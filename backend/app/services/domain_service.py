"""
Domain service for business logic
"""

import logging
from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.domain import Domain
from app.models.document import Document, DocumentChunk
from app.models.chat import Chat
from app.schemas.domain import DomainCreate, DomainUpdate, DomainStats

logger = logging.getLogger(__name__)


class DomainService:
    """Service for domain operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_domain(self, domain_data: DomainCreate) -> Domain:
        """Create a new domain"""
        try:
            # Check if domain name already exists
            existing_domain = await self._get_domain_by_name(domain_data.name)
            if existing_domain:
                raise ValueError(f"Domain with name '{domain_data.name}' already exists")
            
            # Create new domain
            domain = Domain(
                name=domain_data.name,
                description=domain_data.description,
            )
            
            self.db.add(domain)
            await self.db.commit()
            await self.db.refresh(domain)
            
            logger.info(f"Created domain: {domain.name} (ID: {domain.id})")
            return domain
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create domain: {e}")
            raise
    
    async def get_domain(self, domain_id: UUID) -> Optional[Domain]:
        """Get domain by ID"""
        try:
            result = await self.db.execute(
                select(Domain).where(Domain.id == domain_id)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get domain {domain_id}: {e}")
            raise
    
    async def _get_domain_by_name(self, name: str) -> Optional[Domain]:
        """Get domain by name (internal method)"""
        try:
            result = await self.db.execute(
                select(Domain).where(Domain.name == name)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get domain by name '{name}': {e}")
            raise
    
    async def list_domains(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> Tuple[List[Domain], int]:
        """List domains with pagination and search"""
        try:
            # Build query
            query = select(Domain)
            
            # Add search filter
            if search:
                search_filter = or_(
                    Domain.name.ilike(f"%{search}%"),
                    Domain.description.ilike(f"%{search}%")
                )
                query = query.where(search_filter)
            
            # Get total count
            count_query = select(func.count(Domain.id))
            if search:
                count_query = count_query.where(search_filter)
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Get paginated results
            query = query.offset(skip).limit(limit)
            result = await self.db.execute(query)
            domains = result.scalars().all()
            
            return domains, total
            
        except Exception as e:
            logger.error(f"Failed to list domains: {e}")
            raise
    
    async def update_domain(self, domain_id: UUID, domain_data: DomainUpdate) -> Optional[Domain]:
        """Update domain"""
        try:
            domain = await self.get_domain(domain_id)
            if not domain:
                return None
            
            # Check if new name conflicts with existing domain
            if domain_data.name and domain_data.name != domain.name:
                existing_domain = await self._get_domain_by_name(domain_data.name)
                if existing_domain:
                    raise ValueError(f"Domain with name '{domain_data.name}' already exists")
            
            # Update fields
            update_data = domain_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(domain, field, value)
            
            await self.db.commit()
            await self.db.refresh(domain)
            
            logger.info(f"Updated domain: {domain.name} (ID: {domain.id})")
            return domain
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update domain {domain_id}: {e}")
            raise
    
    async def delete_domain(self, domain_id: UUID) -> bool:
        """Delete domain and all associated data"""
        try:
            domain = await self.get_domain(domain_id)
            if not domain:
                return False
            
            # Delete domain (cascade will handle related data)
            await self.db.delete(domain)
            await self.db.commit()
            
            logger.info(f"Deleted domain: {domain.name} (ID: {domain.id})")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete domain {domain_id}: {e}")
            raise
    
    async def get_domain_stats(self, domain_id: UUID) -> Optional[DomainStats]:
        """Get statistics for a specific domain"""
        try:
            # Get domain with basic info
            domain = await self.get_domain(domain_id)
            if not domain:
                return None
            
            # Get document count and total file size
            doc_result = await self.db.execute(
                select(
                    func.count(Document.id),
                    func.coalesce(func.sum(Document.file_size), 0)
                ).where(Document.domain_id == domain_id)
            )
            doc_count, total_file_size = doc_result.first()
            
            # Get chat count
            chat_result = await self.db.execute(
                select(func.count(Chat.id)).where(Chat.domain_id == domain_id)
            )
            chat_count = chat_result.scalar()
            
            # Get total chunks count
            chunk_result = await self.db.execute(
                select(func.count(DocumentChunk.id))
                .join(Document)
                .where(Document.domain_id == domain_id)
            )
            total_chunks = chunk_result.scalar()
            
            # Get last activity (most recent document or chat update)
            last_doc_result = await self.db.execute(
                select(func.max(Document.updated_at))
                .where(Document.domain_id == domain_id)
            )
            last_doc_activity = last_doc_result.scalar()
            
            last_chat_result = await self.db.execute(
                select(func.max(Chat.updated_at))
                .where(Chat.domain_id == domain_id)
            )
            last_chat_activity = last_chat_result.scalar()
            
            # Determine last activity
            last_activity = None
            if last_doc_activity and last_chat_activity:
                last_activity = max(last_doc_activity, last_chat_activity)
            elif last_doc_activity:
                last_activity = last_doc_activity
            elif last_chat_activity:
                last_activity = last_chat_activity
            
            return DomainStats(
                domain_id=domain.id,
                domain_name=domain.name,
                document_count=doc_count or 0,
                chat_count=chat_count or 0,
                total_chunks=total_chunks or 0,
                total_file_size_mb=round((total_file_size or 0) / (1024 * 1024), 2),
                last_activity=last_activity,
            )
            
        except Exception as e:
            logger.error(f"Failed to get domain stats for {domain_id}: {e}")
            raise
    
    async def get_all_domains_stats(self) -> List[DomainStats]:
        """Get statistics for all domains"""
        try:
            # Get all domains
            result = await self.db.execute(select(Domain))
            domains = result.scalars().all()
            
            # Get stats for each domain
            stats = []
            for domain in domains:
                domain_stats = await self.get_domain_stats(domain.id)
                if domain_stats:
                    stats.append(domain_stats)
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get all domains stats: {e}")
            raise
    
    async def domain_exists(self, domain_id: UUID) -> bool:
        """Check if domain exists"""
        try:
            domain = await self.get_domain(domain_id)
            return domain is not None
        except Exception as e:
            logger.error(f"Failed to check domain existence for {domain_id}: {e}")
            return False
