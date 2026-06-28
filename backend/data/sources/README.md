# МКБ-10 — источник справочника

Файл `mkb10_official.csv` — официальный справочник МКБ-10 (OID `1.2.643.5.1.13.13.11.1005`).

Для пересборки поискового индекса:

```bash
python backend/scripts/build_mkb10_json.py
```

Результат: `backend/data/mkb10.json`
