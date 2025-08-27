"""
Chat processing background tasks
"""

import logging
from typing import Optional, List
from uuid import UUID

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.services.chat_service import ChatService
from app.services.search_service import SearchService
from app.schemas.chat import ChatMessageCreate

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="process_chat_message")
def process_chat_message(self, chat_id: str, message_id: str):
    """Process a chat message and generate response"""
    try:
        # Convert string IDs to UUIDs
        chat_uuid = UUID(chat_id)
        message_uuid = UUID(message_id)
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def process():
            async with async_session() as db:
                chat_service = ChatService(db)
                search_service = SearchService(db)
                
                # Get the message
                messages, _ = await chat_service.get_chat_messages(chat_uuid, limit=1000)
                user_message = None
                
                for msg in messages:
                    if msg.id == message_uuid:
                        user_message = msg
                        break
                
                if not user_message:
                    logger.error(f"Message {message_uuid} not found")
                    return
                
                if user_message.role != "user":
                    logger.info(f"Message {message_uuid} is not a user message, skipping")
                    return
                
                try:
                    # Generate AI response
                    response = await generate_chat_response(
                        chat_service, search_service, chat_uuid, user_message.content
                    )
                    
                    if response:
                        # Add AI response to chat
                        await chat_service.add_message(
                            chat_uuid,
                            ChatMessageCreate(
                                role="assistant",
                                content=response,
                                metadata={"generated": True, "model": "placeholder"}
                            )
                        )
                        
                        logger.info(f"Successfully generated response for message {message_uuid}")
                    else:
                        logger.error(f"Failed to generate response for message {message_uuid}")
                        
                except Exception as e:
                    logger.error(f"Error processing chat message {message_uuid}: {e}")
                    raise
        
        # Run async function
        import asyncio
        asyncio.run(process())
        
    except Exception as e:
        logger.error(f"Chat message processing task failed for {message_id}: {e}")
        raise


@shared_task(bind=True, name="generate_chat_response")
def generate_chat_response(self, chat_id: str, user_message: str, context_documents: List[str] = None):
    """Generate AI response for a chat message"""
    try:
        # Convert string ID to UUID
        chat_uuid = UUID(chat_id)
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def generate():
            async with async_session() as db:
                chat_service = ChatService(db)
                search_service = SearchService(db)
                
                try:
                    # Generate response
                    response = await generate_chat_response_internal(
                        chat_service, search_service, chat_uuid, user_message, context_documents
                    )
                    
                    if response:
                        # Add AI response to chat
                        await chat_service.add_message(
                            chat_uuid,
                            ChatMessageCreate(
                                role="assistant",
                                content=response,
                                metadata={"generated": True, "model": "placeholder"}
                            )
                        )
                        
                        logger.info(f"Successfully generated response for chat {chat_uuid}")
                        return response
                    else:
                        logger.error(f"Failed to generate response for chat {chat_uuid}")
                        return None
                        
                except Exception as e:
                    logger.error(f"Error generating chat response for {chat_uuid}: {e}")
                    raise
        
        # Run async function
        import asyncio
        return asyncio.run(generate())
        
    except Exception as e:
        logger.error(f"Chat response generation task failed for {chat_id}: {e}")
        raise


async def generate_chat_response_internal(
    chat_service: ChatService,
    search_service: SearchService,
    chat_id: UUID,
    user_message: str,
    context_documents: List[str] = None
) -> Optional[str]:
    """Internal function to generate chat response"""
    try:
        # Get chat context
        chat = await chat_service.get_chat(chat_id)
        if not chat:
            logger.error(f"Chat {chat_id} not found")
            return None
        
        # Search for relevant documents
        search_results = await search_service.semantic_search(
            query=user_message,
            domain_id=chat.domain_id,
            limit=5
        )
        
        # Build context from search results
        context = ""
        if search_results.results:
            context = "Based on the available documents:\n\n"
            for i, result in enumerate(search_results.results[:3], 1):
                context += f"{i}. {result.content[:200]}...\n\n"
        
        # TODO: Implement actual LLM integration
        # For now, return a placeholder response
        
        if context:
            response = f"I found some relevant information:\n\n{context}\n\nThis is a placeholder response. The actual LLM integration will be implemented in the next phase."
        else:
            response = "I don't have specific information about that topic in my knowledge base. This is a placeholder response. The actual LLM integration will be implemented in the next phase."
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        return None


@shared_task(bind=True, name="process_chat_history")
def process_chat_history(self, chat_id: str):
    """Process entire chat history for analysis"""
    try:
        # Convert string ID to UUID
        chat_uuid = UUID(chat_id)
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def process():
            async with async_session() as db:
                chat_service = ChatService(db)
                
                try:
                    # Get chat statistics
                    stats = await chat_service.get_chat_statistics(chat_uuid)
                    
                    logger.info(f"Processed chat history for {chat_uuid}: {stats}")
                    return stats
                    
                except Exception as e:
                    logger.error(f"Error processing chat history for {chat_uuid}: {e}")
                    raise
        
        # Run async function
        import asyncio
        return asyncio.run(process())
        
    except Exception as e:
        logger.error(f"Chat history processing task failed for {chat_id}: {e}")
        raise


@shared_task(bind=True, name="cleanup_old_chats")
def cleanup_old_chats(self, days_old: int = 30):
    """Clean up old chat messages and sessions"""
    try:
        logger.info(f"Starting cleanup of chats older than {days_old} days")
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def cleanup():
            async with async_session() as db:
                try:
                    # TODO: Implement chat cleanup logic
                    # This would involve:
                    # 1. Finding old chats
                    # 2. Archiving important conversations
                    # 3. Deleting old messages
                    # 4. Updating chat statistics
                    
                    logger.info("Chat cleanup completed (placeholder implementation)")
                    return {"cleaned_chats": 0, "archived_messages": 0}
                    
                except Exception as e:
                    logger.error(f"Error during chat cleanup: {e}")
                    raise
        
        # Run async function
        import asyncio
        return asyncio.run(cleanup())
        
    except Exception as e:
        logger.error(f"Chat cleanup task failed: {e}")
        raise
