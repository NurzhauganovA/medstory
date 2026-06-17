"""Маппинг примера data.json (PascalCase) в формат API (snake_case)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _map_pain(pain: dict[str, Any]) -> dict[str, Any]:
    return {
        "is_present": pain.get("IsPresent"),
        "duration": pain.get("Duration"),
        "intensity": pain.get("Intensity"),
        "localization": pain.get("Localization", []),
        "character": pain.get("Character", []),
        "frequency": pain.get("Frequency", []),
        "provokes": pain.get("Provokes", []),
        "provokes_other": pain.get("ProvokesOther"),
        "relieves": pain.get("Relieves", []),
        "relieves_other": pain.get("RelievesOther"),
    }


def _map_vitae(vitae: dict[str, Any]) -> dict[str, Any]:
    return {
        "dispensary_registration": vitae.get("DispensaryRegistration"),
        "doctors_contacts": vitae.get("DoctorsContacts"),
        "blood_type": vitae.get("BloodType"),
        "concomitant_diseases": vitae.get("ConcomitantDiseases"),
        "past_traumas_surgeries": vitae.get("PastTraumasSurgeries"),
        "preventive_measures": vitae.get("PreventiveMeasures"),
        "anthropometry": vitae.get("Anthropometry"),
        "allergies": vitae.get("Allergies"),
        "bad_habits": vitae.get("BadHabits"),
    }


def map_legacy_data(raw: dict[str, Any]) -> dict[str, Any]:
    anamnesis = raw.get("Anamnesis", {})
    diagnostics = raw.get("Diagnostics", {})
    diagnosis = raw.get("Diagnosis", {})
    treatment = raw.get("Treatment", {})
    mri = diagnosis.get("Mri", {})

    return {
        "anamnesis": {
            "patient_words": anamnesis.get("PatientWords"),
            "onset_reason": anamnesis.get("OnsetReason"),
            "last_exacerbation": anamnesis.get("LastExacerbation"),
            "pain": _map_pain(anamnesis.get("Pain", {})),
            "numbness": anamnesis.get("Numbness", []),
            "current_state": anamnesis.get("CurrentState", []),
            "previous_treatment": anamnesis.get("PreviousTreatment", []),
            "vitae": _map_vitae(anamnesis.get("Vitae", {})),
        },
        "diagnostics": {
            "hypertonus": diagnostics.get("Hypertonus", []),
            "hypotonus": diagnostics.get("Hypotonus", []),
            "rigidity": diagnostics.get("Rigidity", []),
            "lasseg_right": diagnostics.get("LassegRight"),
            "lasseg_left": diagnostics.get("LassegLeft"),
            "lerrey_test": diagnostics.get("LerreyTest"),
            "other_spine_tests": diagnostics.get("OtherSpineTests"),
            "knee_flexion_left": diagnostics.get("KneeFlexionLeft"),
            "knee_flexion_right": diagnostics.get("KneeFlexionRight"),
            "knee_extension_left": diagnostics.get("KneeExtensionLeft"),
            "knee_extension_right": diagnostics.get("KneeExtensionRight"),
            "hip_flexion": diagnostics.get("HipFlexion"),
            "hip_ext_rotation": diagnostics.get("HipExtRotation"),
            "hip_int_rotation": diagnostics.get("HipIntRotation"),
            "hip_adduction": diagnostics.get("HipAdduction"),
            "hip_abduction": diagnostics.get("HipAbduction"),
            "shoulder_abduction": diagnostics.get("ShoulderAbduction"),
            "shoulder_flexion": diagnostics.get("ShoulderFlexion"),
            "shoulder_extension": diagnostics.get("ShoulderExtension"),
            "shoulder_supination": diagnostics.get("ShoulderSupination"),
            "shoulder_pronation": diagnostics.get("ShoulderPronation"),
            "shoulder_horiz_adduction": diagnostics.get("ShoulderHorizAdduction"),
            "shoulder_horiz_abduction": diagnostics.get("ShoulderHorizAbduction"),
            "additional_tests": [
                {
                    "muscle_joint": item.get("MuscleJoint"),
                    "test_value": item.get("TestValue"),
                }
                for item in diagnostics.get("AdditionalTests", [])
            ],
            "walking_pattern": diagnostics.get("WalkingPattern"),
            "pain_vas": diagnostics.get("PainVAS"),
            "quality_of_life": diagnostics.get("QualityOfLife"),
        },
        "diagnosis": {
            "icd10_list": [
                {"code": item.get("Code"), "description": item.get("Description")}
                for item in diagnosis.get("ICD10List", [])
            ],
            "full_description": diagnosis.get("FullDescription"),
            "mri": {
                "hernia_type": mri.get("HerniaType"),
                "segments": [
                    {"segment_name": s.get("SegmentName"), "size_mm": s.get("SizeMm")}
                    for s in mri.get("Segments", [])
                ],
                "is_ligamentous": mri.get("IsLigamentous"),
                "sequestration": mri.get("Sequestration"),
                "location": mri.get("Location"),
                "chronicity": mri.get("Chronicity"),
                "bulging": mri.get("Bulging"),
                "modic": mri.get("Modic"),
                "osteophytes": mri.get("Osteophytes"),
                "kpp": mri.get("KPP"),
                "schmorl": mri.get("Schmorl"),
                "hemangiomas": mri.get("Hemangiomas"),
            },
            "concomitant": diagnosis.get("Concomitant"),
        },
        "treatment": {
            "course_type": treatment.get("CourseType"),
            "coordinator": treatment.get("Coordinator"),
            "procedures": treatment.get("Procedures", []),
            "injections": [
                {
                    "inj_date": item.get("InjDate"),
                    "drug_id": item.get("DrugID"),
                    "drug_name": item.get("DrugName"),
                }
                for item in treatment.get("Injections", [])
            ],
            "medications": [
                {
                    "drug_id": item.get("DrugID"),
                    "drug_name": item.get("DrugName"),
                    "regimen": item.get("Regimen"),
                }
                for item in treatment.get("Medications", [])
            ],
            "recommendations": treatment.get("Recommendations", []),
            "lfk_per_week": treatment.get("LfkPerWeek"),
            "walking_steps": treatment.get("WalkingSteps"),
            "additional_recs": treatment.get("AdditionalRecs"),
            "next_mri_date": treatment.get("NextMriDate"),
        },
    }


def load_example_data(path: Path | None = None) -> dict[str, Any]:
    data_path = path or Path(__file__).resolve().parents[2] / "data.json"
    with open(data_path, encoding="utf-8") as f:
        raw = json.load(f)
    return map_legacy_data(raw)
