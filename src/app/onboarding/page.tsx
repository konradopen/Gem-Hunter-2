"use client";
import { Step1Welcome } from "./components/Step1Welcome";
import { Step2Api } from "./components/Step2Api";
import { Step3CV } from "./components/Step3CV";
import { Step4Filters } from "./components/Step4Filters";
import { Step5Success } from "./components/Step5Success";

import { useEffect, useRef, useState, useActionState } from "react";
import { saveOnboardingState } from "../actions/settings";

import { ProgressBar, Button, Spinner } from "@heroui/react";

export default function OnboardingPage() {
  const LAST_WIZARD_STEP = 5;
  const TOTAL_CONFIG_STEPS = 4;

  const [step, setStep] = useState(1);
  const [renderedStep, setRenderedStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    apiKey: "",
    allowedCities: "Gdańsk, Sopot, Trójmiasto",
    rejectedKeywords:
      "senior, lead, manager, java, c++, php, wordpress, żabka, sprzedawca, hr, marketing, gamedev",
    preferredKeywords: "automation, ai, python, support, junior, mid",
  });

  const [state, formAction, isPending] = useActionState(
    saveOnboardingState,
    null,
  );

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Keep browser page scrolling disabled while the wizard is visible.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const goToStep = (next: number) => {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    setIsTransitioning(true);

    transitionTimeoutRef.current = window.setTimeout(() => {
      setRenderedStep(next);

      window.requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 140);

    setStep(next);
  };

  const nextStep = () => {
    goToStep(Math.min(step + 1, LAST_WIZARD_STEP));
  };

  const prevStep = () => {
    goToStep(Math.max(step - 1, 1));
  };

  const completedSteps = Math.max(0, Math.min(renderedStep - 1, TOTAL_CONFIG_STEPS));
  const progressValue = (completedSteps / TOTAL_CONFIG_STEPS) * 100;
  const shouldShowProgress =
    renderedStep > 1 && renderedStep < LAST_WIZARD_STEP;
  const canGoBack = renderedStep > 1 && renderedStep < LAST_WIZARD_STEP;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 overflow-hidden">
      <form
        action={formAction}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col gap-6 overflow-hidden"
      >
        <input type="hidden" name="apiKey" value={formData.apiKey} />
        <input
          type="hidden"
          name="allowedCities"
          value={formData.allowedCities}
        />
        <input
          type="hidden"
          name="rejectedKeywords"
          value={formData.rejectedKeywords}
        />
        <input
          type="hidden"
          name="preferredKeywords"
          value={formData.preferredKeywords}
        />

        {shouldShowProgress && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-zinc-500 font-medium">
              <span>{`Step ${Math.min(renderedStep, TOTAL_CONFIG_STEPS)} of ${TOTAL_CONFIG_STEPS}`}</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <ProgressBar
              aria-label="Onboarding progress"
              value={progressValue}
              color="success"
              size="sm"
            >
              <ProgressBar.Track className="bg-zinc-100 dark:bg-zinc-800">
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          </div>
        )}

        <div className="min-h-0 flex flex-col justify-center">
          <div
            className={[
              "transition-all duration-150 ease-out motion-reduce:transition-none",
              isTransitioning
                ? "opacity-0 translate-y-1"
                : "opacity-100 translate-y-0",
            ].join(" ")}
          >
            {renderedStep === 1 && <Step1Welcome />}
            {renderedStep === 2 && (
              <Step2Api apiKey={formData.apiKey} updateForm={updateForm} />
            )}
            {renderedStep === 3 && <Step3CV />}
            {renderedStep === 4 && (
              <Step4Filters formData={formData} updateForm={updateForm} />
            )}
            {renderedStep === 5 && <Step5Success />}
          </div>
        </div>

        <div className="flex justify-between mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
          {canGoBack ? (
            <Button
              key="prev-btn"
              type="button"
              onPress={prevStep}
              isDisabled={isPending}
              variant="secondary"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {renderedStep < 4 ? (
            <Button
              key="next-btn"
              type="button"
              onPress={nextStep}
              variant="primary"
              isDisabled={isPending}
            >
              Next
            </Button>
          ) : renderedStep === 4 ? (
            <Button
              key="finish-btn"
              type="button"
              onPress={nextStep}
              variant="primary"
              isDisabled={isPending}
            >
              Complete setup
            </Button>
          ) : (
            <Button
              key="submit-btn"
              type="submit"
              variant="primary"
              isPending={isPending}
              isDisabled={isPending}
            >
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : null}
                  Start
                </>
              )}
            </Button>
          )}
        </div>

        {state?.error && (
          <div className="text-danger text-sm mt-2 text-center font-medium">
            {state.error}
          </div>
        )}
      </form>
    </main>
  );
}
