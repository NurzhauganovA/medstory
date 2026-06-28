import type { ReactNode } from "react";
import { CalendarIcon, LocationIcon } from "../ui/Fields";
import { VoiceInputWrap } from "../ui/VoiceInput";

export function PfField({
  label,
  value,
  onChange,
  placeholder = "Placeholder",
  type = "text",
  icon,
  enableVoice = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  enableVoice?: boolean;
}) {
  const voiceEnabled = enableVoice && type !== "date" && type !== "number";

  return (
    <div className="pf-field">
      <div className="pf-field__box">
        <span className="pf-field__label">{label}</span>
        <VoiceInputWrap
          fieldLabel={label}
          disabled={!voiceEnabled}
          value={value}
          onVoiceInsert={onChange}
        >
          <div className="pf-field__input-wrap">
            <input
              className="pf-field__input"
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
            />
            {icon && <span className="pf-field__icon">{icon}</span>}
          </div>
        </VoiceInputWrap>
      </div>
    </div>
  );
}

export function PfSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Placeholder",
  icon,
  fullWidth,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`pf-field ${fullWidth ? "pf-field--full" : ""}`}>
      <div className="pf-field__box">
        <span className="pf-field__label">{label}</span>
        <div className="pf-field__input-wrap">
          {icon && <span className="pf-field__icon pf-field__icon--left">{icon}</span>}
          <select
            className={`pf-field__select ${icon ? "pf-field__select--with-icon" : ""}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="pf-field__chevron">▾</span>
        </div>
      </div>
    </div>
  );
}

export function PfTextarea({
  label,
  value,
  onChange,
  placeholder = "Placeholder",
  rows = 3,
  fullWidth = true,
  enableVoice = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  fullWidth?: boolean;
  enableVoice?: boolean;
}) {
  return (
    <div className={`pf-field ${fullWidth ? "pf-field--full" : ""}`}>
      <div className="pf-field__box pf-field__box--textarea">
        <span className="pf-field__label">{label}</span>
        <VoiceInputWrap
          fieldLabel={label}
          disabled={!enableVoice}
          value={value}
          onVoiceInsert={onChange}
        >
          <textarea
            className="pf-field__textarea"
            value={value}
            placeholder={placeholder}
            rows={rows}
            onChange={(e) => onChange(e.target.value)}
          />
        </VoiceInputWrap>
      </div>
    </div>
  );
}

export function PfSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="patient-form__section-title">{children}</h3>;
}

export function PfAssessmentGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pf-assessment__group">
      <span className="pf-assessment__group-label">{label}</span>
      <div className="pf-assessment__group-body">{children}</div>
    </div>
  );
}

export function PfSegmentGroup<T extends string | boolean>({
  value,
  options,
  onChange,
}: {
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="pf-segments">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            className={`pf-segment ${active ? "pf-segment--active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function PfTogglePair({
  label,
  yesLabel,
  noLabel,
  value,
  onChange,
}: {
  label: string;
  yesLabel: string;
  noLabel: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const yes = value === true;
  const no = value === false;

  return (
    <div className="patient-form__pain-row">
      <span className="patient-form__pain-label">{label}</span>
      <button
        type="button"
        className={`pf-toggle ${yes ? "pf-toggle--active" : ""}`}
        onClick={() => onChange(true)}
      >
        <span className={`pf-toggle__box ${yes ? "pf-toggle__box--checked" : ""}`}>
          {yes && <span className="pf-toggle__check">✓</span>}
        </span>
        {yesLabel}
      </button>
      <button
        type="button"
        className={`pf-toggle ${no ? "pf-toggle--active" : ""}`}
        onClick={() => onChange(false)}
      >
        <span className={`pf-toggle__box ${no ? "pf-toggle__box--checked" : ""}`}>
          {no && <span className="pf-toggle__check">✓</span>}
        </span>
        {noLabel}
      </button>
    </div>
  );
}

export function PfPainScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  const current = value ?? 0;

  const levelClass =
    current === 0
      ? "pf-pain-scale__value--none"
      : current <= 3
        ? "pf-pain-scale__value--mild"
        : current <= 6
          ? "pf-pain-scale__value--moderate"
          : "pf-pain-scale__value--severe";

  return (
    <div className="pf-pain-scale">
      <div className="pf-pain-scale__header">
        <div>
          <span className="pf-pain-scale__title">Шкала боли (VAS)</span>
          <span className="pf-pain-scale__hint">0 — без боли, 10 — невыносимая</span>
        </div>
        <span className={`pf-pain-scale__value ${levelClass}`}>{current}</span>
      </div>
      <div className="pf-pain-scale__numbers">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`pf-pain-scale__num ${current === i ? "pf-pain-scale__num--active" : ""}`}
            onClick={() => onChange(i)}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="pf-pain-scale__labels">
        <span className="pf-pain-scale__label pf-pain-scale__label--green">Без боли</span>
        <span className="pf-pain-scale__label pf-pain-scale__label--orange">Умеренная</span>
        <span className="pf-pain-scale__label pf-pain-scale__label--red">Невыносимая</span>
      </div>
    </div>
  );
}

