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
  - Distribution hardening has advanced: diagnostics/error-code logging added, installer build scripts are functional, installer can be built/installed successfully, and clean-machine style simulations for missing Node/Docker + port-3000 conflict were validated.
  - Build scripts hardened:
    - `launcher/build.ps1` now uses local venv `pyinstaller.exe` fallback.
    - `launcher/build-installer.ps1` auto-detects Inno Setup in both system and user install paths.
  - Installer MVP currently works end-to-end on this machine:
    - built `launcher/dist-installer/GemHunter-Setup.exe`
    - silent install succeeded to `%LOCALAPPDATA%/Programs/Gem Hunter`
    - installed launcher executable passed start/stop smoke test.
  - Launcher startup hardening added in `launcher/GemHunter.py`:
    - structured diagnostics logging (`launcher/diagnostics.py`)
    - missing Docker/Node guidance
    - non-Node process conflict detection on port `3000`
    - auto `npm install` bootstrap when `node_modules` is missing.
- **Phase 3 (Onboarding & UI Instant Filtering)**:
  - Onboarding wizard UI (Steps 1-4) is COMPLETE. Step 4 (Filters) uses a hybrid tags + presets system.
  - Form state is managed locally and successfully wired to a `useActionState` Server Action.
  - Server Action for UPSERT to SQLite (`settings` table) is COMPLETE (W5D5).
  - Onboarding Guard & Middleware is COMPLETE (W5D2): routing now uses `finished_onboarding` boolean in SQLite, with middleware cookie hint + server-side DB guards on `/dashboard` and `/onboarding`.
  - Onboarding polish pass is COMPLETE: Step 5 moved to a dedicated achievement-style component, progress bar hidden on steps 1 and 5, progress now increments by completed steps, and Back button is hidden on step 5.
  - English-only onboarding pass is COMPLETE: onboarding UI/action copy translated to English and onboarding lint warnings resolved.

## Active Blockers / Known Issues
- None. The Walking Skeleton is functional. A user can double-click `.exe`, services start in the background, and the Next.js app opens in the default browser.
- Not yet a true one-binary app: runtime still depends on Docker Desktop, but the user notes that we can keep some apps as dependencies the user has to download separately if that makes the project better. agent should recommend a better way if it thinks there is one. 
+ Node/npm on target machine (installer now guides user and launcher handles missing-dependency paths more gracefully).

## Next Immediate Steps (Next Session Priorities)
1. **Basic Dashboard Shell**: Create at least the most basic layout and page for `/dashboard` so the user has a proper landing page after finishing the Onboarding flow. (W6D1)
2. **PDF CV Upload Component**: Prepare the UI for drag-and-drop PDF upload in the dashboard settings. (W5D3)
3. **CV Extraction Route Handler**: Implement the endpoint (using `pdf-parse`) to convert the uploaded CV into plain text, and provide a textarea for the user to review/edit the extracted text. (W5D4)
4. **English-only codebase (remaining surfaces)**: Continue translating non-onboarding UI copy, labels, descriptions, comments, and any remaining Polish strings/identifiers outside the onboarding flow.
5. **Installer MVP completion**: run clean Windows VM validation and confirm full first-run UX with missing Docker/Node, plus final payload pruning.
6. **Release-readiness docs**: finalize troubleshooting matrix and error-code index for launcher diagnostics.

## Repo Hygiene Updates in This Session
- `.gitignore` updated to ignore:
  - `launcher/dist-installer/`
  - `launcher/dist-installer/*.log`
  - `.cursor/plans/`
- This keeps installer artifacts and transient planning files out of version control while preserving `.cursor/rules/`.

**Note to next agent:** W5D2 is complete with `finished_onboarding` guard logic (schema + migration, middleware cookie hint, server-side DB redirects on `/dashboard` and `/onboarding`). Onboarding polish/English cleanup requested by user is complete (including Step 5 refactor and progress behavior changes). Installer MVP is now buildable/tested on this machine; next distribution step is clean-VM validation and final docs/payload polish. Product priority remains W6D1 dashboard shell, then W5D3 and W5D4. Phase 3 uses bleeding-edge versions (Next 16, HeroUI v3, React 19). You MUST consult relevant docs/tools before writing UI code or Route Handlers.

## Legacy V1 Knowledge Base (For V2 Implementation)
- **AI Provider**: OpenRouter API will be used (allows access to free models and multiple providers).
- **Onboarding Flow**: 
  - Step 1: Welcome.
  - Step 2: OpenRouter API Key input.
  - Step 3: CV info (actual upload/management will be in Dashboard Settings via drag-drop PDF + textarea).
  - Step 4: UI-driven Filters (derived from V1 logic but customizable).
- **V1 Filters to replicate/adapt in UI**:
  - `LEVEL_DROP`: senior, lead, principal, manager, director
  - `TECH_DROP`: ruby, java, .net, c#, c++, php, wordpress
  - `ROLE_PREFER`: automation, ai, ml, support, ops
  - `BLACKLIST_KEYWORDS`: sprzedawca, kasjer, retail, hr, marketing, ux, gamedev
  - `LOCATIONS`: Gdańsk, Sopot, Tczew + Remote keywords
- **V1 Scoring Logic**:
  - Prompted AI to compare CV with Job (Title, Company, Stack, Description).
  - Expected output: `{ "score": 1-10, "justification": "...", "missing_skills": [] }`
  - Priority sorting: Ranked "automation" roles and specific preferred cities higher.
