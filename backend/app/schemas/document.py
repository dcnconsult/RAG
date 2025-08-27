"""
Document Pydantic schemas
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, validator


class DocumentBase(BaseModel):
    """Base document schema"""
    filename: str = Field(..., min_length=1, max_length=255, description="Document filename")
    file_type: str = Field(..., min_length=1, max_length=50, description="Document file type")
    
    @validator('filename')
    def validate_filename(cls, v):
        """Validate filename"""
        if not v.strip():
            raise ValueError('Filename cannot be empty')
        return v.strip()
    
    @validator('file_type')
    def validate_file_type(cls, v):
        """Validate file type"""
        allowed_types = ['pdf', 'docx', 'txt', 'md', 'rtf']
        if v.lower() not in allowed_types:
            raise ValueError(f'File type must be one of: {", ".join(allowed_types)}')
        return v.lower()


class DocumentCreate(DocumentBase):
    """Schema for creating a document"""
    domain_id: UUID = Field(..., description="Domain ID")
    file_size: int = Field(..., gt=0, description="File size in bytes")
    file_path: str = Field(..., description="File storage path")
    metadata: Optional[dict] = Field(None, description="Document metadata")


class DocumentUpdate(BaseModel):
    """Schema for updating a document"""
    filename: Optional[str] = Field(None, min_length=1, max_length=255, description="Document filename")
    metadata: Optional[dict] = Field(None, description="Document metadata")
    status: Optional[str] = Field(None, description="Document processing status")


class DocumentResponse(DocumentBase):
    """Schema for document response"""
    id: UUID
    domain_id: UUID
    file_path: str
    file_size: int
    status: str
    metadata: Optional[dict]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class DocumentListResponse(BaseModel):
    """Schema for document list response with pagination"""
    documents: List[DocumentResponse]
    total: int
    skip: int
    limit: int
    
    class Config:
        from_attributes = True


class DocumentChunkResponse(BaseModel):
    """Schema for document chunk response"""
    id: UUID
    document_id: UUID
    chunk_index: int
    content: str
    has_embedding: bool
    metadata: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class DocumentWithChunksResponse(DocumentResponse):
    """Schema for document response with chunks"""
    chunks: List[DocumentChunkResponse]
    chunk_count: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
