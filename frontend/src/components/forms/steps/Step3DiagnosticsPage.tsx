import type { ReactNode } from "react";
import type { FormSchema, MedicalCardData } from "../../../types";
import { FORM_ICONS, PfCheckboxList, PfField, PfSectionTitle, PfSelect, PfTextarea } from "../PatientFormFields";
import { VoiceInputWrap } from "../../ui/VoiceInput";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

function DiagCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="diag-card">
      <div className="diag-card__aside">
        <img src={icon} alt="" className="diag-card__icon" />
        <div className="diag-card__meta">
          <span className="diag-card__title">{title}</span>
          {subtitle && <span className="diag-card__subtitle">{subtitle}</span>}
        </div>
      </div>
      <div className="diag-card__body">{children}</div>
    </div>
  );
}

function LrFields({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  onLeft,
  onRight,
  placeholder = "90°",
}: {
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  onLeft: (v: string) => void;
  onRight: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="diag-card__lr">
      <div className="diag-card__lr-col">
        <span className="diag-card__lr-label">{leftLabel}</span>
        <VoiceInputWrap fieldLabel={leftLabel} value={leftValue} onVoiceInsert={onLeft}>
          <input
            className="diag-card__lr-input"
            value={leftValue}
            placeholder={placeholder}
            onChange={(e) => onLeft(e.target.value)}
          />
        </VoiceInputWrap>
      </div>
      <div className="diag-card__lr-col">
        <span className="diag-card__lr-label">{rightLabel}</span>
        <VoiceInputWrap fieldLabel={rightLabel} value={rightValue} onVoiceInsert={onRight}>
          <input
            className="diag-card__lr-input"
            value={rightValue}
            placeholder={placeholder}
            onChange={(e) => onRight(e.target.value)}
          />
        </VoiceInputWrap>
      </div>
    </div>
  );
}

