from __future__ import annotations

from pydantic import BaseModel, Field


class Icd10Item(BaseModel):
    code: str
    name: str


class Icd10SearchResponse(BaseModel):
    query: str
    count: int
    results: list[Icd10Item] = Field(default_factory=list)
