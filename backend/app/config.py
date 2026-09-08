import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Config:
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://civic_user:civic_pass@localhost:5432/civic_issue_reporter",
    )
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-dev-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "60"))
    )
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = 8 * 1024 * 1024  # 8 MB, generous for a single issue photo
