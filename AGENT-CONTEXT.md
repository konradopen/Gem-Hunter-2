# Gem Hunter — Agent Context

> Gem Hunter is a self-hosted, local-first job discovery and AI scoring app.
> This file tells the coding agent what the project is, how it works, and how to help build it.

## Project Identity

- Repository: `wojciechsacewicz/gem-hunter-2` (public, building in public from commit one).
- Type: Self-hosted, open-source desktop/web application.
- Target Audience: Tech-adjacent job seekers (junior developers, IT folks, data analysts) willing to follow a setup tutorial (installing Docker, bypassing unsigned `.exe` warnings).
- Goal: Automate job discovery, filter it, score it against a CV with AI, and let the user review it through a fast swipe interface.
- Status: Week 1 of a 12-week build plan. Foundation setup is in progress.

## Product Vision

The app should help a job seeker find high-quality offers with as little repetitive work as possible.

The desired end experience:
1. Launch the app locally with one double-click.
2. Complete onboarding once (AI provider, API key, CV upload, job filters).
3. Press one button to trigger a background job search.
4. Watch a progress bar fill as jobs are fetched and scored.
5. Review the best offers one card at a time on the Casino Screen.
6. Save good ones as gems.
7. Optionally generate a personalized recruiter message for any saved gem.

The product should feel fast, visual, and motivating rather than heavy or over-engineered.

## Stack

Use this exact stack unless the user says otherwise.

| Layer | Technology |
|---|---|
| Frontend controller | Next.js with App Router, React, TypeScript |
| UI system | HeroUI v3, Tailwind CSS |
| Database | SQLite (`database.sqlite`), Drizzle ORM |
| Automation worker (v1) | n8n Community Edition in Docker |
| CV parsing | `pdf-parse` (used in a Route Handler) |
| Card animations | Framer Motion or HeroUI CSS transitions |
| Desktop launcher | Python + CustomTkinter + PyInstaller → `GemHunter.exe` |
| Runtime environment | Docker Desktop (local) |

## Local Ports

- App: `localhost:3000`
- n8n worker UI: `localhost:5678`
- n8n webhook base URL (internal Docker network): `http://n8n:5678/webhook/`

## Data Model

### Table: settings

Stores exactly one configuration row. Every change performs an UPSERT on `id = 1`.

| Field | Type | Purpose |
|---|---|---|
| `id` | INT PK | Always 1 |
| `active_llm` | TEXT | Selected provider: `gemini`, `openai`, or `deepseek` |
| `api_key` | TEXT | API key for the selected provider |
| `cv_text` | TEXT | Plain text extracted from the uploaded PDF |
| `filters_json` | TEXT | Serialized JSON filters |
| `last_sync_status` | TEXT | Sync state: `idle`, `running`, `completed`, `failed` |

Example `filters_json` value:
```json
{"locations": ["Gdańsk", "Remote"], "min_salary": 6000, "keywords_must": ["React"]}
```

### Table: jobs

Stores all discovered job offers and their AI scoring results.

| Field | Type | Purpose |
|---|---|---|
| `id` | INT PK AUTOINCREMENT | Primary key |
| `url` | TEXT UNIQUE | Deduplication key — never allow duplicates |
| `title` | TEXT | Job title |
| `company` | TEXT | Employer name |
| `location` | TEXT | Job location |
| `salary_min` | INT | Minimum salary |
| `salary_max` | INT | Maximum salary |
| `currency` | TEXT | Salary currency |
| `description` | TEXT | HTML-stripped job description text |
| `status` | TEXT | `unscored`, `new`, `gem`, `rejected`, `auto_rejected`, or `applied` |
| `ai_score` | INT | AI match score 0–100 |
| `ai_reason` | TEXT | Short LLM explanation of the score |
| `scraped_at` | TIMESTAMP | Time the record was inserted |

## Application Flow

### Step 1: Launch

The Python launcher:
1. Runs `docker info` silently to check Docker.
2. Calls `docker compose up -d`.
3. Polls `localhost:3000` until HTTP 200.
4. Opens the default browser at `localhost:3000`.

### Step 2: Onboarding (first run only)

Next.js Middleware checks the `settings` table on every page load.
If `settings` is empty, it blocks access to `/dashboard` and redirects to `/onboarding`.

