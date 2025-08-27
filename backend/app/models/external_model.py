"""
External model configuration model
"""

from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base


class ExternalModel(Base):
    """External LLM provider configuration model"""
    
    __tablename__ = "external_models"
    
    # Model information
    name = Column(String(100), unique=True, nullable=False)
    provider = Column(String(50), nullable=False, index=True)  # openai, anthropic, etc.
    model_type = Column(String(50), nullable=False)  # chat, embedding, etc.
    
    # Configuration
    config = Column(JSONB, nullable=False)  # API keys, model names, parameters
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    
    def __repr__(self) -> str:
        """String representation of the external model"""
        return f"<ExternalModel(id={self.id}, name='{self.name}', provider='{self.provider}')>"
    
    @property
    def api_key(self) -> str:
        """Get the API key from config"""
        return self.config.get("api_key", "") if self.config else ""
    
    @property
    def model_name(self) -> str:
        """Get the model name from config"""
        return self.config.get("model_name", "") if self.config else ""
    
    @property
    def temperature(self) -> float:
        """Get the temperature setting from config"""
        return self.config.get("temperature", 0.7) if self.config else 0.7
    
    @property
    def max_tokens(self) -> int:
        """Get the max tokens setting from config"""
        return self.config.get("max_tokens", 4096) if self.config else 4096
    
    @property
    def is_chat_model(self) -> bool:
        """Check if this is a chat model"""
        return self.model_type == "chat"
    
    @property
    def is_embedding_model(self) -> bool:
        """Check if this is an embedding model"""
        return self.model_type == "embedding"
    
    @property
    def is_openai(self) -> bool:
        """Check if this is an OpenAI model"""
        return self.provider == "openai"
    
    @property
    def is_anthropic(self) -> bool:
        """Check if this is an Anthropic model"""
        return self.provider == "anthropic"
    
    def get_config_value(self, key: str, default=None):
        """Get a configuration value by key"""
        return self.config.get(key, default) if self.config else default
    
    def update_config(self, **kwargs) -> None:
        """Update configuration values"""
        if not self.config:
            self.config = {}
        self.config.update(kwargs)
        self.updated_at = self.updated_at  # Trigger update
