"""
RAG (Retrieval-Augmented Generation) service for intelligent document retrieval and response generation
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentChunk
from app.models.domain import Domain
from app.models.external_model import ExternalModel
from app.schemas.search import SearchResult, SearchResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def retrieve_context(
        self,
        query: str,
        domain_id: Optional[UUID] = None,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[SearchResult]:
        """Retrieve relevant context for a query"""
        try:
            # TODO: Implement actual vector similarity search
            # For now, use basic text search as placeholder
            
            # Build search query
            search_query = (
                select(DocumentChunk)
                .options(selectinload(DocumentChunk.document))
                .options(selectinload(DocumentChunk.document.domain))
            )
            
            # Add domain filter if specified
            if domain_id:
                search_query = search_query.join(Document).where(Document.domain_id == domain_id)
            
            # Add text search (temporary until vector search is implemented)
            search_query = search_query.where(
                DocumentChunk.content.ilike(f"%{query}%")
            )
            
            # Limit results
            search_query = search_query.limit(limit)
            
            # Execute search
            result = await self.db.execute(search_query)
            chunks = result.scalars().all()
            
            # Convert to search results
            search_results = []
            for chunk in chunks:
                search_results.append(SearchResult(
                    chunk_id=chunk.id,
                    document_id=chunk.document_id,
                    domain_id=chunk.document.domain_id,
                    domain_name=chunk.document.domain.name,
                    document_name=chunk.document.filename,
                    content=chunk.content,
                    chunk_index=chunk.chunk_index,
                    similarity_score=0.8,  # Placeholder until vector search
                    metadata=chunk.metadata,
                ))
            
            return search_results
            
        except Exception as e:
            logger.error(f"Context retrieval failed: {e}")
            raise
    
    async def generate_response(
        self,
        query: str,
        context: List[SearchResult],
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """Generate response using retrieved context and LLM"""
        try:
            # TODO: Implement actual LLM integration
            # For now, return a structured response based on context
            
            if not context:
                return "I don't have specific information about that topic in my knowledge base. Please try rephrasing your question or ask about a different topic."
            
            # Build response from context
            response_parts = []
            response_parts.append(f"Based on the available documents, here's what I found:\n\n")
            
            for i, result in enumerate(context, 1):
                response_parts.append(f"{i}. **{result.document_name}** (Domain: {result.domain_name}):\n")
                response_parts.append(f"   {result.content[:300]}...\n\n")
            
            response_parts.append("This is a placeholder response. The actual LLM integration will be implemented in the next phase.")
            
            return "".join(response_parts)
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            return "I encountered an error while generating a response. Please try again."
    
    async def rag_query(
        self,
        query: str,
        domain_id: Optional[UUID] = None,
        limit: int = 5,
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Complete RAG query: retrieve context and generate response"""
        try:
            # Retrieve relevant context
            context = await self.retrieve_context(
                query=query,
                domain_id=domain_id,
                limit=limit,
                similarity_threshold=0.7
            )
            
            # Generate response
            response = await self.generate_response(
                query=query,
                context=context,
                model_name=model_name,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return {
                "query": query,
                "response": response,
                "context": context,
                "context_count": len(context),
                "model_used": model_name or "placeholder",
                "parameters": {
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "similarity_threshold": 0.7
                }
            }
            
        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            raise
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available LLM models"""
        try:
            result = await self.db.execute(
                select(ExternalModel).where(ExternalModel.is_active == True)
            )
            models = result.scalars().all()
            
            model_list = []
            for model in models:
                model_list.append({
                    "id": str(model.id),
                    "name": model.name,
                    "provider": model.provider,
                    "model_type": model.model_type,
                    "is_active": model.is_active,
                    "config": model.config
                })
            
            return model_list
            
        except Exception as e:
            logger.error(f"Failed to get available models: {e}")
            return []
    
    async def validate_model_config(self, model_name: str) -> bool:
        """Validate that a model is properly configured"""
        try:
            result = await self.db.execute(
                select(ExternalModel).where(
                    and_(
                        ExternalModel.name == model_name,
                        ExternalModel.is_active == True
                    )
                )
            )
            model = result.scalar_one_or_none()
            
            if not model:
                return False
            
            # Check if required config fields are present
            config = model.config
            required_fields = []
            
            if model.provider == "openai":
                required_fields = ["api_key", "model"]
            elif model.provider == "anthropic":
                required_fields = ["api_key", "model"]
            
            for field in required_fields:
                if field not in config or not config[field]:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to validate model config for {model_name}: {e}")
            return False
    
    async def get_rag_statistics(
        self,
        domain_id: Optional[UUID] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get RAG system statistics"""
        try:
            # Get total documents
            doc_query = select(func.count(Document.id))
            if domain_id:
                doc_query = doc_query.where(Document.domain_id == domain_id)
            
            total_docs = await self.db.execute(doc_query)
            document_count = total_docs.scalar()
            
            # Get total chunks
            chunk_query = select(func.count(DocumentChunk.id))
            if domain_id:
                chunk_query = chunk_query.join(Document).where(Document.domain_id == domain_id)
            
            total_chunks = await self.db.execute(chunk_query)
            chunk_count = total_chunks.scalar()
            
            # Get chunks with embeddings
            embedding_query = select(func.count(DocumentChunk.id))
            if domain_id:
                embedding_query = embedding_query.join(Document).where(Document.domain_id == domain_id)
            embedding_query = embedding_query.where(DocumentChunk.embedding.isnot(None))
            
            total_embeddings = await self.db.execute(embedding_query)
            embedding_count = total_embeddings.scalar()
            
            # Get domain info
            domain_info = None
            if domain_id:
                domain_result = await self.db.execute(
                    select(Domain).where(Domain.id == domain_id)
                )
                domain = domain_result.scalar_one_or_none()
                if domain:
                    domain_info = {
                        "id": str(domain.id),
                        "name": domain.name,
                        "description": domain.description
                    }
            
            return {
                "document_count": document_count,
                "chunk_count": chunk_count,
                "embedding_count": embedding_count,
                "embedding_coverage": (embedding_count / chunk_count * 100) if chunk_count > 0 else 0,
                "domain_info": domain_info,
                "period_days": days,
                "system_status": "operational" if embedding_count > 0 else "needs_embeddings"
            }
            
        except Exception as e:
            logger.error(f"Failed to get RAG statistics: {e}")
            raise
    
    async def optimize_context(
        self,
        query: str,
        context: List[SearchResult],
        max_context_length: int = 2000
    ) -> List[SearchResult]:
        """Optimize context for response generation"""
        try:
            if not context:
                return []
            
            # Sort by similarity score (highest first)
            sorted_context = sorted(context, key=lambda x: x.similarity_score, reverse=True)
            
            # Calculate total length
            total_length = 0
            optimized_context = []
            
            for result in sorted_context:
                content_length = len(result.content)
                
                # Check if adding this result would exceed max length
                if total_length + content_length <= max_context_length:
                    optimized_context.append(result)
                    total_length += content_length
                else:
                    # Try to truncate this result to fit
                    remaining_length = max_context_length - total_length
                    if remaining_length > 100:  # Only add if we have meaningful space
                        truncated_result = result.copy()
                        truncated_result.content = result.content[:remaining_length] + "..."
                        optimized_context.append(truncated_result)
                    break
            
            return optimized_context
            
        except Exception as e:
            logger.error(f"Context optimization failed: {e}")
            return context
    
    async def get_query_suggestions(
        self,
        partial_query: str,
        domain_id: Optional[UUID] = None,
        limit: int = 5
    ) -> List[str]:
        """Get query suggestions based on partial input"""
        try:
            # TODO: Implement intelligent query suggestions
            # For now, return basic suggestions
            
            suggestions = [
                "What is the main topic of this document?",
                "Can you summarize the key points?",
                "What are the main conclusions?",
                "How does this relate to other documents?",
                "What are the implications of this information?"
            ]
            
            # Filter suggestions based on partial query
            if partial_query:
                filtered_suggestions = [
                    s for s in suggestions 
                    if partial_query.lower() in s.lower()
                ]
                return filtered_suggestions[:limit]
            
            return suggestions[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get query suggestions: {e}")
            return []
