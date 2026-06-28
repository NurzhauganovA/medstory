from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, Field


class AppointmentBookingCreate(BaseModel):
    specialist_id: int
    appointment_date: date
    time_start: str = Field(pattern=r"^\d{2}:\d{2}$")
    appointment_type: str = "Первичный прием"
    comment: str | None = None
    card_data: dict[str, Any] = Field(default_factory=dict)


class AppointmentBookingUpdate(BaseModel):
    specialist_id: int | None = None
    appointment_date: date | None = None
    time_start: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    appointment_type: str | None = None
    comment: str | None = None
    card_data: dict[str, Any] | None = None


class AppointmentBookingDetail(BaseModel):
    appointment_id: int
    medical_card_id: int | None
    current_step: int = 1
    patient_id: int
    specialist_id: int | None
    appointment_date: date
    time_start: str
    appointment_type: str | None
    comment: str | None
    color: str
    card_data: dict[str, Any]
    patient_name: str
    patient_phone: str | None
    patient_iin: str | None
    patient_email: str | None
    patient_birth_date: date | None
    specialist_name: str | None
    specialist_specialty: str | None
