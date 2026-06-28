import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { SearchIcon } from "../icons";
import type { PatientListItem, PatientListResponse } from "../../types";

const PAGE_SIZE = 15;

interface PatientsPageProps {
  onOpenPatient: (patientId: number) => void;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU");
}

export function PatientsPage({ onOpenPatient }: PatientsPageProps) {
  const [data, setData] = useState<PatientListResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPatientsPaginated({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setData(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleRowDoubleClick = (patient: PatientListItem) => {
    onOpenPatient(patient.id);
  };

  return (
    <div className="patients-page">
      <header className="page-header">
        <div>
          <h1 className="page-header__title">Пациенты</h1>
          <p className="page-header__subtitle">Список пациентов клиники</p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn-form btn-form--ghost" onClick={loadPatients}>
            Обновить
          </button>
        </div>
      </header>

      <div className="patients-toolbar">
        <div className="patients-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Поиск по ФИО, ИИН или телефону"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {data && (
          <span className="patients-toolbar__count">
            Всего: {data.total}
          </span>
        )}
      </div>

      <div className="patients-table-wrap">
        {loading ? (
          <div className="patients-table__loading">Загрузка…</div>
        ) : error ? (
          <div className="patients-table__error">{error}</div>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ИИН пациента</th>
                <th>ФИО пациента</th>
                <th>Дата рождения</th>
                <th>Пол</th>
                <th>Номер телефона</th>
                <th>Житель</th>
                <th>Место работы</th>
                <th>Страховая компания</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((patient, index) => (
                <tr
                  key={patient.id}
                  className="patients-table__row"
                  onDoubleClick={() => handleRowDoubleClick(patient)}
                >
                  <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{patient.iin ?? "—"}</td>
                  <td className="patients-table__name">{patient.full_name}</td>
                  <td>{formatDate(patient.birth_date)}</td>
                  <td>{patient.gender ?? "—"}</td>
                  <td>{patient.phone ?? "—"}</td>
                  <td>{patient.residence ?? "—"}</td>
                  <td>{patient.workplace ?? "—"}</td>
                  <td>{patient.insurance_company ?? "—"}</td>
                </tr>
              ))}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={9} className="patients-table__empty">
                    Пациенты не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {data && data.total_pages > 1 && (
        <footer className="patients-pagination">
          <button
            type="button"
            className="patients-pagination__btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Назад
          </button>
          <span className="patients-pagination__info">
            Страница {data.page} из {data.total_pages}
          </span>
          <button
            type="button"
            className="patients-pagination__btn"
            disabled={page >= data.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Далее
          </button>
        </footer>
      )}
    </div>
  );
}
