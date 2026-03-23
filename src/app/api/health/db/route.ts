import { db } from "@/db";
import { jobs, settings } from "@/db/schema";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settingsRow = await db.select().from(settings).limit(1);

    const jobsCountRow = await db.select({ value: count() }).from(jobs);
    const jobsCount = jobsCountRow[0]?.value ?? 0;

    return NextResponse.json({
      ok: true,
      dbFile: "database.sqlite",
      settingsExists: settingsRow.length > 0,
      jobsCount,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
