import { Card } from "@heroui/react";

export function Step3CV() {
  return (
    <div className="flex flex-col space-y-6 py-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Your CV
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gem Hunter uses your CV to evaluate how well you match each job.
        </p>
      </div>

      <Card
        variant="secondary"
        className="border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20"
      >
        <Card.Header>
          <Card.Title className="text-indigo-900 dark:text-indigo-300">
            Where do I add my CV?
          </Card.Title>
        </Card.Header>
        <Card.Content className="text-zinc-700 dark:text-zinc-300 space-y-3">
          <p>
            To keep onboarding fast and focused, CV management is handled in{" "}
            <strong>Dashboard Settings</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>After onboarding, you will land on the dashboard.</li>
            <li>
              Open the <strong>Settings</strong> section.
            </li>
            <li>
              Upload a PDF or paste text from your LinkedIn profile there.
            </li>
          </ul>
        </Card.Content>
      </Card>

      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center mt-4">
        Click &quot;Next&quot; to continue to filter setup.
      </p>
    </div>
  );
}
