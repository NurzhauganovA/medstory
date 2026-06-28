import type { FormSchema, MedicalCardData } from "../../../types";
import {
  CalendarIcon,
  FORM_ICONS,
  LocationIcon,
  PfField,
  PfSectionTitle,
  PfSelect,
} from "../PatientFormFields";
import { VoiceInputWrap } from "../../ui/VoiceInput";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step1PassportPage({ data, options, onChange }: StepProps) {
  const setPassport = (key: keyof MedicalCardData["passport"], value: string) => {
    onChange({
      ...data,
      passport: { ...data.passport, [key]: value || null },
    });
  };

  return (
    <div className="patient-form">
      <PfSectionTitle>Паспортные данные</PfSectionTitle>
      <div className="patient-form__block">
        <div className="patient-form__grid patient-form__grid--2">
        <PfField
          label="ИИН"
          value={data.passport.iin ?? ""}
          onChange={(v) => setPassport("iin", v)}
        />
        <PfField
          label="Номер телефона"
          value={data.passport.phone ?? ""}
          onChange={(v) => setPassport("phone", v)}
        />
        <PfField
          label="ФИО"
          value={data.passport.full_name ?? ""}
          onChange={(v) => setPassport("full_name", v)}
        />
        <PfField
          label="Эл. почта"
          value={data.passport.email ?? ""}
          onChange={(v) => setPassport("email", v)}
        />
        <PfField
          label="Дата рождения"
          type="date"
          value={data.passport.birth_date ?? ""}
          onChange={(v) => setPassport("birth_date", v)}
          icon={<CalendarIcon />}
        />
        <PfField
          label="Дата обращения"
          type="date"
          value={data.passport.visit_date ?? ""}
          onChange={(v) => setPassport("visit_date", v)}
          icon={<CalendarIcon />}
        />
        </div>
      </div>

      <PfSectionTitle>Адреса</PfSectionTitle>
      <div className="patient-form__block">
        <PfSelect
        label="Филиал"
        value={data.passport.branch ?? ""}
        onChange={(v) => setPassport("branch", v)}
        options={options.branches ?? []}
        placeholder="Выберите филиал"
        icon={<LocationIcon />}
        fullWidth
      />
      <PfField
        label="Адрес проживания пациента"
        value={data.passport.address ?? ""}
        onChange={(v) => setPassport("address", v)}
      />
      </div>

      <PfSectionTitle>Прочие данные</PfSectionTitle>
      <div className="patient-form__block">
        <div className="patient-form__grid patient-form__grid--2">
        <PfField
          label="Наименование страховой компании"
          value={data.passport.insurance_company ?? ""}
          onChange={(v) => setPassport("insurance_company", v)}
        />
        <PfField
          label="Номер полиса"
          value={data.passport.insurance_type ?? ""}
          onChange={(v) => setPassport("insurance_type", v)}
        />
        </div>
        <div className="pf-field pf-field--full">
          <div className="pf-field__box">
            <span className="pf-field__label">ФИО врача</span>
            <VoiceInputWrap
              fieldLabel="ФИО врача"
              value={data.passport.doctor_name ?? ""}
              onVoiceInsert={(v) => setPassport("doctor_name", v)}
            >
              <div className="pf-field__input-wrap">
                <span className="pf-field__icon pf-field__icon--left">
                  <img src={FORM_ICONS.doctor} alt="" className="pf-field__img-icon" />
                </span>
                <input
                  className="pf-field__input pf-field__input--with-icon"
                  value={data.passport.doctor_name ?? ""}
                  placeholder="Омаров Даулет Асхатович"
                  onChange={(e) => setPassport("doctor_name", e.target.value)}
                />
              </div>
            </VoiceInputWrap>
          </div>
        </div>
      </div>
    </div>
  );
}
