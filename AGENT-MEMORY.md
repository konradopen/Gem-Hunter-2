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
- **Phase 3 (Onboarding & UI Instant Filtering)**:
  - Onboarding wizard UI (Steps 1-4) is COMPLETE. Step 4 (Filters) uses a hybrid tags + presets system.
  - Form state is managed locally and successfully wired to a `useActionState` Server Action.
  - Server Action for UPSERT to SQLite (`settings` table) is COMPLETE (W5D5).

## Active Blockers / Known Issues
- None. The Walking Skeleton is functional. A user can double-click `.exe`, services start in the background, and the Next.js app opens in the default browser.

## Next Immediate Steps (Next Session Priorities)
1. **Onboarding Guard & Middleware**: Implement a check (e.g., Next.js Middleware or layout check) so that if a user has already finished onboarding (a `settings` row exists in SQLite), accessing `/onboarding` redirects them to `/dashboard`. Conversely, users without settings must be forced to `/onboarding`. (W5D2)
2. **Basic Dashboard Shell**: Create at least the most basic layout and page for `/dashboard` so the user has a proper landing page after finishing the Onboarding flow. (W6D1)
3. **PDF CV Upload Component**: Prepare the UI for drag-and-drop PDF upload in the dashboard settings. (W5D3)
4. **CV Extraction Route Handler**: Implement the endpoint (using `pdf-parse`) to convert the uploaded CV into plain text, and provide a textarea for the user to review/edit the extracted text. (W5D4)
5. **English-only codebase**: The entire project is intended to be English-only. Translate all UI copy, labels, descriptions, comments, and any remaining Polish strings/identifiers to English. Eliminate all signs of Polish from the codebase.
6. **Notes from user**: "I want to hide the progress bar in step 1 and 5 of onboarding, hide the 'back' button in the step 5 of onboarding, make the party emoji bigger and remove gem logo in the step 5 of onboarding. Also about the progress bar - Fix the % of the progress, so it is only going up after a step is completed" and "move the step 5 of the onboarding process into the components folder to keep it tidy like other steps. i want the step 5 (the congrats) to be different than steps 1-4), looking more like an achievement card lol"

**Note to next agent:** This session has ended. We successfully finished the Onboarding UI and hooked it up to SQLite via Drizzle and a Next.js Server Action (`useActionState`). Start your session by reading the steps above and proceeding with the Dashboard/Middleware guard! Phase 3 uses bleeding-edge versions (Next 16, HeroUI v3, React 19). You MUST consult the relevant local docs/tools before writing UI code or Route Handlers.

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
