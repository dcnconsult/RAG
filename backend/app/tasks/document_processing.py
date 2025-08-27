"""
Document processing background tasks
"""

import logging
import os
from typing import List, Optional
from uuid import UUID

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.document import Document, DocumentChunk
from app.services.document_service import DocumentService

logger = logging.getLogger(__name__)


@shared_task(bind=True, name="process_document")
def process_document(self, document_id: str):
    """Process uploaded document and create chunks"""
    try:
        # Convert string ID to UUID
        doc_id = UUID(document_id)
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def process():
            async with async_session() as db:
                # Get document
                document_service = DocumentService(db)
                document = await document_service.get_document(doc_id)
                
                if not document:
                    logger.error(f"Document {doc_id} not found")
                    return
                
                # Update status to processing
                await document_service.update_document_status(doc_id, "processing")
                
                try:
                    # Extract text from document
                    text_content = await extract_text_from_document(document)
                    
                    if not text_content:
                        await document_service.update_document_status(doc_id, "failed")
                        logger.error(f"Failed to extract text from document {doc_id}")
                        return
                    
                    # Create chunks
                    chunks = await create_document_chunks(text_content, document.chunk_size or settings.CHUNK_SIZE)
                    
                    # Save chunks to database
                    for i, chunk_text in enumerate(chunks):
                        await document_service.create_document_chunk(
                            document_id=doc_id,
                            chunk_index=i,
                            content=chunk_text,
                            metadata={"chunk_size": len(chunk_text)}
                        )
                    
                    # Update document status to completed
                    await document_service.update_document_status(doc_id, "completed")
                    
                    logger.info(f"Successfully processed document {doc_id} with {len(chunks)} chunks")
                    
                except Exception as e:
                    logger.error(f"Error processing document {doc_id}: {e}")
                    await document_service.update_document_status(doc_id, "failed")
                    raise
        
        # Run async function
        import asyncio
        asyncio.run(process())
        
    except Exception as e:
        logger.error(f"Document processing task failed for {document_id}: {e}")
        raise


@shared_task(bind=True, name="chunk_document")
def chunk_document(self, document_id: str, chunk_size: int = None, overlap: int = None):
    """Create chunks from document text"""
    try:
        # Convert string ID to UUID
        doc_id = UUID(document_id)
        
        # Use default values if not provided
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        
        # Create async database session
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async def chunk():
            async with async_session() as db:
                # Get document
                document_service = DocumentService(db)
                document = await document_service.get_document(doc_id)
                
                if not document:
                    logger.error(f"Document {doc_id} not found")
                    return
                
                # Get existing chunks
                existing_chunks = await document_service.get_document_chunks(doc_id)
                
                if existing_chunks:
                    logger.info(f"Document {doc_id} already has {len(existing_chunks)} chunks")
                    return
                
                # Extract text from document
                text_content = await extract_text_from_document(document)
                
                if not text_content:
                    logger.error(f"Failed to extract text from document {doc_id}")
                    return
                
                # Create chunks
                chunks = await create_document_chunks(text_content, chunk_size, overlap)
                
                # Save chunks to database
                for i, chunk_text in enumerate(chunks):
                    await document_service.create_document_chunk(
                        document_id=doc_id,
                        chunk_index=i,
                        content=chunk_text,
                        metadata={"chunk_size": len(chunk_text), "overlap": overlap}
                    )
                
                logger.info(f"Successfully created {len(chunks)} chunks for document {doc_id}")
        
        # Run async function
        import asyncio
        asyncio.run(chunk())
        
    except Exception as e:
        logger.error(f"Document chunking task failed for {document_id}: {e}")
        raise


async def extract_text_from_document(document: Document) -> Optional[str]:
    """Extract text content from document based on file type"""
    try:
        file_path = document.file_path
        
        if not os.path.exists(file_path):
            logger.error(f"Document file not found: {file_path}")
            return None
        
        file_type = document.file_type.lower()
        
        if file_type == "txt":
            return await extract_text_from_txt(file_path)
        elif file_type == "pdf":
            return await extract_text_from_pdf(file_path)
        elif file_type in ["docx", "doc"]:
            return await extract_text_from_docx(file_path)
        else:
            logger.warning(f"Unsupported file type: {file_type}")
            return None
            
    except Exception as e:
        logger.error(f"Error extracting text from document: {e}")
        return None


async def extract_text_from_txt(file_path: str) -> str:
    """Extract text from plain text file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading text file {file_path}: {e}")
        return ""


async def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        # TODO: Implement PDF text extraction
        # For now, return placeholder text
        logger.info(f"PDF text extraction not yet implemented for {file_path}")
        return f"PDF content placeholder for {file_path}"
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {e}")
        return ""


async def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        # TODO: Implement DOCX text extraction
        # For now, return placeholder text
        logger.info(f"DOCX text extraction not yet implemented for {file_path}")
        return f"DOCX content placeholder for {file_path}"
    except Exception as e:
        logger.error(f"Error extracting text from DOCX {file_path}: {e}")
        return ""


async def create_document_chunks(text: str, chunk_size: int, overlap: int = 0) -> List[str]:
    """Create text chunks with optional overlap"""
    try:
        if not text:
            return []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # If this is not the last chunk, try to break at a word boundary
            if end < len(text):
                # Look for the last space or newline before the end
                last_space = text.rfind(' ', start, end)
                last_newline = text.rfind('\n', start, end)
                break_point = max(last_space, last_newline)
                
                if break_point > start:
                    end = break_point + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position, accounting for overlap
            start = end - overlap
            if start <= 0:
                start = end
        
        return chunks
        
    except Exception as e:
        logger.error(f"Error creating document chunks: {e}")
        return []
