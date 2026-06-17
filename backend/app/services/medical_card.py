from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.config import settings
from app.models import MedicalCard, Patient
from app.schemas.medical_card import CardStatus, MedicalCardCreate, MedicalCardUpdateStep
from app.utils import deep_merge


class MedicalCardService:
    def __init__(self, db: Session):
        self.db = db

    def list_cards(self, *, patient_id: int | None = None, status: str | None = None) -> list[MedicalCard]:
        query = self.db.query(MedicalCard)
        if patient_id is not None:
            query = query.filter(MedicalCard.patient_id == patient_id)
        if status is not None:
            query = query.filter(MedicalCard.status == status)
        return query.order_by(MedicalCard.updated_at.desc()).all()

    def get_card(self, card_id: int) -> MedicalCard | None:
        return self.db.query(MedicalCard).filter(MedicalCard.id == card_id).first()

    def create_card(self, payload: MedicalCardCreate) -> MedicalCard:
        patient = self.db.query(Patient).filter(Patient.id == payload.patient_id).first()
        if patient is None:
            raise ValueError("Patient not found")

        card = MedicalCard(
            patient_id=payload.patient_id,
            appointment_id=payload.appointment_id,
            card_number=payload.card_number,
            status=CardStatus.in_progress.value,
            current_step=1,
        )
        card.data = self._prefill_from_patient(card.data, patient)
        self.db.add(card)
        self.db.commit()
        self.db.refresh(card)
        return card

    def update_step(self, card_id: int, payload: MedicalCardUpdateStep) -> MedicalCard:
        card = self.get_card(card_id)
        if card is None:
            raise ValueError("Medical card not found")

        card.data = deep_merge(card.data, payload.data)
        card.current_step = payload.current_step
        if card.status == CardStatus.draft.value:
            card.status = CardStatus.in_progress.value
        self.db.commit()
        self.db.refresh(card)
        return card

    def complete_card(self, card_id: int) -> MedicalCard:
        card = self.get_card(card_id)
        if card is None:
            raise ValueError("Medical card not found")
        card.status = CardStatus.completed.value
        card.current_step = 5
        self.db.commit()
        self.db.refresh(card)
        return card

    def _prefill_from_patient(self, data: dict[str, Any], patient: Patient) -> dict[str, Any]:
        passport = data.get("passport", {})
        passport.update(
            {
                "iin": patient.iin,
                "full_name": patient.full_name,
                "phone": patient.phone,
                "email": patient.email,
                "birth_date": patient.birth_date.isoformat() if patient.birth_date else None,
            }
        )
        data["passport"] = passport
        return data


class PdfGeneratorService:
    """Генерация PDF на основе шаблона и заполненных данных."""

    def __init__(self, template_path: Path | None = None):
        self.template_path = template_path or settings.pdf_template_path

    def generate(self, card: MedicalCard) -> Path:
        output_dir = settings.generated_pdfs_dir
        output_path = output_dir / f"medical_card_{card.id}.pdf"

        if self.template_path.exists():
            self._generate_from_template(card, output_path)
        else:
            self._generate_summary_pdf(card, output_path)

        return output_path

    def _generate_from_template(self, card: MedicalCard, output_path: Path) -> None:
        """Накладывает текст поверх PDF-шаблона (AcroForm отсутствует — overlay)."""
        from pypdf import PdfReader, PdfWriter

        reader = PdfReader(str(self.template_path))
        writer = PdfWriter()
        overlay_buffer = self._build_overlay(card)

        for page_index, page in enumerate(reader.pages):
            if page_index == 0:
                overlay_reader = PdfReader(overlay_buffer)
                page.merge_page(overlay_reader.pages[0])
            writer.add_page(page)

        with open(output_path, "wb") as f:
            writer.write(f)

    def _build_overlay(self, card: MedicalCard) -> BytesIO:
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        data = card.data
        passport = data.get("passport", {})
        anamnesis = data.get("anamnesis", {})

        y = 780
        line_height = 14

        def draw(label: str, value: str | None) -> None:
            nonlocal y
            if value:
                c.setFont("Helvetica", 9)
                c.drawString(50, y, f"{label}: {value}")
                y -= line_height

        draw("ИИН", passport.get("iin"))
        draw("ФИО", passport.get("full_name"))
        draw("Телефон", passport.get("phone"))
        draw("Email", passport.get("email"))
        draw("Дата рождения", passport.get("birth_date"))
        draw("Филиал", passport.get("branch"))
        draw("Жалобы", anamnesis.get("patient_words"))

        pain = anamnesis.get("pain", {})
        if pain.get("is_present"):
            draw("Боль", "Есть")
            draw("Локализация", ", ".join(pain.get("localization", [])))
            draw("Характер", ", ".join(pain.get("character", [])))
        else:
            draw("Боль", "Нет")

        draw("Anamnesis morbi", anamnesis.get("onset_reason"))
        draw("Последнее обострение", anamnesis.get("last_exacerbation"))

        vitae = anamnesis.get("vitae", {})
        draw("Диспансерный учет", vitae.get("dispensary_registration"))
        draw("Сопутствующие заболевания", vitae.get("concomitant_diseases"))
        draw("Аллергия", vitae.get("allergies"))

        draw("Инструментальные исследования", data.get("instrumental_studies"))

        diagnostics = data.get("diagnostics", {})
        draw("VAS боль", str(diagnostics.get("pain_vas")) if diagnostics.get("pain_vas") is not None else None)
        draw("Качество жизни", str(diagnostics.get("quality_of_life")) if diagnostics.get("quality_of_life") is not None else None)

        diagnosis = data.get("diagnosis", {})
        draw("Диагноз", diagnosis.get("full_description"))

        treatment = data.get("treatment", {})
        draw("Курс", treatment.get("course_type"))
        draw("Координатор", treatment.get("coordinator"))
        draw("Процедуры", ", ".join(treatment.get("procedures", [])))
        draw("Рекомендации", ", ".join(treatment.get("recommendations", [])))

        c.save()
        buffer.seek(0)
        return buffer

    def _generate_summary_pdf(self, card: MedicalCard, output_path: Path) -> None:
        """Fallback: текстовый PDF без шаблона."""
        c = canvas.Canvas(str(output_path), pagesize=A4)
        y = 800
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Медицинская карта амбулаторного пациента")
        y -= 30
        c.setFont("Helvetica", 10)

        def draw_line(text: str) -> None:
            nonlocal y
            if y < 50:
                c.showPage()
                y = 800
                c.setFont("Helvetica", 10)
            c.drawString(50, y, text[:110])
            y -= 14

        import json

        for line in json.dumps(card.data, ensure_ascii=False, indent=2).splitlines():
            draw_line(line)

        c.save()
