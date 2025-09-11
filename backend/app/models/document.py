"""
Document and document chunk models
"""

from sqlalchemy import Column, String, Text, BigInteger, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship

from .base import Base


class Document(Base):
    """Document model for uploaded files"""
    
    __tablename__ = "documents"
    
    # Document information
    domain_id = Column(ForeignKey("domains.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, processing, completed, failed
    
    # Metadata
    document_metadata = Column(JSONB, nullable=True)
    
    # Relationships
    domain = relationship("Domain", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the document"""
        return f"<Document(id={self.id}, filename='{self.filename}', status='{self.status}')>"
    
    @property
    def chunk_count(self) -> int:
        """Get the number of chunks for this document"""
        return len(self.chunks) if self.chunks else 0
    
    @property
    def is_processed(self) -> bool:
        """Check if document is fully processed"""
        return self.status == "completed"
    
    @property
    def is_failed(self) -> bool:
        """Check if document processing failed"""
        return self.status == "failed"
    
    @property
    def is_pending(self) -> bool:
        """Check if document is pending processing"""
        return self.status == "pending"
    
    @property
    def file_size_mb(self) -> float:
        """Get file size in megabytes"""
        return self.file_size / (1024 * 1024)


class DocumentChunk(Base):
    """Document chunk model for text chunks with vector embeddings"""
    
    __tablename__ = "document_chunks"
    
    # Chunk information
    document_id = Column(ForeignKey("documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False, index=True)
    content = Column(Text, nullable=False)
    
    # Vector embedding
    embedding = Column(Vector(1536), nullable=True)  # OpenAI ada-002 dimension
    
    # Metadata
    document_metadata = Column(JSONB, nullable=True)
    
    # Relationships
    document = relationship("Document", back_populates="chunks")
    
    def __repr__(self) -> str:
        """String representation of the document chunk"""
        return f"<DocumentChunk(id={self.id}, document_id={self.document_id}, chunk_index={self.chunk_index})>"
    
    @property
    def content_length(self) -> int:
        """Get the length of the chunk content"""
        return len(self.content) if self.content else 0
    
    @property
    def has_embedding(self) -> bool:
        """Check if chunk has vector embedding"""
        return self.embedding is not None
    
    @property
    def word_count(self) -> int:
        """Get the word count of the chunk content"""
        if not self.content:
            return 0
        return len(self.content.split())
    
    @property
    def token_estimate(self) -> int:
        """Estimate token count (rough approximation: 1 token ≈ 4 characters)"""
        return self.content_length // 4
