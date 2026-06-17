# MedStory — медицинская карта амбулаторного пациента (форма 052/у)

FastAPI + React проект для клиники Expert Neuro.

## Backend (FastAPI + uvicorn)

### Запуск

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Вариант 1 — через uvicorn напрямую (рекомендуется)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Вариант 2 — через модуль
python -m app

# Вариант 3 — через run.py
python run.py

# Вариант 4 — конфиг uvicorn.ini
uvicorn --config uvicorn.ini
```

API: http://localhost:8000  
Swagger: http://localhost:8000/docs

## Frontend (React + Vite)

Требуется Node.js **12.2+** (работает на v12). Рекомендуется **Node.js 18+** (см. `.nvmrc`).

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173 (прокси `/api` → backend :8000)

### Запуск обоих сервисов

```bash
# Терминал 1
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

# Терминал 2
cd frontend && npm run dev
```

## Архитектура данных

Медкарта хранится как **один JSON-документ** в поле `data`. При нажатии «Далее» фронтенд вызывает `PATCH /api/medical-cards/{id}/step` — данные сохраняются, при повторном открытии подгружаются через `GET`.

### Шаги формы

| Шаг | Содержание |
|-----|------------|
| 1 | Паспортные данные, жалобы, боль |
| 2 | Anamnesis morbi, vitae, инструментальные исследования |
| 3 | Миофасциальная диагностика |
| 4 | Заключение врача, МКБ, МРТ |
| 5 | Лечение и рекомендации |

## API

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/medical-cards/schema/form` | Схема шагов и справочники |
| GET/PATCH | `/api/medical-cards/{id}/step` | Сохранение шага |
| POST | `/api/medical-cards/{id}/generate-pdf` | Сформировать PDF |
| GET | `/api/medical-cards/{id}/pdf` | Скачать PDF |
