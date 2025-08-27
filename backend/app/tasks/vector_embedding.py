"""
Vector embedding background tasks
"""

import logging
from typing import List, Optional
from uuid import UUID

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.document import DocumentChunk
from app.services.document_service import DocumentService

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="generate_embeddings")
def generate_embeddings(self, chunk_id: str):
    """Generate vector embeddings for a document chunk"""
    try:
        # Convert string ID to UUID
        chunk_uuid = UUID(chunk_id)
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def generate():
            async with async_session() as db:
                # Get chunk
                result = await db.execute(
                    f"SELECT * FROM document_chunks WHERE id = '{chunk_uuid}'"
                )
                chunk = result.fetchone()
                
                if not chunk:
                    logger.error(f"Chunk {chunk_uuid} not found")
                    return
                
                # Get chunk content
                content = chunk.content
                
                try:
                    # Generate embedding
                    embedding = await create_embedding(content)
                    
                    if embedding:
                        # Update chunk with embedding
                        await document_service.update_chunk_embedding(chunk_uuid, embedding)
                        logger.info(f"Successfully generated embedding for chunk {chunk_uuid}")
                    else:
                        logger.error(f"Failed to generate embedding for chunk {chunk_uuid}")
                        
                except Exception as e:
                    logger.error(f"Error generating embedding for chunk {chunk_uuid}: {e}")
                    raise
        
        # Run async function
        import asyncio
        asyncio.run(generate())
        
    except Exception as e:
        logger.error(f"Embedding generation task failed for {chunk_id}: {e}")
        raise


@shared_task(bind=True, name="update_chunk_embedding")
def update_chunk_embedding(self, chunk_id: str, embedding: List[float]):
    """Update chunk with vector embedding"""
    try:
        # Convert string ID to UUID
        chunk_uuid = UUID(chunk_id)
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def update():
            async with async_session() as db:
                document_service = DocumentService(db)
                
                # Update chunk embedding
                updated_chunk = await document_service.update_chunk_embedding(chunk_uuid, embedding)
                
                if updated_chunk:
                    logger.info(f"Successfully updated embedding for chunk {chunk_uuid}")
                else:
                    logger.error(f"Failed to update embedding for chunk {chunk_uuid}")
        
        # Run async function
        import asyncio
        asyncio.run(update())
        
    except Exception as e:
        logger.error(f"Embedding update task failed for {chunk_id}: {e}")
        raise


@shared_task(bind=True, name="batch_generate_embeddings")
def batch_generate_embeddings(self, chunk_ids: List[str]):
    """Generate embeddings for multiple chunks in batch"""
    try:
        logger.info(f"Starting batch embedding generation for {len(chunk_ids)} chunks")
        
        for chunk_id in chunk_ids:
            try:
                # Generate embedding for each chunk
                generate_embeddings.delay(chunk_id)
            except Exception as e:
                logger.error(f"Failed to queue embedding generation for chunk {chunk_id}: {e}")
                continue
        
        logger.info(f"Successfully queued embedding generation for {len(chunk_ids)} chunks")
        
    except Exception as e:
        logger.error(f"Batch embedding generation task failed: {e}")
        raise


async def create_embedding(text: str) -> Optional[List[float]]:
    """Create vector embedding for text content"""
    try:
        # TODO: Implement OpenAI embedding integration
        # For now, return a placeholder embedding
        
        if not text:
            return None
        
        # Placeholder: return dummy embedding of correct dimension
        # This should be replaced with actual OpenAI API call
        embedding_dimension = settings.VECTOR_DIMENSION
        placeholder_embedding = [0.0] * embedding_dimension
        
        # Add some variation based on text content (very basic)
        import hashlib
        text_hash = hashlib.md5(text.encode()).hexdigest()
        for i, char in enumerate(text_hash[:min(len(text_hash), embedding_dimension)]):
            placeholder_embedding[i] = (ord(char) - ord('a')) / 26.0
        
        logger.info(f"Generated placeholder embedding for text of length {len(text)}")
        return placeholder_embedding
        
    except Exception as e:
        logger.error(f"Error creating embedding: {e}")
        return None


async def create_embeddings_batch(texts: List[str]) -> List[Optional[List[float]]]:
    """Create embeddings for multiple texts in batch"""
    try:
        embeddings = []
        
        for text in texts:
            embedding = await create_embedding(text)
            embeddings.append(embedding)
        
        return embeddings
        
    except Exception as e:
        logger.error(f"Error creating batch embeddings: {e}")
        return [None] * len(texts)


def validate_embedding(embedding: List[float]) -> bool:
    """Validate that embedding has correct format and dimension"""
    try:
        if not embedding:
            return False
        
        if not isinstance(embedding, list):
            return False
        
        if len(embedding) != settings.VECTOR_DIMENSION:
            return False
        
        # Check that all values are numeric
        for value in embedding:
            if not isinstance(value, (int, float)):
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error validating embedding: {e}")
        return False
