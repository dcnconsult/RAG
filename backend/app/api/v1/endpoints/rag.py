"""
RAG (Retrieval-Augmented Generation) API endpoints
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.rag_service import RAGService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/query")
async def rag_query(
    query: str = Query(..., description="Query text for RAG processing"),
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    limit: int = Query(5, ge=1, le=20, description="Maximum number of context items"),
    model_name: Optional[str] = Query(None, description="LLM model to use"),
    temperature: float = Query(0.7, ge=0.0, le=2.0, description="Response creativity (0=deterministic, 2=creative)"),
    max_tokens: int = Query(1000, ge=100, le=4000, description="Maximum response length"),
    db: AsyncSession = Depends(get_db)
):
    """Perform RAG query: retrieve context and generate response"""
    try:
        rag_service = RAGService(db)
        
        # Validate model if specified
        if model_name:
            is_valid = await rag_service.validate_model_config(model_name)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Model '{model_name}' is not properly configured"
                )
        
        # Process RAG query
        result = await rag_service.rag_query(
            query=query,
            domain_id=domain_id,
            limit=limit,
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="RAG processing failed")


@router.post("/retrieve-context")
async def retrieve_context(
    query: str = Query(..., description="Query text for context retrieval"),
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    limit: int = Query(5, ge=1, le=20, description="Maximum number of context items"),
    similarity_threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve relevant context for a query without generating response"""
    try:
        rag_service = RAGService(db)
        
        context = await rag_service.retrieve_context(
            query=query,
            domain_id=domain_id,
            limit=limit,
            similarity_threshold=similarity_threshold
        )
        
        return {
            "query": query,
            "context": context,
            "context_count": len(context),
            "similarity_threshold": similarity_threshold
        }
        
    except Exception as e:
        logger.error(f"Context retrieval failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Context retrieval failed")


@router.post("/generate-response")
async def generate_response(
    query: str = Query(..., description="Query text"),
    context: str = Query(..., description="Context information for response generation"),
    model_name: Optional[str] = Query(None, description="LLM model to use"),
    temperature: float = Query(0.7, ge=0.0, le=2.0, description="Response creativity"),
    max_tokens: int = Query(1000, ge=100, le=4000, description="Maximum response length"),
    db: AsyncSession = Depends(get_db)
):
    """Generate response using provided context (without retrieval)"""
    try:
        rag_service = RAGService(db)
        
        # Validate model if specified
        if model_name:
            is_valid = await rag_service.validate_model_config(model_name)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Model '{model_name}' is not properly configured"
                )
        
        # Create mock context for the service method
        from app.schemas.search import SearchResult
        mock_context = [
            SearchResult(
                chunk_id="mock",
                document_id="mock",
                domain_id=None,
                domain_name="provided",
                document_name="user_context",
                content=context,
                chunk_index=0,
                similarity_score=1.0,
                metadata={}
            )
        ]
        
        # Generate response
        response = await rag_service.generate_response(
            query=query,
            context=mock_context,
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return {
            "query": query,
            "response": response,
            "context_used": context,
            "model_used": model_name or "placeholder",
            "parameters": {
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Response generation failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Response generation failed")


@router.get("/models")
async def get_available_models(db: AsyncSession = Depends(get_db)):
    """Get list of available LLM models"""
    try:
        rag_service = RAGService(db)
        models = await rag_service.get_available_models()
        
        return {
            "models": models,
            "count": len(models),
            "status": "available" if models else "no_models_configured"
        }
        
    except Exception as e:
        logger.error(f"Failed to get available models: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get models")


@router.get("/models/{model_name}/validate")
async def validate_model_config(
    model_name: str,
    db: AsyncSession = Depends(get_db)
):
    """Validate that a model is properly configured"""
    try:
        rag_service = RAGService(db)
        is_valid = await rag_service.validate_model_config(model_name)
        
        return {
            "model_name": model_name,
            "is_valid": is_valid,
            "status": "configured" if is_valid else "not_configured"
        }
        
    except Exception as e:
        logger.error(f"Failed to validate model config for {model_name}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Validation failed")


@router.get("/statistics")
async def get_rag_statistics(
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: AsyncSession = Depends(get_db)
):
    """Get RAG system statistics"""
    try:
        rag_service = RAGService(db)
        stats = await rag_service.get_rag_statistics(
            domain_id=domain_id,
            days=days
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get RAG statistics: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get statistics")


@router.get("/suggestions")
async def get_query_suggestions(
    partial_query: str = Query(..., description="Partial query text"),
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    limit: int = Query(5, ge=1, le=20, description="Maximum number of suggestions"),
    db: AsyncSession = Depends(get_db)
):
    """Get query suggestions based on partial input"""
    try:
        rag_service = RAGService(db)
        suggestions = await rag_service.get_query_suggestions(
            partial_query=partial_query,
            domain_id=domain_id,
            limit=limit
        )
        
        return {
            "partial_query": partial_query,
            "suggestions": suggestions,
            "count": len(suggestions)
        }
        
    except Exception as e:
        logger.error(f"Failed to get query suggestions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get suggestions")


@router.post("/optimize-context")
async def optimize_context(
    query: str = Query(..., description="Query text"),
    context: str = Query(..., description="Context to optimize"),
    max_context_length: int = Query(2000, ge=500, le=10000, description="Maximum context length"),
    db: AsyncSession = Depends(get_db)
):
    """Optimize context for response generation"""
    try:
        rag_service = RAGService(db)
        
        # Create mock context for optimization
        from app.schemas.search import SearchResult
        mock_context = [
            SearchResult(
                chunk_id="mock",
                document_id="mock",
                domain_id=None,
                domain_name="provided",
                document_name="user_context",
                content=context,
                chunk_index=0,
                similarity_score=1.0,
                metadata={}
            )
        ]
        
        # Optimize context
        optimized_context = await rag_service.optimize_context(
            query=query,
            context=mock_context,
            max_context_length=max_context_length
        )
        
        return {
            "query": query,
            "original_context_length": len(context),
            "optimized_context": optimized_context,
            "optimized_context_length": sum(len(result.content) for result in optimized_context),
            "max_context_length": max_context_length
        }
        
    except Exception as e:
        logger.error(f"Context optimization failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Context optimization failed")


@router.get("/health")
async def rag_health_check():
    """Health check for RAG service"""
    return {
        "status": "healthy",
        "service": "rag",
        "features": {
            "context_retrieval": "available",
            "response_generation": "available (placeholder)",
            "model_management": "available",
            "context_optimization": "available",
            "query_suggestions": "available",
        },
        "llm_integration": "placeholder - to be implemented in next phase"
    }
