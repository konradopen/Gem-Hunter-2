import Image from "next/image";

export function Step1Welcome() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
      {/* Nasze Logo z folderu public/ */}
      <div className="relative w-32 h-32 mb-4">
        <Image
          src="/gem.svg"
          alt="Gem Hunter Logo"
          fill
          className="object-contain drop-shadow-xl"
          priority
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Witaj w Gem Hunter!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Zautomatyzuj poszukiwania pracy. Skonfiguruj klucz API, dodaj swoje
          CV, ustal filtry i pozwól AI szukać "perełek" za Ciebie.
        </p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4 w-full max-w-sm text-sm text-zinc-700 dark:text-zinc-300 text-left space-y-2">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Czego potrzebujesz na start:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Klucz API do OpenRouter.ai</li>
          <li>Twoje miasta i preferencje pracy</li>
          <li>Słowa kluczowe (jakie technologie preferujesz)</li>
        </ul>
      </div>
    </div>
  );
}
