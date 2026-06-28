import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { FormStepContent } from "../forms/FormStepContent";
import { FormStepFooter } from "../forms/FormStepFooter";
import { CloseIcon } from "../icons";
import type { FormSchema, MedicalCardData } from "../../types";
import { buildStepPayload, emptyCardData } from "../../types";

interface MedicalCardFormPageProps {
  patientId: number;
  patientName: string;
  medicalCardId: number;
  startAtStep?: number;
  onClose: () => void;
  onSaved: () => void;
}

export function MedicalCardFormPage({
  patientId,
  patientName,
  medicalCardId,
  startAtStep,
  onClose,
  onSaved,
}: MedicalCardFormPageProps) {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [cardData, setCardData] = useState<MedicalCardData>(emptyCardData());
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<MedicalCardData | null>(null);

  const totalSteps = formSchema?.steps.length ?? 5;
  const stepMeta = formSchema?.steps.find((s) => s.step === currentStep) ?? formSchema?.steps[0];
  const pageLabel = stepMeta?.page_label ?? `Страница №${currentStep}`;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [schema, card] = await Promise.all([
          api.getFormSchema(),
          api.getMedicalCard(medicalCardId),
        ]);
        setFormSchema(schema);
        if (card.patient_id !== patientId) {
          throw new Error("Карта не принадлежит выбранному пациенту");
        }
        setCardData(card.data);
        setInitialData(card.data);
        setCurrentStep(startAtStep ?? card.current_step ?? 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [medicalCardId, patientId, startAtStep]);

  const persistStep = async (dataToSave: MedicalCardData) => {
    setError(null);
    try {
      const updated = await api.updateStep(
        medicalCardId,
        currentStep,
        buildStepPayload(currentStep, dataToSave),
      );
      setCardData(updated.data);
      setInitialData(updated.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
      throw e;
    }
  };

  const saveCurrentStep = async (nextStep: number) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateStep(
        medicalCardId,
        nextStep,
        buildStepPayload(currentStep, cardData),
      );
      setCardData(updated.data);
      setInitialData(updated.data);
      setCurrentStep(nextStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      await saveCurrentStep(currentStep + 1);
      return;
    }
    setSaving(true);
    try {
      await api.updateStep(medicalCardId, currentStep, buildStepPayload(currentStep, cardData));
      await api.completeCard(medicalCardId);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = async () => {
    if (currentStep > 1) {
      await saveCurrentStep(currentStep - 1);
    }
  };

  const handleClear = () => {
    setCardData(emptyCardData());
  };

  const handleReset = () => {
    if (initialData) setCardData(initialData);
  };

  return (
    <div className="form-page">
      <div className="form-page__header">
        <div>
          <h2 className="form-page__title">Медицинская карта</h2>
          <p className="form-page__subtitle">{patientName}</p>
        </div>
        <button type="button" className="form-page__close" onClick={onClose} aria-label="Закрыть">
          <CloseIcon />
        </button>
      </div>

      {loading ? (
        <div className="form-page__loading">Загрузка…</div>
      ) : (
        <>
          <div className="form-page__body form-page__body--full">
            <div className="form-page__left form-page__left--wide">
              <div className="form-page__form-brand">EXPERT NEURO</div>
              <p className="form-page__form-title">
                ФОРМА № 052/у – &quot;Медицинская карта амбулаторного пациента&quot;
              </p>
              {formSchema && (
                <div className="form-page__fields">
                  <FormStepContent
                    step={currentStep}
                    mode="edit"
                    data={cardData}
                    options={formSchema.options}
                    onChange={setCardData}
                    onPersistStep={persistStep}
                  />
                </div>
              )}
            </div>
          </div>

          {error && <div className="form-page__error">{error}</div>}

          <FormStepFooter
            mode="edit"
            currentStep={currentStep}
            totalSteps={totalSteps}
            pageLabel={pageLabel}
            saving={saving}
            onPrev={handlePrev}
            onNext={handleNext}
            onClear={handleClear}
            onReset={handleReset}
          />
        </>
      )}
    </div>
  );
}
