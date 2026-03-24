import { TextField, Label, Input, Description } from "@heroui/react";

interface Step2Props {
  apiKey: string;
  updateForm: (key: "apiKey", value: string) => void;
}

export function Step2Api({ apiKey, updateForm }: Step2Props) {
  return (
    <div className="flex flex-col space-y-6 py-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          AI API key
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gem Hunter uses OpenRouter.ai to analyze job offers and gives you
          access to a wide range of models, including free options.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900/50">
        <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
          How to get your key
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-blue-700 dark:text-blue-400">
          <li>
            Go to{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium hover:text-blue-600 dark:hover:text-blue-300"
            >
              openrouter.ai/keys
            </a>
          </li>
          <li>Sign in or create an account</li>
          <li>Click &quot;Create Key&quot; and paste it here</li>
        </ol>
      </div>

      <TextField className="w-full">
        <Label>OpenRouter API key</Label>
        <Input
          type="password"
          placeholder="sk-or-v1-..."
          value={apiKey}
          onChange={(e) => updateForm("apiKey", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        />
        <Description>
          Your key is stored locally in your SQLite database on this machine.
        </Description>
      </TextField>
    </div>
  );
}
