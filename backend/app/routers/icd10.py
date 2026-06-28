from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.schemas.icd10 import Icd10Item, Icd10SearchResponse
from app.services.icd10 import lookup_icd10, neuro_suggestions, search_icd10

router = APIRouter(prefix="/icd10", tags=["icd10"])


@router.get("/search", response_model=Icd10SearchResponse)
def search_icd10_codes(
    q: str = Query(..., min_length=2, description="Код или название диагноза"),
    limit: int = Query(20, ge=1, le=50),
) -> Icd10SearchResponse:
    results = search_icd10(q, limit=limit)
    return Icd10SearchResponse(query=q, count=len(results), results=results)


@router.get("/lookup/{code}", response_model=Icd10Item)
def lookup_icd10_code(code: str) -> Icd10Item:
    entry = lookup_icd10(code)
    if entry is None:
        raise HTTPException(status_code=404, detail="Код МКБ-10 не найден")
    return entry


@router.get("/suggestions", response_model=list[Icd10Item])
def icd10_suggestions(limit: int = Query(12, ge=1, le=30)) -> list[Icd10Item]:
    return neuro_suggestions(limit=limit)
