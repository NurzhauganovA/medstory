from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class SpecialistRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    specialty: str
    room: str | None = None


class AppointmentScheduleItem(BaseModel):
    id: int
    patient_id: int
    specialist_id: int | None = None
    medical_card_id: int | None = None
    appointment_date: date
    time_start: str
    appointment_type: str | None = None
    comment: str | None = None
    color: str = "blue"
    patient_name: str
    patient_phone: str | None = None
    patient_short_name: str


class ScheduleSlotCreate(BaseModel):
    patient_id: int | None = None
    patient_full_name: str | None = None
    patient_phone: str | None = None
    patient_iin: str | None = None
    specialist_id: int
    appointment_date: date
    time_start: str = Field(pattern=r"^\d{2}:\d{2}$")
    appointment_type: str = "Первичный прием"
    comment: str | None = None
    color: str = "blue"


class ScheduleResponse(BaseModel):
    date_from: date
    date_to: date
    specialist_id: int | None = None
    appointments: list[AppointmentScheduleItem]
