import type { ReactNode } from "react";

interface FieldInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function FieldInput({
  label,
  value,
  onChange,
  placeholder = "Placeholder",
  type = "text",
  fullWidth,
  icon,
}: FieldInputProps) {
  return (
    <div className={`field ${fullWidth ? "field--full" : ""}`}>
      <label className="field__label">{label}</label>
      <div className="field__control">
        <input
          className="field__input"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {icon && <span className="field__input-icon">{icon}</span>}
      </div>
    </div>
  );
}

interface FieldSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  fullWidth?: boolean;
}

export function FieldSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Выберите",
  fullWidth,
}: FieldSelectProps) {
  return (
    <div className={`field ${fullWidth ? "field--full" : ""}`}>
      <label className="field__label">{label}</label>
      <div className="field__control">
        <select
          className="field__select"
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
        <span className="field__select-icon">▾</span>
      </div>
    </div>
  );
}

interface FieldTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function FieldTextarea({
  label,
  value,
  onChange,
  placeholder = "Placeholder",
  rows = 4,
}: FieldTextareaProps) {
  return (
    <div className="field field--full">
      <label className="field__label">{label}</label>
      <textarea
        className="field__textarea"
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface TagSelectProps {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  single?: boolean;
}

export function TagSelect({ label, values, options, onChange, single }: TagSelectProps) {
  const toggle = (opt: string) => {
    if (single) {
      onChange(values.includes(opt) ? [] : [opt]);
      return;
    }
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  const displayValue = values[0] ?? "";

  if (single) {
    return (
      <FieldSelect
        label={label}
        value={displayValue}
        onChange={(v) => onChange(v ? [v] : [])}
        options={options}
      />
    );
  }

  return (
    <div className="field field--full">
      <label className="field__label">{label}</label>
      <div className="tag-select">
        {options.slice(0, 12).map((opt) => (
          <button
            key={opt}
            type="button"
            className={`tag-select__option ${values.includes(opt) ? "tag-select__option--selected" : ""}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}
