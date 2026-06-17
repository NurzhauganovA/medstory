from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.form_options import FORM_OPTIONS, FORM_STEPS
from app.database import get_db
from app.schemas.medical_card import (
    FormSchemaResponse,
    MedicalCardCreate,
    MedicalCardListItem,
    MedicalCardRead,
    MedicalCardUpdateStep,
)
from app.services.medical_card import MedicalCardService, PdfGeneratorService

router = APIRouter(prefix="/medical-cards", tags=["medical-cards"])


@router.get("/schema/form", response_model=FormSchemaResponse)
def get_form_schema() -> FormSchemaResponse:
    return FormSchemaResponse(steps=FORM_STEPS, options=FORM_OPTIONS)


@router.get("", response_model=list[MedicalCardListItem])
def list_medical_cards(
    patient_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
) -> list[MedicalCardListItem]:
    service = MedicalCardService(db)
    return service.list_cards(patient_id=patient_id, status=status)


@router.post("", response_model=MedicalCardRead, status_code=status.HTTP_201_CREATED)
def create_medical_card(payload: MedicalCardCreate, db: Session = Depends(get_db)) -> MedicalCardRead:
    service = MedicalCardService(db)
    try:
        return service.create_card(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{card_id}", response_model=MedicalCardRead)
def get_medical_card(card_id: int, db: Session = Depends(get_db)) -> MedicalCardRead:
    service = MedicalCardService(db)
    card = service.get_card(card_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical card not found")
    return card


@router.patch("/{card_id}/step", response_model=MedicalCardRead)
def update_medical_card_step(
    card_id: int,
    payload: MedicalCardUpdateStep,
    db: Session = Depends(get_db),
) -> MedicalCardRead:
    """Сохранение данных текущего шага при нажатии «Далее» или «Назад»."""
    service = MedicalCardService(db)
    try:
        return service.update_step(card_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{card_id}/complete", response_model=MedicalCardRead)
def complete_medical_card(card_id: int, db: Session = Depends(get_db)) -> MedicalCardRead:
    service = MedicalCardService(db)
    try:
        return service.complete_card(card_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{card_id}/generate-pdf")
def generate_medical_card_pdf(card_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    service = MedicalCardService(db)
    card = service.get_card(card_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical card not found")

    pdf_service = PdfGeneratorService()
    output_path = pdf_service.generate(card)
    return {
        "filename": output_path.name,
        "download_url": f"/api/medical-cards/{card_id}/pdf",
    }


@router.get("/{card_id}/pdf")
def download_medical_card_pdf(card_id: int, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse

    service = MedicalCardService(db)
    card = service.get_card(card_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical card not found")

    pdf_path = settings_generated_pdf(card_id)
    if not pdf_path.exists():
        pdf_service = PdfGeneratorService()
        pdf_path = pdf_service.generate(card)

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"medical_card_{card_id}.pdf",
    )


def settings_generated_pdf(card_id: int):
    from app.config import settings

    return settings.generated_pdfs_dir / f"medical_card_{card_id}.pdf"
