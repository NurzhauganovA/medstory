import { FieldInput, FieldSelect, TagSelect } from "../ui/Fields";
import type { FormSchema, MedicalCardData } from "../../types";

interface StepProps {
  data: MedicalCardData;
  options: FormSchema["options"];
  onChange: (data: MedicalCardData) => void;
}

export function Step3Diagnostics({ data, options, onChange }: StepProps) {
  const setDiag = (patch: Partial<MedicalCardData["diagnostics"]>) => {
    onChange({ ...data, diagnostics: { ...data.diagnostics, ...patch } });
  };

  const d = data.diagnostics;

  return (
    <>
      <h3 className="section-title">Миофасциальная диагностика</h3>

      <div className="diagnostics-visual">
        <img src="/assets/diagnostics-angles.png" alt="Диагностические углы" style={{ gridColumn: "1 / -1", width: "100%", borderRadius: 12 }} />
      </div>

      <div className="form-grid form-grid--3">
        <TagSelect
          label="Гипертонус мышц"
          values={d.hypertonus}
          options={options.muscleGroups ?? []}
          onChange={(v) => setDiag({ hypertonus: v })}
        />
        <TagSelect
          label="Гипотонус мышц"
          values={d.hypotonus}
          options={options.muscleGroups ?? []}
          onChange={(v) => setDiag({ hypotonus: v })}
        />
        <TagSelect
          label="Ригидность мышц"
          values={d.rigidity}
          options={options.muscleGroups ?? []}
          onChange={(v) => setDiag({ rigidity: v })}
        />
      </div>

      <div className="form-grid">
        <FieldInput
          label="Тест Лассега — правая нога"
          value={d.lasseg_right ?? ""}
          onChange={(v) => setDiag({ lasseg_right: v || null })}
        />
        <FieldInput
          label="Тест Лассега — левая нога"
          value={d.lasseg_left ?? ""}
          onChange={(v) => setDiag({ lasseg_left: v || null })}
        />
        <FieldInput
          label="Тест Леррея"
          value={d.lerrey_test ?? ""}
          onChange={(v) => setDiag({ lerrey_test: v || null })}
        />
        <FieldInput
          label="Другие тесты позвоночника"
          value={d.other_spine_tests ?? ""}
          onChange={(v) => setDiag({ other_spine_tests: v || null })}
        />
      </div>

      <h3 className="section-title">Описание коленного сустава</h3>
      <div className="form-grid form-grid--3">
        <FieldInput label="Сгибание лев" value={d.knee_flexion_left ?? ""} onChange={(v) => setDiag({ knee_flexion_left: v || null })} />
        <FieldInput label="Разгибание лев" value={d.knee_extension_left ?? ""} onChange={(v) => setDiag({ knee_extension_left: v || null })} />
        <FieldInput label="Сгибание прав" value={d.knee_flexion_right ?? ""} onChange={(v) => setDiag({ knee_flexion_right: v || null })} />
        <FieldInput label="Разгибание прав" value={d.knee_extension_right ?? ""} onChange={(v) => setDiag({ knee_extension_right: v || null })} />
      </div>

      <h3 className="section-title">Описание тазобедренного сустава</h3>
      <div className="form-grid form-grid--3">
        <FieldInput label="Сгибание бедра" value={d.hip_flexion ?? ""} onChange={(v) => setDiag({ hip_flexion: v || null })} />
        <FieldInput label="Наружная ротация" value={d.hip_ext_rotation ?? ""} onChange={(v) => setDiag({ hip_ext_rotation: v || null })} />
        <FieldInput label="Внутренняя ротация" value={d.hip_int_rotation ?? ""} onChange={(v) => setDiag({ hip_int_rotation: v || null })} />
        <FieldInput label="Приведение бедра" value={d.hip_adduction ?? ""} onChange={(v) => setDiag({ hip_adduction: v || null })} />
        <FieldInput label="Отведение бедра" value={d.hip_abduction ?? ""} onChange={(v) => setDiag({ hip_abduction: v || null })} />
      </div>

      <h3 className="section-title">Описание плечевого сустава</h3>
      <div className="form-grid form-grid--3">
        <FieldInput label="Сгибание плеча" value={d.shoulder_flexion ?? ""} onChange={(v) => setDiag({ shoulder_flexion: v || null })} />
        <FieldInput label="Разгибание плеча" value={d.shoulder_extension ?? ""} onChange={(v) => setDiag({ shoulder_extension: v || null })} />
        <FieldInput label="Отведение плеча" value={d.shoulder_abduction ?? ""} onChange={(v) => setDiag({ shoulder_abduction: v || null })} />
        <FieldInput label="Супинация" value={d.shoulder_supination ?? ""} onChange={(v) => setDiag({ shoulder_supination: v || null })} />
        <FieldInput label="Пронация" value={d.shoulder_pronation ?? ""} onChange={(v) => setDiag({ shoulder_pronation: v || null })} />
        <FieldInput label="Гориз. приведение" value={d.shoulder_horiz_adduction ?? ""} onChange={(v) => setDiag({ shoulder_horiz_adduction: v || null })} />
        <FieldInput label="Гориз. отведение" value={d.shoulder_horiz_abduction ?? ""} onChange={(v) => setDiag({ shoulder_horiz_abduction: v || null })} />
      </div>

      <div className="form-grid">
        <FieldSelect
          label="Паттерны ходьбы"
          value={d.walking_pattern ?? ""}
          onChange={(v) => setDiag({ walking_pattern: v || null })}
          options={options.walkingPatterns ?? []}
        />
        <FieldInput
          label="VAS боль (0–10)"
          type="number"
          value={d.pain_vas?.toString() ?? ""}
          onChange={(v) => setDiag({ pain_vas: v ? Number(v) : null })}
        />
        <FieldInput
          label="Влияние на качество жизни (0–10)"
          type="number"
          value={d.quality_of_life?.toString() ?? ""}
          onChange={(v) => setDiag({ quality_of_life: v ? Number(v) : null })}
        />
      </div>
    </>
  );
}
