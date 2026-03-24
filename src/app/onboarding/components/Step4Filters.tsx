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

// Preset options based on V1 logic and common role patterns.
const CITIES_PRESETS = [
  "Warsaw",
  "Krakow",
  "Wroclaw",
  "Poznan",
  "Tricity",
  "Gdansk",
  "Sopot",
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
  "retail",
  "cashier",
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
  "internship",
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

  // Convert comma-separated values into a normalized list.
  const activeItems = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleAdd = (itemToAdd: string) => {
    const cleanItem = itemToAdd.trim().toLowerCase();
    if (!cleanItem) return;

    // Avoid duplicate values when adding.
    const exists = activeItems.some((i) => i.toLowerCase() === cleanItem);
    if (!exists) {
      const newItems = [...activeItems, cleanItem];
      onChange(newItems.join(", "));
    }
    setInputValue("");
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

  // Show only presets that are not active yet.
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

      {/* Active chips */}
      <div className="flex flex-wrap gap-2 min-h-8">
        {activeItems.length === 0 ? (
          <span className="text-sm text-zinc-400 italic">
            No filters added yet
          </span>
        ) : (
          activeItems.map((item) => (
            <Chip key={item} color={color} variant="soft" size="md">
              <Chip.Label>{item}</Chip.Label>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-1 opacity-60 hover:opacity-100 focus:outline-none"
                aria-label={`Remove ${item}`}
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

      {/* Custom value input */}
      <div className="flex gap-2 items-end">
        <TextField className="flex-1">
          <Label className="sr-only">Add custom filter</Label>
          <Input
            placeholder="Type and press Enter..."
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
          Add
        </button>
      </div>

      {/* Preset quick picks */}
      {availablePresets.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">
            Quick pick:
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
          Final step: Filters
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Define the rules n8n and AI use to filter offers. The more specific
          your keywords are, the better matches you get.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <FilterSection
          title="📍 Locations and Work Mode"
          description="Where do you want to work? Add city names for onsite/hybrid roles, or keep Remote."
          color="accent"
          value={formData.allowedCities}
          onChange={(val) => updateForm("allowedCities", val)}
          presets={CITIES_PRESETS}
        />

        <FilterSection
          title="🚫 Exclude Keywords (Red Flags)"
          description="If an offer contains these terms, it gets filtered out immediately to save AI tokens."
          color="danger"
          value={formData.rejectedKeywords}
          onChange={(val) => updateForm("rejectedKeywords", val)}
          presets={REJECTED_PRESETS}
        />

        <FilterSection
          title="⭐ Preferred Keywords (Green Flags)"
          description="Technologies and terms that should boost AI scoring, such as your core stack."
          color="success"
          value={formData.preferredKeywords}
          onChange={(val) => updateForm("preferredKeywords", val)}
          presets={PREFERRED_PRESETS}
        />
      </div>
    </div>
  );
}
