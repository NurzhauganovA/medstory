from __future__ import annotations

from datetime import date, time

from sqlalchemy.orm import Session, joinedload

from app.models import Appointment, Patient, Specialist
from app.schemas.schedule import AppointmentScheduleItem, ScheduleSlotCreate


def short_patient_name(full_name: str) -> str:
    parts = full_name.split()
    if len(parts) >= 3:
        return f"{parts[0]} {parts[1][0]}. {parts[2][0]}."
    if len(parts) == 2:
        return f"{parts[0]} {parts[1][0]}."
    return full_name


def time_to_str(value: time | None) -> str:
    if value is None:
        return "09:00"
    return value.strftime("%H:%M")


class ScheduleService:
    def __init__(self, db: Session):
        self.db = db

    def list_specialists(self, *, specialty: str | None = None, search: str | None = None) -> list[Specialist]:
        query = self.db.query(Specialist)
        if specialty and specialty != "Все специалисты":
            query = query.filter(Specialist.specialty == specialty)
        if search:
            query = query.filter(Specialist.full_name.ilike(f"%{search}%"))
        return query.order_by(Specialist.full_name).all()

    def get_schedule(
        self,
        *,
        date_from: date,
        date_to: date,
        specialist_id: int | None = None,
    ) -> list[AppointmentScheduleItem]:
        query = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient), joinedload(Appointment.medical_cards))
            .filter(Appointment.appointment_date >= date_from, Appointment.appointment_date <= date_to)
        )
        if specialist_id is not None:
            query = query.filter(Appointment.specialist_id == specialist_id)

        items: list[AppointmentScheduleItem] = []
        for appt in query.order_by(Appointment.appointment_date, Appointment.time_start).all():
            patient = appt.patient
            card_id = appt.medical_cards[0].id if appt.medical_cards else None
            items.append(
                AppointmentScheduleItem(
                    id=appt.id,
                    patient_id=appt.patient_id,
                    specialist_id=appt.specialist_id,
                    medical_card_id=card_id,
                    appointment_date=appt.appointment_date,
                    time_start=time_to_str(appt.time_start),
                    appointment_type=appt.appointment_type,
                    comment=appt.comment,
                    color=appt.color or "blue",
                    patient_name=patient.full_name,
                    patient_phone=patient.phone,
                    patient_short_name=short_patient_name(patient.full_name),
                )
            )
        return items

    def create_slot(self, payload: ScheduleSlotCreate) -> Appointment:
        patient: Patient | None = None
        if payload.patient_id:
            patient = self.db.query(Patient).filter(Patient.id == payload.patient_id).first()
        elif payload.patient_full_name:
            patient = Patient(
                iin=payload.patient_iin,
                full_name=payload.patient_full_name,
                phone=payload.patient_phone,
            )
            self.db.add(patient)
            self.db.flush()
        else:
            raise ValueError("Patient is required")

        specialist = self.db.query(Specialist).filter(Specialist.id == payload.specialist_id).first()
        if specialist is None:
            raise ValueError("Specialist not found")

        hour, minute = map(int, payload.time_start.split(":"))
        appointment = Appointment(
            patient_id=patient.id,
            specialist_id=payload.specialist_id,
            appointment_date=payload.appointment_date,
            time_start=time(hour, minute),
            appointment_type=payload.appointment_type,
            specialist=f"{specialist.specialty} - {specialist.full_name}",
            service="Прием",
            comment=payload.comment,
            color=payload.color,
        )
        self.db.add(appointment)
        self.db.commit()
        appt = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.patient))
            .filter(Appointment.id == appointment.id)
            .one()
        )
        return appt
