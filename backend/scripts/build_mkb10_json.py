#!/usr/bin/env python3
"""Build searchable MKB-10 JSON from the official Russian reference CSV.

Source: OID 1.2.643.5.1.13.13.11.1005 (МКБ-10), mirrored from
https://github.com/ak4nv/mkb10/tree/master/resources

Usage:
    python backend/scripts/build_mkb10_json.py
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "sources" / "mkb10_official.csv"
OUT = ROOT / "data" / "mkb10.json"


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source CSV: {SRC}")

    entries: list[dict[str, str]] = []
    with SRC.open(encoding="utf-8") as handle:
        for row in csv.DictReader(handle, delimiter=";"):
            if row["ACTUAL"] != "1" or not row["MKB_CODE"] or "-" in row["MKB_CODE"]:
                continue
            code = row["MKB_CODE"].strip('"')
            if not any(char.isdigit() for char in code):
                continue
            entries.append({"code": code, "name": row["MKB_NAME"].strip('"')})

    entries.sort(key=lambda item: item["code"])
    OUT.write_text(json.dumps(entries, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {OUT}")


if __name__ == "__main__":
    main()
