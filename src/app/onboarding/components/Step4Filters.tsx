import { useState } from "react";
import { Chip, TextField, Label, Input } from "@heroui/react";

interface Step4Props {
  formData: {
    allowedCities: string;
    rejectedKeywords: string;
    preferredKeywords: string;
  };
  updateForm: (key: keyof Step4Props["formData"], value: string) => void;
}

// Predefiniowane opcje (na podstawie wiedzy z V1 i popularnych ról)
const CITIES_PRESETS = [
  "Warszawa",
  "Kraków",
  "Wrocław",
  "Poznań",
  "Trójmiasto",
  "Gdańsk",
  "Sopot",
  "Zdalnie",
  "Remote",
];

const REJECTED_PRESETS = [
  "senior",
  "lead",
  "manager",
  "director",
  "java",
  "php",
  "c++",
  "ruby",
  "wordpress",
  "żabka",
  "sprzedawca",
  "hr",
  "marketing",
  "gamedev",
];

const PREFERRED_PRESETS = [
  "react",
  "typescript",
  "python",
  "automation",
  "ai",
  "ml",
  "support",
  "junior",
  "mid",
  "staż",
  "intern",
];

interface FilterSectionProps {
  title: string;
  description: string;
  color: "default" | "success" | "warning" | "danger" | "accent";
  value: string;
  onChange: (newValue: string) => void;
  presets: string[];
}

function FilterSection({
  title,
  description,
  color,
  value,
  onChange,
  presets,
}: FilterSectionProps) {
  const [inputValue, setInputValue] = useState("");

  // Konwersja ze stringa (np. "java, php") na tablicę ["java", "php"]
  const activeItems = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleAdd = (itemToAdd: string) => {
    const cleanItem = itemToAdd.trim().toLowerCase();
    if (!cleanItem) return;

    // Sprawdzamy czy już istnieje (żeby nie było duplikatów)
    const exists = activeItems.some((i) => i.toLowerCase() === cleanItem);
    if (!exists) {
      const newItems = [...activeItems, cleanItem];
      onChange(newItems.join(", "));
    }
    setInputValue(""); // Czyścimy input po dodaniu
  };

  const handleRemove = (itemToRemove: string) => {
    const newItems = activeItems.filter(
      (i) => i.toLowerCase() !== itemToRemove.toLowerCase(),
    );
    onChange(newItems.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  // Filtrujemy presety, żeby nie pokazywać tych, które już są dodane
  const availablePresets = presets.filter(
    (preset) =>
      !activeItems.some((i) => i.toLowerCase() === preset.toLowerCase()),
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Aktywne żetony */}
      <div className="flex flex-wrap gap-2 min-h-8">
        {activeItems.length === 0 ? (
          <span className="text-sm text-zinc-400 italic">
            Brak dodanych filtrów
          </span>
        ) : (
          activeItems.map((item) => (
            <Chip key={item} color={color} variant="soft" size="md">
              <Chip.Label>{item}</Chip.Label>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-1 opacity-60 hover:opacity-100 focus:outline-none"
                aria-label={`Usuń ${item}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </Chip>
          ))
        )}
      </div>

      {/* Input do dodawania własnych */}
      <div className="flex gap-2 items-end">
        <TextField className="flex-1">
          <Label className="sr-only">Dodaj własne</Label>
          <Input
            placeholder="Wpisz i wciśnij Enter..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </TextField>
        <button
          type="button"
          onClick={() => handleAdd(inputValue)}
          disabled={!inputValue.trim()}
          className="px-4 py-2 h-10 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Dodaj
        </button>
      </div>

      {/* Szybkie presety (Gotowce) */}
      {availablePresets.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">
            Szybki wybór:
          </p>
          <div className="flex flex-wrap gap-2">
            {availablePresets.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => handleAdd(preset)}
                className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700/50"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Step4Filters({ formData, updateForm }: Step4Props) {
  return (
    <div className="flex flex-col space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Ostatni krok: Filtry
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ustal reguły, według których n8n i AI będą przesiewać oferty. Im
          bardziej precyzyjne słowa kluczowe, tym lepsze „perełki” znajdziesz.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <FilterSection
          title="📍 Lokalizacje i Tryb Pracy"
          description="Gdzie szukasz pracy? Wpisz miasta (jeśli szukasz stacjonarnie/hybrydowo) lub zostaw 'Remote'."
          color="accent"
          value={formData.allowedCities}
          onChange={(val) => updateForm("allowedCities", val)}
          presets={CITIES_PRESETS}
        />

        <FilterSection
          title="🚫 Czego unikać? (Red Flags)"
          description="Jeśli oferta zawiera te słowa, system od razu wyrzuci ją do kosza. Oszczędzaj tokeny AI!"
          color="danger"
          value={formData.rejectedKeywords}
          onChange={(val) => updateForm("rejectedKeywords", val)}
          presets={REJECTED_PRESETS}
        />

        <FilterSection
          title="⭐ Słowa Premium (Zielone Flagi)"
          description="Technologie i słowa kluczowe, za które AI przyzna dodatkowe punkty (np. Twój ulubiony stack)."
          color="success"
          value={formData.preferredKeywords}
          onChange={(val) => updateForm("preferredKeywords", val)}
          presets={PREFERRED_PRESETS}
        />
      </div>
    </div>
  );
}
