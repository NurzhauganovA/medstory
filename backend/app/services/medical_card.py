from __future__ import annotations

import base64
from datetime import date
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session
from weasyprint import HTML

from app.config import settings
from app.models import MedicalCard, Patient
from app.schemas.medical_card import (
    CardStatus,
    MedicalCardCreate,
    MedicalCardUpdateStep,
    empty_medical_card_data,
)
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
            data=empty_medical_card_data(),
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

        card.data = deep_merge(card.data or empty_medical_card_data(), payload.data)
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

    def _prefill_from_patient(self, data: dict[str, Any] | None, patient: Patient) -> dict[str, Any]:
        if not data:
            data = empty_medical_card_data()
        passport = dict(data.get("passport") or {})
        passport.update(
            {
                "iin": patient.iin,
                "full_name": patient.full_name,
                "phone": patient.phone,
                "email": patient.email,
                "birth_date": patient.birth_date.isoformat() if patient.birth_date else None,
                "visit_date": date.today().isoformat(),
            }
        )
        data["passport"] = passport
        return data


# --------------------------------------------------------------------------- #
#  PDF generation — HTML (Jinja2) + WeasyPrint, стиль формы 052/у             #
# --------------------------------------------------------------------------- #

TEMPLATES_DIR = Path(__file__).resolve().parents[1] / "templates"
ASSETS_DIR = settings.assets_dir


def _clean_body_image(src: Path) -> Path:
    """Исходные силуэты содержат «шахматный» фон прозрачности.

    Заменяем серые клетки фона на белый и кешируем результат, чтобы в PDF
    тело выглядело чисто, на белом фоне.
    """
    if not src.exists():
        return src
    out = settings.generated_pdfs_dir / f"_clean_{src.stem}.png"
    try:
        if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
            return out
        from PIL import Image

        im = Image.open(src).convert("RGB")
        pixels = list(im.getdata())
        white = (255, 255, 255)
        cleaned = [
            white if (max(r, g, b) - min(r, g, b)) <= 16 and min(r, g, b) >= 100 else (r, g, b)
            for r, g, b in pixels
        ]
        im.putdata(cleaned)
        im.save(out)
        return out
    except Exception:
        return src


def _image_data_uri(path: Path) -> str:
    if not path.exists():
        return ""
    try:
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        return f"data:image/png;base64,{encoded}"
    except Exception:
        return ""


def _fmt(value: Any) -> str:
    """Единое форматирование значений для шаблона."""
    if value is None or value == "":
        return "—"
    if isinstance(value, bool):
        return "Да" if value else "Нет"
    if isinstance(value, (list, tuple)):
        parts = [_fmt(v) for v in value if v not in (None, "")]
        return ", ".join(parts) if parts else "—"
    text = str(value).strip()
    return text or "—"


