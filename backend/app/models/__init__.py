from __future__ import annotations

from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Integer, JSON, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas.medical_card import CardStatus, empty_medical_card_data


class Specialist(Base):
    __tablename__ = "specialists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(128), nullable=False)
    room: Mapped[str | None] = mapped_column(String(32), nullable=True)

    appointments: Mapped[list[Appointment]] = relationship(back_populates="specialist_ref")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    iin: Mapped[str | None] = mapped_column(String(12), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(32), nullable=True)
    residence: Mapped[str | None] = mapped_column(String(64), nullable=True)
    workplace: Mapped[str | None] = mapped_column(String(255), nullable=True)
    insurance_company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    appointments: Mapped[list[Appointment]] = relationship(back_populates="patient")
    medical_cards: Mapped[list[MedicalCard]] = relationship(back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    specialist_id: Mapped[int | None] = mapped_column(ForeignKey("specialists.id"), nullable=True, index=True)
    appointment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    time_start: Mapped[time | None] = mapped_column(Time, nullable=True)
    responsible: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source: Mapped[str | None] = mapped_column(String(128), nullable=True)
    appointment_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    specialist: Mapped[str | None] = mapped_column(String(255), nullable=True)
    service: Mapped[str | None] = mapped_column(String(128), nullable=True)
    budget: Mapped[str | None] = mapped_column(String(64), nullable=True)
    comment: Mapped[str | None] = mapped_column(String(512), nullable=True)
    color: Mapped[str] = mapped_column(String(16), default="blue", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped[Patient] = relationship(back_populates="appointments")
    specialist_ref: Mapped[Specialist | None] = relationship(back_populates="appointments")
    medical_cards: Mapped[list[MedicalCard]] = relationship(back_populates="appointment")


class MedicalCard(Base):
    __tablename__ = "medical_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False, index=True)
    appointment_id: Mapped[int | None] = mapped_column(ForeignKey("appointments.id"), nullable=True, index=True)
    card_number: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    status: Mapped[str] = mapped_column(String(32), default=CardStatus.draft.value, nullable=False)
    current_step: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    data: Mapped[dict] = mapped_column(JSON, default=empty_medical_card_data, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    patient: Mapped[Patient] = relationship(back_populates="medical_cards")
    appointment: Mapped[Appointment | None] = relationship(back_populates="medical_cards")
