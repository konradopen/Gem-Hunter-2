# Gem Hunter 12-Week Build Schedule

This file tracks the daily tasks for the 12-week build plan. Agents should use this to understand what to build next and what the scope of the current task is.

**Note to Agents:** When completing a task, check it off `[x]` to maintain progress.

## Week 1 & 2: Phase 1 (Foundation)
- [x] W1D1 - Phase 1 - Project init, Next.js 16 & HeroUI v3 setup
- [x] W1D2 - Phase 1 - Drizzle ORM setup & SQLite schema creation
- [x] W1D3 - Phase 1 - Docker Compose & n8n base config
- [x] W1D4 - Phase 1 - Folder structure (src/app) & skeleton pages
- [x] W1D5 - Phase 1 - Verify baseline build & GitHub repo setup
- [X] W2D1 - Phase 1 - Configure Tailwind v4 & HeroUI theming
- [X] W2D2 - Phase 1 - Setup global layout.tsx & fonts
- [X] W2D3 - Phase 1 - Database connection utility & queries tests
- [X] W2D4 - Phase 1 - n8n volume mounts & internal network test
- [X] W2D5 - Phase 1 - Phase 1 review & documentation baseline

## Week 3 & 4: Phase 2 (The Launcher & .exe)
- [X] W3D1 - Phase 2 - Python env setup & CustomTkinter UI init
- [X] W3D2 - Phase 2 - Launcher script: Silent `docker info` check
- [X] W3D3 - Phase 2 - Launcher script: `docker compose up -d` trigger
- [X] W3D4 - Phase 2 - Launcher script: Poll `localhost:3000` until HTTP 200
- [X] W3D5 - Phase 2 - Launcher script: Default browser auto-open
- [x] W4D1 - Phase 2 - PyInstaller config & `.spec` file setup
- [x] W4D2 - Phase 2 - Package into standalone `GemHunter.exe`
- [x] W4D3 - Phase 2 - Test `.exe` on local machine
- [x] W4D4 - Phase 2 - Add UI loading states & error handling to launcher
- [x] W4D5 - Phase 2 - Phase 2 review (Walking Skeleton milestone)

## Week 5 & 6: Phase 3 (Onboarding & UI Instant Filtering)
- [X] W5D1 - Phase 3 - Onboarding wizard UI & form state
- [ ] W5D2 - Phase 3 - Next.js Middleware settings check & redirect
- [ ] W5D3 - Phase 3 - PDF CV upload component
- [ ] W5D4 - Phase 3 - CV extraction Route Handler & User Textarea Review
- [x] W5D5 - Phase 3 - Save settings to SQLite via Drizzle UPSERT
- [ ] W6D1 - Phase 3 - Dashboard layout & Progress Bar empty state
- [ ] W6D2 - Phase 3 - Settings page UI (read/edit existing config)
- [ ] W6D3 - Phase 3 - Local Filter Logic (Regex, Locations, Keywords)
- [ ] W6D4 - Phase 3 - Server Action: Re-evaluate DB jobs on filter save
- [ ] W6D5 - Phase 3 - Status upgrade/downgrade logic tests (shallow/deep/unscored)

## Week 7, 8 & 9: Phase 4 (Worker Pipeline - Decoupled Scraping)
- [ ] W7D1 - Phase 4 - n8n webhook trigger & SQLite context read
- [ ] W7D2 - Phase 4 - n8n: Parse `justjoin.it` & `rocketjobs.pl` sitemaps
- [ ] W7D3 - Phase 4 - n8n: Ironclad deduplication & bulk insert as `shallow`
- [ ] W7D4 - Phase 4 - n8n: Apply hard filters to `shallow` jobs (mark `rejected_shallow`)
- [ ] W7D5 - Phase 4 - n8n: Deep HTTP scraping of remaining `shallow` URLs
- [ ] W8D1 - Phase 4 - n8n: Extract description div & strip HTML (mark `deep`)
- [ ] W8D2 - Phase 4 - n8n: Second regex/keyword filter (mark `unscored` or `rejected_deep`)
- [ ] W8D3 - Phase 4 - n8n: AI scoring system prompt & JSON schema setup
- [ ] W8D4 - Phase 4 - n8n: Process `unscored` -> route to AI -> update row
- [ ] W8D5 - Phase 4 - n8n: Set final status `new` (>=65) or `rejected_deep` (<65)
- [ ] W9D1 - Phase 4 - n8n: Set `last_sync_status = 'completed'`
- [ ] W9D2 - Phase 4 - Pipeline error handling & retries
- [ ] W9D3 - Phase 4 - Optimize AI scoring payload (token limits)
- [ ] W9D4 - Phase 4 - Export & commit final n8n workflow backups
- [ ] W9D5 - Phase 4 - Phase 4 pipeline stabilization

## Week 10, 11 & 12: Phase 5 (Casino Loop & Release)
- [ ] W10D1 - Phase 5 - Search button trigger & Next.js live polling
- [ ] W10D2 - Phase 5 - Connect Casino Screen to DB (status = 'new')
- [ ] W10D3 - Phase 5 - Swipe Server Actions (status: `gem` or `rejected_swipe`)
- [ ] W10D4 - Phase 5 - Zero-delay Optimistic UI for swipe cards
- [ ] W10D5 - Phase 5 - Gems Table UI & SQLite data fetching
- [ ] W11D1 - Phase 5 - Gems Table sorting, filtering & columns
- [ ] W11D2 - Phase 5 - Second AI Pass - UI toggle & Route Handler
- [ ] W11D3 - Phase 5 - Second AI Pass - Prompt engineering (Message + CV Summary)
- [ ] W11D4 - Phase 5 - Second AI Pass - Premium API integration
- [ ] W11D5 - Phase 5 - Editable textarea & 'applied' status workflow
- [ ] W12D1 - Phase 5 - Edge cases (no jobs found, empty DB)
- [ ] W12D2 - Phase 5 - Final UI polish & Accessibility (Aria) checks
- [ ] W12D3 - Phase 5 - Polish the "Read Me First" Docker & Windows bypass guide
- [ ] W12D4 - Phase 5 - Test full installation on a clean machine
- [ ] W12D5 - Phase 5 - v1.0.0 Release & Final Definition of Done check
