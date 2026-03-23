"use server";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { redirect } from "next/navigation";

export async function saveOnboardingState(prevState: any, formData: FormData) {
  try {
    const apiKey = (formData.get("apiKey") as string) || "";
    const allowedCities = (formData.get("allowedCities") as string) || "";
    const rejectedKeywords = (formData.get("rejectedKeywords") as string) || "";
    const preferredKeywords = (formData.get("preferredKeywords") as string) || "";

    // Convert comma separated strings to arrays
    const parseList = (str: string) =>
      str.split(",").map((s) => s.trim()).filter(Boolean);

    const filtersJson = JSON.stringify({
      locations: parseList(allowedCities),
      rejected_keywords: parseList(rejectedKeywords),
      preferred_keywords: parseList(preferredKeywords),
    });

    // Upsert into settings (id = 1)
    await db
      .insert(settings)
      .values({
        id: 1,
        active_llm: "openrouter",
        api_key: apiKey,
        cv_text: "",
        filters_json: filtersJson,
        last_sync_status: "idle",
      })
      .onConflictDoUpdate({
        target: settings.id,
        set: {
          active_llm: "openrouter",
          api_key: apiKey,
          filters_json: filtersJson,
        },
      });
  } catch (error) {
    console.error("Error saving settings:", error);
    return { error: "Wystąpił błąd podczas zapisywania ustawień." };
  }

  // Redirect to dashboard on success (must be outside try-catch because redirect throws internally)
  redirect("/dashboard");
}
