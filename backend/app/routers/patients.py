from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.medical_card import (
    MedicalCardRead,
    PatientCreate,
    PatientDetailResponse,
    PatientListResponse,
    PatientPrintResponse,
    PatientRead,
    PatientUpdate,
)
from app.schemas.auth import UserRole
from app.security import require_roles
from app.services.medical_card import PdfGeneratorService
from app.services.patient import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])

# Регистрировать пациентов и вести приём могут врач и администратор.
require_editor = require_roles(UserRole.admin, UserRole.doctor)


@router.get("", response_model=PatientListResponse)
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
) -> PatientListResponse:
    return PatientService(db).list_patients(page=page, page_size=page_size, search=search)


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    _=Depends(require_editor),
) -> PatientRead:
    return PatientService(db).create_patient(payload)


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: int, db: Session = Depends(get_db)) -> PatientRead:
    patient = PatientService(db).get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.get("/{patient_id}/detail", response_model=PatientDetailResponse)
def get_patient_detail(patient_id: int, db: Session = Depends(get_db)) -> PatientDetailResponse:
    detail = PatientService(db).get_patient_detail(patient_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return detail


@router.patch("/{patient_id}", response_model=PatientRead)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_editor),
) -> PatientRead:
    service = PatientService(db)
    try:
        return service.update_patient(patient_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{patient_id}/start-visit", response_model=MedicalCardRead)
def start_patient_visit(
    patient_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_editor),
) -> MedicalCardRead:
    service = PatientService(db)
    try:
        return service.start_visit(patient_id)
    except ValueError as exc:
        message = str(exc)
        if "already in progress" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message) from exc
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message) from exc


@router.post("/{patient_id}/complete-visit", response_model=MedicalCardRead)
def complete_patient_visit(
    patient_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_editor),
) -> MedicalCardRead:
    service = PatientService(db)
    try:
        return service.complete_active_visit(patient_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{patient_id}/print-card", response_model=PatientPrintResponse)
def print_patient_card(patient_id: int, db: Session = Depends(get_db)) -> PatientPrintResponse:
    service = PatientService(db)
    try:
        card, download_url = service.generate_patient_pdf(patient_id)
        return PatientPrintResponse(
            filename=f"052_u_patient_{patient_id}.pdf",
            download_url=download_url,
            medical_card_id=card.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{patient_id}/pdf")
def download_patient_pdf(patient_id: int, db: Session = Depends(get_db)):
    service = PatientService(db)
    patient = service.get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    try:
        card, _ = service.generate_patient_pdf(patient_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    pdf_path = settings.generated_pdfs_dir / f"medical_card_{card.id}.pdf"
    if not pdf_path.exists():
        PdfGeneratorService().generate(card)

    safe_name = patient.full_name.replace(" ", "_")
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"052_u_{safe_name}.pdf",
    )
