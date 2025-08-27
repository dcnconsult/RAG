"""
Search Pydantic schemas
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, validator


class SearchQuery(BaseModel):
    """Schema for search query"""
    query: str = Field(..., min_length=1, description="Search query text")
    domain_id: Optional[UUID] = Field(None, description="Domain ID to search within")
    limit: int = Field(10, ge=1, le=100, description="Maximum number of results to return")
    threshold: float = Field(0.7, ge=0.0, le=1.0, description="Similarity threshold for results")
    
    @validator('query')
    def validate_query(cls, v):
        """Validate search query"""
        if not v.strip():
            raise ValueError('Search query cannot be empty')
        return v.strip()


class SearchResult(BaseModel):
    """Schema for search result"""
    chunk_id: UUID
    document_id: UUID
    document_name: str
    domain_id: UUID
    domain_name: str
    content: str
    chunk_index: int
    similarity_score: float
    metadata: Optional[dict]
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
        }


class SearchResponse(BaseModel):
    """Schema for search response"""
    query: str
    results: List[SearchResult]
    total_results: int
    response_time: float
    domain_id: Optional[UUID]
    metadata: Optional[dict]
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
        }


class SemanticSearchQuery(SearchQuery):
    """Schema for semantic search query"""
    use_reranking: bool = Field(False, description="Whether to use reranking for better results")
    include_metadata: bool = Field(True, description="Whether to include metadata in results")


class VectorSearchQuery(SearchQuery):
    """Schema for vector search query"""
    vector_dimension: int = Field(1536, description="Vector dimension for search")
    use_approximate_search: bool = Field(True, description="Whether to use approximate search for speed")
