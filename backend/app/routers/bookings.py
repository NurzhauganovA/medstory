from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.booking import (
    AppointmentBookingCreate,
    AppointmentBookingDetail,
    AppointmentBookingUpdate,
)
from app.services.booking import BookingService

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("/{appointment_id}", response_model=AppointmentBookingDetail)
def get_booking(appointment_id: int, db: Session = Depends(get_db)) -> AppointmentBookingDetail:
    try:
        return BookingService(db).get_booking(appointment_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=AppointmentBookingDetail, status_code=status.HTTP_201_CREATED)
def create_booking(payload: AppointmentBookingCreate, db: Session = Depends(get_db)) -> AppointmentBookingDetail:
    try:
        return BookingService(db).create_booking(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{appointment_id}", response_model=AppointmentBookingDetail)
def update_booking(
    appointment_id: int,
    payload: AppointmentBookingUpdate,
    db: Session = Depends(get_db),
) -> AppointmentBookingDetail:
    try:
        return BookingService(db).update_booking(appointment_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
