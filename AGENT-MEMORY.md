# Agent Memory & Session Handoff
## Info to the Agent: if you haven't, read @AGENT-CONTEXT.md and @SCHEDULE.md.

> **Note to Agents:** The full day-by-day task list is now tracked in `SCHEDULE.md`. Please consult and update the checkboxes in that file as you progress.

## Current State
- **Phase 1 (Foundation)** is COMPLETE. Next.js 16, React 19, HeroUI v3, Tailwind v4, Drizzle ORM (SQLite) and n8n Docker Compose are all configured and tested.
- **Phase 2 (The Launcher & .exe)** is COMPLETE.
  - Python launcher (`launcher/GemHunter.py`) built with `customtkinter`.
  - Implemented robust background threading for `docker info`, `docker compose up -d`, and `npm run dev` startup.
  - Implemented single-instance lock and `already running` port detection on `:3000` to prevent duplicate service starts.
  - Implemented safe process teardown (killing Node process tree via `psutil` + `docker compose stop`).
  - PyInstaller successfully packages the script into a standalone `GemHunter.exe` that runs from the project root.
  - Subprocesses are silent on Windows (no flashing CMD windows).

## Active Blockers / Known Issues
- None. The Walking Skeleton is functional. A user can double-click `.exe`, services start in the background, and the Next.js app opens in the default browser.

## Next Immediate Steps (Phase 3 - W5D1)
1. Start the Onboarding flow UI (wizard style) in the Next.js app.
2. Implement form state for user settings (AI provider, API key, basic filters).
3. Setup Next.js Middleware to check if `settings` exists in SQLite and redirect to `/onboarding` if missing.
4. Prepare the PDF upload component for CV parsing.

**Note to next agent:** Phase 3 introduces Next.js and HeroUI work. Remember that this project uses bleeding-edge versions (Next 16, HeroUI v3). You MUST consult the relevant local docs/tools before writing UI code or Route Handlers, as they differ from your base training data.
