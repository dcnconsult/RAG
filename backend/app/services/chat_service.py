"""
Chat service for business logic
"""

import logging
from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.chat import Chat, ChatMessage
from app.models.domain import Domain
from app.schemas.chat import ChatCreate, ChatUpdate, ChatMessageCreate, ChatWithMessagesResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class ChatService:
    """Service for chat operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_chat(self, chat_data: ChatCreate) -> Chat:
        """Create a new chat"""
        try:
            # Check if domain exists
            domain = await self._get_domain(chat_data.domain_id)
            if not domain:
                raise ValueError(f"Domain with ID {chat_data.domain_id} does not exist")
            
            # Create chat
            chat = Chat(
                domain_id=chat_data.domain_id,
                title=chat_data.title or "New Chat",
            )
            
            self.db.add(chat)
            await self.db.commit()
            await self.db.refresh(chat)
            
            logger.info(f"Created chat: {chat.title} (ID: {chat.id})")
            return chat
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create chat: {e}")
            raise
    
    async def get_chat(self, chat_id: UUID) -> Optional[Chat]:
        """Get chat by ID"""
        try:
            result = await self.db.execute(
                select(Chat).where(Chat.id == chat_id)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get chat {chat_id}: {e}")
            raise
    
    async def get_chat_with_messages(self, chat_id: UUID) -> Optional[ChatWithMessagesResponse]:
        """Get chat with messages by ID"""
        try:
            result = await self.db.execute(
                select(Chat)
                .options(selectinload(Chat.messages))
                .where(Chat.id == chat_id)
            )
            chat = result.scalar_one_or_none()
            
            if not chat:
                return None
            
            # Convert to response schema
            messages_response = []
            for message in chat.messages:
                messages_response.append({
                    "id": message.id,
                    "chat_id": message.chat_id,
                    "role": message.role,
                    "content": message.content,
                    "metadata": message.metadata,
                    "created_at": message.created_at,
                })
            
            return ChatWithMessagesResponse(
                id=chat.id,
                domain_id=chat.domain_id,
                title=chat.title,
                created_at=chat.created_at,
                updated_at=chat.updated_at,
                messages=messages_response,
                message_count=len(messages_response),
            )
            
        except Exception as e:
            logger.error(f"Failed to get chat with messages {chat_id}: {e}")
            raise
    
    async def list_chats(
        self,
        domain_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> Tuple[List[Chat], int]:
        """List chats with filters and pagination"""
        try:
            # Build query
            query = select(Chat)
            
            # Add filters
            filters = []
            if domain_id:
                filters.append(Chat.domain_id == domain_id)
            if search:
                search_filter = Chat.title.ilike(f"%{search}%")
                filters.append(search_filter)
            
            if filters:
                query = query.where(and_(*filters))
            
            # Get total count
            count_query = select(func.count(Chat.id))
            if filters:
                count_query = count_query.where(and_(*filters))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Get paginated results
            query = query.offset(skip).limit(limit)
            result = await self.db.execute(query)
            chats = result.scalars().all()
            
            return chats, total
            
        except Exception as e:
            logger.error(f"Failed to list chats: {e}")
            raise
    
    async def update_chat(self, chat_id: UUID, chat_data: ChatUpdate) -> Optional[Chat]:
        """Update chat"""
        try:
            chat = await self.get_chat(chat_id)
            if not chat:
                return None
            
            # Update fields
            update_data = chat_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(chat, field, value)
            
            await self.db.commit()
            await self.db.refresh(chat)
            
            logger.info(f"Updated chat: {chat.title} (ID: {chat.id})")
            return chat
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update chat {chat_id}: {e}")
            raise
    
    async def delete_chat(self, chat_id: UUID) -> bool:
        """Delete chat and associated messages"""
        try:
            chat = await self.get_chat(chat_id)
            if not chat:
                return False
            
            # Delete chat (cascade will handle messages)
            await self.db.delete(chat)
            await self.db.commit()
            
            logger.info(f"Deleted chat: {chat.title} (ID: {chat.id})")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete chat {chat_id}: {e}")
            raise
    
    async def add_message(self, chat_id: UUID, message_data: ChatMessageCreate) -> ChatMessage:
        """Add a message to a chat"""
        try:
            # Check if chat exists
            chat = await self.get_chat(chat_id)
            if not chat:
                raise ValueError(f"Chat with ID {chat_id} does not exist")
            
            # Validate message role
            if message_data.role not in ["user", "assistant", "system"]:
                raise ValueError(f"Invalid message role: {message_data.role}")
            
            # Create message
            message = ChatMessage(
                chat_id=chat_id,
                role=message_data.role,
                content=message_data.content,
                metadata=message_data.metadata or {},
            )
            
            self.db.add(message)
            await self.db.commit()
            await self.db.refresh(message)
            
            logger.info(f"Added message to chat {chat_id}: {message.role}")
            return message
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to add message to chat {chat_id}: {e}")
            raise
    
    async def get_chat_messages(
        self,
        chat_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[ChatMessage], int]:
        """Get messages for a chat with pagination"""
        try:
            # Check if chat exists
            chat = await self.get_chat(chat_id)
            if not chat:
                raise ValueError(f"Chat with ID {chat_id} does not exist")
            
            # Get total count
            count_query = select(func.count(ChatMessage.id)).where(ChatMessage.chat_id == chat_id)
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Get paginated messages
            query = (
                select(ChatMessage)
                .where(ChatMessage.chat_id == chat_id)
                .order_by(ChatMessage.created_at)
                .offset(skip)
                .limit(limit)
            )
            
            result = await self.db.execute(query)
            messages = result.scalars().all()
            
            return messages, total
            
        except Exception as e:
            logger.error(f"Failed to get chat messages for {chat_id}: {e}")
            raise
    
    async def update_message(self, message_id: UUID, content: str) -> Optional[ChatMessage]:
        """Update a chat message"""
        try:
            result = await self.db.execute(
                select(ChatMessage).where(ChatMessage.id == message_id)
            )
            message = result.scalar_one_or_none()
            
            if not message:
                return None
            
            message.content = content
            await self.db.commit()
            await self.db.refresh(message)
            
            logger.info(f"Updated message {message_id}")
            return message
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to update message {message_id}: {e}")
            raise
    
    async def delete_message(self, message_id: UUID) -> bool:
        """Delete a chat message"""
        try:
            result = await self.db.execute(
                select(ChatMessage).where(ChatMessage.id == message_id)
            )
            message = result.scalar_one_or_none()
            
            if not message:
                return False
            
            await self.db.delete(message)
            await self.db.commit()
            
            logger.info(f"Deleted message {message_id}")
            return True
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete message {message_id}: {e}")
            raise
    
    async def get_chat_statistics(self, chat_id: UUID) -> dict:
        """Get statistics for a chat"""
        try:
            # Check if chat exists
            chat = await self.get_chat(chat_id)
            if not chat:
                raise ValueError(f"Chat with ID {chat_id} does not exist")
            
            # Get message counts by role
            role_counts = await self.db.execute(
                select(
                    ChatMessage.role,
                    func.count(ChatMessage.id).label('count')
                )
                .where(ChatMessage.chat_id == chat_id)
                .group_by(ChatMessage.role)
            )
            
            role_stats = {row.role: row.count for row in role_counts}
            
            # Get total message count
            total_result = await self.db.execute(
                select(func.count(ChatMessage.id)).where(ChatMessage.chat_id == chat_id)
            )
            total_messages = total_result.scalar()
            
            # Get first and last message timestamps
            first_message_result = await self.db.execute(
                select(ChatMessage.created_at)
                .where(ChatMessage.chat_id == chat_id)
                .order_by(ChatMessage.created_at)
                .limit(1)
            )
            first_message = first_message_result.scalar_one_or_none()
            
            last_message_result = await self.db.execute(
                select(ChatMessage.created_at)
                .where(ChatMessage.chat_id == chat_id)
                .order_by(ChatMessage.created_at.desc())
                .limit(1)
            )
            last_message = last_message_result.scalar_one_or_none()
            
            return {
                "chat_id": chat_id,
                "total_messages": total_messages,
                "role_distribution": role_stats,
                "first_message_at": first_message.isoformat() if first_message else None,
                "last_message_at": last_message.isoformat() if last_message else None,
                "created_at": chat.created_at.isoformat(),
                "updated_at": chat.updated_at.isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Failed to get chat statistics for {chat_id}: {e}")
            raise
    
    async def _get_domain(self, domain_id: UUID) -> Optional[Domain]:
        """Get domain by ID (internal method)"""
        try:
            result = await self.db.execute(
                select(Domain).where(Domain.id == domain_id)
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Failed to get domain {domain_id}: {e}")
            raise
    
    async def chat_exists(self, chat_id: UUID) -> bool:
        """Check if chat exists"""
        try:
            chat = await self.get_chat(chat_id)
            return chat is not None
        except Exception as e:
            logger.error(f"Failed to check chat existence for {chat_id}: {e}")
            return False
