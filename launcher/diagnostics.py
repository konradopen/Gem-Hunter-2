from __future__ import annotations

import json
import os
import platform
import traceback
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

APP_VERSION = "0.1.0"
APP_NAME = "GemHunter"


@dataclass
class DiagnosticEvent:
    timestamp: str
    level: str
    error_code: str
    message: str
    command: str | None = None
    exit_code: int | None = None
    details: str | None = None


def get_log_path() -> Path:
    local_app_data = os.environ.get("LOCALAPPDATA")
    if not local_app_data:
        local_app_data = str(Path.home() / "AppData" / "Local")
    log_dir = Path(local_app_data) / APP_NAME / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir / "launcher.log"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sanitize(text: str) -> str:
    masked = text
    for marker in ("sk-or-v1-", "sk-"):
        if marker in masked:
            masked = masked.replace(marker, f"{marker}***")
    return masked[:4000]


def write_event(
    *,
    level: str,
    error_code: str,
    message: str,
    command: str | None = None,
    exit_code: int | None = None,
    details: str | None = None,
) -> None:
    event = DiagnosticEvent(
        timestamp=_now_iso(),
        level=level,
        error_code=error_code,
        message=message,
        command=command,
        exit_code=exit_code,
        details=_sanitize(details or "") if details else None,
    )

    record = {
        "app": APP_NAME,
        "version": APP_VERSION,
        "os": platform.platform(),
        "event": asdict(event),
    }
    log_path = get_log_path()
    with log_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=True) + "\n")


def write_exception(error_code: str, message: str, exc: BaseException) -> None:
    details = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    write_event(
        level="error",
        error_code=error_code,
        message=message,
        details=details,
    )


def build_user_report(message: str, error_code: str, extra: dict[str, Any] | None = None) -> str:
    parts = [f"{message}", f"Error code: {error_code}", f"Log: {get_log_path()}"]
    if extra:
        for key, value in extra.items():
            parts.append(f"{key}: {value}")
    return "\n".join(parts)
