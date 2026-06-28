from __future__ import annotations

import math
from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Appointment, MedicalCard, Patient, Specialist
from app.schemas.medical_card import (
    MedicalCardCreate,
    PatientCreate,
    PatientDetailResponse,
    PatientListItem,
    PatientListResponse,
    PatientUpdate,
    PatientVisitItem,
)
from app.services.medical_card import MedicalCardService, PdfGeneratorService


class PatientService:
    def __init__(self, db: Session):
        self.db = db

    def list_patients(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
    ) -> PatientListResponse:
        query = self.db.query(Patient)

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Patient.full_name.ilike(term),
                    Patient.iin.ilike(term),
                    Patient.phone.ilike(term),
                )
            )

        total = query.count()
        page = max(1, page)
        page_size = min(max(1, page_size), 100)
        total_pages = max(1, math.ceil(total / page_size)) if total else 1
        if page > total_pages:
            page = total_pages

        items = (
            query.order_by(Patient.full_name)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return PatientListResponse(
            items=[PatientListItem.model_validate(p) for p in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def list_patients_all(self) -> list[Patient]:
        return self.db.query(Patient).order_by(Patient.full_name).all()

    def get_patient(self, patient_id: int) -> Patient | None:
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_patient_detail(self, patient_id: int) -> PatientDetailResponse | None:
        patient = self.get_patient(patient_id)
        if patient is None:
            return None

        cards = (
            self.db.query(MedicalCard)
            .filter(MedicalCard.patient_id == patient_id)
            .order_by(MedicalCard.updated_at.desc())
            .all()
        )

        appointments = (
            self.db.query(Appointment)
            .options(joinedload(Appointment.specialist_ref))
            .filter(Appointment.patient_id == patient_id)
            .order_by(Appointment.appointment_date.desc(), Appointment.time_start.desc())
            .all()
        )

        visits: list[PatientVisitItem] = []
        card_by_appt = {c.appointment_id: c for c in cards if c.appointment_id}

        for appt in appointments:
            card = card_by_appt.get(appt.id)
            card_data = card.data if card else {}
            diagnosis = card_data.get("diagnosis", {}) if card_data else {}
            diagnostics = card_data.get("diagnostics", {}) if card_data else {}
            passport = card_data.get("passport", {}) if card_data else {}

            icd_list = diagnosis.get("icd10_list") or []
            icd_codes = ", ".join(
                entry.get("code") for entry in icd_list if isinstance(entry, dict) and entry.get("code")
            )
            diagnosis_label = icd_codes or diagnosis.get("full_description")

            visits.append(
                PatientVisitItem(
                    id=appt.id,
                    medical_card_id=card.id if card else None,
                    visit_date=appt.appointment_date,
                    status=card.status if card else "scheduled",
                    doctor_name=passport.get("doctor_name")
                    or (appt.specialist_ref.full_name if appt.specialist_ref else appt.specialist),
                    diagnosis=diagnosis_label,
                    pain_vas=diagnostics.get("pain_vas"),
                )
            )

        for card in cards:
            if card.appointment_id is not None:
                continue
            card_data = card.data or {}
            diagnosis = card_data.get("diagnosis", {})
            diagnostics = card_data.get("diagnostics", {})
            passport = card_data.get("passport", {})
            visit_date_str = passport.get("visit_date")
            visit_date = date.fromisoformat(visit_date_str) if visit_date_str else None

            icd_list = diagnosis.get("icd10_list") or []
            icd_codes = ", ".join(
                entry.get("code") for entry in icd_list if isinstance(entry, dict) and entry.get("code")
            )
            diagnosis_label = icd_codes or diagnosis.get("full_description")

            visits.append(
                PatientVisitItem(
                    id=card.id,
                    medical_card_id=card.id,
                    visit_date=visit_date,
                    status=card.status,
                    doctor_name=passport.get("doctor_name"),
                    diagnosis=diagnosis_label,
                    pain_vas=diagnostics.get("pain_vas"),
                )
            )

        visits.sort(key=lambda v: v.visit_date or date.min, reverse=True)

        latest = cards[0] if cards else None
        active = next((c for c in cards if c.status in ("draft", "in_progress")), None)
        return PatientDetailResponse(
            patient=PatientListItem.model_validate(patient),
            latest_card_id=latest.id if latest else None,
            latest_card_step=latest.current_step if latest else 1,
            active_card_id=active.id if active else None,
            visits=visits,
        )

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

    def get_or_create_printable_card(self, patient_id: int) -> MedicalCard:
        patient = self.get_patient(patient_id)
        if patient is None:
            raise ValueError("Patient not found")

        card = (
            self.db.query(MedicalCard)
            .filter(MedicalCard.patient_id == patient_id)
            .order_by(MedicalCard.updated_at.desc())
            .first()
        )
        if card is not None:
            return card

        return MedicalCardService(self.db).create_card(MedicalCardCreate(patient_id=patient_id))

    def start_visit(self, patient_id: int) -> MedicalCard:
        patient = self.get_patient(patient_id)
        if patient is None:
            raise ValueError("Patient not found")

        in_progress = (
            self.db.query(MedicalCard)
            .filter(
                MedicalCard.patient_id == patient_id,
                MedicalCard.status.in_(["draft", "in_progress"]),
            )
            .order_by(MedicalCard.updated_at.desc())
            .first()
        )
        if in_progress is not None:
            raise ValueError("Active visit already in progress")

        return MedicalCardService(self.db).create_card(MedicalCardCreate(patient_id=patient_id))

    def complete_active_visit(self, patient_id: int) -> MedicalCard:
        patient = self.get_patient(patient_id)
        if patient is None:
            raise ValueError("Patient not found")

        in_progress = (
            self.db.query(MedicalCard)
            .filter(
                MedicalCard.patient_id == patient_id,
                MedicalCard.status.in_(["draft", "in_progress"]),
            )
            .order_by(MedicalCard.updated_at.desc())
            .first()
        )
        if in_progress is None:
            raise ValueError("No active visit to complete")

        return MedicalCardService(self.db).complete_card(in_progress.id)

    def generate_patient_pdf(self, patient_id: int) -> tuple[MedicalCard, str]:
        card = self.get_or_create_printable_card(patient_id)
        pdf_service = PdfGeneratorService()
        output_path = pdf_service.generate(card)
        download_url = f"/api/medical-cards/{card.id}/pdf"
        return card, download_url


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

    def create_appointment(self, payload) -> Appointment:
        from app.schemas.medical_card import AppointmentCreate

        patient = self.db.query(Patient).filter(Patient.id == payload.patient_id).first()
        if patient is None:
            raise ValueError("Patient not found")
        appointment = Appointment(**payload.model_dump())
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
