import { Card } from "@heroui/react";

export function Step3CV() {
  return (
    <div className="flex flex-col space-y-6 py-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Twoje CV
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gem Hunter używa Twojego CV, żeby oceniać, jak dobrze pasujesz do
          danej oferty pracy.
        </p>
      </div>

      <Card
        variant="secondary"
        className="border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20"
      >
        <Card.Header>
          <Card.Title className="text-indigo-900 dark:text-indigo-300">
            Gdzie dodam swoje CV?
          </Card.Title>
        </Card.Header>
        <Card.Content className="text-zinc-700 dark:text-zinc-300 space-y-3">
          <p>
            Aby ułatwić i przyspieszyć start aplikacji, zarządzanie CV zostało
            przeniesione bezpośrednio do <strong>Ustawień Dashboardu</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Kiedy skończysz Onboarding, trafisz na Główny Panel.</li>
            <li>
              Wejdziesz tam w zakładkę <strong>Ustawienia</strong>.
            </li>
            <li>
              Tam czeka na Ciebie wygodny panel: wrzucisz plik PDF lub po prostu
              wkleisz tekst ze swojego profilu LinkedIn.
            </li>
          </ul>
        </Card.Content>
      </Card>

      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 text-center mt-4">
        Kliknij "Dalej", aby przejść do najważniejszego kroku — konfiguracji
        Twoich filtrów.
      </p>
    </div>
  );
}
