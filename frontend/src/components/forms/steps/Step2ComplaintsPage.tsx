import type { FormSchema, MedicalCardData } from "../../../types";
import {
  PfAssessmentGroup,
  PfCheckboxGrid,
  PfField,
  PfPainScale,
  PfSectionTitle,
  PfSegmentGroup,
  PfTextarea,
} from "../PatientFormFields";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step2ComplaintsPage({ data, options, onChange }: StepProps) {
  const setAnamnesis = (patch: Partial<MedicalCardData["anamnesis"]>) => {
    onChange({ ...data, anamnesis: { ...data.anamnesis, ...patch } });
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

  const setVitae = (key: keyof MedicalCardData["anamnesis"]["vitae"], value: string) => {
    onChange({
      ...data,
      anamnesis: {
        ...data.anamnesis,
        vitae: { ...data.anamnesis.vitae, [key]: value || null },
      },
    });
  };

  const setDiag = (patch: Partial<MedicalCardData["diagnostics"]>) => {
    onChange({ ...data, diagnostics: { ...data.diagnostics, ...patch } });
  };

  const pain = data.anamnesis.pain;
  const vitae = data.anamnesis.vitae;
  const painYes = pain.is_present === true;

  const painLocalization = ["Нет", ...(options.painLocalization ?? [])];

  return (
    <div className="patient-form">
      <PfSectionTitle>Жалобы пациента</PfSectionTitle>
      <div className="patient-form__block">
        <PfTextarea
          label="Со слов пациента"
          value={data.anamnesis.patient_words ?? ""}
          onChange={(v) => setAnamnesis({ patient_words: v || null })}
          rows={2}
          placeholder="Со слов пациента..."
        />

        <div className="patient-form__grid patient-form__grid--2">
          <PfField
            label="Когда началось и с чем связывает"
            value={data.anamnesis.onset_reason ?? ""}
            onChange={(v) => setAnamnesis({ onset_reason: v || null })}
            placeholder="Когда началось и с чем связывает..."
          />
          <PfField
            label="Последнее обострение и с чем связывает"
            value={data.anamnesis.last_exacerbation ?? ""}
            onChange={(v) => setAnamnesis({ last_exacerbation: v || null })}
            placeholder="Последнее обострение и с чем связывает..."
          />
        </div>
      </div>

      <PfSectionTitle>Оценка боли</PfSectionTitle>
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
        <>
          <PfPainScale
            value={data.diagnostics.pain_vas}
            onChange={(v) => setDiag({ pain_vas: v })}
          />

          <div className="pf-pain-details">
            <p className="pf-pain-details__title">Характеристики боли и анамнез</p>
            <PfCheckboxGrid
              layout="4"
              columns={[
              {
                label: "Локализация боли",
                values: pain.localization,
                options: painLocalization,
                onChange: (v) => setPain({ localization: v }),
              },
              {
                label: "Характер боли",
                values: pain.character,
                options: options.painCharacter ?? [],
                onChange: (v) => setPain({ character: v }),
              },
              {
                label: "Периодичность боли",
                values: pain.frequency,
                options: options.painFrequency ?? [],
                onChange: (v) => setPain({ frequency: v }),
              },
              {
                label: "Что провоцирует боль",
                values: pain.provokes,
                options: options.painProvokes ?? [],
                onChange: (v) => setPain({ provokes: v }),
              },
              {
                label: "Что купирует боль",
                values: pain.relieves,
                options: options.painRelieves ?? [],
                onChange: (v) => setPain({ relieves: v }),
              },
              {
                label: "Онемение",
                values: data.anamnesis.numbness,
                options: ["Нет", ...(options.numbness ?? [])],
                onChange: (v) => setAnamnesis({ numbness: v }),
              },
              {
                label: "Текущее состояние",
                values: data.anamnesis.current_state,
                options: options.currentState ?? [],
                onChange: (v) => setAnamnesis({ current_state: v }),
              },
              {
                label: "Проведенное ранее лечение",
                values: data.anamnesis.previous_treatment,
                options: options.previousTreatment ?? [],
                onChange: (v) => setAnamnesis({ previous_treatment: v }),
              },
            ]}
            />
          </div>

          {(pain.provokes.includes("Другое") || pain.relieves.includes("Другое")) && (
            <div className="patient-form__grid patient-form__grid--2">
              {pain.provokes.includes("Другое") && (
                <PfField
                  label="Что провоцирует — другое"
                  value={pain.provokes_other ?? ""}
                  onChange={(v) => setPain({ provokes_other: v || null })}
                />
              )}
              {pain.relieves.includes("Другое") && (
                <PfField
                  label="Что купирует — другое"
                  value={pain.relieves_other ?? ""}
                  onChange={(v) => setPain({ relieves_other: v || null })}
                />
              )}
            </div>
          )}
        </>
      )}

      <PfSectionTitle>Anamnesis morbi</PfSectionTitle>
      <div className="patient-form__block">
        <div className="patient-form__grid patient-form__grid--2">
        <PfField
          label="С чем связывают заболевание"
          value={data.anamnesis.onset_association ?? ""}
          onChange={(v) => setAnamnesis({ onset_association: v || null })}
        />
        <PfField
          label="С чем связано обострение"
          value={data.anamnesis.exacerbation_reason ?? ""}
          onChange={(v) => setAnamnesis({ exacerbation_reason: v || null })}
        />
        </div>
      </div>

      <PfSectionTitle>Anamnesis vitae</PfSectionTitle>
      <div className="patient-form__block">
        <div className="patient-form__grid patient-form__grid--3">
        <PfField
          label="Диспансерный учет"
          value={vitae.dispensary_registration ?? ""}
          onChange={(v) => setVitae("dispensary_registration", v)}
        />
        <PfField
          label="Группа крови + резус-фактор"
          value={vitae.blood_type ?? ""}
          onChange={(v) => setVitae("blood_type", v)}
        />
        <PfField
          label="Перенесенные травмы и операции"
          value={vitae.past_traumas_surgeries ?? ""}
          onChange={(v) => setVitae("past_traumas_surgeries", v)}
        />
        <PfField
          label="Антропометрические данные (вес и рост)"
          value={vitae.anthropometry ?? ""}
          onChange={(v) => setVitae("anthropometry", v)}
        />
        <PfField
          label="Вредные привычки и риски для здоровья"
          value={vitae.bad_habits ?? ""}
          onChange={(v) => setVitae("bad_habits", v)}
        />
        <PfField
          label="Контакты лечащих врачей"
          value={vitae.doctors_contacts ?? ""}
          onChange={(v) => setVitae("doctors_contacts", v)}
        />
        <PfField
          label="Сопутствующие (хронические) заболевания"
          value={vitae.concomitant_diseases ?? ""}
          onChange={(v) => setVitae("concomitant_diseases", v)}
        />
        <PfField
          label="Профилактические мероприятия, в том числе"
          value={vitae.preventive_measures ?? ""}
          onChange={(v) => setVitae("preventive_measures", v)}
        />
        <PfField
          label="Аллергические реакции МКБ код/Наименование"
          value={vitae.allergies ?? ""}
          onChange={(v) => setVitae("allergies", v)}
        />
        </div>
      </div>

      <PfSectionTitle>Инструментальные/Лабораторные исследования</PfSectionTitle>
      <div className="patient-form__block">
        <PfTextarea
        label="Инструментальные/Лабораторные исследования"
        value={data.instrumental_studies ?? ""}
        onChange={(v) => onChange({ ...data, instrumental_studies: v || null })}
        rows={3}
        />
      </div>
    </div>
  );
}
