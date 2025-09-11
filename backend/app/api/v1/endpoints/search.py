"""
Search API endpoints
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.search import SearchQuery, SearchResponse, VectorSearchQuery
from app.services.search_service import SearchService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/semantic", response_model=SearchResponse)
async def semantic_search(
    query: str = Query(..., description="Search query text"),
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    similarity_threshold: float = Query(0.7, ge=0.0, le=1.0, description="Similarity threshold"),
    db: AsyncSession = Depends(get_db)
) -> SearchResponse:
    """Perform semantic search using vector similarity"""
    try:
        search_service = SearchService(db)
        results = await search_service.semantic_search(
            query=query,
            domain_id=domain_id,
            limit=limit,
            similarity_threshold=similarity_threshold,
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")


@router.post("/vector", response_model=SearchResponse)
async def vector_search(
    query: str = Query(..., description="Search query text"),
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    similarity_threshold: float = Query(0.7, ge=0.0, le=1.0, description="Similarity threshold"),
    db: AsyncSession = Depends(get_db)
) -> SearchResponse:
    """Perform vector similarity search"""
    try:
        search_service = SearchService(db)
        results = await search_service.vector_search(
            query=query,
            domain_id=domain_id,
            limit=limit,
            similarity_threshold=similarity_threshold,
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")


@router.post("/hybrid", response_model=SearchResponse)
async def hybrid_search(
    query: str = Query(..., description="Search query text"),
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    semantic_weight: float = Query(0.7, ge=0.0, le=1.0, description="Weight for semantic search"),
    vector_weight: float = Query(0.3, ge=0.0, le=1.0, description="Weight for vector search"),
    db: AsyncSession = Depends(get_db)
) -> SearchResponse:
    """Perform hybrid search combining semantic and vector search"""
    try:
        # Validate weights
        if abs(semantic_weight + vector_weight - 1.0) > 0.01:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Semantic and vector weights must sum to 1.0"
            )
        
        search_service = SearchService(db)
        results = await search_service.hybrid_search(
            query=query,
            domain_id=domain_id,
            limit=limit,
            semantic_weight=semantic_weight,
            vector_weight=vector_weight,
        )
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Hybrid search failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")


@router.get("/by-domain/{domain_id}")
async def search_by_domain(
    domain_id: UUID,
    query: str = Query(..., description="Search query text"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    db: AsyncSession = Depends(get_db)
) -> SearchResponse:
    """Search within a specific domain"""
    try:
        search_service = SearchService(db)
        results = await search_service.search_by_domain(
            query=query,
            domain_id=domain_id,
            limit=limit,
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Domain search failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")


@router.get("/across-domains")
async def search_across_domains(
    query: str = Query(..., description="Search query text"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    db: AsyncSession = Depends(get_db)
) -> SearchResponse:
    """Search across all domains"""
    try:
        search_service = SearchService(db)
        results = await search_service.search_across_domains(
            query=query,
            limit=limit,
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Cross-domain search failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")


@router.get("/suggestions")
async def get_search_suggestions(
    partial_query: str = Query(..., description="Partial search query"),
    limit: int = Query(5, ge=1, le=20, description="Maximum number of suggestions"),
    db: AsyncSession = Depends(get_db)
):
    """Get search suggestions based on partial query"""
    try:
        search_service = SearchService(db)
        suggestions = await search_service.get_search_suggestions(
            partial_query=partial_query,
            limit=limit,
        )
        
        return {
            "suggestions": suggestions,
            "query": partial_query,
            "count": len(suggestions),
        }
        
    except Exception as e:
        logger.error(f"Failed to get search suggestions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get suggestions")


@router.get("/analytics")
async def get_search_analytics(
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: AsyncSession = Depends(get_db)
):
    """Get search analytics and statistics"""
    try:
        search_service = SearchService(db)
        analytics = await search_service.get_search_analytics(
            domain_id=domain_id,
            days=days,
        )
        
        return analytics
        
    except Exception as e:
        logger.error(f"Failed to get search analytics: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get analytics")


@router.get("/health")
async def search_health_check():
    """Health check for search service"""
    return {
        "status": "healthy",
        "service": "search",
        "features": {
            "semantic_search": "available",
            "vector_search": "available (placeholder)",
            "hybrid_search": "available",
            "analytics": "available",
        },
    }
