"""
Chat API endpoints
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.chat import (
    ChatCreate, ChatUpdate, ChatResponse, ChatListResponse,
    ChatWithMessagesResponse, ChatMessageCreate, ChatMessageResponse
)
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_data: ChatCreate,
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """Create a new chat"""
    try:
        chat_service = ChatService(db)
        chat = await chat_service.create_chat(chat_data)
        
        return ChatResponse(
            id=chat.id,
            domain_id=chat.domain_id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create chat: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/", response_model=ChatListResponse)
async def list_chats(
    domain_id: Optional[UUID] = Query(None, description="Filter by domain ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search in chat titles"),
    db: AsyncSession = Depends(get_db)
) -> ChatListResponse:
    """List chats with pagination and filters"""
    try:
        chat_service = ChatService(db)
        chats, total = await chat_service.list_chats(
            domain_id=domain_id,
            skip=skip,
            limit=limit,
            search=search,
        )
        
        chat_responses = []
        for chat in chats:
            chat_responses.append(ChatResponse(
                id=chat.id,
                domain_id=chat.domain_id,
                title=chat.title,
                created_at=chat.created_at,
                updated_at=chat.updated_at,
            ))
        
        return ChatListResponse(
            chats=chat_responses,
            total=total,
            skip=skip,
            limit=limit,
        )
        
    except Exception as e:
        logger.error(f"Failed to list chats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """Get chat by ID"""
    try:
        chat_service = ChatService(db)
        chat = await chat_service.get_chat(chat_id)
        
        if not chat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
        
        return ChatResponse(
            id=chat.id,
            domain_id=chat.domain_id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chat {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{chat_id}/with-messages", response_model=ChatWithMessagesResponse)
async def get_chat_with_messages(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> ChatWithMessagesResponse:
    """Get chat with messages by ID"""
    try:
        chat_service = ChatService(db)
        chat_with_messages = await chat_service.get_chat_with_messages(chat_id)
        
        if not chat_with_messages:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
        
        return chat_with_messages
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chat with messages {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: UUID,
    chat_data: ChatUpdate,
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """Update chat"""
    try:
        chat_service = ChatService(db)
        chat = await chat_service.update_chat(chat_id, chat_data)
        
        if not chat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
        
        return ChatResponse(
            id=chat.id,
            domain_id=chat.domain_id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update chat {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete chat"""
    try:
        chat_service = ChatService(db)
        deleted = await chat_service.delete_chat(chat_id)
        
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete chat {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/{chat_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def add_message(
    chat_id: UUID,
    message_data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db)
) -> ChatMessageResponse:
    """Add a message to a chat"""
    try:
        chat_service = ChatService(db)
        message = await chat_service.add_message(chat_id, message_data)
        
        return ChatMessageResponse(
            id=message.id,
            chat_id=message.chat_id,
            role=message.role,
            content=message.content,
            metadata=message.metadata,
            created_at=message.created_at,
        )
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to add message to chat {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{chat_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    chat_id: UUID,
    skip: int = Query(0, ge=0, description="Number of messages to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of messages to return"),
    db: AsyncSession = Depends(get_db)
) -> List[ChatMessageResponse]:
    """Get messages for a chat with pagination"""
    try:
        chat_service = ChatService(db)
        messages, total = await chat_service.get_chat_messages(
            chat_id=chat_id,
            skip=skip,
            limit=limit,
        )
        
        message_responses = []
        for message in messages:
            message_responses.append(ChatMessageResponse(
                id=message.id,
                chat_id=message.chat_id,
                role=message.role,
                content=message.content,
                metadata=message.metadata,
                created_at=message.created_at,
            ))
        
        return message_responses
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get chat messages for {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/messages/{message_id}", response_model=ChatMessageResponse)
async def update_message(
    message_id: UUID,
    content: str,
    db: AsyncSession = Depends(get_db)
) -> ChatMessageResponse:
    """Update a chat message"""
    try:
        chat_service = ChatService(db)
        message = await chat_service.update_message(message_id, content)
        
        if not message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        
        return ChatMessageResponse(
            id=message.id,
            chat_id=message.chat_id,
            role=message.role,
            content=message.content,
            metadata=message.metadata,
            created_at=message.created_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update message {message_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a chat message"""
    try:
        chat_service = ChatService(db)
        deleted = await chat_service.delete_message(message_id)
        
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete message {message_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{chat_id}/statistics")
async def get_chat_statistics(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get statistics for a chat"""
    try:
        chat_service = ChatService(db)
        stats = await chat_service.get_chat_statistics(chat_id)
        
        return stats
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get chat statistics for {chat_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
