import Image from "next/image";

export function Step1Welcome() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
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
          Welcome to Gem Hunter
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Automate your job search. Configure your API key, set your filters,
          and let AI surface the best opportunities for you.
        </p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4 w-full max-w-sm text-sm text-zinc-700 dark:text-zinc-300 text-left space-y-2">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          What you need to get started:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>An OpenRouter.ai API key</li>
          <li>Your preferred cities and work mode</li>
          <li>Keywords that match your preferred stack</li>
        </ul>
      </div>
    </div>
  );
}
