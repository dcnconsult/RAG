"""
Domain model for RAG knowledge domains
"""

from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship

from .base import Base


class Domain(Base):
    """RAG knowledge domain model"""
    
    __tablename__ = "domains"
    
    # Domain information
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Relationships
    documents = relationship("Document", back_populates="domain", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="domain", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the domain"""
        return f"<Domain(id={self.id}, name='{self.name}')>"
    
    @property
    def document_count(self) -> int:
        """Get the number of documents in this domain"""
        return len(self.documents) if self.documents else 0
    
    @property
    def chat_count(self) -> int:
        """Get the number of chats in this domain"""
        return len(self.chats) if self.chats else 0
    
    @property
    def total_chunks(self) -> int:
        """Get the total number of document chunks in this domain"""
        total = 0
        for document in self.documents:
            total += len(document.chunks) if document.chunks else 0
        return total
