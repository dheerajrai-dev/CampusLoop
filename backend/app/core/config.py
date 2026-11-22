import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusLoop"
    ENVIRONMENT: str = "production"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite:///./campusloop.db"
    AUTO_SEED: bool = True
    
    JWT_SECRET: str = "campusloop-development-secret-key-replace-in-production-min32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("DATABASE_URL", mode="before")
    def fix_postgres_scheme(cls, v):
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg://", 1)
            if v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+psycopg://", 1)
            # If running on Vercel and using relative SQLite, redirect to writable /tmp
            if os.environ.get("VERCEL") and v.startswith("sqlite:///."):
                return "sqlite:////tmp/campusloop.db"
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
