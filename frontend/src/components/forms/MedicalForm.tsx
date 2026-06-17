import { useCallback, useState } from "react";
import { api } from "../../api/client";
import type { FormSchema, MedicalCard, MedicalCardData } from "../../types";
import { buildStepPayload } from "../../types";
import { ProgressBar } from "../ui/ProgressBar";
import { Step1Passport } from "./Step1Passport";
import { Step2Anamnesis } from "./Step2Anamnesis";
import { Step3Diagnostics } from "./Step3Diagnostics";
import { Step4Diagnosis } from "./Step4Diagnosis";
import { Step5Treatment } from "./Step5Treatment";

interface MedicalFormProps {
  card: MedicalCard;
  schema: FormSchema;
  onCardUpdate: (card: MedicalCard) => void;
}

export function MedicalForm({ card, schema, onCardUpdate }: MedicalFormProps) {
  const [step, setStep] = useState(card.current_step);
  const [data, setData] = useState<MedicalCardData>(card.data);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const totalSteps = schema.steps.length;
  const currentStepMeta = schema.steps.find((s) => s.step === step) ?? schema.steps[0];

  const saveStep = useCallback(
    async (nextStep: number) => {
      setSaving(true);
      try {
        const payload = buildStepPayload(step, data);
        const updated = await api.updateStep(card.id, nextStep, payload);
        onCardUpdate(updated);
        setData(updated.data);
        setStep(nextStep);
      } finally {
        setSaving(false);
      }
    },
    [card.id, data, onCardUpdate, step],
  );

  const handleNext = async () => {
    if (step < totalSteps) {
      await saveStep(step + 1);
    }
  };

  const handleBack = async () => {
    if (step > 1) {
      await saveStep(step - 1);
    }
  };

  const handleGeneratePdf = async () => {
    setGenerating(true);
    try {
      await api.updateStep(card.id, step, buildStepPayload(step, data));
      await api.completeCard(card.id);
      const result = await api.generatePdf(card.id);
      window.open(result.download_url, "_blank");
    } finally {
      setGenerating(false);
    }
  };

  const renderStep = () => {
    const props = { data, options: schema.options, onChange: setData };
    switch (step) {
      case 1:
        return <Step1Passport {...props} />;
      case 2:
        return <Step2Anamnesis {...props} />;
      case 3:
        return <Step3Diagnostics {...props} />;
      case 4:
        return <Step4Diagnosis {...props} />;
      case 5:
        return <Step5Treatment {...props} />;
      default:
        return null;
    }
  };

  return (
    <section className="form-card">
      <div className="form-card__brand">
        <div className="form-card__logo">EXPERT NEURO</div>
      </div>
      <h2 className="form-card__title">
        ФОРМА № 052/у – &quot;Медицинская карта амбулаторного пациента&quot;
      </h2>

      <div className="form-body">{renderStep()}</div>

      <footer className="form-footer">
        <ProgressBar
          currentStep={step}
          totalSteps={totalSteps}
          pageLabel={currentStepMeta.page_label}
        />
        <div className="form-actions">
          {step > 1 && (
            <button
              type="button"
              className="btn-nav btn-nav--back"
              onClick={handleBack}
              disabled={saving}
            >
              Назад
            </button>
          )}
          {step < totalSteps ? (
            <button
              type="button"
              className="btn-nav btn-nav--next"
              onClick={handleNext}
              disabled={saving}
            >
              {saving ? "Сохранение…" : "Далее"}
            </button>
          ) : (
            <button
              type="button"
              className="btn-nav btn-nav--generate"
              onClick={handleGeneratePdf}
              disabled={generating || saving}
            >
              {generating ? "Формирование…" : "Сформировать PDF"}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
