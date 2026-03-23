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
          Klucz API AI
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gem Hunter używa OpenRouter.ai, aby analizować oferty. Dlaczego? Bo to
          daje dostęp do setek modeli (w tym darmowych!).
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-900/50">
        <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
          Jak zdobyć klucz?
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-blue-700 dark:text-blue-400">
          <li>
            Wejdź na{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium hover:text-blue-600 dark:hover:text-blue-300"
            >
              openrouter.ai/keys
            </a>
          </li>
          <li>Zaloguj się lub stwórz konto</li>
          <li>Kliknij "Create Key" i skopiuj go tutaj</li>
        </ol>
      </div>

      <TextField className="w-full">
        <Label>Klucz API OpenRouter</Label>
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
          Klucz jest bezpieczny - będzie zapisany tylko lokalnie w Twojej bazie
          SQLite na komputerze.
        </Description>
      </TextField>
    </div>
  );
}
