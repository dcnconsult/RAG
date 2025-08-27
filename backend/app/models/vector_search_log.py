"""
Vector search log model for analytics
"""

from sqlalchemy import Column, Text, Integer, Float
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base


class VectorSearchLog(Base):
    """Vector search log for analytics and monitoring"""
    
    __tablename__ = "vector_search_logs"
    
    # Search information
    query = Column(Text, nullable=False)
    results_count = Column(Integer, nullable=False)
    response_time = Column(Float, nullable=False)  # Response time in seconds
    
    # Metadata
    metadata = Column(JSONB, nullable=True)  # Additional search parameters, filters, etc.
    
    def __repr__(self) -> str:
        """String representation of the vector search log"""
        return f"<VectorSearchLog(id={self.id}, results_count={self.results_count}, response_time={self.response_time}s)>"
    
    @property
    def query_length(self) -> int:
        """Get the length of the search query"""
        return len(self.query) if self.query else 0
    
    @property
    def query_word_count(self) -> int:
        """Get the word count of the search query"""
        if not self.query:
            return 0
        return len(self.query.split())
    
    @property
    def response_time_ms(self) -> float:
        """Get response time in milliseconds"""
        return self.response_time * 1000
    
    @property
    def is_fast_response(self) -> bool:
        """Check if response time is considered fast (< 100ms)"""
        return self.response_time < 0.1
    
    @property
    def is_slow_response(self) -> bool:
        """Check if response time is considered slow (> 1s)"""
        return self.response_time > 1.0
    
    @property
    def search_parameters(self) -> dict:
        """Get search parameters from metadata"""
        return self.metadata.get("parameters", {}) if self.metadata else {}
    
    @property
    def filters_applied(self) -> list:
        """Get filters applied from metadata"""
        return self.metadata.get("filters", []) if self.metadata else []
    
    @property
    def model_used(self) -> str:
        """Get the model used for search from metadata"""
        return self.metadata.get("model", "unknown") if self.metadata else "unknown"
    
    @property
    def domain_id(self) -> str:
        """Get the domain ID from metadata"""
        return self.metadata.get("domain_id") if self.metadata else None
    
    @property
    def user_id(self) -> str:
        """Get the user ID from metadata"""
        return self.metadata.get("user_id") if self.metadata else None
    
    def add_metadata(self, **kwargs) -> None:
        """Add metadata to the log entry"""
        if not self.metadata:
            self.metadata = {}
        self.metadata.update(kwargs)
        self.updated_at = self.updated_at  # Trigger update
