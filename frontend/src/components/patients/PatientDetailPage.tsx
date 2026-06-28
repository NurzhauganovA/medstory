import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { BackIcon } from "../icons";
import type { PatientDetailResponse, PatientVisitItem } from "../../types";

interface PatientDetailPageProps {
  patientId: number;
  refreshKey?: number;
  onBack: () => void;
  onStartVisit: (patientId: number, medicalCardId: number, patientName: string) => void;
  onContinueVisit: (patientId: number, medicalCardId: number, patientName: string) => void;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU");
}

function statusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Завершён";
    case "in_progress":
      return "В процессе";
    case "draft":
      return "Черновик";
    case "scheduled":
      return "Запланирован";
    default:
      return status;
  }
}

function isActiveVisit(status: string) {
  return status === "in_progress" || status === "draft";
}

export function PatientDetailPage({
  patientId,
  refreshKey = 0,
  onBack,
  onStartVisit,
  onContinueVisit,
}: PatientDetailPageProps) {
  const [detail, setDetail] = useState<PatientDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [printingCardId, setPrintingCardId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getPatientDetail(patientId);
      setDetail(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail, refreshKey]);

  const handlePrint = async () => {
    setPrinting(true);
    setError(null);
    try {
      await api.downloadPatientPdf(patientId, detail?.patient.full_name ?? "patient");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка печати");
    } finally {
      setPrinting(false);
    }
  };

  const handleVisitPrint = async (visit: PatientVisitItem) => {
    if (!visit.medical_card_id) return;
    setPrintingCardId(visit.medical_card_id);
    setError(null);
    try {
      await api.downloadMedicalCardPdf(
        visit.medical_card_id,
        detail?.patient.full_name ?? "patient",
        visit.visit_date,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка печати");
    } finally {
      setPrintingCardId(null);
    }
  };

  const handleStartVisit = async () => {
    setStarting(true);
    setError(null);
    try {
      const card = await api.startPatientVisit(patientId);
      onStartVisit(patientId, card.id, detail?.patient.full_name ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка начала приёма");
    } finally {
      setStarting(false);
    }
  };

  const handleContinueVisit = () => {
    if (!detail?.active_card_id) return;
    onContinueVisit(patientId, detail.active_card_id, detail.patient.full_name ?? "");
  };

  const handleCompleteVisit = async () => {
    if (!detail?.active_card_id) return;
    const confirmed = window.confirm(
      "Завершить текущий приём? Данные сохранятся в истории болезни.",
    );
    if (!confirmed) return;

    setCompleting(true);
    setError(null);
    try {
      await api.completePatientVisit(patientId);
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка завершения приёма");
    } finally {
      setCompleting(false);
    }
  };

  const handleVisitOpen = (visit: PatientVisitItem) => {
    if (!visit.medical_card_id) return;
    if (isActiveVisit(visit.status)) {
      onContinueVisit(patientId, visit.medical_card_id, detail?.patient.full_name ?? "");
      return;
    }
    onContinueVisit(patientId, visit.medical_card_id, detail?.patient.full_name ?? "");
  };

  if (loading) {
    return <div className="page-loading">Загрузка…</div>;
  }

  if (error && !detail) {
    return <div className="page-error">{error}</div>;
  }

  if (!detail) {
    return <div className="page-error">Пациент не найден</div>;
  }

  const { patient, visits, active_card_id: activeCardId } = detail;
  const hasActiveVisit = activeCardId != null;

  return (
    <div className="patient-detail-page">
      <header className="patient-detail-header">
        <button type="button" className="patient-detail-header__back" onClick={onBack}>
          <BackIcon />
          К списку пациентов
        </button>
        <div className="patient-detail-header__main">
          <div>
            <h1 className="patient-detail-header__title">
              Медицинская карта: {patient.full_name}
            </h1>
            <p className="patient-detail-header__meta">
              ИИН {patient.iin ?? "—"} · {patient.phone ?? "—"}
            </p>
          </div>
          <div className="patient-detail-header__actions">
            <button
              type="button"
              className="btn-form btn-form--ghost"
              disabled={printing}
              onClick={handlePrint}
            >
              {printing ? "Формирование…" : "Печать последнего приёма"}
            </button>
            {hasActiveVisit ? (
              <>
                <button
                  type="button"
                  className="btn-form btn-form--ghost"
                  disabled={completing}
                  onClick={handleCompleteVisit}
                >
                  {completing ? "Завершение…" : "Завершить приём"}
                </button>
                <button
                  type="button"
                  className="btn-form btn-form--primary"
                  onClick={handleContinueVisit}
                >
                  Продолжить приём
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-form btn-form--primary"
                disabled={starting}
                onClick={handleStartVisit}
              >
                {starting ? "Открытие…" : "Начать приём"}
              </button>
            )}
          </div>
        </div>
      </header>

      {hasActiveVisit && (
        <div className="patient-detail-notice">
          Есть незавершённый приём. Завершите его, чтобы начать новый и сохранить историю болезни.
        </div>
      )}

      {error && <div className="form-page__error">{error}</div>}

      <section className="patient-info-cards">
        <div className="patient-info-card">
          <span className="patient-info-card__label">Дата рождения</span>
          <span className="patient-info-card__value">{formatDate(patient.birth_date)}</span>
        </div>
        <div className="patient-info-card">
          <span className="patient-info-card__label">Пол</span>
          <span className="patient-info-card__value">{patient.gender ?? "—"}</span>
        </div>
        <div className="patient-info-card">
          <span className="patient-info-card__label">Житель</span>
          <span className="patient-info-card__value">{patient.residence ?? "—"}</span>
        </div>
        <div className="patient-info-card">
          <span className="patient-info-card__label">Место работы</span>
          <span className="patient-info-card__value">{patient.workplace ?? "—"}</span>
        </div>
        <div className="patient-info-card">
          <span className="patient-info-card__label">Страховая компания</span>
          <span className="patient-info-card__value">{patient.insurance_company ?? "—"}</span>
        </div>
      </section>

      <section className="patient-visits">
        <h2 className="patient-visits__title">История болезни</h2>
        <div className="patients-table-wrap">
          <table className="patients-table">
            <thead>
              <tr>
                <th>ID визита</th>
                <th>Дата визита</th>
                <th>Статус визита</th>
                <th>ФИО врача</th>
                <th>Диагноз МКБ-10</th>
                <th>Шкала боли</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr
                  key={`${visit.id}-${visit.medical_card_id ?? "none"}`}
                  className={`patients-table__row ${visit.medical_card_id ? "patients-table__row--clickable" : ""}`}
                  onDoubleClick={() => handleVisitOpen(visit)}
                >
                  <td>{visit.medical_card_id ?? visit.id}</td>
                  <td>{formatDate(visit.visit_date)}</td>
                  <td>
                    <span className={`visit-status visit-status--${visit.status}`}>
                      {statusLabel(visit.status)}
                    </span>
                  </td>
                  <td>{visit.doctor_name ?? "—"}</td>
                  <td>{visit.diagnosis ?? "—"}</td>
                  <td>{visit.pain_vas ?? "—"}</td>
                  <td>
                    {visit.medical_card_id ? (
                      <button
                        type="button"
                        className="visit-print-btn"
                        title="Печать этого приёма"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleVisitPrint(visit);
                        }}
                        disabled={printingCardId === visit.medical_card_id}
                      >
                        {printingCardId === visit.medical_card_id ? "…" : "🖨"}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={7} className="patients-table__empty">
                    Визитов пока нет. Нажмите «Начать приём», чтобы создать первую карту.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
