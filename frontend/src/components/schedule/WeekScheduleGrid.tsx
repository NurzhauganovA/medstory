import type { ScheduleAppointment, ViewMode } from "../../types/schedule";
import {
  TIME_SLOTS,
  formatDayTitle,
  formatWeekRange,
  getWeekDays,
  toIsoDate,
  weekdayLabel,
} from "../../types/schedule";
import type { Specialist } from "../../types/schedule";
import { CalendarIcon, PlusIcon } from "../icons";

interface WeekScheduleGridProps {
  weekStart: Date;
  viewMode: ViewMode;
  appointments: ScheduleAppointment[];
  selectedSpecialist: Specialist | null;
  onSlotClick: (date: string, time: string) => void;
  onAppointmentOpen: (appointment: ScheduleAppointment) => void;
  onWeekChange: (direction: -1 | 1) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

function findAppointment(
  appointments: ScheduleAppointment[],
  date: string,
  time: string,
  specialistId: number | null,
): ScheduleAppointment | undefined {
  return appointments.find(
    (a) =>
      a.appointment_date === date &&
      a.time_start === time &&
      (specialistId == null || a.specialist_id === specialistId),
  );
}

export function WeekScheduleGrid({
  weekStart,
  viewMode,
  appointments,
  selectedSpecialist,
  onSlotClick,
  onAppointmentOpen,
  onWeekChange,
  onViewModeChange,
}: WeekScheduleGridProps) {
  const weekDays = getWeekDays(weekStart, 6);
  const weekEnd = weekDays[weekDays.length - 1];

  return (
    <div className="schedule-grid-wrap">
      <div className="schedule-toolbar">
        <div className="schedule-toolbar__left">
          {selectedSpecialist ? (
            <>
              <h2 className="schedule-toolbar__doctor">{selectedSpecialist.full_name}</h2>
              <span className="schedule-toolbar__badge">{selectedSpecialist.specialty}</span>
              <button type="button" className="schedule-toolbar__info" aria-label="Информация">
                i
              </button>
            </>
          ) : (
            <h2 className="schedule-toolbar__doctor">{formatDayTitle(weekDays[0])}</h2>
          )}
        </div>

        <div className="view-toggle">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`view-toggle__btn ${viewMode === mode ? "view-toggle__btn--active" : ""}`}
              onClick={() => onViewModeChange(mode)}
            >
              {mode === "day" ? "День" : mode === "week" ? "Неделя" : "Месяц"}
            </button>
          ))}
        </div>

        <div className="schedule-toolbar__right">
          <button type="button" className="date-nav-btn" onClick={() => onWeekChange(-1)}>
            ‹
          </button>
          <span className="schedule-toolbar__range">
            {formatWeekRange(weekDays[0], weekEnd)}
          </span>
          <button type="button" className="date-nav-btn date-nav-btn--icon" onClick={() => onWeekChange(1)}>
            <CalendarIcon />
          </button>
        </div>
      </div>

      <div className="schedule-grid">
        <div className="schedule-grid__header">
          <div className="schedule-grid__corner" />
          {weekDays.map((day) => (
            <div key={toIsoDate(day)} className="schedule-grid__day-head">
              <span className="schedule-grid__weekday">{weekdayLabel(day)}</span>
              <span className="schedule-grid__daynum">{day.getDate()}</span>
            </div>
          ))}
        </div>

        {TIME_SLOTS.map((time) => (
          <div key={time} className="schedule-grid__row">
            <div className="schedule-grid__time">{time}</div>
            {weekDays.map((day) => {
              const dateStr = toIsoDate(day);
              const appt = findAppointment(
                appointments,
                dateStr,
                time,
                selectedSpecialist?.id ?? null,
              );

              if (appt) {
                return (
                  <div key={`${dateStr}-${time}`} className="schedule-grid__cell">
                    <div
                      className={`appointment-card appointment-card--${appt.color}`}
                      onDoubleClick={() => onAppointmentOpen(appt)}
                      title="Двойной клик — открыть форму"
                    >
                      <div className="appointment-card__name">{appt.patient_short_name}</div>
                      <div className="appointment-card__phone">{appt.patient_phone}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={`${dateStr}-${time}`} className="schedule-grid__cell schedule-grid__cell--empty">
                  <button
                    type="button"
                    className="slot-add-btn"
                    onClick={() => onSlotClick(dateStr, time)}
                    aria-label={`Добавить запись ${dateStr} ${time}`}
                  >
                    <PlusIcon />
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
