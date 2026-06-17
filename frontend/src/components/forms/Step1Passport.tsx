import {
  CalendarIcon,
  FieldInput,
  FieldTextarea,
  LocationIcon,
  TagSelect,
} from "../ui/Fields";
import type { FormSchema, MedicalCardData } from "../../types";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step1Passport({ data, options, onChange }: StepProps) {
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

  return (
    <>
      <h3 className="section-title">Паспортные данные</h3>
      <div className="form-grid">
        <FieldInput
          label="ИИН"
          value={data.passport.iin ?? ""}
          onChange={(v) => setPassport("iin", v)}
        />
        <FieldInput
          label="Номер телефона"
          value={data.passport.phone ?? ""}
          onChange={(v) => setPassport("phone", v)}
        />
        <FieldInput
          label="ФИО"
          value={data.passport.full_name ?? ""}
          onChange={(v) => setPassport("full_name", v)}
        />
        <FieldInput
          label="Эл. почта"
          value={data.passport.email ?? ""}
          onChange={(v) => setPassport("email", v)}
        />
        <FieldInput
          label="Дата рождения"
          type="date"
          value={data.passport.birth_date ?? ""}
          onChange={(v) => setPassport("birth_date", v)}
          icon={<CalendarIcon />}
        />
        <FieldInput
          label="Дата обращения"
          type="date"
          value={data.passport.visit_date ?? ""}
          onChange={(v) => setPassport("visit_date", v)}
          icon={<CalendarIcon />}
        />
        <div className="field field--full">
          <label className="field__label">Филиал</label>
          <div className="field__control">
            <span className="field__input-icon" style={{ left: 14, right: "auto" }}>
              <LocationIcon />
            </span>
            <select
              className="field__select"
              style={{ paddingLeft: 40 }}
              value={data.passport.branch ?? ""}
              onChange={(e) => setPassport("branch", e.target.value)}
            >
              <option value="">Выберите филиал</option>
              {(options.branches ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="field__select-icon">▾</span>
          </div>
        </div>
      </div>

      <h3 className="section-title">Жалобы пациента</h3>
      <FieldTextarea
        label="Жалобы"
        value={data.anamnesis.patient_words ?? ""}
        onChange={(v) => setAnamnesis({ patient_words: v || null })}
      />

      <h3 className="section-title">Боли</h3>
      <div className="checkbox-row">
        <span className="checkbox-row__label">Боли</span>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={pain.is_present === true}
            onChange={() => setPain({ is_present: true })}
          />
          Есть
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={pain.is_present === false}
            onChange={() => setPain({ is_present: false })}
          />
          Нет
        </label>
      </div>

      {pain.is_present && (
        <div className="form-grid form-grid--3">
          <TagSelect
            label="Локализация боли"
            values={pain.localization}
            options={options.painLocalization ?? []}
            onChange={(v) => setPain({ localization: v })}
            single
          />
          <TagSelect
            label="Ирадиация боли"
            values={pain.localization}
            options={options.painLocalization ?? []}
            onChange={(v) => setPain({ localization: v })}
            single
          />
          <TagSelect
            label="Характер боли"
            values={pain.character}
            options={options.painCharacter ?? []}
            onChange={(v) => setPain({ character: v })}
            single
          />
          <TagSelect
            label="Периодичность боли"
            values={pain.frequency}
            options={options.painFrequency ?? []}
            onChange={(v) => setPain({ frequency: v })}
            single
          />
          <TagSelect
            label="Что провоцирует боль"
            values={pain.provokes}
            options={options.painProvokes ?? []}
            onChange={(v) => setPain({ provokes: v })}
            single
          />
          <TagSelect
            label="Что купирует боль"
            values={pain.relieves}
            options={options.painRelieves ?? []}
            onChange={(v) => setPain({ relieves: v })}
            single
          />
          <TagSelect
            label="Онемение"
            values={data.anamnesis.numbness}
            options={options.numbness ?? []}
            onChange={(v) => setAnamnesis({ numbness: v })}
            single
          />
        </div>
      )}
    </>
  );
}
