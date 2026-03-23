from __future__ import annotations

import atexit
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from pathlib import Path

import psutil
import requests

APP_URL = "http://localhost:3000"
LOCK_FILE = Path(tempfile.gettempdir()) / "gem_hunter_launcher.lock"


def _fatal(message: str) -> None:
    try:
        import tkinter as tk
        from tkinter import messagebox

        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Gem Hunter Launcher — Error", message)
        root.destroy()
    except Exception:
        print(message, file=sys.stderr)

    raise SystemExit(1)


def _looks_like_project_root(path: Path) -> bool:
    try:
        return (path / "docker-compose.yml").exists() and (
            path / "package.json"
        ).exists()
    except Exception:
        return False


def resolve_project_root() -> Path:
    candidates: list[Path] = []

    env_root = os.environ.get("GEM_HUNTER_ROOT")
    if env_root:
        try:
            candidates.append(Path(env_root).expanduser().resolve())
        except Exception:
            pass

    try:
        candidates.append(Path.cwd())
    except Exception:
        pass

    if getattr(sys, "frozen", False):
        try:
            candidates.append(Path(sys.executable).resolve().parent)
        except Exception:
            pass

    try:
        script_path = Path(__file__).resolve()
        candidates.append(script_path.parent)
        candidates.append(script_path.parent.parent)
    except Exception:
        pass

    seen: set[str] = set()
    for candidate in candidates:
        key = str(candidate).lower()
        if key in seen:
            continue
        seen.add(key)
        if _looks_like_project_root(candidate):
            return candidate

    raise RuntimeError(
        "Could not locate project root.\n\n"
        "Expected folder containing both:\n"
        "- docker-compose.yml\n"
        "- package.json\n\n"
        "Run launcher from project root or set GEM_HUNTER_ROOT."
    )


def _find_npm_executable() -> str | None:
    return shutil.which("npm") or shutil.which("npm.cmd")


def _is_port_open(port: int, host: str = "127.0.0.1", timeout_s: float = 0.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout_s):
            return True
    except Exception:
        return False


def _windows_subprocess_kwargs() -> dict:
    if os.name != "nt":
        return {}

    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    startupinfo.wShowWindow = 0  # SW_HIDE
    return {
        "creationflags": subprocess.CREATE_NO_WINDOW,
        "startupinfo": startupinfo,
    }


def run_silent(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    kwargs = _windows_subprocess_kwargs()
    return subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        shell=False,
        **kwargs,
    )


def popen_silent(command: list[str], cwd: Path) -> subprocess.Popen:
    kwargs = _windows_subprocess_kwargs()
    return subprocess.Popen(
        command,
        cwd=str(cwd),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=False,
        **kwargs,
    )


class SingleInstanceLock:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.acquired = False

    def acquire(self) -> bool:
        if self.path.exists():
            try:
                pid = int(self.path.read_text(encoding="utf-8").strip())
                if psutil.pid_exists(pid):
                    return False
                self.path.unlink(missing_ok=True)
            except Exception:
                try:
                    self.path.unlink(missing_ok=True)
                except Exception:
                    pass

        try:
            self.path.write_text(str(os.getpid()), encoding="utf-8")
            self.acquired = True
            return True
        except Exception:
            return False

    def release(self) -> None:
        if not self.acquired:
            return
        try:
            self.path.unlink(missing_ok=True)
        except Exception:
            pass
        self.acquired = False


try:
    import customtkinter as ctk
except Exception as e:
    _fatal(
        "CustomTkinter is not available.\n\n"
        "Fix:\n"
        "1) Activate venv\n"
        "2) Run: pip install -r requirements.txt\n\n"
        f"Details: {e}"
    )


