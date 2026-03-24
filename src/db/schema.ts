import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  active_llm: text("active_llm"),
  api_key: text("api_key"),
  cv_text: text("cv_text"),
  filters_json: text("filters_json"),
  last_sync_status: text("last_sync_status").default("idle"),
  finished_onboarding: integer("finished_onboarding", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").unique().notNull(),
  title: text("title"),
  company: text("company"),
  location: text("location"),
  salary_min: integer("salary_min"),
  salary_max: integer("salary_max"),
  currency: text("currency"),
  description: text("description"),
  status: text("status").default("shallow"),
  ai_score: integer("ai_score"),
  ai_reason: text("ai_reason"),
  scraped_at: integer("scraped_at", { mode: "timestamp" }),
});
