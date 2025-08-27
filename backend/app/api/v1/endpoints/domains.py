"""
Domain management endpoints
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.domain import Domain
from app.schemas.domain import (
    DomainCreate,
    DomainUpdate,
    DomainResponse,
    DomainListResponse,
    DomainStats,
)
from app.services.domain_service import DomainService

router = APIRouter()


@router.post("/", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
async def create_domain(
    domain_data: DomainCreate,
    db: AsyncSession = Depends(get_db),
) -> DomainResponse:
    """Create a new RAG domain"""
    try:
        domain_service = DomainService(db)
        domain = await domain_service.create_domain(domain_data)
        return DomainResponse.from_orm(domain)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create domain",
        )


@router.get("/", response_model=DomainListResponse)
async def list_domains(
    skip: int = Query(0, ge=0, description="Number of domains to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of domains to return"),
    search: Optional[str] = Query(None, description="Search domains by name or description"),
    db: AsyncSession = Depends(get_db),
) -> DomainListResponse:
    """List all RAG domains with pagination and search"""
    try:
        domain_service = DomainService(db)
        domains, total = await domain_service.list_domains(skip=skip, limit=limit, search=search)
        
        return DomainListResponse(
            domains=[DomainResponse.from_orm(domain) for domain in domains],
            total=total,
            skip=skip,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list domains",
        )


@router.get("/{domain_id}", response_model=DomainResponse)
async def get_domain(
    domain_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> DomainResponse:
    """Get a specific RAG domain by ID"""
    try:
        domain_service = DomainService(db)
        domain = await domain_service.get_domain(domain_id)
        
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found",
            )
        
        return DomainResponse.from_orm(domain)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domain",
        )


@router.put("/{domain_id}", response_model=DomainResponse)
async def update_domain(
    domain_id: UUID,
    domain_data: DomainUpdate,
    db: AsyncSession = Depends(get_db),
) -> DomainResponse:
    """Update a RAG domain"""
    try:
        domain_service = DomainService(db)
        domain = await domain_service.update_domain(domain_id, domain_data)
        
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found",
            )
        
        return DomainResponse.from_orm(domain)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update domain",
        )


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(
    domain_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a RAG domain and all associated data"""
    try:
        domain_service = DomainService(db)
        success = await domain_service.delete_domain(domain_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete domain",
        )


@router.get("/{domain_id}/stats", response_model=DomainStats)
async def get_domain_stats(
    domain_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> DomainStats:
    """Get statistics for a specific domain"""
    try:
        domain_service = DomainService(db)
        stats = await domain_service.get_domain_stats(domain_id)
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found",
            )
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domain statistics",
        )


@router.get("/stats/overview", response_model=List[DomainStats])
async def get_all_domains_stats(
    db: AsyncSession = Depends(get_db),
) -> List[DomainStats]:
    """Get statistics for all domains"""
    try:
        domain_service = DomainService(db)
        stats = await domain_service.get_all_domains_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domains statistics",
        )
