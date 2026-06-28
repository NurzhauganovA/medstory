import type { FormSchema, MedicalCardData } from "../../types";
import {
  CalendarIcon,
  LocationIcon,
  PfAssessmentGroup,
  PfCheckboxGrid,
  PfField,
  PfSectionTitle,
  PfSegmentGroup,
  PfSelect,
  PfTextarea,
} from "./PatientFormFields";

interface PatientDataFormProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function PatientDataForm({ data, options, onChange }: PatientDataFormProps) {
  const setPassport = (key: keyof MedicalCardData["passport"], value: string) => {
    onChange({
      ...data,
      passport: { ...data.passport, [key]: value || null },
    });
  };

  const setPain = (patch: Partial<MedicalCardData["anamnesis"]["pain"]>) => {
    onChange({
      ...data,
      anamnesis: {
        ...data.anamnesis,
        pain: { ...data.anamnesis.pain, ...patch },
      },
    });
  };

  const setAnamnesis = (patch: Partial<MedicalCardData["anamnesis"]>) => {
    onChange({ ...data, anamnesis: { ...data.anamnesis, ...patch } });
  };

  const pain = data.anamnesis.pain;
  const painYes = pain.is_present === true;
  const painLocalization = ["Нет", ...(options.painLocalization ?? [])];

  return (
    <div className="patient-form">
      <PfSectionTitle>Паспортные данные</PfSectionTitle>
      <div className="patient-form__block">
        <div className="patient-form__grid patient-form__grid--2">
          <PfField label="ИИН" value={data.passport.iin ?? ""} onChange={(v) => setPassport("iin", v)} />
          <PfField label="Номер телефона" value={data.passport.phone ?? ""} onChange={(v) => setPassport("phone", v)} />
          <PfField label="ФИО" value={data.passport.full_name ?? ""} onChange={(v) => setPassport("full_name", v)} />
          <PfField label="Эл. почта" value={data.passport.email ?? ""} onChange={(v) => setPassport("email", v)} />
          <PfField label="Дата рождения" type="date" value={data.passport.birth_date ?? ""} onChange={(v) => setPassport("birth_date", v)} icon={<CalendarIcon />} />
          <PfField label="Дата обращения" type="date" value={data.passport.visit_date ?? ""} onChange={(v) => setPassport("visit_date", v)} icon={<CalendarIcon />} />
        </div>

        <PfSelect
          label="Филиал"
          value={data.passport.branch ?? ""}
          onChange={(v) => setPassport("branch", v)}
          options={options.branches ?? []}
          placeholder="Выберите филиал"
          icon={<LocationIcon />}
          fullWidth
        />
      </div>

      <PfSectionTitle>Жалобы пациента</PfSectionTitle>
      <div className="patient-form__block">
        <PfTextarea
          label="Жалобы"
          value={data.anamnesis.patient_words ?? ""}
          onChange={(v) => setAnamnesis({ patient_words: v || null })}
          rows={3}
        />
      </div>

      <PfSectionTitle>Боли</PfSectionTitle>
      <div className="pf-assessment">
        <PfAssessmentGroup label="Наличие">
          <PfSegmentGroup
            value={pain.is_present}
            options={[
              { value: true, label: "Есть" },
              { value: false, label: "Нет" },
            ]}
            onChange={(v) => setPain({ is_present: v })}
          />
        </PfAssessmentGroup>
        {painYes && (
          <>
            <PfAssessmentGroup label="Длительность">
              <PfSegmentGroup
                value={pain.duration}
                options={(options.painDuration ?? []).map((o) => ({ value: o, label: o }))}
                onChange={(v) => setPain({ duration: v })}
              />
            </PfAssessmentGroup>
            <PfAssessmentGroup label="Интенсивность">
              <PfSegmentGroup
                value={pain.intensity}
                options={(options.painIntensity ?? []).map((o) => ({ value: o, label: o }))}
                onChange={(v) => setPain({ intensity: v })}
              />
            </PfAssessmentGroup>
          </>
        )}
      </div>

      {painYes && (
        <div className="pf-pain-details">
          <p className="pf-pain-details__title">Характеристики боли</p>
          <PfCheckboxGrid
            layout="3"
            columns={[
            { label: "Локализация боли", values: pain.localization, options: painLocalization, onChange: (v) => setPain({ localization: v }) },
            { label: "Характер боли", values: pain.character, options: options.painCharacter ?? [], onChange: (v) => setPain({ character: v }) },
            { label: "Периодичность боли", values: pain.frequency, options: options.painFrequency ?? [], onChange: (v) => setPain({ frequency: v }) },
            { label: "Что провоцирует боль", values: pain.provokes, options: options.painProvokes ?? [], onChange: (v) => setPain({ provokes: v }) },
            { label: "Что купирует боль", values: pain.relieves, options: options.painRelieves ?? [], onChange: (v) => setPain({ relieves: v }) },
            { label: "Онемение", values: data.anamnesis.numbness, options: ["Нет", ...(options.numbness ?? [])], onChange: (v) => setAnamnesis({ numbness: v }) },
          ]}
          />
        </div>
      )}
    </div>
  );
}
