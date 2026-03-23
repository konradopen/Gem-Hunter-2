# 💎 Gem Hunter

> A self-hosted, local-first job discovery and AI scoring app designed to find your next great role with zero repetitive work.
> 
> **Note:** This is primarily a personal hobby project aimed at evolving my programming skills, but I'm building it in public!

Gem Hunter automates the tedious parts of job hunting. It searches for jobs in the background, filters them, scores them against your CV using AI (OpenAI, Gemini, or DeepSeek), and presents the best matches in a fast, swipeable interface.

---

## 🛑 Prerequisites

Gem Hunter is a local-first application. To ensure your data stays private and the app runs smoothly, it relies on a local background worker. 

### Docker Desktop
The background worker that scrapes and processes jobs requires **Docker Desktop** to be installed and running on your machine.
*   Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
*   Make sure Docker is running before launching Gem Hunter.

---

## 🎯 Target Market (v1)

For version 1, this project specifically targets the **Polish job market**. We are utilizing the sitemaps provided by:
*   [JustJoin.it](https://justjoin.it/robots.txt)
*   [RocketJobs.pl](https://rocketjobs.pl/robots.txt)

## ✨ How It Works

Gem Hunter is designed to save API credits and your time by using a highly efficient, multi-stage pipeline where **scraping is completely decoupled from filtering**. The database acts as a vault, meaning you can change your filters in the UI and instantly see updated results without needing to re-scrape the internet.

1. **Instant UI Filtering:** Change your filters (locations, regex, salary) in the app and instantly re-evaluate your local database. Jobs upgrade or downgrade their status immediately without any network calls.
2. **Shallow Scraping:** In the background, we pull new job URLs directly from the JustJoin.it and RocketJobs.pl sitemaps and save them to the local database.
3. **Initial Hard Filtering:** User-defined hard filters reduce the massive list of URLs down to a manageable couple hundred potential matches.
4. **Deep Scraping:** We fetch the full HTML/description *only* for the jobs that passed the initial filters.
5. **Second Hard Filtering:** We run regex and keyword filters again, this time against the newly fetched full job descriptions.
6. **First AI Pass (Scoring):** We use a cost-effective LLM to score the remaining, highly-targeted jobs (0-100) against your uploaded CV.
7. **Casino Screen:** You review the AI-scored matches one at a time with a fast, swipe-style interface and save your favorites as "Gems".
8. **Second AI Pass (Premium):** For your saved Gems, you can manually trigger a heavier, more expensive AI model (like GPT-5.4 or Gemini 3.1 Pro) to generate a highly personalized recruiter message and a custom "summary" section for your CV tailored perfectly to that specific offer.

## 🏗️ Architecture & Stack

*   **Frontend / Controller:** Next.js (App Router), React, TypeScript
*   **UI System:** HeroUI v3 & Tailwind CSS
*   **Database:** Local SQLite (`database.sqlite`) via Drizzle ORM
*   **Background Worker:** n8n Community Edition (running via Docker)
*   **CV Parsing:** `pdf-parse`
*   **Desktop Launcher:** Python + CustomTkinter + PyInstaller -> `GemHunter.exe`

## 🤝 Contributing

Since this is a hobby project to level up my skills, I am totally open to Pull Requests! If you want to help out, suggest features, fix bugs, or just review some code, feel free to fork the repo and submit a PR. All help is welcome.

## 🚀 Development Setup

If you want to run the project from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/wojciechsacewicz/gem-hunter-2.git
   cd gem-hunter-2
   ```

2. Start the background worker (requires Docker):
   ```bash
   docker compose up -d
   ```

3. Install dependencies and start the Next.js app:
   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser. 

## 📄 License

This project is open-source. See the [LICENSE](LICENSE) file for details.
