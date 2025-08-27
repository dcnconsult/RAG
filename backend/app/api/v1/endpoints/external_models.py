"""
External model management API endpoints
"""

import logging
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.external_model_service import ExternalModelService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/")
async def create_external_model(
    name: str = Query(..., description="Model name"),
    provider: str = Query(..., description="LLM provider (openai, anthropic, cohere, huggingface)"),
    model_type: str = Query(..., description="Model type (chat, completion, embedding)"),
    config: str = Query(..., description="Model configuration as JSON string"),
    is_active: bool = Query(True, description="Whether the model is active"),
    db: AsyncSession = Depends(get_db)
):
    """Create a new external model configuration"""
    try:
        import json
        config_dict = json.loads(config)
        
        external_model_service = ExternalModelService(db)
        model = await external_model_service.create_model(
            name=name,
            provider=provider,
            model_type=model_type,
            config=config_dict,
            is_active=is_active
        )
        
        return {
            "id": str(model.id),
            "name": model.name,
            "provider": model.provider,
            "model_type": model.model_type,
            "is_active": model.is_active,
            "created_at": model.created_at.isoformat(),
            "updated_at": model.updated_at.isoformat(),
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON configuration"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create external model: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create model")


@router.get("/")
async def list_external_models(
    provider: Optional[str] = Query(None, description="Filter by provider"),
    model_type: Optional[str] = Query(None, description="Filter by model type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db)
):
    """List external models with filters"""
    try:
        external_model_service = ExternalModelService(db)
        models = await external_model_service.list_models(
            provider=provider,
            model_type=model_type,
            is_active=is_active
        )
        
        model_list = []
        for model in models:
            model_list.append({
                "id": str(model.id),
                "name": model.name,
                "provider": model.provider,
                "model_type": model.model_type,
                "is_active": model.is_active,
                "created_at": model.created_at.isoformat(),
                "updated_at": model.updated_at.isoformat(),
            })
        
        return {
            "models": model_list,
            "count": len(model_list),
            "filters": {
                "provider": provider,
                "model_type": model_type,
                "is_active": is_active
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to list external models: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list models")


@router.get("/{model_id}")
async def get_external_model(
    model_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get external model by ID"""
    try:
        external_model_service = ExternalModelService(db)
        model = await external_model_service.get_model(model_id)
        
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        
        return {
            "id": str(model.id),
            "name": model.name,
            "provider": model.provider,
            "model_type": model.model_type,
            "is_active": model.is_active,
            "config": model.config,
            "created_at": model.created_at.isoformat(),
            "updated_at": model.updated_at.isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get external model {model_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get model")


@router.put("/{model_id}")
async def update_external_model(
    model_id: UUID,
    name: Optional[str] = Query(None, description="Model name"),
    provider: Optional[str] = Query(None, description="LLM provider"),
    model_type: Optional[str] = Query(None, description="Model type"),
    config: Optional[str] = Query(None, description="Model configuration as JSON string"),
    is_active: Optional[bool] = Query(None, description="Whether the model is active"),
    db: AsyncSession = Depends(get_db)
):
    """Update external model"""
    try:
        external_model_service = ExternalModelService(db)
        
        # Parse config if provided
        config_dict = None
        if config:
            import json
            try:
                config_dict = json.loads(config)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON configuration"
                )
        
        model = await external_model_service.update_model(
            model_id=model_id,
            name=name,
            provider=provider,
            model_type=model_type,
            config=config_dict,
            is_active=is_active
        )
        
        if not model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        
        return {
            "id": str(model.id),
            "name": model.name,
            "provider": model.provider,
            "model_type": model.model_type,
            "is_active": model.is_active,
            "config": model.config,
            "created_at": model.created_at.isoformat(),
            "updated_at": model.updated_at.isoformat(),
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update external model {model_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update model")


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_external_model(
    model_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete external model"""
    try:
        external_model_service = ExternalModelService(db)
        deleted = await external_model_service.delete_model(model_id)
        
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete external model {model_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete model")


@router.post("/{model_id}/test")
async def test_model_connection(
    model_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Test connection to external model"""
    try:
        external_model_service = ExternalModelService(db)
        result = await external_model_service.test_model_connection(model_id)
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to test model connection for {model_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to test connection")


@router.get("/providers/{provider}/models")
async def get_provider_models(
    provider: str,
    db: AsyncSession = Depends(get_db)
):
    """Get available models for a specific provider"""
    try:
        external_model_service = ExternalModelService(db)
        models = await external_model_service.get_provider_models(provider)
        
        return {
            "provider": provider,
            "models": models,
            "count": len(models)
        }
        
    except Exception as e:
        logger.error(f"Failed to get provider models for {provider}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get provider models")


@router.get("/providers")
async def get_supported_providers():
    """Get list of supported LLM providers"""
    return {
        "providers": [
            {
                "name": "openai",
                "description": "OpenAI GPT models and embeddings",
                "supported_types": ["chat", "completion", "embedding"],
                "website": "https://openai.com"
            },
            {
                "name": "anthropic",
                "description": "Anthropic Claude models",
                "supported_types": ["chat", "completion"],
                "website": "https://anthropic.com"
            },
            {
                "name": "cohere",
                "description": "Cohere command models and embeddings",
                "supported_types": ["chat", "completion", "embedding"],
                "website": "https://cohere.ai"
            },
            {
                "name": "huggingface",
                "description": "Hugging Face open source models",
                "supported_types": ["chat", "completion", "embedding"],
                "website": "https://huggingface.co"
            }
        ],
        "count": 4
    }


@router.get("/health")
async def external_models_health_check():
    """Health check for external models service"""
    return {
        "status": "healthy",
        "service": "external_models",
        "features": {
            "model_management": "available",
            "provider_support": "openai, anthropic, cohere, huggingface",
            "connection_testing": "available (placeholder)",
            "configuration_validation": "available"
        }
    }
