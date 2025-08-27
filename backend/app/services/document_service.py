"""
Document service for business logic
"""

import logging
import os
from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentChunk
from app.models.domain import Domain
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentWithChunksResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for document operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_document(self, document_data: DocumentCreate) -> Document:
        """Create a new document"""
        try:
            # Check if domain exists
            domain = await self._get_domain(document_data.domain_id)
            if not domain:
                raise ValueError(f"Domain with ID {document_data.domain_id} does not exist")
            
            # Validate file size
            if document_data.file_size > settings.MAX_FILE_SIZE:
                raise ValueError(f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes")
            
            # Validate file type
            if document_data.file_type.lower() not in settings.ALLOWED_EXTENSIONS:
                raise ValueError(f"File type '{document_data.file_type}' is not allowed")
            
            # Create document
            document = Document(
                domain_id=document_data.domain_id,
                filename=document_data.filename,
                file_path=document_data.file_path,
                file_size=document_data.file_size,
                file_type=document_data.file_type,
                status="pending",
                metadata=document_data.metadata or {},
            )
            
            self.db.add(document)
            await self.db.commit()
            await self.db.refresh(document)
            
            logger.info(f"Created document: {document.filename} (ID: {document.id})")
            return document
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create document: {e}")
            raise
    
    async def get_document(self, document_id: UUID) -> Optional[Document]:
        """Get document by ID"""
        try:
            result = await self.db.execute(
                select(Document).where(Document.id == document_id)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get document {document_id}: {e}")
            raise
    
    async def get_document_with_chunks(self, document_id: UUID) -> Optional[DocumentWithChunksResponse]:
        """Get document with chunks by ID"""
        try:
            result = await self.db.execute(
                select(Document)
                .options(selectinload(Document.chunks))
                .where(Document.id == document_id)
            )
            document = result.scalar_one_or_none()
            
            if not document:
                return None
            
            # Convert to response schema
            chunks_response = []
            for chunk in document.chunks:
                chunks_response.append({
                    "id": chunk.id,
                    "document_id": chunk.document_id,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "has_embedding": chunk.has_embedding,
                    "metadata": chunk.metadata,
                    "created_at": chunk.created_at,
                })
            
            return DocumentWithChunksResponse(
                id=document.id,
                domain_id=document.domain_id,
                filename=document.filename,
                file_type=document.file_type,
                file_path=document.file_path,
                file_size=document.file_size,
                status=document.status,
                metadata=document.metadata,
                created_at=document.created_at,
                updated_at=document.updated_at,
                chunks=chunks_response,
                chunk_count=len(chunks_response),
            )
            
        except Exception as e:
            logger.error(f"Failed to get document with chunks {document_id}: {e}")
            raise
    
    async def list_documents(
        self,
        domain_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Document], int]:
        """List documents with filters and pagination"""
        try:
            # Build query
            query = select(Document)
            
            # Add filters
            filters = []
            if domain_id:
                filters.append(Document.domain_id == domain_id)
            if status:
                filters.append(Document.status == status)
            if search:
                search_filter = Document.filename.ilike(f"%{search}%")
                filters.append(search_filter)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(Document.id))
            if filters:
                count_query = count_query.where(and_(*filters))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Get paginated results
            query = query.offset(skip).limit(limit)
            result = await self.db.execute(query)
            documents = result.scalars().all()
            
            return documents, total
            
        except Exception as e:
            logger.error(f"Failed to list documents: {e}")
            raise
    
    async def update_document(self, document_id: UUID, document_data: DocumentUpdate) -> Optional[Document]:
        """Update document"""
        try:
            document = await self.get_document(document_id)
            if not document:
                return None
            
            # Update fields
            update_data = document_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(document, field, value)
            
            await self.db.commit()
            await self.db.refresh(document)
            
            logger.info(f"Updated document: {document.filename} (ID: {document.id})")
            return document
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update document {document_id}: {e}")
            raise
    
    async def delete_document(self, document_id: UUID) -> bool:
        """Delete document and associated chunks"""
        try:
            document = await self.get_document(document_id)
            if not document:
                return False
            
            # Delete file from storage
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
                logger.info(f"Deleted file: {document.file_path}")
            
            # Delete document (cascade will handle chunks)
            await self.db.delete(document)
            await self.db.commit()
            
            logger.info(f"Deleted document: {document.filename} (ID: {document.id})")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete document {document_id}: {e}")
            raise
    
    async def update_document_status(self, document_id: UUID, status: str) -> Optional[Document]:
        """Update document processing status"""
        try:
            document = await self.get_document(document_id)
            if not document:
                return None
            
            document.status = status
            await self.db.commit()
            await self.db.refresh(document)
            
            logger.info(f"Updated document status: {document.filename} -> {status}")
            return document
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update document status {document_id}: {e}")
            raise
    
    async def get_document_chunks(self, document_id: UUID) -> List[DocumentChunk]:
        """Get all chunks for a document"""
        try:
            result = await self.db.execute(
                select(DocumentChunk)
                .where(DocumentChunk.document_id == document_id)
                .order_by(DocumentChunk.chunk_index)
            )
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Failed to get document chunks for {document_id}: {e}")
            raise
    
    async def create_document_chunk(
        self,
        document_id: UUID,
        chunk_index: int,
        content: str,
        metadata: Optional[dict] = None
    ) -> DocumentChunk:
        """Create a new document chunk"""
        try:
            chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=chunk_index,
                content=content,
                metadata=metadata or {},
            )
            
            self.db.add(chunk)
            await self.db.commit()
            await self.db.refresh(chunk)
            
            logger.info(f"Created chunk {chunk_index} for document {document_id}")
            return chunk
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create document chunk: {e}")
            raise
    
    async def update_chunk_embedding(
        self,
        chunk_id: UUID,
        embedding: List[float]
    ) -> Optional[DocumentChunk]:
        """Update chunk vector embedding"""
        try:
            result = await self.db.execute(
                select(DocumentChunk).where(DocumentChunk.id == chunk_id)
            )
            chunk = result.scalar_one_or_none()
            
            if not chunk:
                return None
            
            chunk.embedding = embedding
            await self.db.commit()
            await self.db.refresh(chunk)
            
            logger.info(f"Updated embedding for chunk {chunk_id}")
            return chunk
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update chunk embedding {chunk_id}: {e}")
            raise
    
    async def _get_domain(self, domain_id: UUID) -> Optional[Domain]:
        """Get domain by ID (internal method)"""
        try:
            result = await self.db.execute(
                select(Domain).where(Domain.id == domain_id)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get domain {domain_id}: {e}")
            raise
    
    async def document_exists(self, document_id: UUID) -> bool:
        """Check if document exists"""
        try:
            document = await self.get_document(document_id)
            return document is not None
        except Exception as e:
            logger.error(f"Failed to check document existence for {document_id}: {e}")
            return False
