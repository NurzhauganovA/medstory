from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate_db() -> None:
    """Добавляет новые колонки в существующую SQLite БД."""
    inspector = inspect(engine)
    if "appointments" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("appointments")}
    alterations = {
        "specialist_id": "INTEGER",
        "time_start": "TIME",
        "comment": "VARCHAR(512)",
        "color": "VARCHAR(16) DEFAULT 'blue'",
    }
    with engine.begin() as conn:
        for column, col_type in alterations.items():
            if column not in existing:
                conn.execute(text(f"ALTER TABLE appointments ADD COLUMN {column} {col_type}"))

    if "patients" in inspector.get_table_names():
        patient_cols = {col["name"] for col in inspector.get_columns("patients")}
        patient_alterations = {
            "gender": "VARCHAR(32)",
            "residence": "VARCHAR(64)",
            "workplace": "VARCHAR(255)",
            "insurance_company": "VARCHAR(255)",
        }
        with engine.begin() as conn:
            for column, col_type in patient_alterations.items():
                if column not in patient_cols:
                    conn.execute(text(f"ALTER TABLE patients ADD COLUMN {column} {col_type}"))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    migrate_db()
