# Gem Hunter — Agent Context

> Gem Hunter is a self-hosted, local-first job discovery and AI scoring app.
> This file tells the coding agent what the project is, how it works, and how to help build it.

## Project Identity

- Repository: `wojciechsacewicz/gem-hunter-2` (public, building in public from commit one).
- Type: Self-hosted, open-source desktop/web application.
- Purpose: A personal hobby project aimed at evolving programming skills. Pull Requests and community contributions are highly welcome!
- Target Audience: Tech-adjacent job seekers. For version 1, this project specifically targets the **Polish job market**.
- Goal: Automate job discovery, filter it extensively to save API costs, score it against a CV with AI, and let the user review it through a fast swipe interface.
- Status: Week 1 of a 12-week build plan. Foundation setup is in progress.

## Product Vision

The app should help a job seeker find high-quality offers with as little repetitive work as possible, while being highly efficient with paid AI API credits.

The desired end experience:
1. Launch the app locally with one double-click.
2. Complete onboarding once (AI provider, API key, CV upload, hard filters).
3. The system works in a decoupled way: Scraping happens in the background, while Filtering is applied instantly.
4. Review the best offers one card at a time on the Casino Screen.
5. Save good ones as gems.
6. Manually trigger a premium Second AI Pass to generate a tailored CV summary and recruiter message for the gems.

The product should feel fast, visual, and motivating rather than heavy or over-engineered.

## Target Job Boards (v1)

We are utilizing the sitemaps provided by:
- JustJoin.it (`justjoin.it/robots.txt` / sitemaps)
- RocketJobs.pl (`rocketjobs.pl/robots.txt` / sitemaps)

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
| `filters_json` | TEXT | Serialized JSON filters (regex, locations, keywords), configurable in the UI |
| `last_sync_status` | TEXT | Sync state: `idle`, `running`, `completed`, `failed` |

Example `filters_json` value:
```json
{"locations": ["Gdańsk", "Remote"], "min_salary": 6000, "keywords_must": ["React"], "regex_exclude": "senior|lead"}
```

### Table: jobs

Stores all discovered job offers. Raw data (URL, full description) is kept so filters can be re-applied without re-scraping.

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
| `description` | TEXT | HTML-stripped full job description text (once deep scraped) |
| `status` | TEXT | `shallow`, `rejected_shallow`, `deep`, `rejected_deep`, `unscored`, `new`, `gem`, `rejected_swipe`, `applied` |
| `ai_score` | INT | AI match score 0–100 |
| `ai_reason` | TEXT | Short LLM explanation of the score |
| `scraped_at` | TIMESTAMP | Time the record was inserted |

## Application Flow: Decoupled Scraping & Filtering

To save AI API credits and time, the pipeline uses a strict multi-stage funnel where **Scraping is completely decoupled from Filtering**.

### Stage 1: UI-Driven Filtering (Instant, No Network)
Filters (locations, regex, salary) are easily configurable in the Next.js UI.
When a user updates their filters and clicks "Save":
1. The app immediately updates `filters_json` in the `settings` table.
2. A local Next.js script instantly re-evaluates all existing jobs in the database against the new filters.
3. If a previously `rejected_shallow` job now matches (e.g., changed city from Warsaw to Gdańsk), its status upgrades back to `shallow` (ready for deep scrape).
4. If a previously `rejected_deep` job now matches, it upgrades to `unscored` (ready for AI).
5. **No network calls or re-scraping are needed.** The database is the vault.

### Stage 2: Background Scraping & Processing (n8n Worker)
When the worker runs, it processes the funnel incrementally:
1. **Shallow Scraping:** Fetch job URLs from sitemaps (`justjoin.it/robots.txt`, `rocketjobs.pl/robots.txt`). Save to the `jobs` table with `status = 'shallow'`. Ironclad deduplication happens here (skip known URLs).
2. **Initial Hard Filtering:** Apply `filters_json` against the `shallow` data. Update non-matching to `rejected_shallow`.
3. **Deep Scraping:** HTTP GET the full HTML *only* for `shallow` jobs that passed the hard filter. Extract the description div, strip HTML to plain text. Update to `status = 'deep'`.
4. **Second Hard Filtering:** Run regex and keyword filters against the full job descriptions. Non-matches become `rejected_deep`. Survivors become `unscored`.
5. **First AI Pass (Scoring):** Route `unscored` jobs to the active LLM to score against the CV.
   - If `ai_score >= 65`, set `status = 'new'`.
   - If `ai_score < 65`, set `status = 'rejected_deep'`.

### Stage 3: Casino Screen
The Casino Screen shows one large job card at a time.
Read query: `SELECT * FROM jobs WHERE status = 'new' AND ai_score >= 65 ORDER BY ai_score DESC`
Controls:
- `←` (left arrow): reject — sets `status = 'rejected_swipe'`.
- `→` (right arrow): gem — sets `status = 'gem'`.

### Stage 4: Gems Table and Second AI Pass
The Gems Table shows all jobs where `status = 'gem'`.
The Second AI Pass feature:
- Uses a heavier/premium model (GPT-4o or Gemini Pro) to evaluate the best offers.
- Intentionally triggered manually to preserve API credits.
- Generates a highly personalized **recruiter message**.
- Generates a **new custom 'summary' section** tailored perfectly to that specific offer for the user's CV.

## Repository Structure

```text
gem-hunter-2/
├── .github/              
├── launcher/             # Python launcher and packaging
│   ├── assets/           
│   ├── GemHunter.py      
│   └── requirements.txt  
├── n8n/
│   ├── backups/          
│   └── .gitignore
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── swipe/        
│   │   ├── gems/         
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           
│   │   └── shared/       
│   ├── db/
│   │   ├── schema.ts     
│   │   └── index.ts      
│   └── lib/
│       ├── llm-utils.ts  
│       └── utils.ts      
├── .env.example
├── .gitignore            
├── docker-compose.yml
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── README.md
```

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

### Decision defaults

When requirements are unclear, prefer:
- Simplicity over abstraction.
- Readability over cleverness.
- Local-first over cloud dependency.
- Working feature over speculative optimization.
- Explicit naming over terse naming.

## Build Phases

| Phase | Scope | Weeks |
|---|---|---|
| 1 | Repo setup, Next.js + HeroUI shell, Drizzle schema, docker compose | 1–2 |
| 2 | Python launcher (.exe), PyInstaller, Docker checking & polling, Walking Skeleton | 3–4 |
| 3 | Onboarding flow, CV parsing, Settings page, UI-driven Instant Filtering | 5–6 |
| 4 | n8n worker pipeline (decoupled scraping, deep scraping, AI scoring) | 7–9 |
| 5 | Search trigger, Casino Screen wired to DB, Gems Table, Second AI Pass | 10–12 |

## Definition of Done for v1

- [ ] App starts from `GemHunter.exe` with one double-click and opens in the browser.
- [ ] Onboarding extracts CV text from a standard PDF and saves all settings.
- [ ] Filters are easily changed in the UI and apply instantly to local database without re-scraping.
- [ ] Worker pipeline runs asynchronously, executing the multi-stage filter pipeline.
- [ ] Deduplication is strict — no URL is ever sent to a paid AI API more than once.
- [ ] Casino Screen swipe decisions write instantly with zero visible loading.
- [ ] Gems Table shows saved jobs and supports the premium Second AI Pass (Message + CV Summary).
- [ ] Repository has a clean "Read Me First" guide explaining the Docker requirement and architecture.