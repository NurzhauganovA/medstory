#!/usr/bin/env python
"""Создание/обновление пользователя MedStory (аналог `createsuperuser`).

Примеры:
    # Интерактивно (пароль вводится скрыто, с подтверждением):
    python create_user.py

    # Сразу с аргументами:
    python create_user.py --username chief --full-name "Иванов И.И." --role admin

    # В Docker:
    docker compose exec backend python create_user.py
"""

from __future__ import annotations

import argparse
import getpass
import sys

from app.database import SessionLocal, init_db
from app.schemas.auth import ROLE_LABELS_RU, UserCreate, UserRole, UserUpdate
from app.services.user import UserService

ROLE_CHOICES = [r.value for r in UserRole]


def prompt_password(existing: str | None = None) -> str:
    """Скрытый ввод пароля с подтверждением."""
    if existing:
        return existing
    while True:
        p1 = getpass.getpass("Пароль: ")
        if len(p1) < 4:
            print("  ⚠ Пароль слишком короткий (минимум 4 символа).")
            continue
        p2 = getpass.getpass("Повторите пароль: ")
        if p1 != p2:
            print("  ⚠ Пароли не совпадают, попробуйте ещё раз.")
            continue
        return p1


def main() -> int:
    parser = argparse.ArgumentParser(description="Создание пользователя MedStory")
    parser.add_argument("--username", help="Логин")
    parser.add_argument("--full-name", dest="full_name", help="Ф.И.О.")
    parser.add_argument("--role", choices=ROLE_CHOICES, help="Роль (по умолчанию admin)")
    parser.add_argument("--password", help="Пароль (если не указан — будет запрошен скрыто)")
    args = parser.parse_args()

    init_db()
    db = SessionLocal()
    try:
        service = UserService(db)

        username = (args.username or input("Логин: ")).strip()
        if not username:
            print("✗ Логин обязателен.")
            return 1

        existing = service.get_by_username(username)
        if existing:
            print(f"Пользователь «{username}» уже существует "
                  f"({ROLE_LABELS_RU.get(existing.role, existing.role)}).")
            answer = input("Сбросить ему пароль? [y/N]: ").strip().lower()
            if answer in ("y", "yes", "д", "да"):
                password = prompt_password(args.password)
                service.update(existing.id, UserUpdate(password=password))
                print(f"✓ Пароль пользователя «{username}» обновлён.")
                return 0
            print("Отменено.")
            return 0

        full_name = (args.full_name or input("Ф.И.О.: ")).strip() or username

        role = args.role
        if not role:
            print("Доступные роли: "
                  + ", ".join(f"{r} — {ROLE_LABELS_RU[r]}" for r in ROLE_CHOICES))
            role = (input("Роль [admin]: ").strip() or "admin")
            if role not in ROLE_CHOICES:
                print(f"✗ Неизвестная роль «{role}». Допустимо: {', '.join(ROLE_CHOICES)}")
                return 1

        password = prompt_password(args.password)

        user = service.create(
            UserCreate(
                username=username,
                full_name=full_name,
                role=UserRole(role),
                password=password,
            )
        )
        print(f"✓ Пользователь создан: {user.username} "
              f"({ROLE_LABELS_RU.get(user.role, user.role)}), ID={user.id}")
        return 0
    except ValueError as exc:
        print(f"✗ Ошибка: {exc}")
        return 1
    except KeyboardInterrupt:
        print("\nОтменено.")
        return 130
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
