import { ProgressBar } from "../ui/ProgressBar";

interface FormStepFooterProps {
  mode: "create" | "edit";
  currentStep: number;
  totalSteps: number;
  pageLabel: string;
  saving?: boolean;
  canSubmit?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onClear?: () => void;
  onReset?: () => void;
  onConfirm?: () => void;
}

export function FormStepFooter({
  mode,
  currentStep,
  totalSteps,
  pageLabel,
  saving = false,
  canSubmit = true,
  onPrev,
  onNext,
  onClear,
  onReset,
  onConfirm,
}: FormStepFooterProps) {
  const isLastStep = currentStep >= totalSteps;

  if (mode === "create") {
    return (
      <div className="form-page__footer form-page__footer--create">
        <button type="button" className="btn-form btn-form--ghost" disabled>
          🖨 Распечатать
        </button>
        <div className="form-page__footer-right">
          <button type="button" className="btn-form btn-form--ghost" onClick={onReset}>
            ✕ Сбросить
          </button>
          <button
            type="button"
            className="btn-form btn-form--primary"
            disabled={!canSubmit || saving}
            onClick={onConfirm}
          >
            {saving ? "Сохранение…" : "✓ Подтвердить запись"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page__footer form-page__footer--edit">
      <div className="form-step-footer__nav">
        <div className="form-step-footer__arrows">
          <button
            type="button"
            className="form-step-footer__arrow"
            onClick={onPrev}
            disabled={currentStep <= 1 || saving}
            aria-label="Назад"
          >
            ‹
          </button>
          <button
            type="button"
            className="form-step-footer__arrow"
            onClick={onNext}
            disabled={isLastStep || saving}
            aria-label="Вперёд"
          >
            ›
          </button>
        </div>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} pageLabel={pageLabel} />
      </div>

      <div className="form-page__footer-right">
        <button type="button" className="btn-form btn-form--muted" onClick={onClear} disabled={saving}>
          Очистить
        </button>
        {currentStep > 1 && (
          <button
            type="button"
            className="btn-form btn-form--ghost"
            onClick={onPrev}
            disabled={saving}
          >
            Назад
          </button>
        )}
        <button
          type="button"
          className="btn-form btn-form--primary"
          onClick={onNext}
          disabled={saving}
        >
          {saving ? "Сохранение…" : isLastStep ? "Завершить приём" : "Далее"}
        </button>
      </div>
    </div>
  );
}
