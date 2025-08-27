"""
Application configuration settings
"""

import os
from typing import List, Optional, Union
from pydantic import BaseModel, Field, field_validator


class Settings(BaseModel):
    """Application settings"""
    
    # Application Configuration
    PROJECT_NAME: str = "RAG Explorer"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Intelligent Document Retrieval & Chat API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Host Configuration
    ALLOWED_HOSTS: List[str] = Field(default=["localhost", "127.0.0.1"], env="ALLOWED_HOSTS")
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:3000"], env="CORS_ORIGINS")
    
    # Database Configuration
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DATABASE_TEST_URL: Optional[str] = Field(default=None, env="DATABASE_TEST_URL")
    
    # Redis Configuration
    REDIS_URL: str = Field(..., env="REDIS_URL")
    REDIS_TEST_URL: Optional[str] = Field(default=None, env="REDIS_TEST_URL")
    
    # LLM API Configuration
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    
    # Vector Configuration
    VECTOR_DIMENSION: int = Field(default=1536, env="VECTOR_DIMENSION")
    CHUNK_SIZE: int = Field(default=1000, env="CHUNK_SIZE")
    CHUNK_OVERLAP: int = Field(default=200, env="CHUNK_OVERLAP")
    MAX_TOKENS: int = Field(default=4096, env="MAX_TOKENS")
    TEMPERATURE: float = Field(default=0.7, env="TEMPERATURE")
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = Field(default=10485760, env="MAX_FILE_SIZE")  # 10MB
    UPLOAD_DIR: str = Field(default="./uploads", env="UPLOAD_DIR")
    ALLOWED_EXTENSIONS: List[str] = Field(default=["pdf", "docx", "txt", "md", "rtf"], env="ALLOWED_EXTENSIONS")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    RATE_LIMIT_PER_HOUR: int = Field(default=1000, env="RATE_LIMIT_PER_HOUR")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    
    # Celery Configuration
    CELERY_BROKER_URL: str = Field(..., env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(..., env="CELERY_RESULT_BACKEND")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    PROMETHEUS_MULTIPROC_DIR: str = Field(default="/tmp", env="PROMETHEUS_MULTIPROC_DIR")
    
    # Computed Properties
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.ENVIRONMENT.lower() == "testing"
    
    # Validators
    @field_validator("ALLOWED_HOSTS", "CORS_ORIGINS", mode="before")
    @classmethod
    def parse_list_fields(cls, v):
        """Parse list fields from environment variables"""
        if isinstance(v, str):
            return [item.strip() for item in v.split(",")]
        return v
    
    @field_validator("ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_extensions(cls, v):
        """Parse file extensions from environment variables"""
        if isinstance(v, str):
            return [ext.strip().lower() for ext in v.split(",")]
        return v
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v):
        """Validate secret key length"""
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @field_validator("VECTOR_DIMENSION")
    @classmethod
    def validate_vector_dimension(cls, v):
        """Validate vector dimension"""
        if v not in [384, 768, 1024, 1536, 2048, 4096]:
            raise ValueError("VECTOR_DIMENSION must be one of: 384, 768, 1024, 1536, 2048, 4096")
        return v
    
    @field_validator("CHUNK_SIZE")
    @classmethod
    def validate_chunk_size(cls, v):
        """Validate chunk size"""
        if v < 100 or v > 10000:
            raise ValueError("CHUNK_SIZE must be between 100 and 10000")
        return v
    
    @field_validator("CHUNK_OVERLAP")
    @classmethod
    def validate_chunk_overlap(cls, v, info):
        """Validate chunk overlap"""
        chunk_size = info.data.get("CHUNK_SIZE", 1000)
        if v >= chunk_size:
            raise ValueError("CHUNK_OVERLAP must be less than CHUNK_SIZE")
        return v
    
    @field_validator("TEMPERATURE")
    @classmethod
    def validate_temperature(cls, v):
        """Validate temperature value"""
        if v < 0.0 or v > 2.0:
            raise ValueError("TEMPERATURE must be between 0.0 and 2.0")
        return v
    
    @field_validator("MAX_FILE_SIZE")
    @classmethod
    def validate_max_file_size(cls, v):
        """Validate maximum file size"""
        if v < 1024 * 1024:  # 1MB minimum
            raise ValueError("MAX_FILE_SIZE must be at least 1MB")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance
settings = Settings()


# Environment-specific overrides
if settings.is_development:
    # Development overrides
    settings.DEBUG = True
    settings.LOG_LEVEL = "DEBUG"
    
if settings.is_testing:
    # Testing overrides
    settings.DATABASE_URL = settings.DATABASE_TEST_URL or settings.DATABASE_URL
    settings.REDIS_URL = settings.REDIS_TEST_URL or settings.REDIS_URL
    settings.DEBUG = True
    settings.LOG_LEVEL = "DEBUG"
