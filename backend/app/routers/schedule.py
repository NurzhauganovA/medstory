from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schedule import (
    AppointmentScheduleItem,
    ScheduleResponse,
    ScheduleSlotCreate,
    SpecialistRead,
)
from app.services.schedule import ScheduleService

router = APIRouter(tags=["schedule"])


@router.get("/specialists", response_model=list[SpecialistRead])
def list_specialists(
    specialty: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
) -> list[SpecialistRead]:
    return ScheduleService(db).list_specialists(specialty=specialty, search=search)


@router.get("/schedule", response_model=ScheduleResponse)
def get_schedule(
    date_from: date = Query(...),
    date_to: date = Query(...),
    specialist_id: int | None = None,
    db: Session = Depends(get_db),
) -> ScheduleResponse:
    appointments = ScheduleService(db).get_schedule(
        date_from=date_from,
        date_to=date_to,
        specialist_id=specialist_id,
    )
    return ScheduleResponse(
        date_from=date_from,
        date_to=date_to,
        specialist_id=specialist_id,
        appointments=appointments,
    )


@router.post("/schedule", response_model=AppointmentScheduleItem, status_code=status.HTTP_201_CREATED)
def create_schedule_slot(payload: ScheduleSlotCreate, db: Session = Depends(get_db)) -> AppointmentScheduleItem:
    service = ScheduleService(db)
    try:
        appt = service.create_slot(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    patient = appt.patient
    from app.services.schedule import short_patient_name, time_to_str

    return AppointmentScheduleItem(
        id=appt.id,
        patient_id=appt.patient_id,
        specialist_id=appt.specialist_id,
        appointment_date=appt.appointment_date,
        time_start=time_to_str(appt.time_start),
        appointment_type=appt.appointment_type,
        comment=appt.comment,
        color=appt.color or "blue",
        patient_name=patient.full_name,
        patient_phone=patient.phone,
        patient_short_name=short_patient_name(patient.full_name),
    )
