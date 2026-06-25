from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production-32chars!!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://llmgoat:llmgoat_dev@localhost:5432/llmgoat"

    # Redis
    REDIS_URL: str = "redis://:redisdev123@localhost:6379/0"

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 30

    # LLM token budget per session (prevents unbounded consumption)
    MAX_TOKENS_PER_SESSION: int = 10000
    MAX_TOKENS_PER_REQUEST: int = 200

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
