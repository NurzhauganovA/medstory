from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CardStatus(str, Enum):
    draft = "draft"
    in_progress = "in_progress"
    completed = "completed"


class PainBlock(BaseModel):
    is_present: bool | None = None
    duration: str | None = None
    intensity: str | None = None
    localization: list[str] = Field(default_factory=list)
    character: list[str] = Field(default_factory=list)
    frequency: list[str] = Field(default_factory=list)
    provokes: list[str] = Field(default_factory=list)
    provokes_other: str | None = None
    relieves: list[str] = Field(default_factory=list)
    relieves_other: str | None = None


class VitaeBlock(BaseModel):
    dispensary_registration: str | None = None
    doctors_contacts: str | None = None
    blood_type: str | None = None
    concomitant_diseases: str | None = None
    past_traumas_surgeries: str | None = None
    preventive_measures: str | None = None
    anthropometry: str | None = None
    allergies: str | None = None
    bad_habits: str | None = None


class AnamnesisBlock(BaseModel):
    patient_words: str | None = None
    onset_reason: str | None = None
    onset_association: str | None = None
    last_exacerbation: str | None = None
    exacerbation_reason: str | None = None
    pain: PainBlock = Field(default_factory=PainBlock)
    numbness: list[str] = Field(default_factory=list)
    current_state: list[str] = Field(default_factory=list)
    previous_treatment: list[str] = Field(default_factory=list)
    vitae: VitaeBlock = Field(default_factory=VitaeBlock)


class AdditionalTest(BaseModel):
    muscle_joint: str | None = None
    test_value: str | None = None


class DiagnosticsBlock(BaseModel):
    hypertonus: list[str] = Field(default_factory=list)
    hypotonus: list[str] = Field(default_factory=list)
    rigidity: list[str] = Field(default_factory=list)
    lasseg_right: str | None = None
    lasseg_left: str | None = None
    lerrey_test: str | None = None
    other_spine_tests: str | None = None
    knee_flexion_left: str | None = None
    knee_flexion_right: str | None = None
    knee_extension_left: str | None = None
    knee_extension_right: str | None = None
    hip_flexion: str | None = None
    hip_ext_rotation: str | None = None
    hip_int_rotation: str | None = None
    hip_adduction: str | None = None
    hip_abduction: str | None = None
    shoulder_abduction: str | None = None
    shoulder_flexion: str | None = None
    shoulder_extension: str | None = None
    shoulder_supination: str | None = None
    shoulder_pronation: str | None = None
    shoulder_horiz_adduction: str | None = None
    shoulder_horiz_abduction: str | None = None
    additional_tests: list[AdditionalTest] = Field(default_factory=list)
    walking_pattern: str | None = None
    pain_vas: int | None = Field(default=None, ge=0, le=10)
    quality_of_life: int | None = Field(default=None, ge=0, le=10)


class Icd10Entry(BaseModel):
    code: str | None = None
    description: str | None = None


class MriSegment(BaseModel):
    segment_name: str | None = None
    size_mm: str | None = None


class MriBlock(BaseModel):
    hernia_type: str | None = None
    segments: list[MriSegment] = Field(default_factory=list)
    is_ligamentous: bool | None = None
    sequestration: str | None = None
    location: str | None = None
    chronicity: str | None = None
    bulging: str | None = None
    modic: str | None = None
    osteophytes: str | None = None
    kpp: str | None = None
    schmorl: str | None = None
    hemangiomas: str | None = None


class DiagnosisBlock(BaseModel):
    icd10_list: list[Icd10Entry] = Field(default_factory=list)
    full_description: str | None = None
    mri: MriBlock = Field(default_factory=MriBlock)
    pathology_rows: list[dict[str, Any]] = Field(default_factory=list)
    body_map_markers: list[dict[str, Any]] = Field(default_factory=list)
    concomitant: str | None = None


class TreatmentProcedure(BaseModel):
    id: str
    name: str
    date: str | None = None
    dose: str | None = None
    drug_name: str | None = None


class BodyMapProcedure(BaseModel):
    id: str
    procedure_name: str
    procedure_date: str | None = None
    dose: str | None = None
    drug_name: str | None = None
    notes: str | None = None


class InjectionEntry(BaseModel):
    inj_date: str | None = None
    drug_id: int | None = None
    drug_name: str | None = None


class MedicationEntry(BaseModel):
    drug_id: int | None = None
    drug_name: str | None = None
    regimen: str | None = None


