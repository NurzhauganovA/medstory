import type { TreatmentProcedure } from "../../types";
import { emptyBodyMapProcedure, newEntryId } from "../../types";

interface TreatmentProceduresPanelProps {
  procedures: TreatmentProcedure[];
  procedureOptions: string[];
  drugOptions: string[];
  onChange: (procedures: TreatmentProcedure[]) => void;
  title?: string;
  emptyText?: string;
}

export function TreatmentProceduresPanel({
  procedures,
  procedureOptions,
  drugOptions,
  onChange,
  title = "Назначенные процедуры",
  emptyText = "Добавьте процедуру из списка",
}: TreatmentProceduresPanelProps) {
  const addProcedure = () => {
    onChange([
      ...procedures,
      {
        id: newEntryId("tp"),
        name: procedureOptions[0] ?? "",
        date: null,
        dose: null,
        drug_name: null,
      },
    ]);
  };

  const updateProcedure = (id: string, patch: Partial<TreatmentProcedure>) => {
    onChange(procedures.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeProcedure = (id: string) => {
    onChange(procedures.filter((item) => item.id !== id));
  };

  const availableToAdd = procedureOptions.filter(
    (name) => !procedures.some((item) => item.name === name),
  );

  const quickAdd = (name: string) => {
    if (procedures.some((item) => item.name === name)) return;
    onChange([
      ...procedures,
      { id: newEntryId("tp"), name, date: null, dose: null, drug_name: null },
    ]);
  };

  return (
    <div className="treatment-procedures">
      <div className="treatment-procedures__head">
        <span className="treatment-procedures__title">{title}</span>
        <button
          type="button"
          className="btn-form btn-form--outline-sm"
          onClick={addProcedure}
          disabled={procedureOptions.length === 0}
        >
          + Добавить процедуру
        </button>
      </div>

      {availableToAdd.length > 0 && (
        <div className="treatment-procedures__quick">
          {availableToAdd.slice(0, 6).map((name) => (
            <button
              key={name}
              type="button"
              className="treatment-procedures__quick-btn"
              onClick={() => quickAdd(name)}
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      {procedures.length === 0 ? (
        <p className="treatment-procedures__empty">{emptyText}</p>
      ) : (
        <div className="treatment-procedures__list">
          {procedures.map((item, index) => (
            <div key={item.id} className="treatment-procedures__card">
              <div className="treatment-procedures__card-head">
                <span className="treatment-procedures__card-num">{index + 1}</span>
                <button
                  type="button"
                  className="treatment-procedures__card-remove"
                  aria-label="Удалить процедуру"
                  onClick={() => removeProcedure(item.id)}
                >
                  ×
                </button>
              </div>
              <label className="treatment-procedures__field">
                <span>Процедура</span>
                <select
                  value={item.name}
                  onChange={(e) => updateProcedure(item.id, { name: e.target.value })}
                >
                  {procedureOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="treatment-procedures__row">
                <label className="treatment-procedures__field">
                  <span>Дата</span>
                  <input
                    type="date"
                    value={item.date ?? ""}
                    onChange={(e) => updateProcedure(item.id, { date: e.target.value || null })}
                  />
                </label>
                <label className="treatment-procedures__field">
                  <span>Доза</span>
                  <input
                    type="text"
                    value={item.dose ?? ""}
                    placeholder="напр. 1 мл"
                    onChange={(e) => updateProcedure(item.id, { dose: e.target.value || null })}
                  />
                </label>
              </div>
              <label className="treatment-procedures__field">
                <span>Препарат</span>
                <select
                  value={item.drug_name ?? ""}
                  onChange={(e) => updateProcedure(item.id, { drug_name: e.target.value || null })}
                >
                  <option value="">Не выбран</option>
                  {drugOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarkerProceduresEditor({
  procedures,
  procedureOptions,
  drugOptions,
  onChange,
}: {
  procedures: import("../../types").BodyMapProcedure[];
  procedureOptions: string[];
  drugOptions: string[];
  onChange: (procedures: import("../../types").BodyMapProcedure[]) => void;
}) {
  const addProcedure = () => {
    const next = emptyBodyMapProcedure();
    next.procedure_name = procedureOptions[0] ?? "";
    onChange([...procedures, next]);
  };

  const updateProcedure = (id: string, patch: Partial<import("../../types").BodyMapProcedure>) => {
    onChange(procedures.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeProcedure = (id: string) => {
    onChange(procedures.filter((item) => item.id !== id));
  };

  return (
    <div className="marker-procedures">
      <div className="marker-procedures__head">
        <span className="marker-procedures__title">Процедуры на точке</span>
        <button type="button" className="btn-form btn-form--outline-sm" onClick={addProcedure}>
          + Процедура
        </button>
      </div>

      {procedures.length === 0 ? (
        <p className="marker-procedures__empty">Назначьте процедуру для этой точки на теле</p>
      ) : (
        <div className="marker-procedures__list">
          {procedures.map((item, index) => (
            <div key={item.id} className="marker-procedures__card">
              <div className="marker-procedures__card-head">
                <span>Процедура {index + 1}</span>
                <button type="button" onClick={() => removeProcedure(item.id)} aria-label="Удалить">
                  ×
                </button>
              </div>
              <label className="marker-procedures__field">
                <span>Название</span>
                <select
                  value={item.procedure_name}
                  onChange={(e) => updateProcedure(item.id, { procedure_name: e.target.value })}
                >
                  {procedureOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="marker-procedures__row">
                <label className="marker-procedures__field">
                  <span>Дата</span>
                  <input
                    type="date"
                    value={item.procedure_date ?? ""}
                    onChange={(e) =>
                      updateProcedure(item.id, { procedure_date: e.target.value || null })
                    }
                  />
                </label>
                <label className="marker-procedures__field">
                  <span>Доза</span>
                  <input
                    type="text"
                    value={item.dose ?? ""}
                    placeholder="доза"
                    onChange={(e) => updateProcedure(item.id, { dose: e.target.value || null })}
                  />
                </label>
              </div>
              <label className="marker-procedures__field">
                <span>Препарат</span>
                <select
                  value={item.drug_name ?? ""}
                  onChange={(e) => updateProcedure(item.id, { drug_name: e.target.value || null })}
                >
                  <option value="">Не выбран</option>
                  {drugOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="marker-procedures__field">
                <span>Комментарий</span>
                <input
                  type="text"
                  value={item.notes ?? ""}
                  placeholder="зона, кратность…"
                  onChange={(e) => updateProcedure(item.id, { notes: e.target.value || null })}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
