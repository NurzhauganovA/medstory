import { useMemo, useState } from "react";
import type { BodyMapMarker, FormSchema, MedicalCardData, PathologyRow } from "../../../types";
import {
  emptyPathologyRow,
  getActiveCourse,
  getPathologyRows,
  normalizeBodyMapMarkers,
  normalizeTreatment,
  syncMriFromPathologyRows,
  updateTreatmentCourses,
} from "../../../types";
import { BodyMapEditor } from "../BodyMapEditor";
import { CourseBlock } from "../CourseBlock";
import { Icd10Search } from "../Icd10Search";
import {
  PfAssessmentGroup,
  PfSectionTitle,
  PfSegmentGroup,
  PfSelect,
  PfTextarea,
} from "../PatientFormFields";
import { VoiceInputWrap } from "../../ui/VoiceInput";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
  onPersistStep?: (data: MedicalCardData) => Promise<void>;
}


export function Step4DiagnosisPage({ data, options, onChange, onPersistStep }: StepProps) {
  const [recPick, setRecPick] = useState("");

  const setDiagnosis = (patch: Partial<MedicalCardData["diagnosis"]>) => {
    onChange({ ...data, diagnosis: { ...data.diagnosis, ...patch } });
  };

  const persistBodyMapMarkers = async (body_map_markers: BodyMapMarker[]) => {
    if (!onPersistStep) return;
    await onPersistStep({
      ...data,
      diagnosis: { ...data.diagnosis, body_map_markers },
    });
  };

  const setMri = (patch: Partial<MedicalCardData["diagnosis"]["mri"]>) => {
    onChange({
      ...data,
      diagnosis: {
        ...data.diagnosis,
        mri: { ...data.diagnosis.mri, ...patch },
      },
    });
  };

  const treatment = normalizeTreatment(data.treatment);
  const activeCourse = getActiveCourse(treatment);

  const updateActiveCourseRecommendations = (recommendations: string[]) => {
    onChange({
      ...data,
      treatment: updateTreatmentCourses(treatment, (courses, activeId) => ({
        courses: courses.map((c) => (c.id === activeId ? { ...c, recommendations } : c)),
      })),
    });
  };

  const mri = data.diagnosis.mri;
  const icdList = data.diagnosis.icd10_list;
  const pathologyRows = getPathologyRows(data.diagnosis);
  const recommendations = activeCourse.recommendations;

  const updatePathologyRows = (rows: PathologyRow[]) => {
    setDiagnosis({
      pathology_rows: rows,
      mri: { ...data.diagnosis.mri, ...syncMriFromPathologyRows(rows) },
    });
  };

  const addPathologyRow = () => {
    const template = pathologyRows[pathologyRows.length - 1] ?? emptyPathologyRow();
    updatePathologyRows([...pathologyRows, { ...template }]);
  };

  const removePathologyRow = (index: number) => {
    updatePathologyRows(pathologyRows.filter((_, i) => i !== index));
  };

  const updatePathologyRow = (index: number, patch: Partial<PathologyRow>) => {
    const next = pathologyRows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    updatePathologyRows(next);
  };

  const addRecommendation = () => {
    if (!recPick || recommendations.includes(recPick)) return;
    updateActiveCourseRecommendations([...recommendations, recPick]);
    setRecPick("");
  };

  const removeRecommendation = (rec: string) => {
    updateActiveCourseRecommendations(recommendations.filter((r) => r !== rec));
  };

  const availableRecommendations = (options.recommendations ?? []).filter(
    (r) => !recommendations.includes(r),
  );

  const bodyMapMarkers = useMemo(
    () => normalizeBodyMapMarkers(data.diagnosis.body_map_markers),
    [data.diagnosis.body_map_markers],
  );

  const drugOptions = useMemo(
    () => [...(options.injectionDrugs ?? []), ...(options.medications ?? [])],
    [options.injectionDrugs, options.medications],
  );

  return (
    <div className="patient-form">
      <PfSectionTitle>Лечение</PfSectionTitle>
      <CourseBlock data={data} options={options} onChange={onChange} />

      <PfSectionTitle>Предварительный диагноз</PfSectionTitle>

      <div className="patient-form__block">
        <Icd10Search
          selected={icdList}
          onChange={(icd10_list) => setDiagnosis({ icd10_list })}
        />

        <PfTextarea
          label="Полное описание предварительного диагноза"
          value={data.diagnosis.full_description ?? ""}
          onChange={(v) => setDiagnosis({ full_description: v || null })}
          rows={4}
          placeholder="Опишите предварительный диагноз..."
        />
      </div>

      <div className="pathology-header">
        <PfSectionTitle>Конструктор патологий</PfSectionTitle>
        <button type="button" className="btn-form btn-form--outline-sm" onClick={addPathologyRow}>
          + Добавить поле
        </button>
      </div>

      <div className="pathology-table">
        <div className="pathology-table__row pathology-table__row--head">
          <span>Разрыв кольца</span>
          <span>Уровень</span>
          <span>Размер (мм)</span>
          <span>Задняя прод. связка</span>
          <span>Расположение</span>
          <span>Выбухание</span>
          <span>Патология позвонков</span>
          <span />
        </div>
        {pathologyRows.length === 0 ? (
          <div className="pathology-table__empty">
            Нет записей. Нажмите «+ Добавить поле» или заполните параметры МРТ ниже.
          </div>
        ) : (
          pathologyRows.map((row, index) => (
            <div key={index} className="pathology-table__row pathology-table__row--edit">
              <select
                className="pathology-table__cell"
                value={row.hernia_type ?? ""}
                onChange={(e) => updatePathologyRow(index, { hernia_type: e.target.value || null })}
              >
                <option value="">—</option>
                {(options.herniaTypes ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                className="pathology-table__cell"
                value={row.segment_name ?? ""}
                onChange={(e) => updatePathologyRow(index, { segment_name: e.target.value || null })}
              >
                <option value="">—</option>
                {(options.mriSegments ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <VoiceInputWrap
                fieldLabel="Размер (мм)"
                value={row.size_mm ?? ""}
                onVoiceInsert={(v) => updatePathologyRow(index, { size_mm: v || null })}
              >
                <input
                  className="pathology-table__cell"
                  value={row.size_mm ?? ""}
                  placeholder="1 мм"
                  onChange={(e) => updatePathologyRow(index, { size_mm: e.target.value || null })}
                />
              </VoiceInputWrap>
              <select
                className="pathology-table__cell"
                value={row.sequestration ?? ""}
                onChange={(e) => updatePathologyRow(index, { sequestration: e.target.value || null })}
              >
                <option value="">—</option>
                {(options.sequestration ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                className="pathology-table__cell"
                value={row.location ?? ""}
                onChange={(e) => updatePathologyRow(index, { location: e.target.value || null })}
              >
                <option value="">—</option>
                {(options.mriLocation ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                className="pathology-table__cell"
                value={row.bulging ?? ""}
                onChange={(e) => updatePathologyRow(index, { bulging: e.target.value || null })}
              >
                <option value="">—</option>
                {(options.mriBulging ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <VoiceInputWrap
                fieldLabel="Патология позвонков"
                value={row.modic ?? ""}
                onVoiceInsert={(v) => updatePathologyRow(index, { modic: v || null })}
              >
                <input
                  className="pathology-table__cell"
                  value={row.modic ?? ""}
                  placeholder="Без патологий"
                  onChange={(e) => updatePathologyRow(index, { modic: e.target.value || null })}
                />
              </VoiceInputWrap>
              <button
                type="button"
                className="pathology-table__delete"
                aria-label="Удалить"
                onClick={() => removePathologyRow(index)}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      <div className="patient-form__block">
        <PfTextarea
          label="Сопутствующие заболевания, операции и травмы"
          value={data.diagnosis.concomitant ?? ""}
          onChange={(v) => setDiagnosis({ concomitant: v || null })}
          rows={3}
        />

        <PfSelect
          label="Паттерны ходьбы и положение тела"
          value={data.diagnostics.walking_pattern ?? ""}
          onChange={(v) =>
            onChange({
              ...data,
              diagnostics: { ...data.diagnostics, walking_pattern: v || null },
            })
          }
          options={options.walkingPatterns ?? []}
          fullWidth
        />
      </div>

      <div className="diagnosis-body-map-section">
        <PfSectionTitle>Схема тела (МФС)</PfSectionTitle>
        <BodyMapEditor
          markers={bodyMapMarkers}
          onChange={(body_map_markers) => setDiagnosis({ body_map_markers })}
          onPersist={persistBodyMapMarkers}
          procedureOptions={options.procedures ?? []}
          drugOptions={drugOptions}
        />
      </div>

      <div className="diagnosis-recs-panel">
        <PfSectionTitle>
          Рекомендации
          {treatment.courses.length > 1 ? ` (курс ${activeCourse.number})` : ""}
        </PfSectionTitle>
        <div className="diagnosis-recs-add">
          <select
            className="diagnosis-recs-select"
            value={recPick}
            onChange={(e) => setRecPick(e.target.value)}
          >
            <option value="">Выберите рекомендацию…</option>
            {availableRecommendations.map((rec) => (
              <option key={rec} value={rec}>
                {rec}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-form btn-form--outline-sm diagnosis-recs-add__btn"
            disabled={!recPick}
            onClick={addRecommendation}
          >
            Добавить
          </button>
        </div>
        <ul className="rec-list">
          {recommendations.length === 0 ? (
            <li className="rec-list__empty">Рекомендации не выбраны</li>
          ) : (
            recommendations.map((rec) => (
              <li key={rec} className="rec-list__item">
                <span>{rec}</span>
                <button
                  type="button"
                  className="rec-list__remove"
                  aria-label="Удалить"
                  onClick={() => removeRecommendation(rec)}
                >
                  −
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="pf-pain-details">
        <p className="pf-pain-details__title">Параметры МРТ</p>
        <div className="pf-assessment pf-assessment--flat">
          <PfAssessmentGroup label="Тип грыжи">
            <PfSegmentGroup
              value={mri.hernia_type}
              options={(options.herniaTypes ?? []).map((o) => ({ value: o, label: o }))}
              onChange={(v) => {
                setMri({ hernia_type: v });
                if (pathologyRows.length === 1) {
                  updatePathologyRow(0, { hernia_type: v });
                }
              }}
            />
          </PfAssessmentGroup>
          <PfAssessmentGroup label="Секвестрация">
            <PfSegmentGroup
              value={mri.sequestration}
              options={(options.sequestration ?? []).map((o) => ({ value: o, label: o }))}
              onChange={(v) => {
                setMri({ sequestration: v });
                if (pathologyRows.length === 1) {
                  updatePathologyRow(0, { sequestration: v });
                }
              }}
            />
          </PfAssessmentGroup>
          <PfAssessmentGroup label="Локализация">
            <PfSegmentGroup
              value={mri.location}
              options={(options.mriLocation ?? []).map((o) => ({ value: o, label: o }))}
              onChange={(v) => {
                setMri({ location: v });
                if (pathologyRows.length === 1) {
                  updatePathologyRow(0, { location: v });
                }
              }}
            />
          </PfAssessmentGroup>
          <PfAssessmentGroup label="Хроничность">
            <PfSegmentGroup
              value={mri.chronicity}
              options={(options.mriChronicity ?? []).map((o) => ({ value: o, label: o }))}
              onChange={(v) => setMri({ chronicity: v })}
            />
          </PfAssessmentGroup>
          <PfAssessmentGroup label="Выбухание">
            <PfSegmentGroup
              value={mri.bulging}
              options={(options.mriBulging ?? []).map((o) => ({ value: o, label: o }))}
              onChange={(v) => {
                setMri({ bulging: v });
                if (pathologyRows.length === 1) {
                  updatePathologyRow(0, { bulging: v });
                }
              }}
            />
          </PfAssessmentGroup>
        </div>
      </div>
    </div>
  );
}