export function Step3DiagnosticsPage({ data, options, onChange }: StepProps) {
  const setDiag = (patch: Partial<MedicalCardData["diagnostics"]>) => {
    onChange({ ...data, diagnostics: { ...data.diagnostics, ...patch } });
  };

  const d = data.diagnostics;

  return (
    <div className="patient-form">
      <PfSectionTitle>Миофасциальная диагностика</PfSectionTitle>

      <div className="pf-pain-details">
        <p className="pf-pain-details__title">Мышечный тонус</p>
        <div className="pf-muscle-tone">
        <PfCheckboxList
          label="Гипертонус"
          values={d.hypertonus}
          options={options.muscleGroups ?? []}
          onChange={(v) => setDiag({ hypertonus: v })}
          maxHeight={320}
        />
        <PfCheckboxList
          label="Гипотонус"
          values={d.hypotonus}
          options={options.muscleGroups ?? []}
          onChange={(v) => setDiag({ hypotonus: v })}
          maxHeight={320}
        />
        <PfCheckboxList
          label="Ригидность"
          values={d.rigidity}
          options={options.muscleGroups ?? []}
          onChange={(v) => setDiag({ rigidity: v })}
          maxHeight={320}
        />
      </div>
      </div>

      <div className="patient-form__block">
        <div className="diag-cards-grid">
          <DiagCard icon={FORM_ICONS.leg} title="Прямая нога (SLR)" subtitle="Норма 90°">
            <span className="diag-card__field-label">Подъем прямой ноги</span>
            <LrFields
              leftLabel="Левая"
              rightLabel="Правая"
              leftValue={d.lasseg_left ?? ""}
              rightValue={d.lasseg_right ?? ""}
              onLeft={(v) => setDiag({ lasseg_left: v || null })}
              onRight={(v) => setDiag({ lasseg_right: v || null })}
            />
          </DiagCard>

          <DiagCard icon={FORM_ICONS.bone} title="Коленный сустав" subtitle="Сгиб/разгиб">
            <span className="diag-card__field-label">Сгибание</span>
            <LrFields
              leftLabel="Левая"
              rightLabel="Правая"
              leftValue={d.knee_flexion_left ?? ""}
              rightValue={d.knee_flexion_right ?? ""}
              onLeft={(v) => setDiag({ knee_flexion_left: v || null })}
              onRight={(v) => setDiag({ knee_flexion_right: v || null })}
            />
            <span className="diag-card__field-label">Разгибание</span>
            <LrFields
              leftLabel="Левая"
              rightLabel="Правая"
              leftValue={d.knee_extension_left ?? ""}
              rightValue={d.knee_extension_right ?? ""}
              onLeft={(v) => setDiag({ knee_extension_left: v || null })}
              onRight={(v) => setDiag({ knee_extension_right: v || null })}
            />
          </DiagCard>

          <DiagCard icon={FORM_ICONS.spine} title="Поясница (Наклон)">
            <PfField
              label="Угол наклона"
              value={d.other_spine_tests ?? ""}
              onChange={(v) => setDiag({ other_spine_tests: v || null })}
            />
            <PfField
              label="Комментарии"
              value={d.lerrey_test ?? ""}
              onChange={(v) => setDiag({ lerrey_test: v || null })}
            />
          </DiagCard>

          <DiagCard icon={FORM_ICONS.leg} title="Плечевой сустав">
            <span className="diag-card__field-label">Отведение</span>
            <LrFields
              leftLabel="Левая"
              rightLabel="Правая"
              leftValue={d.shoulder_abduction ?? ""}
              rightValue={d.shoulder_horiz_abduction ?? ""}
              onLeft={(v) => setDiag({ shoulder_abduction: v || null })}
              onRight={(v) => setDiag({ shoulder_horiz_abduction: v || null })}
            />
            <span className="diag-card__field-label">Сгибание (вперед)</span>
            <LrFields
              leftLabel="Левая"
              rightLabel="Правая"
              leftValue={d.shoulder_flexion ?? ""}
              rightValue={d.shoulder_extension ?? ""}
              onLeft={(v) => setDiag({ shoulder_flexion: v || null })}
              onRight={(v) => setDiag({ shoulder_extension: v || null })}
            />
          </DiagCard>
        </div>
      </div>

      <div className="patient-form__block">
        <div className="diag-card diag-card--wide">
          <div className="diag-card__aside">
            <img src={FORM_ICONS.pelvis} alt="" className="diag-card__icon diag-card__icon--line" />
            <span className="diag-card__title">Описание тазобедренного сустава</span>
          </div>
          <div className="diag-card__body diag-card__body--grid">
            <PfSelect
              label="Сгибание бедра в согнутом колене"
              value={d.hip_flexion ?? ""}
              onChange={(v) => setDiag({ hip_flexion: v || null })}
              options={[]}
              placeholder="Placeholder"
            />
            <PfSelect
              label="Наружная ротация"
              value={d.hip_ext_rotation ?? ""}
              onChange={(v) => setDiag({ hip_ext_rotation: v || null })}
              options={[]}
              placeholder="Placeholder"
            />
            <PfSelect
              label="Внутренняя ротация"
              value={d.hip_int_rotation ?? ""}
              onChange={(v) => setDiag({ hip_int_rotation: v || null })}
              options={[]}
              placeholder="Placeholder"
            />
          </div>
        </div>
      </div>

      <div className="patient-form__block">
        <PfTextarea
          label="Описание других суставов"
          value={d.other_spine_tests ?? ""}
          onChange={(v) => setDiag({ other_spine_tests: v || null })}
          rows={3}
        />

        <PfSelect
          label="Паттерны ходьбы и положение тела"
          value={d.walking_pattern ?? ""}
          onChange={(v) => setDiag({ walking_pattern: v || null })}
          options={options.walkingPatterns ?? []}
          fullWidth
        />
      </div>
    </div>
  );
}
