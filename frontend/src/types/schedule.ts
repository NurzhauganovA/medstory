export interface Specialist {
  id: number;
  full_name: string;
  specialty: string;
  room: string | null;
}

export interface ScheduleAppointment {
  id: number;
  patient_id: number;
  specialist_id: number | null;
  medical_card_id: number | null;
  appointment_date: string;
  time_start: string;
  appointment_type: string | null;
  comment: string | null;
  color: string;
  patient_name: string;
  patient_phone: string | null;
  patient_short_name: string;
}

export interface ScheduleResponse {
  date_from: string;
  date_to: string;
  specialist_id: number | null;
  appointments: ScheduleAppointment[];
}

export interface SlotSelection {
  date: string;
  time: string;
  specialistId: number;
}

export type ViewMode = "day" | "week" | "month";

export type VisitType = "Первичный прием" | "Повторный прием";

export interface BookingDetail {
  appointment_id: number;
  medical_card_id: number | null;
  current_step: number;
  patient_id: number;
  specialist_id: number | null;
  appointment_date: string;
  time_start: string;
  appointment_type: string | null;
  comment: string | null;
  color: string;
  card_data: import("./index").MedicalCardData;
  patient_name: string;
  patient_phone: string | null;
  patient_iin: string | null;
  patient_email: string | null;
  patient_birth_date: string | null;
  specialist_name: string | null;
  specialist_specialty: string | null;
}

export interface BookingPayload {
  specialist_id: number;
  appointment_date: string;
  time_start: string;
  appointment_type: string;
  comment?: string | null;
  card_data: import("./index").MedicalCardData;
}

const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

const MONTHS_RU = [
  "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
  "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря",
];

const WEEKDAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function formatWeekRange(from: Date, to: Date): string {
  const sameMonth = from.getMonth() === to.getMonth();
  if (sameMonth) {
    return `${from.getDate()} — ${to.getDate()} ${MONTHS_RU[from.getMonth()]}, ${from.getFullYear()}`;
  }
  return `${from.getDate()} ${MONTHS_RU[from.getMonth()]} — ${to.getDate()} ${MONTHS_RU[to.getMonth()]}, ${to.getFullYear()}`;
}

export function formatDayTitle(date: Date): string {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const prefix = isToday ? "Сегодня " : "";
  return `${prefix}${date.getDate()} ${MONTHS_RU[date.getMonth()]}, ${date.getFullYear()} г`;
}

export function formatSlotDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getWeekDays(weekStart: Date, count = 6): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(weekStart, i));
}

export function weekdayLabel(date: Date): string {
  return WEEKDAYS_SHORT[date.getDay()];
}

export const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export const SPECIALTIES = [
  "Все специалисты",
  "Невролог",
  "Лор",
  "Главный врач",
];

export function getAvailableSlots(
  specialistId: number,
  date: string,
  appointments: ScheduleAppointment[],
  excludeAppointmentId?: number,
): string[] {
  const booked = new Set(
    appointments
      .filter(
        (a) =>
          a.specialist_id === specialistId &&
          a.appointment_date === date &&
          a.id !== excludeAppointmentId,
      )
      .map((a) => a.time_start),
  );
  return TIME_SLOTS.filter((t) => !booked.has(t));
}
