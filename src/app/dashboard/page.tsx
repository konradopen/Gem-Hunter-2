import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const [userSettings] = await db
    .select({ finished_onboarding: settings.finished_onboarding })
    .from(settings)
    .where(eq(settings.id, 1))
    .limit(1);

  if (!userSettings?.finished_onboarding) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">to-do</p>
      </div>
    </main>
  );
}
