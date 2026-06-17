from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "MedStory API"
    debug: bool = True
    database_url: str = "sqlite:///./medstory.db"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    pdf_template_path: Path = Path(__file__).resolve().parents[2] / "????????????_?????_????????.pdf"
    generated_pdfs_dir: Path = Path(__file__).resolve().parents[1] / "generated_pdfs"


settings = Settings()
settings.generated_pdfs_dir.mkdir(parents=True, exist_ok=True)
