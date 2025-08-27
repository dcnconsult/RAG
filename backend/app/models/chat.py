"""
Chat and chat message models
"""

from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class Chat(Base):
    """Chat session model"""
    
    __tablename__ = "chats"
    
    # Chat information
    domain_id = Column(ForeignKey("domains.id"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    
    # Relationships
    domain = relationship("Domain", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation of the chat"""
        return f"<Chat(id={self.id}, domain_id={self.domain_id}, title='{self.title}')>"
    
    @property
    def message_count(self) -> int:
        """Get the number of messages in this chat"""
        return len(self.messages) if self.messages else 0
    
    @property
    def user_messages(self) -> list:
        """Get all user messages in this chat"""
        return [msg for msg in self.messages if msg.role == "user"] if self.messages else []
    
    @property
    def assistant_messages(self) -> list:
        """Get all assistant messages in this chat"""
        return [msg for msg in self.messages if msg.role == "assistant"] if self.messages else []
    
    @property
    def system_messages(self) -> list:
        """Get all system messages in this chat"""
        return [msg for msg in self.messages if msg.role == "system"] if self.messages else []
    
    @property
    def last_message(self):
        """Get the last message in this chat"""
        if not self.messages:
            return None
        return sorted(self.messages, key=lambda x: x.created_at)[-1]
    
    @property
    def last_user_message(self):
        """Get the last user message in this chat"""
        user_messages = self.user_messages
        if not user_messages:
            return None
        return sorted(user_messages, key=lambda x: x.created_at)[-1]
    
    def generate_title(self) -> str:
        """Generate a title for the chat based on the first user message"""
        first_user_message = self.user_messages[0] if self.user_messages else None
        if first_user_message:
            content = first_user_message.content
            # Truncate to reasonable length and clean up
            title = content[:50].strip()
            if len(content) > 50:
                title += "..."
            return title
        return "New Chat"


class ChatMessage(Base):
    """Chat message model"""
    
    __tablename__ = "chat_messages"
    
    # Message information
    chat_id = Column(ForeignKey("chats.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False, index=True)  # user, assistant, system
    content = Column(Text, nullable=False)
    
    # Metadata
    metadata = Column(JSONB, nullable=True)
    
    # Relationships
    chat = relationship("Chat", back_populates="messages")
    
    def __repr__(self) -> str:
        """String representation of the chat message"""
        return f"<ChatMessage(id={self.id}, chat_id={self.chat_id}, role='{self.role}')>"
    
    @property
    def content_length(self) -> int:
        """Get the length of the message content"""
        return len(self.content) if self.content else 0
    
    @property
    def word_count(self) -> int:
        """Get the word count of the message content"""
        if not self.content:
            return 0
        return len(self.content.split())
    
    @property
    def token_estimate(self) -> int:
        """Estimate token count (rough approximation: 1 token ≈ 4 characters)"""
        return self.content_length // 4
    
    @property
    def is_user_message(self) -> bool:
        """Check if this is a user message"""
        return self.role == "user"
    
    @property
    def is_assistant_message(self) -> bool:
        """Check if this is an assistant message"""
        return self.role == "assistant"
    
    @property
    def is_system_message(self) -> bool:
        """Check if this is a system message"""
        return self.role == "system"
