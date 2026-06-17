import type { Appointment, Patient } from "../../types";

interface AppointmentPanelProps {
  patient: Patient | null;
  appointment: Appointment | null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Сегодня";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AppointmentPanel({ patient, appointment }: AppointmentPanelProps) {
  return (
    <aside className="appointment-panel">
      <div className="appointment-panel__header">
        <div>
          <div className="appointment-panel__date">
            Сегодня, {formatDate(appointment?.appointment_date)}
          </div>
          <div className="appointment-panel__counter">16/20</div>
        </div>
        <button type="button" className="appointment-panel__back" aria-label="Назад">
          ←
        </button>
      </div>

      <div className="patient-card">
        <div className="patient-card__label">Пациент</div>
        <div className="patient-card__value">{patient?.full_name ?? "—"}</div>
        <div className="patient-card__label">Номер телефона</div>
        <div className="patient-card__value">{patient?.phone ?? "—"}</div>
        <div className="patient-card__label">Эл. почта</div>
        <div className="patient-card__value">{patient?.email ?? "—"}</div>
      </div>

      <div className="detail-list">
        <div className="detail-list__row">
          <span className="detail-list__label">Ответственный</span>
          <span className="detail-list__value">{appointment?.responsible ?? "—"}</span>
        </div>
        <div className="detail-list__row">
          <span className="detail-list__label">Источник заявки</span>
          <span className="detail-list__value">{appointment?.source ?? "—"}</span>
        </div>
        <div className="detail-list__row">
          <span className="detail-list__label">Тип записи</span>
          <span className="detail-list__value">{appointment?.appointment_type ?? "—"}</span>
        </div>
        <div className="detail-list__row">
          <span className="detail-list__label">Специалист</span>
          <span className="detail-list__value">{appointment?.specialist ?? "—"}</span>
        </div>
        <div className="detail-list__row">
          <span className="detail-list__label">Услуга</span>
          <span className="detail-list__value">{appointment?.service ?? "—"}</span>
        </div>
        <div className="detail-list__row">
          <span className="detail-list__label">Бюджет</span>
          <span className="detail-list__value">{appointment?.budget ?? "—"}</span>
        </div>
      </div>

      <button type="button" className="btn-start">
        + Начать прием
      </button>
    </aside>
  );
}
