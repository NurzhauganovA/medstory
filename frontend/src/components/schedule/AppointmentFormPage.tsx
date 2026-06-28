import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { FormStepContent } from "../forms/FormStepContent";
import { FormStepFooter } from "../forms/FormStepFooter";
import { CloseIcon } from "../icons";
import { AppointmentFormRight, pickNearestSlot } from "./AppointmentFormRight";
import type { FormSchema, MedicalCardData } from "../../types";
import { buildStepPayload, emptyCardData } from "../../types";
import type {
  ScheduleAppointment,
  SlotSelection,
  Specialist,
  VisitType,
} from "../../types/schedule";
import { toIsoDate } from "../../types/schedule";

export type AppointmentFormMode = "create" | "edit";

interface AppointmentFormPageProps {
  mode: AppointmentFormMode;
  appointmentId?: number;
  slot: SlotSelection | null;
  defaultSpecialist: Specialist | null;
  appointments: ScheduleAppointment[];
  specialists: Specialist[];
  onClose: () => void;
  onSaved: () => void;
}

export function AppointmentFormPage({
  mode,
  appointmentId,
  slot,
  defaultSpecialist,
  appointments,
  specialists,
  onClose,
  onSaved,
}: AppointmentFormPageProps) {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [cardData, setCardData] = useState<MedicalCardData>(emptyCardData());
  const [medicalCardId, setMedicalCardId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [visitType, setVisitType] = useState<VisitType>("Первичный прием");
  const [comment, setComment] = useState("");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()));
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [nearestTime, setNearestTime] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState("Все специалисты");
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = formSchema?.steps.length ?? 5;
  const stepMeta = formSchema?.steps.find((s) => s.step === currentStep) ?? formSchema?.steps[0];
  const pageLabel = stepMeta?.page_label ?? `Страница №${currentStep}`;
  const isCreate = mode === "create";

  const resetCreateForm = useCallback(() => {
    const data = emptyCardData();
    if (slot) {
      data.passport.visit_date = slot.date;
    } else {
      data.passport.visit_date = toIsoDate(new Date());
    }
    setCardData(data);
    setCurrentStep(1);
    setMedicalCardId(null);
    setVisitType("Первичный прием");
    setComment("");
    setSelectedSpecialistId(slot?.specialistId ?? defaultSpecialist?.id ?? specialists[0]?.id ?? null);
    setSelectedDate(slot?.date ?? toIsoDate(new Date()));
    setSelectedTime(slot?.time ?? "09:00");
    setNearestTime(!slot);
    setSpecialtyFilter(defaultSpecialist?.specialty ?? "Все специалисты");
    setSpecialistSearch("");
    setError(null);
  }, [slot, defaultSpecialist, specialists]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const schema = formSchema ?? (await api.getFormSchema());
        if (!formSchema) setFormSchema(schema);

        if (mode === "edit" && appointmentId) {
          const booking = await api.getBooking(appointmentId);
          setCardData(booking.card_data);
          setMedicalCardId(booking.medical_card_id);
          setCurrentStep(booking.current_step || 1);
          setVisitType(
            booking.appointment_type?.includes("Повторный")
              ? "Повторный прием"
              : "Первичный прием",
          );
          setComment(booking.comment ?? "");
          setSelectedSpecialistId(booking.specialist_id);
          setSelectedDate(booking.appointment_date);
          setSelectedTime(booking.time_start);
          setNearestTime(false);
          setSpecialtyFilter(booking.specialist_specialty ?? "Все специалисты");
        } else {
          resetCreateForm();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mode, appointmentId, resetCreateForm]);

  useEffect(() => {
    if (!isCreate || !nearestTime) return;
    const picked = pickNearestSlot(specialists, selectedDate, appointments, specialtyFilter);
    if (picked) {
      setSelectedSpecialistId(picked.specialistId);
      setSelectedTime(picked.time);
    }
  }, [nearestTime, selectedDate, specialists, appointments, specialtyFilter, isCreate]);

  const canSubmit = Boolean(
    cardData.passport.full_name?.trim() &&
      selectedSpecialistId != null &&
      selectedDate &&
      selectedTime,
  );

  const persistStep = async (dataToSave: MedicalCardData) => {
    if (!medicalCardId) return;
    setError(null);
    try {
      const updated = await api.updateStep(
        medicalCardId,
        currentStep,
        buildStepPayload(currentStep, dataToSave),
      );
      setCardData(updated.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
      throw e;
    }
  };

  const saveCurrentStep = async (nextStep: number) => {
    if (!medicalCardId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateStep(
        medicalCardId,
        nextStep,
        buildStepPayload(currentStep, cardData),
      );
      setCardData(updated.data);
      setCurrentStep(nextStep);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!canSubmit || !selectedSpecialistId) return;
    setSaving(true);
    setError(null);
    try {
      await api.createBooking({
        specialist_id: selectedSpecialistId,
        appointment_date: selectedDate,
        time_start: selectedTime,
        appointment_type: visitType,
        comment: comment || null,
        card_data: cardData,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleEditNext = async () => {
    if (currentStep < totalSteps) {
      await saveCurrentStep(currentStep + 1);
      return;
    }
    if (!medicalCardId) return;
    setSaving(true);
    try {
      await api.updateStep(medicalCardId, currentStep, buildStepPayload(currentStep, cardData));
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPrev = async () => {
    if (currentStep > 1) {
      await saveCurrentStep(currentStep - 1);
    }
  };

  const handleClear = () => {
    setCardData(emptyCardData());
  };

  const handleReset = () => {
    if (isCreate) {
      resetCreateForm();
      return;
    }
    if (appointmentId) {
      api.getBooking(appointmentId).then((booking) => {
        setCardData(booking.card_data);
        setCurrentStep(booking.current_step || 1);
      });
    }
  };

  return (
    <div className="form-page">
      <div className="form-page__header">
        <h2 className="form-page__title">Заполните форму</h2>
        <button type="button" className="form-page__close" onClick={onClose} aria-label="Закрыть">
          <CloseIcon />
        </button>
      </div>

      {loading ? (
        <div className="form-page__loading">Загрузка…</div>
      ) : (
        <>
          <div className={`form-page__body ${isCreate ? "" : "form-page__body--full"}`}>
            <div className={`form-page__left ${isCreate ? "" : "form-page__left--wide"}`}>
              <div className="form-page__form-brand">EXPERT NEURO</div>
              <p className="form-page__form-title">
                ФОРМА № 052/у – &quot;Медицинская карта амбулаторного пациента&quot;
              </p>
              {formSchema && (
                <div className="form-page__fields">
                  <FormStepContent
                    step={currentStep}
                    mode={mode}
                    data={cardData}
                    options={formSchema.options}
                    onChange={setCardData}
                    onPersistStep={mode === "edit" ? persistStep : undefined}
                  />
                </div>
              )}
            </div>

            {isCreate && (
              <AppointmentFormRight
                specialists={specialists}
                appointments={appointments}
                selectedSpecialistId={selectedSpecialistId}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                visitType={visitType}
                comment={comment}
                nearestTime={nearestTime}
                specialtyFilter={specialtyFilter}
                specialistSearch={specialistSearch}
                onSpecialistSelect={setSelectedSpecialistId}
                onDateChange={setSelectedDate}
                onTimeSelect={(t, date) => {
                  setSelectedTime(t);
                  if (date) setSelectedDate(date);
                  setNearestTime(false);
                }}
                onVisitTypeChange={setVisitType}
                onCommentChange={setComment}
                onNearestTimeChange={setNearestTime}
                onSpecialtyFilterChange={setSpecialtyFilter}
                onSpecialistSearchChange={setSpecialistSearch}
              />
            )}
          </div>

          {error && <div className="form-page__error">{error}</div>}

          <FormStepFooter
            mode={mode}
            currentStep={currentStep}
            totalSteps={totalSteps}
            pageLabel={pageLabel}
            saving={saving}
            canSubmit={canSubmit}
            onPrev={handleEditPrev}
            onNext={handleEditNext}
            onClear={handleClear}
            onReset={handleReset}
            onConfirm={handleConfirm}
          />
        </>
      )}
    </div>
  );
}
