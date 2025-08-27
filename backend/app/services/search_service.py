"""
Search service for business logic
"""

import logging
import time
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentChunk
from app.models.domain import Domain
from app.models.vector_search_log import VectorSearchLog
from app.schemas.search import SearchQuery, SearchResponse, SearchResult, VectorSearchQuery
from app.core.config import settings

logger = logging.getLogger(__name__)


class SearchService:
    """Service for search operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def semantic_search(
        self,
        query: str,
        domain_id: Optional[UUID] = None,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> SearchResponse:
        """Perform semantic search using vector similarity"""
        start_time = time.time()
        
        try:
            # TODO: Implement OpenAI embedding for query
            # For now, we'll do a basic text search
            # query_embedding = await self._get_query_embedding(query)
            
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
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Log search
            await self._log_search(
                query=query,
                results_count=len(search_results),
                response_time=response_time,
                search_type="semantic",
                domain_id=domain_id,
            )
            
            return SearchResponse(
                query=query,
                results=search_results,
                total_results=len(search_results),
                response_time=response_time,
                search_type="semantic",
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Semantic search failed: {e}")
            
            # Log failed search
            await self._log_search(
                query=query,
                results_count=0,
                response_time=response_time,
                search_type="semantic",
                domain_id=domain_id,
                error=str(e),
            )
            
            raise
    
    async def vector_search(
        self,
        query: str,
        domain_id: Optional[UUID] = None,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> SearchResponse:
        """Perform vector similarity search"""
        start_time = time.time()
        
        try:
            # TODO: Implement OpenAI embedding for query
            # query_embedding = await self._get_query_embedding(query)
            
            # For now, return empty results until vector search is implemented
            search_results = []
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Log search
            await self._log_search(
                query=query,
                results_count=len(search_results),
                response_time=response_time,
                search_type="vector",
                domain_id=domain_id,
            )
            
            return SearchResponse(
                query=query,
                results=search_results,
                total_results=len(search_results),
                response_time=response_time,
                search_type="vector",
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Vector search failed: {e}")
            
            # Log failed search
            await self._log_search(
                query=query,
                results_count=0,
                response_time=response_time,
                search_type="vector",
                domain_id=domain_id,
                error=str(e),
            )
            
            raise
    
    async def hybrid_search(
        self,
        query: str,
        domain_id: Optional[UUID] = None,
        limit: int = 10,
        semantic_weight: float = 0.7,
        vector_weight: float = 0.3
    ) -> SearchResponse:
        """Perform hybrid search combining semantic and vector search"""
        start_time = time.time()
        
        try:
            # Perform both search types
            semantic_results = await self.semantic_search(
                query=query,
                domain_id=domain_id,
                limit=limit,
            )
            
            vector_results = await self.vector_search(
                query=query,
                domain_id=domain_id,
                limit=limit,
            )
            
            # Combine and rank results
            combined_results = self._combine_search_results(
                semantic_results.results,
                vector_results.results,
                semantic_weight,
                vector_weight,
                limit
            )
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Log search
            await self._log_search(
                query=query,
                results_count=len(combined_results),
                response_time=response_time,
                search_type="hybrid",
                domain_id=domain_id,
            )
            
            return SearchResponse(
                query=query,
                results=combined_results,
                total_results=len(combined_results),
                response_time=response_time,
                search_type="hybrid",
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Hybrid search failed: {e}")
            
            # Log failed search
            await self._log_search(
                query=query,
                results_count=0,
                response_time=response_time,
                search_type="hybrid",
                domain_id=domain_id,
                error=str(e),
            )
            
            raise
    
    async def search_by_domain(
        self,
        query: str,
        domain_id: UUID,
        limit: int = 10
    ) -> SearchResponse:
        """Search within a specific domain"""
        return await self.semantic_search(
            query=query,
            domain_id=domain_id,
            limit=limit,
        )
    
    async def search_across_domains(
        self,
        query: str,
        limit: int = 10
    ) -> SearchResponse:
        """Search across all domains"""
        return await self.semantic_search(
            query=query,
            domain_id=None,
            limit=limit,
        )
    
    async def get_search_suggestions(
        self,
        partial_query: str,
        limit: int = 5
    ) -> List[str]:
        """Get search suggestions based on partial query"""
        try:
            # Search for similar queries in search logs
            result = await self.db.execute(
                select(VectorSearchLog.query)
                .where(VectorSearchLog.query.ilike(f"%{partial_query}%"))
                .group_by(VectorSearchLog.query)
                .order_by(func.count(VectorSearchLog.id).desc())
                .limit(limit)
            )
            
            suggestions = result.scalars().all()
            return list(suggestions)
            
        except Exception as e:
            logger.error(f"Failed to get search suggestions: {e}")
            return []
    
    async def get_search_analytics(
        self,
        domain_id: Optional[UUID] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get search analytics and statistics"""
        try:
            # Build base query
            base_query = select(VectorSearchLog)
            if domain_id:
                base_query = base_query.where(VectorSearchLog.metadata.contains({"domain_id": str(domain_id)}))
            
            # Get total searches
            total_result = await self.db.execute(
                select(func.count(VectorSearchLog.id))
            )
            total_searches = total_result.scalar()
            
            # Get searches by type
            type_result = await self.db.execute(
                select(
                    VectorSearchLog.metadata['search_type'].label('search_type'),
                    func.count(VectorSearchLog.id).label('count')
                )
                .group_by(text("metadata->>'search_type'"))
            )
            searches_by_type = {row.search_type: row.count for row in type_result}
            
            # Get average response time
            avg_time_result = await self.db.execute(
                select(func.avg(VectorSearchLog.response_time))
            )
            avg_response_time = avg_time_result.scalar() or 0
            
            # Get top queries
            top_queries_result = await self.db.execute(
                select(
                    VectorSearchLog.query,
                    func.count(VectorSearchLog.id).label('count')
                )
                .group_by(VectorSearchLog.query)
                .order_by(func.count(VectorSearchLog.id).desc())
                .limit(10)
            )
            top_queries = [{"query": row.query, "count": row.count} for row in top_queries_result]
            
            return {
                "total_searches": total_searches,
                "searches_by_type": searches_by_type,
                "average_response_time": avg_response_time,
                "top_queries": top_queries,
                "domain_id": domain_id,
                "period_days": days,
            }
            
        except Exception as e:
            logger.error(f"Failed to get search analytics: {e}")
            raise
    
    def _combine_search_results(
        self,
        semantic_results: List[SearchResult],
        vector_results: List[SearchResult],
        semantic_weight: float,
        vector_weight: float,
        limit: int
    ) -> List[SearchResult]:
        """Combine and rank search results from different search types"""
        # Create a dictionary to store combined results
        combined_dict = {}
        
        # Add semantic results with weight
        for result in semantic_results:
            combined_dict[result.chunk_id] = {
                "result": result,
                "semantic_score": result.similarity_score * semantic_weight,
                "vector_score": 0,
                "combined_score": result.similarity_score * semantic_weight,
            }
        
        # Add vector results with weight
        for result in vector_results:
            if result.chunk_id in combined_dict:
                # Update existing result
                combined_dict[result.chunk_id]["vector_score"] = result.similarity_score * vector_weight
                combined_dict[result.chunk_id]["combined_score"] += result.similarity_score * vector_weight
            else:
                # Add new result
                combined_dict[result.chunk_id] = {
                    "result": result,
                    "semantic_score": 0,
                    "vector_score": result.similarity_score * vector_weight,
                    "combined_score": result.similarity_score * vector_weight,
                }
        
        # Sort by combined score and return top results
        sorted_results = sorted(
            combined_dict.values(),
            key=lambda x: x["combined_score"],
            reverse=True
        )
        
        return [item["result"] for item in sorted_results[:limit]]
    
    async def _log_search(
        self,
        query: str,
        results_count: int,
        response_time: float,
        search_type: str,
        domain_id: Optional[UUID] = None,
        error: Optional[str] = None
    ) -> None:
        """Log search operation"""
        try:
            metadata = {
                "search_type": search_type,
                "domain_id": str(domain_id) if domain_id else None,
                "error": error,
            }
            
            search_log = VectorSearchLog(
                query=query,
                results_count=results_count,
                response_time=response_time,
                metadata=metadata,
            )
            
            self.db.add(search_log)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to log search: {e}")
            # Don't raise here as it's not critical
    
    async def _get_query_embedding(self, query: str) -> List[float]:
        """Get vector embedding for a query (placeholder)"""
        # TODO: Implement OpenAI embedding
        # This is a placeholder that returns a dummy embedding
        return [0.0] * 1536  # OpenAI embedding dimension
