from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from app.schemas.icd10 import Icd10Item

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "mkb10.json"

# Частые коды для неврологии и опорно-двигательного аппарата (префиксы МКБ-10).
NEURO_PREFIXES = (
    "M47",
    "M48",
    "M50",
    "M51",
    "M53",
    "M54",
    "M79",
    "G54",
    "G55",
    "G56",
    "G57",
    "G58",
    "G93",
    "S13",
    "S23",
    "S33",
)


@lru_cache(maxsize=1)
def _load_entries() -> tuple[Icd10Item, ...]:
    if not DATA_PATH.exists():
        return tuple()
    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return tuple(Icd10Item.model_validate(item) for item in raw)


@lru_cache(maxsize=1)
def _code_index() -> dict[str, Icd10Item]:
    return {entry.code.upper(): entry for entry in _load_entries()}


def lookup_icd10(code: str) -> Icd10Item | None:
    return _code_index().get(code.strip().upper())


def _score(entry: Icd10Item, query: str) -> tuple[int, str]:
    code = entry.code.upper()
    name = entry.name.casefold()
    q_upper = query.strip().upper()
    q_lower = query.strip().casefold()

    if code.startswith(q_upper):
        return (0, code)
    if q_upper in code:
        return (1, code)
    if name.startswith(q_lower):
        return (2, code)
    if q_lower in name:
        return (3, code)
    return (99, code)


def search_icd10(query: str, *, limit: int = 20) -> list[Icd10Item]:
    q = query.strip()
    if len(q) < 2:
        return []

    limit = max(1, min(limit, 50))
    matches: list[tuple[tuple[int, str], Icd10Item]] = []

    for entry in _load_entries():
        score = _score(entry, q)
        if score[0] < 99:
            matches.append((score, entry))

    matches.sort(key=lambda item: (item[0][0], item[0][1]))
    return [entry for _, entry in matches[:limit]]


def neuro_suggestions(*, limit: int = 12) -> list[Icd10Item]:
    limit = max(1, min(limit, 30))
    results: list[Icd10Item] = []
    for entry in _load_entries():
        if "." not in entry.code:
            continue
        if not any(entry.code.startswith(prefix) for prefix in NEURO_PREFIXES):
            continue
        results.append(entry)
        if len(results) >= limit:
            break
    return results


def is_code_like(query: str) -> bool:
    return bool(re.match(r"^[A-Za-zА-Яа-я]\d", query.strip()))