class PdfGeneratorService:
    """Генерация PDF медкарты из HTML-шаблона (Jinja2 + WeasyPrint)."""

    def __init__(self, template_path: Path | None = None):
        self.template_path = template_path or settings.pdf_template_path
        self.env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            autoescape=select_autoescape(["html", "xml"]),
        )
        self.env.filters["fmt"] = _fmt

    # ------------------------------------------------------------------ #
    def generate(self, card: MedicalCard) -> Path:
        output_path = settings.generated_pdfs_dir / f"medical_card_{card.id}.pdf"
        context = self._build_context(card)
        html = self.env.get_template("medical_card.html").render(**context)
        HTML(string=html, base_url=str(TEMPLATES_DIR)).write_pdf(str(output_path))
        return output_path

    # ------------------------------------------------------------------ #
    def _build_context(self, card: MedicalCard) -> dict[str, Any]:
        data: dict[str, Any] = card.data or {}
        passport = data.get("passport") or {}
        anamnesis = data.get("anamnesis") or {}
        pain = anamnesis.get("pain") or {}
        vitae = anamnesis.get("vitae") or {}
        diagnostics = data.get("diagnostics") or {}
        diagnosis = data.get("diagnosis") or {}
        treatment = data.get("treatment") or {}

        # --- боль: провоцирует/купирует с «другое» ---
        provokes = list(pain.get("provokes") or [])
        if pain.get("provokes_other"):
            provokes.append(str(pain["provokes_other"]))
        relieves = list(pain.get("relieves") or [])
        if pain.get("relieves_other"):
            relieves.append(str(pain["relieves_other"]))
        if pain.get("is_present") is True:
            pain_present = "Есть"
        elif pain.get("is_present") is False:
            pain_present = "Нет"
        else:
            pain_present = "—"

        # --- метки тела ---
        markers = []
        for i, m in enumerate(diagnosis.get("body_map_markers") or [], start=1):
            view = m.get("view") or "front"
            markers.append({
                "num": i,
                "view": view,
                "side": "спереди" if view == "front" else "сзади",
                "tool": m.get("tool") or "circle",
                "x": round(float(m.get("x", 50)), 2),
                "y": round(float(m.get("y", 50)), 2),
                "description": m.get("description"),
                "_procs": m.get("procedures") or [],
            })
        front_markers = [m for m in markers if m["view"] == "front"]
        back_markers = [m for m in markers if m["view"] == "back"]

        # --- патология МРТ ---
        pathology = list(diagnosis.get("pathology_rows") or [])
        mri = diagnosis.get("mri") or {}
        if not pathology and any(mri.get(k) for k in ("hernia_type", "location", "sequestration")):
            seg = (mri.get("segments") or [{}])[0]
            pathology = [{
                "hernia_type": mri.get("hernia_type"),
                "segment_name": seg.get("segment_name"),
                "size_mm": seg.get("size_mm"),
                "sequestration": mri.get("sequestration"),
                "location": mri.get("location"),
                "bulging": mri.get("bulging"),
                "modic": mri.get("modic"),
            }]
        mri_extra = [
            ("Давность", mri.get("chronicity")),
            ("Остеофиты", mri.get("osteophytes")),
            ("КПП", mri.get("kpp")),
            ("Грыжи Шморля", mri.get("schmorl")),
            ("Гемангиомы", mri.get("hemangiomas")),
        ]
        mri_extra = [(lbl, val) for lbl, val in mri_extra if val not in (None, "")]

        # --- курсы лечения ---
        courses = self._normalize_courses(treatment)

        footer = "EXPERT NEURO · " + (str(passport.get("full_name") or "").strip() or "—")
        if passport.get("visit_date"):
            footer += f" · {passport['visit_date']}"

        return {
            "card_number": str(card.card_number or card.id),
            "footer": footer,
            "p": passport,
            "age": self._age(passport),
            "a": anamnesis,
            "pain": pain,
            "pain_present": pain_present,
            "provokes": provokes,
            "relieves": relieves,
            "vitae": vitae,
            "instrumental": data.get("instrumental_studies"),
            "diag": diagnostics,
            "diagnosis": diagnosis,
            "pathology": pathology,
            "mri_extra": mri_extra,
            "markers": markers,
            "front_markers": front_markers,
            "back_markers": back_markers,
            "courses": courses,
            "injections": treatment.get("injections") or [],
            "medications": treatment.get("medications") or [],
            "front_img": _image_data_uri(_clean_body_image(ASSETS_DIR / "body-front.png")),
            "back_img": _image_data_uri(_clean_body_image(ASSETS_DIR / "body-back.png")),
        }

    # ------------------------------------------------------------------ #
    @staticmethod
    def _normalize_procedures(procs: list[Any]) -> list[dict[str, Any]]:
        result = []
        for proc in procs or []:
            if isinstance(proc, str):
                result.append({"name": proc})
            elif isinstance(proc, dict):
                result.append({
                    "name": proc.get("name") or proc.get("procedure_name"),
                    "date": proc.get("date") or proc.get("procedure_date"),
                    "dose": proc.get("dose"),
                    "drug_name": proc.get("drug_name"),
                })
        return result

    def _normalize_courses(self, treatment: dict[str, Any]) -> list[dict[str, Any]]:
        raw_courses = treatment.get("courses") or []
        if not raw_courses:
            raw_courses = [{
                "number": 1,
                "course_type": treatment.get("course_type"),
                "coordinator": treatment.get("coordinator"),
                "procedures": treatment.get("procedures") or [],
                "recommendations": treatment.get("recommendations") or [],
                "lfk_per_week": treatment.get("lfk_per_week"),
                "walking_steps": treatment.get("walking_steps"),
                "additional_recs": treatment.get("additional_recs"),
                "next_mri_date": treatment.get("next_mri_date"),
            }]
        courses = []
        for c in raw_courses:
            course = dict(c)
            course["_procs"] = self._normalize_procedures(c.get("procedures"))
            courses.append(course)
        return courses

    @staticmethod
    def _age(passport: dict[str, Any]) -> str:
        if passport.get("age"):
            return str(passport["age"])
        bd = passport.get("birth_date")
        if bd:
            try:
                d = date.fromisoformat(str(bd))
                today = date.today()
                return str(today.year - d.year - ((today.month, today.day) < (d.month, d.day)))
            except Exception:
                return ""
        return ""
