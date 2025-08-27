"""
Chat Pydantic schemas
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, validator


class ChatBase(BaseModel):
    """Base chat schema"""
    title: Optional[str] = Field(None, max_length=255, description="Chat title")


class ChatCreate(ChatBase):
    """Schema for creating a chat"""
    domain_id: UUID = Field(..., description="Domain ID")


class ChatUpdate(BaseModel):
    """Schema for updating a chat"""
    title: Optional[str] = Field(None, max_length=255, description="Chat title")


class ChatResponse(ChatBase):
    """Schema for chat response"""
    id: UUID
    domain_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class ChatListResponse(BaseModel):
    """Schema for chat list response with pagination"""
    chats: List[ChatResponse]
    total: int
    skip: int
    limit: int
    
    class Config:
        from_attributes = True


class ChatMessageBase(BaseModel):
    """Base chat message schema"""
    content: str = Field(..., min_length=1, description="Message content")
    
    @validator('content')
    def validate_content(cls, v):
        """Validate message content"""
        if not v.strip():
            raise ValueError('Message content cannot be empty')
        return v.strip()


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a chat message"""
    chat_id: UUID = Field(..., description="Chat ID")
    role: str = Field(..., description="Message role (user, assistant, system)")
    
    @validator('role')
    def validate_role(cls, v):
        """Validate message role"""
        allowed_roles = ['user', 'assistant', 'system']
        if v.lower() not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v.lower()


class ChatMessageResponse(ChatMessageBase):
    """Schema for chat message response"""
    id: UUID
    chat_id: UUID
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class ChatWithMessagesResponse(ChatResponse):
    """Schema for chat response with messages"""
    messages: List[ChatMessageResponse]
    message_count: int
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