export function PfRadioGroup({
  label,
  value,
  options,
  onChange,
  inline,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string) => void;
  inline?: boolean;
}) {
  return (
    <div className={`pf-radio-group ${inline ? "pf-radio-group--inline" : ""}`}>
      <span className="pf-radio-group__label">{label}</span>
      <div className="pf-radio-group__options">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              className={`pf-radio-opt ${active ? "pf-radio-opt--active" : ""}`}
              onClick={() => onChange(opt)}
            >
              <span className={`pf-check ${active ? "pf-check--on" : ""}`}>
                {active && <span className="pf-check__mark">✓</span>}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PfCheckboxList({
  label,
  values,
  options,
  onChange,
  maxHeight = 200,
}: {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  maxHeight?: number;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <div className="pf-checklist">
      <div className="pf-checklist__header">
        <span className="pf-checklist__title">{label}</span>
        {values.length > 0 && <span className="pf-checklist__count">{values.length}</span>}
      </div>
      <div className="pf-checklist__scroll" style={{ maxHeight }}>
        {options.map((opt) => {
          const checked = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`pf-checklist__item ${checked ? "pf-checklist__item--checked" : ""}`}
              onClick={() => toggle(opt)}
            >
              <span className={`pf-checklist__box ${checked ? "pf-checklist__box--on" : ""}`}>
                {checked && <span className="pf-checklist__check">✓</span>}
              </span>
              <span className="pf-checklist__text">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PfCheckboxGrid({
  columns,
  layout = "auto",
}: {
  columns: {
    label: string;
    values: string[];
    options: string[];
    onChange: (values: string[]) => void;
  }[];
  layout?: "auto" | "2" | "3" | "4";
}) {
  const layoutClass =
    layout === "4"
      ? "pf-checklist-grid--4"
      : layout === "3"
        ? "pf-checklist-grid--3"
        : layout === "2"
          ? "pf-checklist-grid--2"
          : "";

  return (
    <div className={`pf-checklist-grid ${layoutClass}`}>
      {columns.map((col, i) => (
        <PfCheckboxList
          key={col.label || `col-${i}`}
          label={col.label}
          values={col.values}
          options={col.options}
          onChange={col.onChange}
        />
      ))}
    </div>
  );
}

export { CalendarIcon, LocationIcon };

export function pickSingle(arr: string[]) {
  return arr[0] ?? "";
}

export const FORM_ICONS = {
  leg: "/assets/icons/photo_2026-06-17_15-53-30.jpg",
  bone: "/assets/icons/photo_2026-06-17_15-53-35.jpg",
  spine: "/assets/icons/photo_2026-06-17_15-53-40.jpg",
  doctor: "/assets/icons/photo_2026-06-17_15-53-45.jpg",
  pelvis: "/assets/icons/photo_2026-06-17_15-53-48.jpg",
  body: "/assets/icons/photo_2026-06-17_15-51-19.jpg",
} as const;
