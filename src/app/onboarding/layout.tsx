import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type OnboardingLayoutProps = {
  children: ReactNode;
};

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  const [userSettings] = await db
    .select({ finished_onboarding: settings.finished_onboarding })
    .from(settings)
    .where(eq(settings.id, 1))
    .limit(1);

  if (userSettings?.finished_onboarding) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
