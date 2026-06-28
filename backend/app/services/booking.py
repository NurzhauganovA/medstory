from __future__ import annotations

from datetime import date, time
from typing import Any

from sqlalchemy.orm import Session, joinedload

from app.models import Appointment, MedicalCard, Patient, Specialist
from app.schemas.booking import AppointmentBookingCreate, AppointmentBookingDetail, AppointmentBookingUpdate
from app.schemas.medical_card import empty_medical_card_data
from app.services.schedule import short_patient_name, time_to_str
from app.utils import deep_merge


def visit_type_color(appointment_type: str) -> str:
    return "green" if "Повторный" in appointment_type else "blue"


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    def get_booking(self, appointment_id: int) -> AppointmentBookingDetail:
        appt = (
            self.db.query(Appointment)
            .options(
                joinedload(Appointment.patient),
                joinedload(Appointment.specialist_ref),
                joinedload(Appointment.medical_cards),
            )
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if appt is None:
            raise ValueError("Appointment not found")

        card = appt.medical_cards[0] if appt.medical_cards else None
        card_data = card.data if card else empty_medical_card_data()
        patient = appt.patient
        specialist = appt.specialist_ref

        return AppointmentBookingDetail(
            appointment_id=appt.id,
            medical_card_id=card.id if card else None,
            current_step=card.current_step if card else 1,
            patient_id=patient.id,
            specialist_id=appt.specialist_id,
            appointment_date=appt.appointment_date,
            time_start=time_to_str(appt.time_start),
            appointment_type=appt.appointment_type,
            comment=appt.comment,
            color=appt.color or "blue",
            card_data=card_data,
            patient_name=patient.full_name,
            patient_phone=patient.phone,
            patient_iin=patient.iin,
            patient_email=patient.email,
            patient_birth_date=patient.birth_date,
            specialist_name=specialist.full_name if specialist else None,
            specialist_specialty=specialist.specialty if specialist else None,
        )

    def create_booking(self, payload: AppointmentBookingCreate) -> AppointmentBookingDetail:
        specialist = self.db.query(Specialist).filter(Specialist.id == payload.specialist_id).first()
        if specialist is None:
            raise ValueError("Specialist not found")

        patient = self._upsert_patient_from_card(payload.card_data)
        hour, minute = map(int, payload.time_start.split(":"))

        existing = (
            self.db.query(Appointment)
            .filter(
                Appointment.specialist_id == payload.specialist_id,
                Appointment.appointment_date == payload.appointment_date,
                Appointment.time_start == time(hour, minute),
            )
            .first()
        )
        if existing:
            raise ValueError("Слот уже занят")

        appointment = Appointment(
            patient_id=patient.id,
            specialist_id=payload.specialist_id,
            appointment_date=payload.appointment_date,
            time_start=time(hour, minute),
            appointment_type=payload.appointment_type,
            specialist=f"{specialist.specialty} - {specialist.full_name}",
            service="Прием",
            comment=payload.comment,
            color=visit_type_color(payload.appointment_type),
        )
        self.db.add(appointment)
        self.db.flush()

        card_data = deep_merge(empty_medical_card_data(), payload.card_data)
        card = MedicalCard(
            patient_id=patient.id,
            appointment_id=appointment.id,
            status="in_progress",
            current_step=1,
            data=card_data,
        )
        self.db.add(card)
        self.db.commit()

        return self.get_booking(appointment.id)

    def update_booking(self, appointment_id: int, payload: AppointmentBookingUpdate) -> AppointmentBookingDetail:
        appt = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.medical_cards), joinedload(Appointment.patient))
            .filter(Appointment.id == appointment_id)
            .first()
        )
        if appt is None:
            raise ValueError("Appointment not found")

        if payload.specialist_id is not None:
            specialist = self.db.query(Specialist).filter(Specialist.id == payload.specialist_id).first()
            if specialist is None:
                raise ValueError("Specialist not found")
            appt.specialist_id = payload.specialist_id
            appt.specialist = f"{specialist.specialty} - {specialist.full_name}"

        if payload.appointment_date is not None:
            appt.appointment_date = payload.appointment_date

        if payload.time_start is not None:
            hour, minute = map(int, payload.time_start.split(":"))
            appt.time_start = time(hour, minute)

        if payload.appointment_type is not None:
            appt.appointment_type = payload.appointment_type
            appt.color = visit_type_color(payload.appointment_type)

        if payload.comment is not None:
            appt.comment = payload.comment

        if payload.card_data is not None:
            patient = self._upsert_patient_from_card(payload.card_data, patient=appt.patient)
            appt.patient_id = patient.id

            card = appt.medical_cards[0] if appt.medical_cards else None
            if card is None:
                card = MedicalCard(
                    patient_id=patient.id,
                    appointment_id=appt.id,
                    status="in_progress",
                    current_step=1,
                    data=empty_medical_card_data(),
                )
                self.db.add(card)
                self.db.flush()
            card.data = deep_merge(card.data, payload.card_data)

        self.db.commit()
        return self.get_booking(appointment_id)

    def _upsert_patient_from_card(
        self,
        card_data: dict[str, Any],
        patient: Patient | None = None,
    ) -> Patient:
        passport = card_data.get("passport", {})
        full_name = passport.get("full_name")
        if not full_name:
            raise ValueError("ФИО пациента обязательно")

        birth_raw = passport.get("birth_date")
        birth_date: date | None = None
        if birth_raw:
            if isinstance(birth_raw, str):
                birth_date = date.fromisoformat(birth_raw)
            elif isinstance(birth_raw, date):
                birth_date = birth_raw

        if patient is None:
            iin = passport.get("iin")
            if iin:
                patient = self.db.query(Patient).filter(Patient.iin == iin).first()
            if patient is None:
                patient = Patient(full_name=full_name)
                self.db.add(patient)

        patient.full_name = full_name
        patient.phone = passport.get("phone")
        patient.email = passport.get("email")
        patient.iin = passport.get("iin")
        patient.birth_date = birth_date
        self.db.flush()
        return patient
