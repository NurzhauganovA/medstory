import { FieldInput, FieldTextarea, TagSelect } from "../ui/Fields";
import type { FormSchema, MedicalCardData } from "../../types";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step2Anamnesis({ data, options, onChange }: StepProps) {
  const setAnamnesis = (patch: Partial<MedicalCardData["anamnesis"]>) => {
    onChange({ ...data, anamnesis: { ...data.anamnesis, ...patch } });
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

  const vitae = data.anamnesis.vitae;

  return (
    <>
      <h3 className="section-title">Anamnesis morbi</h3>
      <div className="form-grid">
        <FieldInput
          label="Когда впервые началось заболевание"
          value={data.anamnesis.onset_reason ?? ""}
          onChange={(v) => setAnamnesis({ onset_reason: v || null })}
        />
        <FieldInput
          label="С чем связывают заболевание"
          value={data.anamnesis.onset_association ?? ""}
          onChange={(v) => setAnamnesis({ onset_association: v || null })}
        />
        <FieldInput
          label="Последнее обострение"
          value={data.anamnesis.last_exacerbation ?? ""}
          onChange={(v) => setAnamnesis({ last_exacerbation: v || null })}
        />
        <FieldInput
          label="С чем связано обострение"
          value={data.anamnesis.exacerbation_reason ?? ""}
          onChange={(v) => setAnamnesis({ exacerbation_reason: v || null })}
        />
        <TagSelect
          label="Текущее состояние"
          values={data.anamnesis.current_state}
          options={options.currentState ?? []}
          onChange={(v) => setAnamnesis({ current_state: v })}
          single
        />
        <TagSelect
          label="Проведенное лечение"
          values={data.anamnesis.previous_treatment}
          options={options.previousTreatment ?? []}
          onChange={(v) => setAnamnesis({ previous_treatment: v })}
          single
        />
      </div>

      <h3 className="section-title">Anamnesis vitae</h3>
      <div className="form-grid">
        <FieldInput
          label="Диспансерный учет"
          value={vitae.dispensary_registration ?? ""}
          onChange={(v) => setVitae("dispensary_registration", v)}
        />
        <FieldInput
          label="Сопутствующие (хронические) заболевания"
          value={vitae.concomitant_diseases ?? ""}
          onChange={(v) => setVitae("concomitant_diseases", v)}
        />
        <FieldInput
          label="Перенесенные травмы и операции"
          value={vitae.past_traumas_surgeries ?? ""}
          onChange={(v) => setVitae("past_traumas_surgeries", v)}
        />
        <FieldInput
          label="Аллергия"
          value={vitae.allergies ?? ""}
          onChange={(v) => setVitae("allergies", v)}
        />
      </div>

      <h3 className="section-title">Инструментальные/Лабораторные исследования</h3>
      <FieldTextarea
        label="Инструментальные/Лабораторные исследования"
        value={data.instrumental_studies ?? ""}
        onChange={(v) => onChange({ ...data, instrumental_studies: v || null })}
        rows={5}
      />
    </>
  );
}
