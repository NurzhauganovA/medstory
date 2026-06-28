import { CalendarIcon, SearchIcon } from "../icons";
import type { ScheduleAppointment, Specialist, VisitType } from "../../types/schedule";
import {
  SPECIALTIES,
  addDays,
  formatSlotDateLabel,
  getAvailableSlots,
  toIsoDate,
} from "../../types/schedule";

interface AppointmentFormRightProps {
  specialists: Specialist[];
  appointments: ScheduleAppointment[];
  selectedSpecialistId: number | null;
  selectedDate: string;
  selectedTime: string;
  visitType: VisitType;
  comment: string;
  nearestTime: boolean;
  specialtyFilter: string;
  specialistSearch: string;
  excludeAppointmentId?: number;
  onSpecialistSelect: (id: number) => void;
  onDateChange: (date: string) => void;
  onTimeSelect: (time: string, date?: string) => void;
  onVisitTypeChange: (type: VisitType) => void;
  onCommentChange: (value: string) => void;
  onNearestTimeChange: (value: boolean) => void;
  onSpecialtyFilterChange: (value: string) => void;
  onSpecialistSearchChange: (value: string) => void;
}

export function AppointmentFormRight({
  specialists,
  appointments,
  selectedSpecialistId,
  selectedDate,
  selectedTime,
  visitType,
  comment,
  nearestTime,
  specialtyFilter,
  specialistSearch,
  excludeAppointmentId,
  onSpecialistSelect,
  onDateChange,
  onTimeSelect,
  onVisitTypeChange,
  onCommentChange,
  onNearestTimeChange,
  onSpecialtyFilterChange,
  onSpecialistSearchChange,
}: AppointmentFormRightProps) {
  const filtered = specialists.filter((s) => {
    if (specialtyFilter !== "Все специалисты" && s.specialty !== specialtyFilter) return false;
    if (specialistSearch && !s.full_name.toLowerCase().includes(specialistSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  const showPlaceholder = filtered.length === 0;

  function buildSlotItems(specId: number) {
    const items: { date: string; time: string }[] = [];
    const base = new Date(selectedDate + "T00:00:00");

    for (let day = 0; day < 5; day++) {
      const date = toIsoDate(addDays(base, day));
      const times = getAvailableSlots(specId, date, appointments, excludeAppointmentId);
      for (const time of times) {
        items.push({ date, time });
      }
    }

    if (
      selectedTime &&
      !items.some((item) => item.date === selectedDate && item.time === selectedTime)
    ) {
      items.unshift({ date: selectedDate, time: selectedTime });
    }

    return items;
  }

  return (
    <aside className="form-page__right">
      <h3 className="form-page__right-title">3. Выберите специалиста и слот</h3>

      <select
        className="form-page__select"
        value={specialtyFilter}
        onChange={(e) => onSpecialtyFilterChange(e.target.value)}
      >
        {SPECIALTIES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="form-page__date-row">
        <label className="form-page__checkbox">
          <input
            type="checkbox"
            checked={nearestTime}
            onChange={(e) => onNearestTimeChange(e.target.checked)}
          />
          Ближайшее время
        </label>
        <div className="form-page__date-field">
          <CalendarIcon />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="form-page__search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Поиск специалиста"
          value={specialistSearch}
          onChange={(e) => onSpecialistSearchChange(e.target.value)}
        />
      </div>

      <div className="form-page__specialists-list">
        {showPlaceholder ? (
          <div className="form-page__empty-slots">
            <div className="form-page__empty-icon">🕐</div>
            <p>Тут будут отображаться свободные окошки специалистов</p>
          </div>
        ) : (
          filtered.map((spec) => {
            const isSelected = spec.id === selectedSpecialistId;
            const displaySlots = isSelected ? buildSlotItems(spec.id) : [];

            return (
              <div
                key={spec.id}
                className={`form-page__spec-card ${isSelected ? "form-page__spec-card--active" : ""}`}
              >
                <button
                  type="button"
                  className="form-page__spec-head"
                  onClick={() => onSpecialistSelect(spec.id)}
                >
                  <span className={`form-page__radio ${isSelected ? "form-page__radio--on" : ""}`} />
                  <div className="form-page__spec-info">
                    <span className="form-page__spec-name">{spec.full_name}</span>
                    <div className="form-page__spec-tags">
                      <span className={`form-page__tag ${isSelected ? "form-page__tag--blue" : ""}`}>
                        {spec.specialty}
                      </span>
                      {spec.room && <span className="form-page__tag form-page__tag--gray">{spec.room}</span>}
                    </div>
                  </div>
                </button>

                {isSelected && (
                  <div className="form-page__slots">
                    {displaySlots.length === 0 ? (
                      <span className="form-page__no-slots">Нет свободных слотов</span>
                    ) : (
                      displaySlots.map((slot) => (
                        <button
                          key={`${slot.date}-${slot.time}`}
                          type="button"
                          className={`form-page__slot-card ${
                            selectedTime === slot.time && selectedDate === slot.date
                              ? "form-page__slot-card--active"
                              : ""
                          }`}
                          onClick={() => onTimeSelect(slot.time, slot.date)}
                        >
                          <span className="form-page__slot-date">
                            {formatSlotDateLabel(slot.date)}
                          </span>
                          <span className="form-page__slot-time">{slot.time}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="form-page__visit-type">
        <button
          type="button"
          className={`form-page__visit-btn ${visitType === "Первичный прием" ? "form-page__visit-btn--active" : ""}`}
          onClick={() => onVisitTypeChange("Первичный прием")}
        >
          Первичный прием
        </button>
        <button
          type="button"
          className={`form-page__visit-btn ${visitType === "Повторный прием" ? "form-page__visit-btn--active" : ""}`}
          onClick={() => onVisitTypeChange("Повторный прием")}
        >
          Повторный прием
        </button>
      </div>

      <div className="form-page__comment">
        <label className="form-page__comment-label">Комментарий</label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Комментарий"
          rows={3}
        />
      </div>
    </aside>
  );
}

export function pickNearestSlot(
  specialists: Specialist[],
  date: string,
  appointments: ScheduleAppointment[],
  specialtyFilter: string,
): { specialistId: number; time: string } | null {
  const list = specialists.filter(
    (s) => specialtyFilter === "Все специалисты" || s.specialty === specialtyFilter,
  );
  for (const spec of list) {
    const slots = getAvailableSlots(spec.id, date, appointments);
    if (slots.length > 0) {
      return { specialistId: spec.id, time: slots[0] };
    }
  }
  return null;
}