The onboarding wizard collects:
- AI provider and API key.
- A PDF CV file.
- Hard filters (location, salary, keywords).

The CV upload flow:
1. Frontend sends the PDF to a Route Handler.
2. The Route Handler uses `pdf-parse` to extract plain text and returns it to the client.
3. The UI shows the text in a large editable textarea for the user to review and fix formatting.
4. A Server Action saves the final edited result to `settings` via Drizzle UPSERT.
5. The user is redirected to the empty dashboard.

### Step 3: Search trigger

The user clicks the "Search Gems" button on the dashboard.
A Server Action updates `last_sync_status = 'running'` in the `settings` table and fires an HTTP POST to `http://localhost:5678/webhook/trigger-sync`.

After triggering, Next.js starts polling every 2 seconds:
```sql
-- Polls count of new jobs and the current run status
SELECT COUNT(*) FROM jobs WHERE scraped_at > [click_timestamp];
SELECT last_sync_status FROM settings;
```

The count drives the HeroUI Progress Bar animation, and when `last_sync_status` hits `'completed'`, the bar jumps to 100% and transitions to a success state.

### Step 4: Worker pipeline (n8n, runs in background)

When n8n receives the webhook, it runs this pipeline in order:

1. Read context: `SELECT * FROM settings` — loads API key, CV text, and filters into workflow variables.
2. Shallow scraping: HTTP GET to job board APIs/sitemaps using hard filters. Builds a URL list of up to ~500 offers.
3. Ironclad deduplication: `SELECT url FROM jobs` — compares scraped URLs to existing DB entries. Drops all known URLs. Only passes through truly new ones (typically ~20).
4. Immediate insert: Bulk `INSERT INTO jobs (url, title, ...)` with `status = 'unscored'`. This ensures fault tolerance.
5. Processing Loop: For each `unscored` job:
   - Deep scraping: HTTP GET the URL, extract the description div, strip HTML to plain text.
   - AI scoring: Routes to the active provider based on `active_llm`. Uses this system prompt:

```text
Return ONLY valid JSON in the format {"score": 85, "reason": "Knows React and SQLite"}.
Score this job listing against the CV below on a scale of 0 to 100.
```

6. Update Row: `UPDATE jobs SET description = ?, ai_score = ?, ai_reason = ?, status = ? WHERE id = ?`.
   - If `ai_score >= 65`, set `status = 'new'`.
   - If `ai_score < 65`, set `status = 'auto_rejected'`.
7. Done: Final node executes `UPDATE settings SET last_sync_status = 'completed'`.

### Step 5: Casino Screen

The Casino Screen shows one large job card at a time.

Read query:
```sql
SELECT * FROM jobs WHERE status = 'new' AND ai_score >= 65 ORDER BY ai_score DESC
```

Each card displays: title, company, salary range, and an AI insight section showing `ai_score` and `ai_reason`.

Controls:
- `←` (left arrow): reject — Server Action sets `status = 'rejected'`.
- `→` (right arrow): gem — Server Action sets `status = 'gem'`.

Both actions use optimistic UI updates: the next card loads from a pre-fetched local array with zero visible delay.
Card exit animations use Framer Motion or HeroUI CSS transitions.

### Step 6: Gems Table and Second AI Pass

The Gems Table shows all jobs where `status = 'gem'` in a full HeroUI Table component.

The Second AI Pass feature:
- Generates a personalized recruiter message for a specific job.
- Is intentionally triggered manually, not automatically.
- Reason: preserve API credits — the second pass uses a heavier model such as GPT-4o or Gemini Pro.
- Flow: user clicks a toggle on the job row → Next.js Route Handler fetches the job data and CV from SQLite → calls the premium model API → returns text into an editable textarea → user copies and the status updates to `applied`.

## Repository Structure

