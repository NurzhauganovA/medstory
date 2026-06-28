.PHONY: up down logs restart build ps rebuild

# Запустить весь проект (backend + frontend + тестовые данные) одной командой
up:
	docker compose up --build -d
	@echo "MedStory запущен. Открой http://localhost (или http://<IP сервера>)"

# Остановить
down:
	docker compose down

# Полная пересборка без кеша
rebuild:
	docker compose build --no-cache
	docker compose up -d

# Логи
logs:
	docker compose logs -f

# Перезапуск
restart:
	docker compose restart

# Статус контейнеров
ps:
	docker compose ps
