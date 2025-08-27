"""
External model management service for LLM providers
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.external_model import ExternalModel
from app.core.config import settings

logger = logging.getLogger(__name__)


class ExternalModelService:
    """Service for managing external LLM models"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_model(
        self,
        name: str,
        provider: str,
        model_type: str,
        config: Dict[str, Any],
        is_active: bool = True
    ) -> ExternalModel:
        """Create a new external model configuration"""
        try:
            # Validate provider
            if provider not in ["openai", "anthropic", "cohere", "huggingface"]:
                raise ValueError(f"Unsupported provider: {provider}")
            
            # Validate model type
            if model_type not in ["chat", "completion", "embedding"]:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            # Validate required config fields
            required_fields = self._get_required_fields(provider)
            for field in required_fields:
                if field not in config or not config[field]:
                    raise ValueError(f"Missing required config field: {field}")
            
            # Check if model name already exists
            existing = await self.get_model_by_name(name)
            if existing:
                raise ValueError(f"Model with name '{name}' already exists")
            
            # Create model
            model = ExternalModel(
                name=name,
                provider=provider,
                model_type=model_type,
                config=config,
                is_active=is_active
            )
            
            self.db.add(model)
            await self.db.commit()
            await self.db.refresh(model)
            
            logger.info(f"Created external model: {name} ({provider})")
            return model
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create external model: {e}")
            raise
    
    async def get_model(self, model_id: UUID) -> Optional[ExternalModel]:
        """Get external model by ID"""
        try:
            result = await self.db.execute(
                select(ExternalModel).where(ExternalModel.id == model_id)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get external model {model_id}: {e}")
            raise
    
    async def get_model_by_name(self, name: str) -> Optional[ExternalModel]:
        """Get external model by name"""
        try:
            result = await self.db.execute(
                select(ExternalModel).where(ExternalModel.name == name)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get external model by name {name}: {e}")
            raise
    
    async def list_models(
        self,
        provider: Optional[str] = None,
        model_type: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[ExternalModel]:
        """List external models with filters"""
        try:
            query = select(ExternalModel)
            
            # Add filters
            filters = []
            if provider:
                filters.append(ExternalModel.provider == provider)
            if model_type:
                filters.append(ExternalModel.model_type == model_type)
            if is_active is not None:
                filters.append(ExternalModel.is_active == is_active)
            
            if filters:
                query = query.where(and_(*filters))
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Failed to list external models: {e}")
            raise
    
    async def update_model(
        self,
        model_id: UUID,
        name: Optional[str] = None,
        provider: Optional[str] = None,
        model_type: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
        is_active: Optional[bool] = None
    ) -> Optional[ExternalModel]:
        """Update external model"""
        try:
            model = await self.get_model(model_id)
            if not model:
                return None
            
            # Update fields
            if name is not None:
                # Check if new name conflicts with existing model
                if name != model.name:
                    existing = await self.get_model_by_name(name)
                    if existing:
                        raise ValueError(f"Model with name '{name}' already exists")
                model.name = name
            
            if provider is not None:
                if provider not in ["openai", "anthropic", "cohere", "huggingface"]:
                    raise ValueError(f"Unsupported provider: {provider}")
                model.provider = provider
            
            if model_type is not None:
                if model_type not in ["chat", "completion", "embedding"]:
                    raise ValueError(f"Unsupported model type: {model_type}")
                model.model_type = model_type
            
            if config is not None:
                # Validate required config fields
                required_fields = self._get_required_fields(model.provider)
                for field in required_fields:
                    if field not in config or not config[field]:
                        raise ValueError(f"Missing required config field: {field}")
                model.config = config
            
            if is_active is not None:
                model.is_active = is_active
            
            await self.db.commit()
            await self.db.refresh(model)
            
            logger.info(f"Updated external model: {model.name}")
            return model
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update external model {model_id}: {e}")
            raise
    
    async def delete_model(self, model_id: UUID) -> bool:
        """Delete external model"""
        try:
            model = await self.get_model(model_id)
            if not model:
                return False
            
            await self.db.delete(model)
            await self.db.commit()
            
            logger.info(f"Deleted external model: {model.name}")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete external model {model_id}: {e}")
            raise
    
    async def test_model_connection(self, model_id: UUID) -> Dict[str, Any]:
        """Test connection to external model"""
        try:
            model = await self.get_model(model_id)
            if not model:
                return {"success": False, "error": "Model not found"}
            
            if not model.is_active:
                return {"success": False, "error": "Model is not active"}
            
            # TODO: Implement actual connection testing
            # For now, return placeholder response
            
            if model.provider == "openai":
                # Test OpenAI API key format
                api_key = model.config.get("api_key", "")
                if not api_key.startswith("sk-"):
                    return {"success": False, "error": "Invalid OpenAI API key format"}
                
                return {
                    "success": True,
                    "provider": model.provider,
                    "model": model.config.get("model", "unknown"),
                    "message": "Connection test passed (placeholder - actual testing not implemented)"
                }
            
            elif model.provider == "anthropic":
                # Test Anthropic API key format
                api_key = model.config.get("api_key", "")
                if not api_key.startswith("sk-ant-"):
                    return {"success": False, "error": "Invalid Anthropic API key format"}
                
                return {
                    "success": True,
                    "provider": model.provider,
                    "model": model.config.get("model", "unknown"),
                    "message": "Connection test passed (placeholder - actual testing not implemented)"
                }
            
            else:
                return {
                    "success": False,
                    "error": f"Connection testing not implemented for provider: {model.provider}"
                }
                
        except Exception as e:
            logger.error(f"Failed to test model connection for {model_id}: {e}")
            return {"success": False, "error": str(e)}
    
    def _get_required_fields(self, provider: str) -> List[str]:
        """Get required configuration fields for a provider"""
        if provider == "openai":
            return ["api_key", "model"]
        elif provider == "anthropic":
            return ["api_key", "model"]
        elif provider == "cohere":
            return ["api_key", "model"]
        elif provider == "huggingface":
            return ["api_key", "model"]
        else:
            return []
    
    async def get_provider_models(self, provider: str) -> List[str]:
        """Get available models for a specific provider"""
        try:
            if provider == "openai":
                return [
                    "gpt-4", "gpt-4-turbo", "gpt-4-turbo-preview",
                    "gpt-3.5-turbo", "gpt-3.5-turbo-16k",
                    "text-embedding-ada-002", "text-embedding-3-small", "text-embedding-3-large"
                ]
            elif provider == "anthropic":
                return [
                    "claude-3-opus", "claude-3-sonnet", "claude-3-haiku",
                    "claude-2.1", "claude-2.0", "claude-instant-1.2"
                ]
            elif provider == "cohere":
                return [
                    "command", "command-light", "command-nightly",
                    "embed-english-v3.0", "embed-multilingual-v3.0"
                ]
            elif provider == "huggingface":
                return [
                    "meta-llama/Llama-2-7b-chat-hf",
                    "meta-llama/Llama-2-13b-chat-hf",
                    "meta-llama/Llama-2-70b-chat-hf",
                    "microsoft/DialoGPT-medium",
                    "gpt2", "bert-base-uncased"
                ]
            else:
                return []
                
        except Exception as e:
            logger.error(f"Failed to get provider models for {provider}: {e}")
            return []
