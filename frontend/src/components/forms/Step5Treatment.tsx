import { FieldInput, FieldSelect, FieldTextarea, TagSelect } from "../ui/Fields";
import type { FormSchema, MedicalCardData } from "../../types";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step5Treatment({ data, options, onChange }: StepProps) {
  const setTreatment = (patch: Partial<MedicalCardData["treatment"]>) => {
    onChange({ ...data, treatment: { ...data.treatment, ...patch } });
  };

  const t = data.treatment;

  return (
    <>
      <h3 className="section-title">Лечение</h3>
      <div className="form-grid">
        <FieldSelect
          label="Курс"
          value={t.course_type ?? ""}
          onChange={(v) => setTreatment({ course_type: v || null })}
          options={options.courseTypes ?? []}
        />
        <FieldInput
          label="Координатор по лечению"
          value={t.coordinator ?? ""}
          onChange={(v) => setTreatment({ coordinator: v || null })}
        />
      </div>

      <TagSelect
        label="Процедуры"
        values={t.procedures}
        options={options.procedures ?? []}
        onChange={(v) => setTreatment({ procedures: v })}
      />

      <TagSelect
        label="Рекомендации"
        values={t.recommendations}
        options={options.recommendations ?? []}
        onChange={(v) => setTreatment({ recommendations: v })}
      />

      <div className="form-grid">
        <FieldInput
          label="ЛФК — раз в неделю"
          value={t.lfk_per_week ?? ""}
          onChange={(v) => setTreatment({ lfk_per_week: v || null })}
        />
        <FieldInput
          label="Ходьба — шагов"
          value={t.walking_steps ?? ""}
          onChange={(v) => setTreatment({ walking_steps: v || null })}
        />
        <FieldInput
          label="Дата контрольного МРТ"
          type="date"
          value={t.next_mri_date ?? ""}
          onChange={(v) => setTreatment({ next_mri_date: v || null })}
        />
      </div>

      <FieldTextarea
        label="Дополнительные рекомендации"
        value={t.additional_recs ?? ""}
        onChange={(v) => setTreatment({ additional_recs: v || null })}
        rows={3}
      />
    </>
  );
}
