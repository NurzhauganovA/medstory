import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { AppointmentFormPage } from "../components/schedule/AppointmentFormPage";
import { ScheduleHeader } from "../components/schedule/ScheduleHeader";
import { SpecialistFilter } from "../components/schedule/SpecialistFilter";
import { WeekScheduleGrid } from "../components/schedule/WeekScheduleGrid";
import type { AppointmentFormMode } from "../components/schedule/AppointmentFormPage";
import type {
  ScheduleAppointment,
  SlotSelection,
  Specialist,
  ViewMode,
} from "../types/schedule";
import {
  SPECIALTIES,
  addDays,
  toIsoDate,
} from "../types/schedule";

const DEMO_WEEK_START = new Date(2026, 0, 21);

interface SchedulePageProps {
  embedded?: boolean;
}

export default function SchedulePage({ embedded = false }: SchedulePageProps) {
  const [weekStart, setWeekStart] = useState<Date>(DEMO_WEEK_START);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<number | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("Все специалисты");
  const [specialistSearch, setSpecialistSearch] = useState("");
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>([]);
  const [weekAppointments, setWeekAppointments] = useState<ScheduleAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<AppointmentFormMode>("create");
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);

  const weekEnd = addDays(weekStart, 5);
  const dateFrom = toIsoDate(weekStart);
  const dateTo = toIsoDate(weekEnd);

  const loadSpecialists = useCallback(async () => {
    const data = await api.getSpecialists({
      specialty: specialtyFilter === "Все специалисты" ? undefined : specialtyFilter,
      search: specialistSearch || undefined,
    });
    setSpecialists(data);
    setSelectedSpecialistId((prev) => {
      if (prev != null && data.some((s) => s.id === prev)) return prev;
      return data[0]?.id ?? null;
    });
  }, [specialtyFilter, specialistSearch]);

  const loadSchedule = useCallback(async () => {
    const [filtered, all] = await Promise.all([
      api.getSchedule(dateFrom, dateTo, selectedSpecialistId ?? undefined),
      api.getSchedule(dateFrom, dateTo),
    ]);
    setAppointments(filtered.appointments);
    setWeekAppointments(all.appointments);
  }, [dateFrom, dateTo, selectedSpecialistId]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await loadSpecialists();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadSpecialists]);

  useEffect(() => {
    if (selectedSpecialistId == null) return;
    loadSchedule().catch((e) => setError(e instanceof Error ? e.message : "Ошибка расписания"));
  }, [loadSchedule, selectedSpecialistId]);

  const selectedSpecialist = specialists.find((s) => s.id === selectedSpecialistId) ?? null;

  const openCreateForm = (slot: SlotSelection | null) => {
    setFormMode("create");
    setEditingAppointmentId(undefined);
    setSelectedSlot(slot);
    setFormOpen(true);
  };

  const handleSlotClick = (date: string, time: string) => {
    if (!selectedSpecialistId) return;
    openCreateForm({ date, time, specialistId: selectedSpecialistId });
  };

  const handleCreateClick = () => {
    openCreateForm(null);
  };

  const handleAppointmentOpen = (appt: ScheduleAppointment) => {
    setFormMode("edit");
    setEditingAppointmentId(appt.id);
    setSelectedSlot(null);
    setFormOpen(true);
  };

  const handleSaved = () => {
    loadSchedule().catch(() => undefined);
  };

  const handleWeekChange = (dir: -1 | 1) => {
    setWeekStart((prev) => addDays(prev, dir * 7));
  };

  if (loading) {
    return <div className="page-loading">Загрузка…</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  const content = formOpen ? (
    <AppointmentFormPage
      mode={formMode}
      appointmentId={editingAppointmentId}
      slot={selectedSlot}
      defaultSpecialist={selectedSpecialist}
      appointments={weekAppointments}
      specialists={specialists}
      onClose={() => setFormOpen(false)}
      onSaved={handleSaved}
    />
  ) : (
    <>
      <ScheduleHeader onCreateClick={handleCreateClick} />
      <div className="schedule-page">
        <SpecialistFilter
          specialists={specialists}
          selectedId={selectedSpecialistId}
          specialtyFilter={specialtyFilter}
          search={specialistSearch}
          onSelect={setSelectedSpecialistId}
          onSpecialtyChange={setSpecialtyFilter}
          onSearchChange={setSpecialistSearch}
          specialties={SPECIALTIES}
        />
        <WeekScheduleGrid
          weekStart={weekStart}
          viewMode={viewMode}
          appointments={appointments}
          selectedSpecialist={selectedSpecialist}
          onSlotClick={handleSlotClick}
          onAppointmentOpen={handleAppointmentOpen}
          onWeekChange={handleWeekChange}
          onViewModeChange={setViewMode}
        />
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="app-layout">
      <div className="app-main">{content}</div>
    </div>
  );
}
