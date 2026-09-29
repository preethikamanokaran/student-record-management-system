import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Record Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./student_records.db")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

    class Config:
        case_sensitive = True

settings = Settings()