```text
gem-hunter-2/
├── .github/              # Issue templates, GitHub Actions
├── launcher/             # Python launcher and packaging
│   ├── assets/           # icon.ico and other assets
│   ├── GemHunter.py      # Main CustomTkinter launcher script
│   └── requirements.txt  # Python dependencies
├── n8n/
│   ├── backups/          # Exported n8n workflow .json files (commit these)
│   └── .gitignore
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # Route Handlers
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── swipe/        # Casino Screen
│   │   ├── gems/         # Gems Table
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # HeroUI-based components
│   │   └── shared/       # Custom cards, progress elements
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema for settings and jobs
│   │   └── index.ts      # SQLite connection
│   └── lib/
│       ├── llm-utils.ts  # Second AI Pass logic
│       └── utils.ts      # General utilities
├── .env.example
├── .gitignore            # Must include: node_modules, .next, database.sqlite, n8n_data/
├── docker-compose.yml
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── README.md
```

## Naming Conventions

Use these names consistently. Never use synonyms for the same concept.

| Canonical name | Means |
|---|---|
| Casino Screen | The swipe-style job review screen under `/swipe` |
| Second AI Pass | The manual recruiter message generator in the Gems Table |
| Worker | n8n (v1 only — may change in future versions) |
| Settings | The single-row configuration table |
| Gem | A job saved with `status = 'gem'` |
| Route Handler | Next.js App Router API handler under `app/api` |
| Server Action | Next.js mutation function called from client components |

## HeroUI AI Resources

HeroUI v3 provides agent-compatible documentation. Use these when working on UI:

- llms.txt (structured for LLM consumption): https://v3.heroui.com/docs/react/getting-started/llms-txt
- MCP Server: https://v3.heroui.com/docs/react/getting-started/mcp-server
- Agent Skills: https://v3.heroui.com/docs/react/getting-started/agent-skills
- agents.md (component guidance for agents): https://v3.heroui.com/docs/react/getting-started/agents-md

## Agent Behavior

### How to work

1. Read the current file state before making any changes.
2. State a brief plan before making substantial edits.
3. Make focused, scoped changes.
4. Keep all code consistent with the stack above.
5. Use modern 2026 Next.js patterns (App Router, Route Handlers, Server Actions).
6. Explain any non-obvious decision in plain language.
7. Flag any library addition with a reason.
8. Ask before making large structural changes or refactors.

### Output format

Every response should follow this structure:
1. One-sentence summary of what is about to happen.
2. List of files to create or edit.
3. The actual code.
4. Short reason why.
5. Clear next suggested step.

If a task is ambiguous: ask one short clarifying question, or propose two options and recommend one.
If a task is large: split it into phases and start with the smallest working implementation.

### Decision defaults

When requirements are unclear, prefer:
- Simplicity over abstraction.
- Readability over cleverness.
- Local-first over cloud dependency.
- Working feature over speculative optimization.
- Explicit naming over terse naming.

### MCP usage

Use available MCP servers when they improve correctness or save time.

- GitHub MCP: inspect repo structure, check existing files.
- Context7 MCP: look up current documentation before implementing anything version-sensitive.
- HeroUI MCP: all component implementation, patterns, and UI questions.
- Filesystem MCP (if available): read and edit local project files directly.
- SQLite MCP (if available): inspect schema, run queries, debug data issues.
- Playwright MCP: test UI behavior and verify component rendering.

## Build Phases

| Phase | Scope | Weeks |
|---|---|---|
| 1 | Repo setup, Next.js + HeroUI shell, Drizzle schema, docker compose | 1–2 |
| 2 | Python launcher (.exe), PyInstaller, Docker checking & polling, Walking Skeleton | 3–4 |
| 3 | Onboarding flow, CV parsing, Settings page, dashboard shell | 5–6 |
| 4 | n8n webhook, shallow scraping, deduplication, deep scraping, AI scoring, bulk insert | 7–9 |
| 5 | Search trigger, Casino Screen wired to DB, Gems Table, Second AI Pass, edge cases, release | 10–12 |

## Definition of Done for v1

- [ ] App starts from `GemHunter.exe` with one double-click and opens in the browser.
- [ ] Onboarding extracts CV text from a standard PDF and saves all settings.
- [ ] Worker pipeline runs asynchronously after a manual button press.
- [ ] Deduplication is strict — no URL is ever sent to a paid AI API more than once.
- [ ] Casino Screen swipe decisions write instantly with zero visible loading.
- [ ] Gems Table shows saved jobs and supports the Second AI Pass.
- [ ] Repository has a flawless English "Read Me First" guide explaining the Docker requirement, how to safely bypass Windows Defender for the `.exe`, and the architecture.
