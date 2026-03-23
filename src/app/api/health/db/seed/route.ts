import { db } from "@/db";
import { settings } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Minimalny seed: zawsze jeden rekord settings z id=1
    // SQLite upsert: onConflictDoUpdate
    await db
      .insert(settings)
      .values({
        id: 1,
        active_llm: "openai",
        api_key: "",
        cv_text: "",
        filters_json: JSON.stringify({
          locations: [],
          keywords_must: [],
          regex_exclude: "",
        }),
        last_sync_status: "idle",
      })
      .onConflictDoUpdate({
        target: settings.id,
        set: {
          active_llm: "openai",
          last_sync_status: "idle",
        },
      });

    const row = await db
      .select()
      .from(settings)
      .where(settings.id.eq(1))
      .limit(1);

    return NextResponse.json({ ok: true, settings: row[0] ?? null });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
