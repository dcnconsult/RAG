"""
Document API endpoints
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse,
    DocumentWithChunksResponse, DocumentChunkResponse
)
from app.services.document_service import DocumentService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    domain_id: UUID = Form(...),
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    """Create a new document"""
    try:
        # TODO: Implement file upload handling
        # For now, create a placeholder document
        document_data = DocumentCreate(
            domain_id=domain_id,
            filename=file.filename or "unknown",
            file_path=f"/uploads/{file.filename}",
            file_size=0,  # TODO: Get actual file size
            file_type=file.filename.split(".")[-1] if "." in file.filename else "txt",
            metadata={"uploaded_filename": file.filename} if metadata else None,
        )
        
        document_service = DocumentService(db)
        document = await document_service.create_document(document_data)
        
        return DocumentResponse(
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
        )
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create document: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    status: Optional[str] = Query(None, description="Filter by document status"),
    search: Optional[str] = Query(None, description="Search in document names"),
    db: AsyncSession = Depends(get_db)
) -> DocumentListResponse:
    """List documents with pagination and filters"""
    try:
        document_service = DocumentService(db)
        documents, total = await document_service.list_documents(
            domain_id=domain_id,
            skip=skip,
            limit=limit,
            status=status,
            search=search,
        )
        
        document_responses = []
        for document in documents:
            document_responses.append(DocumentResponse(
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
            ))
        
        return DocumentListResponse(
            documents=document_responses,
            total=total,
            skip=skip,
            limit=limit,
        )
        
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    """Get document by ID"""
    try:
        document_service = DocumentService(db)
        document = await document_service.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        return DocumentResponse(
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
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document {document_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{document_id}/with-chunks", response_model=DocumentWithChunksResponse)
async def get_document_with_chunks(
    document_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> DocumentWithChunksResponse:
    """Get document with chunks by ID"""
    try:
        document_service = DocumentService(db)
        document_with_chunks = await document_service.get_document_with_chunks(document_id)
        
        if not document_with_chunks:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        return document_with_chunks
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document with chunks {document_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_data: DocumentUpdate,
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    """Update document"""
    try:
        document_service = DocumentService(db)
        document = await document_service.update_document(document_id, document_data)
        
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        return DocumentResponse(
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
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update document {document_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete document"""
    try:
        document_service = DocumentService(db)
        deleted = await document_service.delete_document(document_id)
        
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document {document_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.patch("/{document_id}/status", response_model=DocumentResponse)
async def update_document_status(
    document_id: UUID,
    status: str = Form(...),
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    """Update document processing status"""
    try:
        document_service = DocumentService(db)
        document = await document_service.update_document_status(document_id, status)
        
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
        return DocumentResponse(
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
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update document status {document_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkResponse])
async def get_document_chunks(
    document_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> List[DocumentChunkResponse]:
    """Get all chunks for a document"""
    try:
        document_service = DocumentService(db)
        chunks = await document_service.get_document_chunks(document_id)
        
        chunk_responses = []
        for chunk in chunks:
            chunk_responses.append(DocumentChunkResponse(
                id=chunk.id,
                document_id=chunk.document_id,
                chunk_index=chunk.chunk_index,
                content=chunk.content,
                has_embedding=chunk.has_embedding,
                metadata=chunk.metadata,
                created_at=chunk.created_at,
            ))
        
        return chunk_responses
        
    except Exception as e:
        logger.error(f"Failed to get document chunks for {document_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
