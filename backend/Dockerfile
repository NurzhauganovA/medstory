# MedStory backend — FastAPI + WeasyPrint (PDF медкарты)
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Системные библиотеки для WeasyPrint (Pango/HarfBuzz) + шрифты с кириллицей.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpango-1.0-0 \
        libpangoft2-1.0-0 \
        libharfbuzz0b \
        libffi8 \
        libjpeg62-turbo \
        shared-mime-info \
        fonts-dejavu-core \
        fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Код бэкенда.
COPY backend/ /app/

# Изображения тела (front/back) для карты тела в PDF.
COPY frontend/public/assets/ /app/assets/

ENV ASSETS_DIR=/app/assets \
    DATABASE_URL=sqlite:////data/medstory.db \
    DEBUG=false

RUN mkdir -p /data /app/generated_pdfs

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
