from __future__ import annotations

from datetime import date, datetime, time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import appointments, bookings, icd10, medical_cards, patients, schedule


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
    app.include_router(schedule.router, prefix="/api")
    app.include_router(bookings.router, prefix="/api")
    app.include_router(icd10.router, prefix="/api")

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        seed_demo_data()

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


def _backfill_patient_profiles(db) -> None:
    from datetime import date as dt_date

    from app.models import Patient

    profiles = {
        "Досболов": ("1995-02-13", "Мужской", "Город", "ТОО «MEGA»", "ФСМС"),
        "Алиева": ("1994-10-12", "Женский", "Город", "Больница №1", "ФСМС"),
    }

    for patient in db.query(Patient).all():
        if patient.gender:
            continue
        for key, (birth, gender, residence, workplace, insurance) in profiles.items():
            if key in patient.full_name:
                patient.birth_date = patient.birth_date or dt_date.fromisoformat(birth)
                patient.gender = gender
                patient.residence = residence
                patient.workplace = workplace
                patient.insurance_company = insurance
                break
        else:
            patient.gender = patient.gender or "Мужской"
            patient.residence = patient.residence or "Город"
            patient.workplace = patient.workplace or "—"
            patient.insurance_company = patient.insurance_company or "ФСМС"


def seed_demo_data() -> None:
    """Демо-данные для расписания регистратуры."""
    from app.database import SessionLocal
    from app.models import Appointment, MedicalCard, Patient, Specialist
    from app.schemas.medical_card import empty_medical_card_data

    db = SessionLocal()
    try:
        if db.query(Specialist).count() > 0:
            _backfill_patient_profiles(db)
            db.commit()
            return

        specialists = [
            Specialist(full_name="Омаров Даулет Асхатович", specialty="Невролог", room="каб. 102"),
            Specialist(full_name="Касымов Руслан Арманович", specialty="Невролог", room="каб. 103"),
            Specialist(full_name="Сулейменова Динара Канатовна", specialty="Невролог", room="каб. 104"),
            Specialist(full_name="Жандосова М. А.", specialty="Лор", room="каб. 201"),
            Specialist(full_name="Ашимова Д. Н.", specialty="Главный врач", room="каб. 001"),
        ]
        db.add_all(specialists)
        db.flush()

        patients = db.query(Patient).all()
        if len(patients) < 12:
            patients_data = [
                ("Аскаров Айдын Максатович", "+7 (777) 783 90 56", "951203545678", "1990-03-15", "Мужской", "Город", "Поликлиника №3", "ФСМС"),
                ("Досболов Айдар Даулетович", "+7 (777) 783 90 56", "950213546567", "1995-02-13", "Мужской", "Город", "ТОО «MEGA»", "ФСМС"),
                ("Иванов Петр Сергеевич", "+7 (701) 234 56 78", "900101123456", "1988-07-22", "Мужской", "Город", "АО «КазМунайГаз»", "ФСМС"),
                ("Ким Айгуль Нурлановна", "+7 (702) 345 67 89", "920505987654", "1992-05-05", "Женский", "Город", "Школа №45", "ФСМС"),
                ("Нурланов Ерлан Бекенович", "+7 (705) 456 78 90", "880808112233", "1987-08-08", "Мужской", "Село", "Фермерское хозяйство", "ФСМС"),
                ("Алиева Айгерим Бериковна", "+7 (707) 111 22 33", "941012345678", "1994-10-12", "Женский", "Город", "Больница №1", "ФСМС"),
                ("Беков Арман Серикович", "+7 (708) 222 33 44", "930303456789", "1993-03-03", "Мужской", "Город", "IT компания", "ФСМС"),
                ("Сатова Динара Канатовна", "+7 (709) 333 44 55", "960606567890", "1996-06-06", "Женский", "Город", "Университет", "ФСМС"),
                ("Жумабеков Тимур Алиевич", "+7 (700) 444 55 66", "910909678901", "1991-09-09", "Мужской", "Село", "Стройкомпания", "ФСМС"),
                ("Оразова Гульнара Маратовна", "+7 (701) 555 66 77", "970707789012", "1997-07-07", "Женский", "Город", "Салон красоты", "ФСМС"),
                ("Мухамедов Руслан Ерланович", "+7 (702) 666 77 88", "890505890123", "1989-05-05", "Мужской", "Город", "Банк", "ФСМС"),
                ("Тлеубергенова Асель Болатовна", "+7 (703) 777 88 99", "980808901234", "1998-08-08", "Женский", "Город", "Магазин", "ФСМС"),
            ]
            for name, phone, iin, birth, gender, residence, workplace, insurance in patients_data:
                if not any(p.full_name == name for p in patients):
                    from datetime import date as dt_date
                    p = Patient(
                        full_name=name,
                        phone=phone,
                        iin=iin,
                        email="patient@mail.com",
                        birth_date=dt_date.fromisoformat(birth),
                        gender=gender,
                        residence=residence,
                        workplace=workplace,
                        insurance_company=insurance,
                    )
                    db.add(p)
                    patients.append(p)
            db.flush()

        # Неделя 21–26 января 2026 по макету
        week_start = date(2026, 1, 21)
        schedule_entries = [
            (0, 0, "08:00", "green"),
            (0, 1, "08:00", "green"),
            (0, 2, "08:00", "blue"),
            (0, 3, "08:00", "green"),
            (0, 4, "08:00", "green"),
            (1, 0, "09:00", "green"),
            (1, 1, "09:00", "blue"),
            (1, 2, "09:00", "green"),
            (2, 0, "10:00", "blue"),
            (2, 3, "10:00", "green"),
            (3, 1, "11:00", "green"),
            (3, 4, "11:00", "blue"),
            (4, 2, "12:00", "green"),
        ]

        from datetime import timedelta

        for day_offset, spec_idx, time_str, color in schedule_entries:
            h, m = map(int, time_str.split(":"))
            appt = Appointment(
                patient_id=patients[day_offset % len(patients)].id,
                specialist_id=specialists[spec_idx].id,
                appointment_date=week_start + timedelta(days=day_offset),
                time_start=time(h, m),
                appointment_type="Первичный прием",
                specialist=f"{specialists[spec_idx].specialty} - {specialists[spec_idx].full_name}",
                service="Прием",
                budget="12 500 тг",
                color=color,
            )
            db.add(appt)

        if not db.query(MedicalCard).filter(MedicalCard.card_number == "052/001").first():
            dosbolov = next((p for p in patients if "Досболов" in p.full_name), patients[0])
            card_data = empty_medical_card_data()
            card_data["passport"].update(
                {
                    "iin": dosbolov.iin,
                    "full_name": dosbolov.full_name,
                    "phone": dosbolov.phone,
                    "birth_date": "1995-02-13",
                    "visit_date": "2026-01-22",
                    "branch": "Тимирязева 67",
                }
            )
            db.add(
                MedicalCard(
                    patient_id=dosbolov.id,
                    card_number="052/001",
                    status="in_progress",
                    current_step=1,
                    data=card_data,
                )
            )
        db.commit()
    finally:
        db.close()


app = create_app()
