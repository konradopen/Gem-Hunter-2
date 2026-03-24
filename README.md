# 💎 Gem Hunter

> A self-hosted, local-first job discovery and AI scoring app designed to find your next great role with zero repetitive work.
>
> **Note:** This is primarily a personal hobby project aimed at evolving my programming skills, but I'm building it in public!

Gem Hunter automates the tedious parts of job hunting. It searches for jobs in the background, filters them, scores them against your CV using AI (OpenAI, Gemini, or DeepSeek), and presents the best matches in a fast, swipeable interface.

---

## 🛑 Prerequisites

### Docker Desktop
The background worker that scrapes and processes jobs requires **Docker Desktop** to be installed and running on your machine.

- Download and install Docker Desktop: https://www.docker.com/products/docker-desktop/
- Make sure Docker is running before launching Gem Hunter.

### Node.js
You need Node.js to run the Next.js app locally (Phase 1). Any reasonably recent Node 20+ should work.

---

## 📦 Windows Installer (MVP)

Gem Hunter now includes an installer path for easier sharing on Windows.

- Build launcher executable:
  - `powershell -ExecutionPolicy Bypass -File launcher/build.ps1`
- Build installer (requires Inno Setup 6):
  - `powershell -ExecutionPolicy Bypass -File launcher/build-installer.ps1`

Installer script location:
- `launcher/installer/GemHunter.iss`

Important:
- The installer does not silently install Docker or Node.
- On missing dependencies, launcher shows guided instructions and official links.

Diagnostics log path:
- `%LOCALAPPDATA%\GemHunter\logs\launcher.log`

Validation checklist before sharing:
- Build launcher: `powershell -ExecutionPolicy Bypass -File launcher/build.ps1`
- Build installer: `powershell -ExecutionPolicy Bypass -File launcher/build-installer.ps1`
- Install silently (CI-friendly): `launcher/dist-installer/GemHunter-Setup.exe /SP- /VERYSILENT /NORESTART /LOG=install.log`
- Start launcher and verify it stays open.
- Click `Start Services` and verify:
  - missing Docker/Node shows guided messages
  - port 3000 conflict is detected clearly
  - successful path reaches `http://localhost:3000`

---

## ⚡ Quickstart (Development)

From the repo root:

1) Start the background worker (n8n):
- `docker compose up -d`

2) Install deps and run the app:
- `npm install`
- `npm run dev`

Open:
- App: http://localhost:3000
- n8n UI: http://localhost:5678

---

## 🔌 Ports

| Service | URL |
|---|---|
| Next.js app | http://localhost:3000 |
| n8n UI | http://localhost:5678 |

---

## 🎯 Target Market (v1)

For version 1, this project specifically targets the **Polish job market**. We are utilizing the sitemaps provided by:
- https://justjoin.it/robots.txt
- https://rocketjobs.pl/robots.txt

---

## ✨ How It Works

Gem Hunter is designed to save API credits and your time by using a highly efficient, multi-stage pipeline where **scraping is completely decoupled from filtering**. The database acts as a vault, meaning you can change your filters in the UI and instantly see updated results without needing to re-scrape the internet.

1. **Instant UI Filtering:** Change your filters (locations, regex, salary) in the app and instantly re-evaluate your local database. Jobs upgrade or downgrade their status immediately without any network calls.
2. **Shallow Scraping:** In the background, we pull new job URLs directly from the JustJoin.it and RocketJobs.pl sitemaps and save them to the local database.
3. **Initial Hard Filtering:** User-defined hard filters reduce the massive list of URLs down to a manageable couple hundred potential matches.
4. **Deep Scraping:** We fetch the full HTML/description *only* for the jobs that passed the initial filters.
5. **Second Hard Filtering:** We run regex and keyword filters again, this time against the newly fetched full job descriptions.
6. **First AI Pass (Scoring):** We use a cost-effective LLM to score the remaining, highly-targeted jobs (0-100) against your uploaded CV.
7. **Casino Screen:** You review the AI-scored matches one at a time with a fast, swipe-style interface and save your favorites as "Gems".
8. **Second AI Pass (Premium):** For your saved Gems, you can manually trigger a heavier, more expensive AI model to generate a highly personalized recruiter message and a custom "summary" section for your CV tailored perfectly to that specific offer.

---

## 🗄️ Database (SQLite) & Drizzle migrations

The app uses a local SQLite file:
- `database.sqlite` (repo root)

Schema lives in:
- `src/db/schema.ts`

When you change the schema (or start from a fresh DB), run:

- `npx drizzle-kit generate`
- `npx drizzle-kit migrate`

Tip: a quick DB smoke test endpoint exists:
- `GET http://localhost:3000/api/health/db`

---

## 🤖 n8n (Background Worker)

n8n runs in Docker via `docker-compose.yml`.

### First run
When you open http://localhost:5678 for the first time, n8n may ask you to create a local owner/admin user (onboarding).
This configuration is stored locally in:
- `./n8n_data`

### Persisted volumes
This repo mounts:
- `./n8n_data` → n8n config/workflows
- `./database.sqlite` → the app database file inside the container at `/database.sqlite`

---

## 🏗️ Architecture & Stack

- **Frontend / Controller:** Next.js (App Router), React, TypeScript
- **UI System:** HeroUI v3 & Tailwind CSS
- **Database:** Local SQLite (`database.sqlite`) via Drizzle ORM
- **Background Worker:** n8n Community Edition (running via Docker)
- **CV Parsing:** `pdf-parse`
- **Desktop Launcher:** Python + CustomTkinter + PyInstaller -> `GemHunter.exe`

---

## 🧯 Troubleshooting

### Docker isn’t running
Check:
- `docker info`

If it fails, start Docker Desktop and try again.

### n8n doesn’t open on :5678
Check containers:
- `docker ps`
Logs:
- `docker logs -f n8n-gem-hunter`

### App doesn’t open on :3000
Run:
- `npm run dev`

### Port 3000 conflict
If launcher reports a port conflict, another process is using `:3000`.

- Check listeners and stop the conflicting process.
- Restart the launcher and click `Start Services` again.

### Launcher diagnostics
If startup fails, collect:
- `%LOCALAPPDATA%\GemHunter\logs\launcher.log`

---

## 🤝 Contributing

Since this is a hobby project to level up my skills, I am totally open to Pull Requests! If you want to help out, suggest features, fix bugs, or just review some code, feel free to fork the repo and submit a PR. All help is welcome.

---

## 📄 License

This project is open-source. See the [LICENSE](LICENSE) file for details.
