import { FieldInput, FieldSelect, FieldTextarea } from "../ui/Fields";
import type { FormSchema, MedicalCardData } from "../../types";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step4Diagnosis({ data, options, onChange }: StepProps) {
  const setDiagnosis = (patch: Partial<MedicalCardData["diagnosis"]>) => {
    onChange({ ...data, diagnosis: { ...data.diagnosis, ...patch } });
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

  const mri = data.diagnosis.mri;

  return (
    <>
      <h3 className="section-title">Заключение врача клиники «EXPERT NEURO»</h3>

      <FieldTextarea
        label="Предварительный диагноз (полное описание)"
        value={data.diagnosis.full_description ?? ""}
        onChange={(v) => setDiagnosis({ full_description: v || null })}
        rows={4}
      />

      <div className="form-grid">
        <FieldSelect
          label="Тип грыжи"
          value={mri.hernia_type ?? ""}
          onChange={(v) => setMri({ hernia_type: v || null })}
          options={options.herniaTypes ?? []}
        />
        <FieldSelect
          label="Локализация"
          value={mri.location ?? ""}
          onChange={(v) => setMri({ location: v || null })}
          options={options.mriLocation ?? []}
        />
        <FieldSelect
          label="Хроничность"
          value={mri.chronicity ?? ""}
          onChange={(v) => setMri({ chronicity: v || null })}
          options={options.mriChronicity ?? []}
        />
        <FieldSelect
          label="Выбухание"
          value={mri.bulging ?? ""}
          onChange={(v) => setMri({ bulging: v || null })}
          options={options.mriBulging ?? []}
        />
        <FieldSelect
          label="Секвестрация"
          value={mri.sequestration ?? ""}
          onChange={(v) => setMri({ sequestration: v || null })}
          options={options.sequestration ?? []}
        />
        <FieldInput label="Modic" value={mri.modic ?? ""} onChange={(v) => setMri({ modic: v || null })} />
        <FieldInput label="Остеофиты" value={mri.osteophytes ?? ""} onChange={(v) => setMri({ osteophytes: v || null })} />
        <FieldInput label="КПП" value={mri.kpp ?? ""} onChange={(v) => setMri({ kpp: v || null })} />
        <FieldInput label="Грыжи Шморля" value={mri.schmorl ?? ""} onChange={(v) => setMri({ schmorl: v || null })} />
        <FieldInput label="Гемангиомы" value={mri.hemangiomas ?? ""} onChange={(v) => setMri({ hemangiomas: v || null })} />
      </div>

      <FieldTextarea
        label="Сопутствующие заболевания, операции и травмы"
        value={data.diagnosis.concomitant ?? ""}
        onChange={(v) => setDiagnosis({ concomitant: v || null })}
        rows={3}
      />
    </>
  );
}
