import { useEffect, useState } from "react";
import { api } from "./api/client";
import { AppointmentPanel } from "./components/layout/AppointmentPanel";
import { IconSidebar, TopHeader } from "./components/layout/Header";
import { MedicalForm } from "./components/forms/MedicalForm";
import type { Appointment, FormSchema, MedicalCard } from "./types";
import "./styles/global.css";

export default function App() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [card, setCard] = useState<MedicalCard | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [formSchema, cards, appointments] = await Promise.all([
          api.getFormSchema(),
          api.getMedicalCards(),
          api.getAppointments(),
        ]);

        setSchema(formSchema);

        const activeCard = cards[0];
        if (!activeCard) {
          setError("Нет медицинских карт. Запустите backend для создания демо-данных.");
          return;
        }

        const fullCard = await api.getMedicalCard(activeCard.id);
        setCard(fullCard);

        const appt =
          appointments.find((a) => a.id === fullCard.appointment_id) ?? appointments[0] ?? null;
        setAppointment(appt);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="loading-screen">Загрузка…</div>;
  }

  if (error || !schema || !card) {
    return <div className="error-screen">{error ?? "Данные не найдены"}</div>;
  }

  return (
    <div className="app-shell">
      <IconSidebar />
      <div className="main-column">
        <TopHeader />
        <div className="content-row">
          <AppointmentPanel patient={card.patient ?? null} appointment={appointment} />
          <MedicalForm card={card} schema={schema} onCardUpdate={setCard} />
        </div>
      </div>
    </div>
  );
}
