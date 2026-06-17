from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Appointment, Patient
from app.schemas.medical_card import (
    AppointmentCreate,
    PatientCreate,
    PatientUpdate,
)


class PatientService:
    def __init__(self, db: Session):
        self.db = db

    def list_patients(self) -> list[Patient]:
        return self.db.query(Patient).order_by(Patient.full_name).all()

    def get_patient(self, patient_id: int) -> Patient | None:
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def create_patient(self, payload: PatientCreate) -> Patient:
        patient = Patient(**payload.model_dump())
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update_patient(self, patient_id: int, payload: PatientUpdate) -> Patient:
        patient = self.get_patient(patient_id)
        if patient is None:
            raise ValueError("Patient not found")
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(patient, key, value)
        self.db.commit()
        self.db.refresh(patient)
        return patient


class AppointmentService:
    def __init__(self, db: Session):
        self.db = db

    def list_appointments(self, *, patient_id: int | None = None) -> list[Appointment]:
        query = self.db.query(Appointment)
        if patient_id is not None:
            query = query.filter(Appointment.patient_id == patient_id)
        return query.order_by(Appointment.appointment_date.desc()).all()

    def get_appointment(self, appointment_id: int) -> Appointment | None:
        return self.db.query(Appointment).filter(Appointment.id == appointment_id).first()

    def create_appointment(self, payload: AppointmentCreate) -> Appointment:
        patient = self.db.query(Patient).filter(Patient.id == payload.patient_id).first()
        if patient is None:
            raise ValueError("Patient not found")
        appointment = Appointment(**payload.model_dump())
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
