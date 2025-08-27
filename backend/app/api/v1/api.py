"""
Main API router for version 1 endpoints
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health, domains, documents, chats, search, auth, users, rag, external_models

api_router = APIRouter()

# Health checks
api_router.include_router(health.router, tags=["health"])

# Authentication and user management
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Core business logic
api_router.include_router(domains.router, prefix="/domains", tags=["domains"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chats.router, prefix="/chats", tags=["chats"])

# Search and RAG
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])

# External model management
api_router.include_router(external_models.router, prefix="/external-models", tags=["external_models"])
