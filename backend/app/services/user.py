from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import User
from app.schemas.auth import UserCreate, UserUpdate
from app.security import hash_password, verify_password


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def list_users(self) -> list[User]:
        return self.db.query(User).order_by(User.id.asc()).all()

    def get(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def create(self, payload: UserCreate) -> User:
        if self.get_by_username(payload.username):
            raise ValueError("Пользователь с таким логином уже существует")
        user = User(
            username=payload.username.strip(),
            full_name=payload.full_name.strip(),
            role=payload.role.value,
            is_active=payload.is_active,
            hashed_password=hash_password(payload.password),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user_id: int, payload: UserUpdate) -> User:
        user = self.get(user_id)
        if user is None:
            raise ValueError("Пользователь не найден")
        if payload.full_name is not None:
            user.full_name = payload.full_name.strip()
        if payload.role is not None:
            user.role = payload.role.value
        if payload.is_active is not None:
            user.is_active = payload.is_active
        if payload.password:
            user.hashed_password = hash_password(payload.password)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: int) -> None:
        user = self.get(user_id)
        if user is None:
            raise ValueError("Пользователь не найден")
        self.db.delete(user)
        self.db.commit()

    def authenticate(self, username: str, password: str) -> User | None:
        user = self.get_by_username(username.strip())
        if user is None or not user.is_active:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
