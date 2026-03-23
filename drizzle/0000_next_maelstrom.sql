CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`company` text,
	`location` text,
	`salary_min` integer,
	`salary_max` integer,
	`currency` text,
	`description` text,
	`status` text DEFAULT 'shallow',
	`ai_score` integer,
	`ai_reason` text,
	`scraped_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_url_unique` ON `jobs` (`url`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`active_llm` text,
	`api_key` text,
	`cv_text` text,
	`filters_json` text,
	`last_sync_status` text DEFAULT 'idle'
);