class TreatmentCourse(BaseModel):
    id: str
    number: int = 1
    course_type: str | None = None
    coordinator: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    next_mri_date: str | None = None
    procedures: list[TreatmentProcedure | str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    lfk_per_week: str | None = None
    walking_steps: str | None = None
    additional_recs: str | None = None


class TreatmentBlock(BaseModel):
    courses: list[TreatmentCourse] = Field(default_factory=list)
    active_course_id: str | None = None
    course_type: str | None = None
    coordinator: str | None = None
    procedures: list[TreatmentProcedure | str] = Field(default_factory=list)
    injections: list[InjectionEntry] = Field(default_factory=list)
    medications: list[MedicationEntry] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    lfk_per_week: str | None = None
    walking_steps: str | None = None
    additional_recs: str | None = None
    next_mri_date: str | None = None


class PassportBlock(BaseModel):
    iin: str | None = None
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    birth_date: date | None = None
    visit_date: date | None = None
    branch: str | None = None
    gender: str | None = None
    age: int | None = None
    nationality: str | None = None
    residence: str | None = None
    citizenship: str | None = None
    address: str | None = None
    workplace: str | None = None
    position: str | None = None
    education: str | None = None
    insurance_company: str | None = None
    insurance_type: str | None = None
    social_status: str | None = None
    visit_reason: str | None = None
    doctor_name: str | None = None
    nurse_name: str | None = None
    coordinator_name: str | None = None
    primary_visit_date: date | None = None
    course_end_date: date | None = None


class MedicalCardData(BaseModel):
    """Полная JSON-структура медкарты — хранится в одном JSONB-поле."""

    passport: PassportBlock = Field(default_factory=PassportBlock)
    anamnesis: AnamnesisBlock = Field(default_factory=AnamnesisBlock)
    instrumental_studies: str | None = None
    diagnostics: DiagnosticsBlock = Field(default_factory=DiagnosticsBlock)
    diagnosis: DiagnosisBlock = Field(default_factory=DiagnosisBlock)
    treatment: TreatmentBlock = Field(default_factory=TreatmentBlock)


def empty_medical_card_data() -> dict[str, Any]:
    return MedicalCardData().model_dump(mode="json")


class PatientBase(BaseModel):
    iin: str | None = None
    full_name: str
    phone: str | None = None
    email: str | None = None
    birth_date: date | None = None
    gender: str | None = None
    residence: str | None = None
    workplace: str | None = None
    insurance_company: str | None = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    iin: str | None = None
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    birth_date: date | None = None
    gender: str | None = None
    residence: str | None = None
    workplace: str | None = None
    insurance_company: str | None = None


class PatientRead(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class PatientListItem(PatientRead):
    pass


class PatientListResponse(BaseModel):
    items: list[PatientListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class PatientVisitItem(BaseModel):
    id: int
    medical_card_id: int | None = None
    visit_date: date | None = None
    status: str
    doctor_name: str | None = None
    diagnosis: str | None = None
    pain_vas: int | None = None


class PatientDetailResponse(BaseModel):
    patient: PatientRead
    latest_card_id: int | None = None
    latest_card_step: int = 1
    active_card_id: int | None = None
    visits: list[PatientVisitItem]


class PatientPrintResponse(BaseModel):
    filename: str
    download_url: str
    medical_card_id: int


class AppointmentBase(BaseModel):
    patient_id: int
    appointment_date: date
    responsible: str | None = None
    source: str | None = None
    appointment_type: str | None = None
    specialist: str | None = None
    service: str | None = None
    budget: str | None = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentRead(AppointmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    patient: PatientRead | None = None


class MedicalCardCreate(BaseModel):
    patient_id: int
    appointment_id: int | None = None
    card_number: str | None = None


class MedicalCardUpdateStep(BaseModel):
    """Частичное обновление при нажатии «Далее» на конкретном шаге."""

    current_step: int = Field(ge=1, le=5)
    data: dict[str, Any] = Field(default_factory=dict)


class MedicalCardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    appointment_id: int | None
    card_number: str | None
    status: CardStatus
    current_step: int
    data: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    patient: PatientRead | None = None


class MedicalCardListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    card_number: str | None
    status: CardStatus
    current_step: int
    updated_at: datetime
    patient: PatientRead | None = None


class FormSchemaResponse(BaseModel):
    steps: list[dict[str, Any]]
    options: dict[str, list[str]]
