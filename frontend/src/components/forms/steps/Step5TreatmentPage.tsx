import { useMemo } from "react";
import type { FormSchema, MedicalCardData } from "../../../types";
import {
  getActiveCourse,
  normalizeTreatment,
  normalizeTreatmentProcedures,
  updateTreatmentCourses,
} from "../../../types";
import { CourseBlock } from "../CourseBlock";
import { TreatmentProceduresPanel } from "../TreatmentProceduresPanel";
import {
  PfCheckboxGrid,
  PfField,
  PfSectionTitle,
  PfTextarea,
} from "../PatientFormFields";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step5TreatmentPage({ data, options, onChange }: StepProps) {
  const treatment = normalizeTreatment(data.treatment);
  const activeCourse = getActiveCourse(treatment);

  const updateActiveCourse = (patch: Partial<typeof activeCourse>) => {
    onChange({
      ...data,
      treatment: updateTreatmentCourses(treatment, (courses, activeId) => ({
        courses: courses.map((c) => (c.id === activeId ? { ...c, ...patch } : c)),
      })),
    });
  };

  const recommendations = options.recommendations ?? [];
  const recMid = Math.ceil(recommendations.length / 2);
  const recLeft = recommendations.slice(0, recMid);
  const recRight = recommendations.slice(recMid);

  const procedures = useMemo(
    () => normalizeTreatmentProcedures(activeCourse.procedures),
    [activeCourse.procedures],
  );

  const drugOptions = useMemo(
    () => [...(options.injectionDrugs ?? []), ...(options.medications ?? [])],
    [options.injectionDrugs, options.medications],
  );

  return (
    <div className="patient-form">
      <PfSectionTitle>Лечение</PfSectionTitle>
      <CourseBlock data={data} options={options} onChange={onChange} compact />

      <div className="pf-pain-details">
        <p className="pf-pain-details__title">
          Аппаратная терапия и инъекции
          {treatment.courses.length > 1 ? ` · курс ${activeCourse.number}` : ""}
        </p>
        <TreatmentProceduresPanel
          procedures={procedures}
          procedureOptions={options.procedures ?? []}
          drugOptions={drugOptions}
          onChange={(next) => updateActiveCourse({ procedures: next })}
          title={`План процедур · курс ${activeCourse.number}`}
          emptyText="Добавьте процедуры для выбранного курса лечения"
        />
      </div>

      <PfSectionTitle>
        Рекомендации
        {treatment.courses.length > 1 ? ` · курс ${activeCourse.number}` : ""}
      </PfSectionTitle>
      <div className="pf-pain-details">
        <PfCheckboxGrid
          layout="2"
          columns={[
            {
              label: "Рекомендации",
              values: activeCourse.recommendations.filter((r) => recLeft.includes(r)),
              options: recLeft,
              onChange: (left) => {
                const right = activeCourse.recommendations.filter((r) => recRight.includes(r));
                updateActiveCourse({ recommendations: [...left, ...right] });
              },
            },
            {
              label: "",
              values: activeCourse.recommendations.filter((r) => recRight.includes(r)),
              options: recRight,
              onChange: (right) => {
                const left = activeCourse.recommendations.filter((r) => recLeft.includes(r));
                updateActiveCourse({ recommendations: [...left, ...right] });
              },
            },
          ]}
        />
      </div>

      <div className="patient-form__block">
        <div className="patient-form__grid patient-form__grid--2">
          <PfField
            label="ЛФК (раз в нед)"
            value={activeCourse.lfk_per_week ?? ""}
            onChange={(v) => updateActiveCourse({ lfk_per_week: v || null })}
          />
          <PfField
            label="Скандинавская ходьба (шагов)"
            value={activeCourse.walking_steps ?? ""}
            onChange={(v) => updateActiveCourse({ walking_steps: v || null })}
          />
        </div>

        <PfTextarea
          label="Дополнительные рекомендации"
          value={activeCourse.additional_recs ?? ""}
          onChange={(v) => updateActiveCourse({ additional_recs: v || null })}
          rows={3}
        />
      </div>
    </div>
  );
}
