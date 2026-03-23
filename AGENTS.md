<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:heroui-agent-rules -->
# This is NOT the HeroUI you know.

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. You MUST ALWAYS use the `get_component_docs` MCP tool to read the latest HeroUI v3.0.1 docs for ANY component before writing code that uses it. NEVER guess the syntax or rely on your NextUI v2 training data. Heed deprecation notices.
<!-- END:heroui-agent-rules -->

<!-- BEGIN:interview-mode-rules -->
# Mandatory Pre-Implementation Interview Mode

Before writing code or implementing ANY new feature, you MUST conduct a deep interview with the user to align on the technical approach. Do not skip this step. 

1. **Present Options**: Always propose at least 3 distinct implementation paths:
   - **Option A**: [Describe approach A, e.g., the standard/simplest way]
   - **Option B**: [Describe approach B, e.g., an alternative UI/UX or architectural pattern]
   - **Option C**: [Describe approach C, e.g., the most robust or advanced way]
   - **Option D (Custom)**: Ask the user if they have their own specific idea.
2. **Deep Interview**: Ask clarifying questions about edge cases, user experience, and technical preferences. 
3. **Post-Interview Summary**: Once the user selects an option or provides their vision, you MUST summarize the final implementation plan in a structured way.
4. **Request Permission**: Only *after* presenting the final summary should you ask for the user's explicit consent to begin writing the code.
<!-- END:interview-mode-rules -->

<!-- BEGIN:session-start-tasks -->
# Session Start Tasks & Core Rules

**At the beginning of EVERY new session, you MUST:**
1. **Context Initialization**: Read `AGENT-MEMORY.md`, `AGENT-CONTEXT.md`, and `SCHEDULE.md` if you haven't already.
2. **Version Discrepancy Acknowledgement**: Explicitly acknowledge that the project uses Next.js 16 (App Router), React 19, HeroUI v3, and Tailwind v4. Your training data is OUTDATED.
3. **Strict Documentation Rule**: NEVER GUESS APIs. Use MCP tools (`heroui` / `get_component_docs`, `context7`) or read local docs (`node_modules/next/dist/docs/`) before writing UI code, Server Actions, or Route Handlers.
4. **Schedule Tracking**: Look at `SCHEDULE.md` to find the next unchecked task. Check off `[x]` tasks in `SCHEDULE.md` as you complete them.
5. **Memory Update**: Update `AGENT-MEMORY.md` live after EVERY MAJOR task is completed (not just at the end of the session). This ensures safe handoffs and minimizes memory loss in case of unexpected interruptions.

**Permanent Information & Architectural Rules:**
- **Stack**: Next.js 16, React 19, HeroUI v3, Tailwind v4, SQLite (Drizzle ORM), Python Launcher.
- **Local Ports**: App runs on `:3000`, n8n runs on `:5678`.
- **Data Flow**: Strict decoupling. Scraping/Filtering (n8n + local Next.js scripts) saves to SQLite. UI reads from SQLite.
- **Decision Defaults**: Prefer simplicity over abstraction, local-first over cloud dependency, explicit naming, and readability. Read files before editing. Always state a brief plan before major changes.
<!-- END:session-start-tasks -->
