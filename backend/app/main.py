from __future__ import annotations

from datetime import date

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import appointments, medical_cards, patients


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(patients.router, prefix="/api")
    app.include_router(appointments.router, prefix="/api")
    app.include_router(medical_cards.router, prefix="/api")

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        seed_demo_data()

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


def seed_demo_data() -> None:
    """Демо-данные из макетов Скрины.docx для быстрого старта."""
    from app.database import SessionLocal
    from app.models import Appointment, MedicalCard, Patient
    from app.schemas.medical_card import empty_medical_card_data

    db = SessionLocal()
    try:
        if db.query(Patient).count() > 0:
            return

        patient = Patient(
            iin="950213546567",
            full_name="Досболов Айдар Даулетович",
            phone="+7 (777) 783 90 56",
            email="dosbolov.a@mail.com",
            birth_date=date(1995, 2, 13),
        )
        db.add(patient)
        db.flush()

        appointment = Appointment(
            patient_id=patient.id,
            appointment_date=date(2025, 11, 22),
            responsible="Жандосова М. А.",
            source="What's app",
            appointment_type="Первичный прием",
            specialist="Лор - Жандосова М. А.",
            service="Прием",
            budget="12 500 тг",
        )
        db.add(appointment)
        db.flush()

        card_data = empty_medical_card_data()
        card_data["passport"].update(
            {
                "iin": patient.iin,
                "full_name": patient.full_name,
                "phone": patient.phone,
                "email": patient.email,
                "birth_date": "1995-02-13",
                "visit_date": "2025-11-22",
                "branch": "Тимирязева 67",
            }
        )
        card_data["anamnesis"]["patient_words"] = "Боли в пояснице когда наклонясь"

        card = MedicalCard(
            patient_id=patient.id,
            appointment_id=appointment.id,
            card_number="052/001",
            status="in_progress",
            current_step=1,
            data=card_data,
        )
        db.add(card)
        db.commit()
    finally:
        db.close()


app = create_app()
