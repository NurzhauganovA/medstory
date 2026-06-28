#!/usr/bin/env bash
# MedStory — установка Docker (если нужно) и запуск проекта на сервере Ubuntu.
# Использование:  ./deploy.sh
set -euo pipefail

echo "==> Проверка Docker..."
if ! command -v docker >/dev/null 2>&1; then
    echo "==> Docker не найден. Устанавливаю..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker || true
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "==> Плагин docker compose не найден. Устанавливаю..."
    apt-get update -y
    apt-get install -y docker-compose-plugin
fi

echo "==> Сборка и запуск контейнеров (backend + frontend)..."
docker compose up --build -d

echo "==> Статус:"
docker compose ps

IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo "============================================================"
echo " MedStory запущен!"
echo " Откройте в браузере:  http://${IP:-<IP сервера>}"
echo " API health:           http://${IP:-<IP сервера>}/api/health"
echo "============================================================"