class LauncherApp(ctk.CTk):
    def __init__(self, lock: SingleInstanceLock) -> None:
        super().__init__()
        self.lock = lock

        try:
            self.project_root = resolve_project_root()
        except Exception as e:
            _fatal(str(e))

        self.compose_file = self.project_root / "docker-compose.yml"
        self.npm_process: subprocess.Popen | None = None
        self.stop_in_progress = False
        self.start_in_progress = False

        ctk.set_appearance_mode("System")
        ctk.set_default_color_theme("blue")
        ctk.set_widget_scaling(1.0)

        self.title("Gem Hunter Launcher")
        self.geometry("700x420")
        self.minsize(620, 360)

        self.status = ctk.CTkLabel(self, text="Idle")
        self.status.pack(padx=16, pady=(16, 8), anchor="w")

        self.log = ctk.CTkTextbox(self, corner_radius=0)
        self.log.pack(padx=16, pady=(0, 12), fill="both", expand=True)
        self.log.configure(state="disabled")

        self.buttons = ctk.CTkFrame(self, fg_color="transparent")
        self.buttons.pack(padx=16, pady=(0, 16), anchor="e")

        self.start_btn = ctk.CTkButton(
            self.buttons, text="Start Services", command=self.on_start, corner_radius=0
        )
        self.start_btn.pack(side="left", padx=(0, 8))

        self.open_btn = ctk.CTkButton(
            self.buttons,
            text="Open App",
            command=self.on_open,
            state="disabled",
            fg_color="transparent",
            border_width=2,
            text_color=("gray10", "#DCE4EE"),
            corner_radius=0,
        )
        self.open_btn.pack(side="left", padx=(0, 8))

        self.stop_btn = ctk.CTkButton(
            self.buttons,
            text="Stop Services",
            command=self.on_stop,
            state="disabled",
            fg_color="#E02424",
            hover_color="#C81E1E",
            corner_radius=0,
        )
        self.stop_btn.pack(side="left")

        self.append_log("Launcher ready.")
        self.append_log(f"Using project root: {self.project_root}")
        self.append_log(f"Using compose file: {self.compose_file}")

        # If app already running, do NOT auto-open browser. Only mark ready.
        if _is_port_open(3000):
            self._mark_ready_ui(already_running=True)

        self.protocol("WM_DELETE_WINDOW", self.on_closing)
        atexit.register(self._cleanup_on_exit)

    def append_log(self, text: str) -> None:
        self.log.configure(state="normal")
        self.log.insert("end", text.rstrip() + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def set_status(self, text: str) -> None:
        self.status.configure(text=text)

    def on_open(self) -> None:
        try:
            webbrowser.open(APP_URL)
        except Exception as e:
            self.append_log(f"Failed to open browser: {e}")

    def _run_compose(self, args: list[str]) -> subprocess.CompletedProcess[str]:
        return run_silent(
            ["docker", "compose", "-f", str(self.compose_file), *args],
            cwd=self.project_root,
        )

    def _mark_ready_ui(self, already_running: bool = False) -> None:
        self.set_status("Ready")
        self.open_btn.configure(state="normal")
        self.stop_btn.configure(state="normal")
        if already_running:
            self.append_log("App already running on :3000 (no duplicate start).")
            # intentionally NO auto-open here
        else:
            self.append_log("App: OK (HTTP 200)")
            self.on_open()

    def _kill_pid_tree(self, pid: int) -> None:
        try:
            parent = psutil.Process(pid)
            for child in parent.children(recursive=True):
                try:
                    child.kill()
                except Exception:
                    pass
            try:
                parent.kill()
            except Exception:
                pass
        except Exception:
            pass

    def _kill_npm_tree(self) -> None:
        # 1) Kill known process started by this instance
        if self.npm_process is not None:
            self._kill_pid_tree(self.npm_process.pid)
            self.npm_process = None

        # 2) Fallback: kill node listening on :3000 (works after launcher restart)
        try:
            for conn in psutil.net_connections(kind="inet"):
                if not conn.laddr:
                    continue
                if conn.laddr.port != 3000:
                    continue
                if conn.status != psutil.CONN_LISTEN:
                    continue
                if not conn.pid:
                    continue

                try:
                    proc = psutil.Process(conn.pid)
                    pname = (proc.name() or "").lower()
                    if "node" in pname or "npm" in pname:
                        self._kill_pid_tree(conn.pid)
                except Exception:
                    pass
        except Exception:
            pass

    def cleanup_services_sync(self) -> None:
        try:
            self._kill_npm_tree()
        except Exception:
            pass

        try:
            self._run_compose(["stop"])
        except Exception:
            pass

    def _cleanup_on_exit(self) -> None:
        try:
            self.lock.release()
        except Exception:
            pass

    def _run_start_background(self) -> None:
        try:
            docker_info = run_silent(["docker", "info"], cwd=self.project_root)
            if docker_info.returncode != 0:
                details = (
                    docker_info.stderr or docker_info.stdout or "docker info failed"
                ).strip()
                self.after(0, lambda: self.append_log("Docker: NOT AVAILABLE"))
                self.after(0, lambda: self.append_log(details))
                self.after(0, lambda: self.set_status("Docker not available"))
                self.after(0, lambda: self.start_btn.configure(state="normal"))
                return

            self.after(0, lambda: self.append_log("Docker: OK"))
            lines = [
                ln.strip()
                for ln in (docker_info.stdout or "").splitlines()
                if ln.strip()
            ]
            self.after(
                0,
                lambda: self.append_log(
                    "\n".join(lines[:5]) if lines else "docker info returned OK"
                ),
            )

            self.after(
                0, lambda: self.set_status("Starting n8n (docker compose up -d)…")
            )
            self.after(
                0,
                lambda: self.append_log(
                    f"Running: docker compose -f {self.compose_file} up -d (cwd={self.project_root})"
                ),
            )

            compose = self._run_compose(["up", "-d"])
            if compose.returncode != 0:
                details = (
                    compose.stderr or compose.stdout or "docker compose failed"
                ).strip()
                self.after(0, lambda: self.append_log("Docker Compose: FAILED"))
                self.after(0, lambda: self.append_log(details))
                self.after(0, lambda: self.set_status("Compose failed"))
                self.after(0, lambda: self.start_btn.configure(state="normal"))
                return

            self.after(0, lambda: self.append_log("Docker Compose: OK"))
            self.after(0, lambda: self.append_log("n8n started"))

            if _is_port_open(3000):
                self.after(0, lambda: self._mark_ready_ui(already_running=True))
                return

            self.after(0, lambda: self.set_status("Starting app (npm run dev)…"))
            self.after(
                0,
                lambda: self.append_log(
                    f"Running: npm run dev (cwd={self.project_root})"
                ),
            )

            npm_path = _find_npm_executable()
            if not npm_path:
                self.after(0, lambda: self.append_log("npm: command not found in PATH"))
                self.after(0, lambda: self.set_status("Node.js not available"))
                self.after(0, lambda: self.start_btn.configure(state="normal"))
                return

            self.npm_process = popen_silent(
                [npm_path, "run", "dev"], cwd=self.project_root
            )

            self.after(
                0, lambda: self.set_status("Waiting for http://localhost:3000 …")
            )
            self.after(0, lambda: self.append_log("Polling app health (HTTP 200)…"))

            deadline = time.time() + 120
            last_error: str | None = None

            while time.time() < deadline:
                if self.stop_in_progress:
                    self.after(
                        0,
                        lambda: self.append_log("Start flow aborted (stop requested)."),
                    )
                    self.after(0, lambda: self.set_status("Stopped"))
                    self.after(0, lambda: self.start_btn.configure(state="normal"))
                    return

                try:
                    r = requests.get(APP_URL, timeout=2)
                    if r.status_code == 200:
                        self.after(
                            0, lambda: self._mark_ready_ui(already_running=False)
                        )
                        return
                    last_error = f"HTTP {r.status_code}"
                except Exception as e:
                    last_error = str(e)
                time.sleep(1)

            self.after(
                0, lambda: self.append_log(f"App: TIMEOUT (last error: {last_error})")
            )
            self.after(0, lambda: self.set_status("Timed out"))
            self.after(0, lambda: self.start_btn.configure(state="normal"))

        except Exception as e:
            self.after(0, lambda: self.append_log(f"Launcher error: {e}"))
            self.after(0, lambda: self.set_status("Error"))
            self.after(0, lambda: self.start_btn.configure(state="normal"))
        finally:
            self.start_in_progress = False

    def _run_stop_background(self) -> None:
        try:
            self.append_log("Stopping services...")
            self.set_status("Stopping services…")
            self.cleanup_services_sync()
            self.append_log("Services stopped.")
            self.set_status("Stopped")
            self.start_btn.configure(state="normal")
            self.open_btn.configure(state="disabled")
            self.stop_btn.configure(state="disabled")
        except Exception as e:
            self.append_log(f"Stop error: {e}")
            self.set_status("Stop failed")
            self.stop_btn.configure(state="normal")
        finally:
            self.stop_in_progress = False

    def on_start(self) -> None:
        if self.start_in_progress:
            return
        self.start_in_progress = True
        self.stop_in_progress = False

        self.start_btn.configure(state="disabled")
        self.open_btn.configure(state="disabled")
        self.stop_btn.configure(state="normal")
        self.set_status("Checking Docker…")
        self.append_log("Checking Docker (docker info)…")
        threading.Thread(target=self._run_start_background, daemon=True).start()

    def on_stop(self) -> None:
        if self.stop_in_progress:
            return
        self.stop_in_progress = True
        self.stop_btn.configure(state="disabled")
        threading.Thread(target=self._run_stop_background, daemon=True).start()

    def on_closing(self) -> None:
        try:
            import tkinter.messagebox as mb

            choice = mb.askyesnocancel(
                "Exit Gem Hunter Launcher",
                "Do you want to stop services before closing?\n\n"
                "Yes = Stop services and close\n"
                "No = Close launcher only (services keep running)\n"
                "Cancel = Stay open",
            )
            if choice is None:
                return
            if choice is True:
                self.stop_in_progress = True
                self.cleanup_services_sync()
        except Exception:
            pass

        self.lock.release()
        self.destroy()


def main() -> None:
    lock = SingleInstanceLock(LOCK_FILE)
    if not lock.acquire():
        _fatal(
            "Gem Hunter Launcher is already running.\n\nClose the existing launcher window first."
        )

    try:
        app = LauncherApp(lock)
        app.mainloop()
    except Exception as e:
        lock.release()
        _fatal(f"Launcher failed to start.\n\nDetails: {e}")
    finally:
        lock.release()


if __name__ == "__main__":
    main()
