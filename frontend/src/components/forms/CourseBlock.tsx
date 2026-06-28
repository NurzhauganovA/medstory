import type { FormSchema, MedicalCardData, TreatmentCourse, TreatmentBlock } from "../../types";
import {
  addTreatmentCourse,
  getActiveCourse,
  normalizeTreatment,
  removeTreatmentCourse,
  updateTreatmentCourses,
} from "../../types";
import { PfField, PfSectionTitle, PfSelect } from "./PatientFormFields";

interface CourseBlockProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
  compact?: boolean;
}

function courseTabLabel(course: TreatmentCourse) {
  const type = course.course_type ? ` · ${course.course_type}` : "";
  return `Курс ${course.number}${type}`;
}

export function CourseBlock({ data, options, onChange, compact = false }: CourseBlockProps) {
  const treatment = normalizeTreatment(data.treatment);
  const activeCourse = getActiveCourse(treatment);
  const courseTypes = options.courseTypes ?? [];

  const setTreatment = (next: TreatmentBlock) => {
    onChange({ ...data, treatment: next });
  };

  const updateActiveCourse = (patch: Partial<TreatmentCourse>) => {
    setTreatment(
      updateTreatmentCourses(treatment, (courses, activeId) => ({
        courses: courses.map((c) => (c.id === activeId ? { ...c, ...patch } : c)),
      })),
    );
  };

  const selectCourse = (courseId: string) => {
    setTreatment({ ...treatment, active_course_id: courseId });
  };

  const handleAddCourse = () => {
    setTreatment(addTreatmentCourse(treatment, courseTypes));
  };

  const handleRemoveCourse = (courseId: string) => {
    setTreatment(removeTreatmentCourse(treatment, courseId));
  };

  return (
    <div className={`course-block ${compact ? "course-block--compact" : ""}`}>
      <div className="course-block__head">
        <PfSectionTitle>Курсы лечения</PfSectionTitle>
        <button type="button" className="btn-form btn-form--outline-sm" onClick={handleAddCourse}>
          + Добавить курс
        </button>
      </div>

      <div className="course-tabs" role="tablist">
        {treatment.courses.map((course) => (
          <button
            key={course.id}
            type="button"
            role="tab"
            aria-selected={course.id === activeCourse.id}
            className={`course-tabs__item ${course.id === activeCourse.id ? "course-tabs__item--active" : ""}`}
            onClick={() => selectCourse(course.id)}
          >
            <span className="course-tabs__label">{courseTabLabel(course)}</span>
            {course.start_date && (
              <span className="course-tabs__meta">с {course.start_date}</span>
            )}
          </button>
        ))}
      </div>

      {!compact && (
        <div className="course-block__panel">
          <div className="course-block__panel-head">
            <h4 className="course-block__panel-title">
              Курс лечения {activeCourse.number}
              {activeCourse.course_type ? ` — ${activeCourse.course_type}` : ""}
            </h4>
            {treatment.courses.length > 1 && (
              <button
                type="button"
                className="course-block__remove"
                onClick={() => handleRemoveCourse(activeCourse.id)}
              >
                Удалить курс
              </button>
            )}
          </div>

          <div className="course-block__grid">
            <PfSelect
              label="Тип курса"
              value={activeCourse.course_type ?? ""}
              onChange={(v) => updateActiveCourse({ course_type: v || null })}
              options={courseTypes}
              placeholder="Выберите тип"
            />
            <PfField
              label="Координатор"
              value={activeCourse.coordinator ?? data.passport.coordinator_name ?? ""}
              onChange={(v) => updateActiveCourse({ coordinator: v || null })}
              placeholder="ФИО координатора"
            />
            <PfField
              label="Дата начала курса"
              type="date"
              value={activeCourse.start_date ?? data.passport.visit_date ?? ""}
              onChange={(v) => updateActiveCourse({ start_date: v || null })}
            />
            <PfField
              label="Дата окончания курса"
              type="date"
              value={activeCourse.end_date ?? ""}
              onChange={(v) => updateActiveCourse({ end_date: v || null })}
            />
            <PfField
              label="Дата контрольного МРТ"
              type="date"
              value={activeCourse.next_mri_date ?? ""}
              onChange={(v) => updateActiveCourse({ next_mri_date: v || null })}
            />
          </div>

          {treatment.courses.length > 1 && (
            <p className="course-block__hint">
              Всего курсов: {treatment.courses.length}. Каждый курс хранит свой план лечения,
              процедуры и рекомендации.
            </p>
          )}
        </div>
      )}

      {compact && (
        <p className="course-block__compact-note">
          Редактируется: <strong>{courseTabLabel(activeCourse)}</strong>
        </p>
      )}
    </div>
  );
}
