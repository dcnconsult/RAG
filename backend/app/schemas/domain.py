"""
Domain Pydantic schemas
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class DomainBase(BaseModel):
    """Base domain schema"""
    name: str = Field(..., min_length=1, max_length=255, description="Domain name")
    description: Optional[str] = Field(None, max_length=1000, description="Domain description")
    
    @validator('name')
    def validate_name(cls, v):
        """Validate domain name"""
        if not v.strip():
            raise ValueError('Domain name cannot be empty')
        return v.strip()


class DomainCreate(DomainBase):
    """Schema for creating a domain"""
    pass


class DomainUpdate(BaseModel):
    """Schema for updating a domain"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Domain name")
    description: Optional[str] = Field(None, max_length=1000, description="Domain description")
    
    @validator('name')
    def validate_name(cls, v):
        """Validate domain name"""
        if v is not None and not v.strip():
            raise ValueError('Domain name cannot be empty')
        return v.strip() if v else v


class DomainResponse(DomainBase):
    """Schema for domain response"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class DomainListResponse(BaseModel):
    """Schema for domain list response with pagination"""
    domains: list[DomainResponse]
    total: int
    skip: int
    limit: int
    
    class Config:
        from_attributes = True


class DomainStats(BaseModel):
    """Schema for domain statistics"""
    domain_id: UUID
    domain_name: str
    document_count: int
    chat_count: int
    total_chunks: int
    total_file_size_mb: float
    last_activity: Optional[datetime]
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat() if v else None,
        }
