"""
Test configuration and fixtures for API testing
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
from fastapi import Form, UploadFile, Query
from fastapi import status
from datetime import datetime, timezone, timedelta
from uuid import uuid4

# Create a minimal test app for now
def create_test_app():
    """Create a minimal test FastAPI application"""
    from fastapi import FastAPI, HTTPException, status, Form, UploadFile, File, Query
    from uuid import uuid4
    from datetime import datetime, timezone
    
    app = FastAPI(title="Test API", version="1.0.0")
    
    # Mock data for testing
    mock_domains = [
        {
            "id": str(uuid4()),
            "name": "Test Domain 1",
            "description": "A test domain for testing purposes",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "name": "Test Domain 2", 
            "description": "Another test domain",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    mock_documents = [
        {
            "id": str(uuid4()),
            "domain_id": mock_domains[0]["id"],
            "filename": "test_document1.pdf",
            "file_type": "pdf",
            "file_path": "/uploads/test_document1.pdf",
            "file_size": 1024000,
            "status": "uploaded",
            "metadata": {"uploaded_filename": "test_document1.pdf"},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "domain_id": mock_domains[0]["id"],
            "filename": "test_document2.txt",
            "file_type": "txt",
            "file_path": "/uploads/test_document2.txt",
            "file_size": 512000,
            "status": "processed",
            "metadata": {"uploaded_filename": "test_document2.txt"},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    mock_document_chunks = [
        {
            "id": str(uuid4()),
            "document_id": mock_documents[0]["id"],
            "chunk_index": 0,
            "content": "This is the first chunk of the document content.",
            "has_embedding": True,
            "metadata": {"chunk_size": 100},
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "document_id": mock_documents[0]["id"],
            "chunk_index": 1,
            "content": "This is the second chunk of the document content.",
            "has_embedding": True,
            "metadata": {"chunk_size": 100},
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    mock_domain_stats = {
        "domain_id": mock_domains[0]["id"],
        "domain_name": mock_domains[0]["name"],
        "document_count": 5,
        "chat_count": 3,
        "total_chunks": 150,
        "total_file_size_mb": 2.5,
        "last_activity": datetime.now(timezone.utc)
    }
    
    # Mock external models data
    mock_external_models = [
        {
            "id": "valid-model-id",
            "name": "gpt-4",
            "provider": "openai",
            "model_type": "chat",
            "is_active": True,
            "config": {"api_key": "mock_key", "temperature": 0.7},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "name": "claude-3",
            "provider": "anthropic",
            "model_type": "chat",
            "is_active": True,
            "config": {"api_key": "mock_key", "temperature": 0.7},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "name": "command",
            "provider": "cohere",
            "model_type": "completion",
            "is_active": False,
            "config": {"api_key": "mock_key", "temperature": 0.7},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
    
    @app.get("/api/v1/health")
    async def api_health_check():
        return {
            "status": "healthy", 
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "1.0.0",
            "environment": "testing"
        }
    
    @app.get("/api/v1/health/detailed")
    async def detailed_health_check():
        return {
            "status": "healthy",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "1.0.0",
            "environment": "testing",
            "response_time": 0.001,
            "services": {
                "database": {"status": "healthy", "type": "postgresql", "url": "localhost:5432"},
                "redis": {"status": "healthy", "type": "redis", "url": "localhost:6379"},
                "celery": {"status": "healthy", "type": "celery", "broker": "localhost:6379"}
            },
            "system": {
                "python_version": "3.11+",
                "fastapi_version": "0.104+",
                "sqlalchemy_version": "2.0+"
            }
        }
    
    @app.get("/api/v1/health/ready")
    async def readiness_check():
        return {
            "status": "ready",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "1.0.0",
            "environment": "testing"
        }
    
    # Domain endpoints
    @app.post("/api/v1/domains/", status_code=status.HTTP_201_CREATED)
    async def create_domain(domain_data: dict):
        """Create a new domain"""
        if not domain_data.get("name") or not domain_data["name"].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain name cannot be empty"
            )
        
        new_domain = {
            "id": str(uuid4()),
            "name": domain_data["name"],
            "description": domain_data.get("description"),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        mock_domains.append(new_domain)
        return new_domain
    
    @app.get("/api/v1/domains/")
    async def list_domains(skip: int = 0, limit: int = 100, search: str = None):
        """List domains with pagination and search"""
        domains = mock_domains
        
        # Apply search filter
        if search:
            domains = [d for d in domains if search.lower() in d["name"].lower() or 
                      (d["description"] and search.lower() in d["description"].lower())]
        
        # Apply pagination
        total = len(domains)
        domains = domains[skip:skip + limit]
        
        return {
            "domains": domains,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    @app.get("/api/v1/domains/{domain_id}")
    async def get_domain(domain_id: str):
        """Get a specific domain by ID"""
        domain = next((d for d in mock_domains if d["id"] == domain_id), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found"
            )
        return domain
    
    @app.put("/api/v1/domains/{domain_id}")
    async def update_domain(domain_id: str, domain_data: dict):
        """Update a domain"""
        domain = next((d for d in mock_domains if d["id"] == domain_id), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found"
            )
        
        if "name" in domain_data:
            if not domain_data["name"] or not domain_data["name"].strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Domain name cannot be empty"
                )
            domain["name"] = domain_data["name"].strip()
        
        if "description" in domain_data:
            domain["description"] = domain_data["description"]
        
        # Ensure timestamp is different by adding a small offset
        from datetime import timedelta
        domain["updated_at"] = datetime.now(timezone.utc) + timedelta(microseconds=1)
        return domain
    
    @app.delete("/api/v1/domains/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_domain(domain_id: str):
        """Delete a domain"""
        domain = next((d for d in mock_domains if d["id"] == domain_id), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found"
            )
        
        mock_domains.remove(domain)
        return None
    
    @app.get("/api/v1/domains/{domain_id}/stats")
    async def get_domain_stats(domain_id: str):
        """Get domain statistics"""
        domain = next((d for d in mock_domains if d["id"] == domain_id), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found"
            )
        
        return {
            "domain_id": domain_id,
            "domain_name": domain["name"],
            "document_count": 5,
            "chat_count": 3,
            "total_chunks": 150,
            "total_file_size_mb": 2.5,
            "last_activity": datetime.now(timezone.utc)
        }
    
    @app.get("/api/v1/domains/stats/overview")
    async def get_all_domains_stats():
        """Get statistics for all domains"""
        return [
            {
                "domain_id": d["id"],
                "domain_name": d["name"],
                "document_count": 5,
                "chat_count": 3,
                "total_chunks": 150,
                "total_file_size_mb": 2.5,
                "last_activity": datetime.now(timezone.utc)
            }
            for d in mock_domains
        ]
    
    # Document endpoints
    @app.post("/api/v1/documents/", status_code=status.HTTP_201_CREATED)
    async def create_document(domain_id: str = Form(...), file: UploadFile = File(...), metadata: str = Form(None)):
        """Create a new document"""
        # Validate domain exists
        domain = next((d for d in mock_domains if d["id"] == domain_id), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid domain ID"
            )
        
        # Validate file type
        file_type = file.filename.split(".")[-1].lower() if "." in file.filename else "txt"
        allowed_types = ['pdf', 'docx', 'txt', 'md', 'rtf']
        if file_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type must be one of: {', '.join(allowed_types)}"
            )
        
        # Create new document
        new_document = {
            "id": str(uuid4()),
            "domain_id": domain_id,
            "filename": file.filename or "unknown",
            "file_type": file_type,
            "file_path": f"/uploads/{file.filename}",
            "file_size": 1024000,  # Mock file size
            "status": "uploaded",
            "metadata": {"uploaded_filename": file.filename} if metadata else None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        mock_documents.append(new_document)
        return new_document
    
    @app.get("/api/v1/documents/")
    async def list_documents(
        domain_id: str = Query(None),
        skip: int = Query(0),
        limit: int = Query(100),
        status: str = Query(None),
        search: str = Query(None)
    ):
        """List documents with pagination and filters"""
        documents = mock_documents
        
        # Apply domain filter
        if domain_id:
            documents = [d for d in documents if d["domain_id"] == domain_id]
        
        # Apply status filter
        if status:
            documents = [d for d in documents if d["status"] == status]
        
        # Apply search filter
        if search:
            documents = [d for d in documents if search.lower() in d["filename"].lower()]
        
        # Apply pagination
        total = len(documents)
        documents = documents[skip:skip + limit]
        
        return {
            "documents": documents,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    @app.get("/api/v1/documents/{document_id}")
    async def get_document(document_id: str):
        """Get a specific document by ID"""
        document = next((d for d in mock_documents if d["id"] == document_id), None)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        return document
    
    @app.get("/api/v1/documents/{document_id}/with-chunks")
    async def get_document_with_chunks(document_id: str):
        """Get document with chunks by ID"""
        document = next((d for d in mock_documents if d["id"] == document_id), None)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Get chunks for this document
        chunks = [c for c in mock_document_chunks if c["document_id"] == document_id]
        
        return {
            **document,
            "chunks": chunks,
            "chunk_count": len(chunks)
        }
    
    @app.put("/api/v1/documents/{document_id}")
    async def update_document(document_id: str, document_data: dict):
        """Update a document"""
        document = next((d for d in mock_documents if d["id"] == document_id), None)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Update fields
        if "filename" in document_data:
            if not document_data["filename"] or not document_data["filename"].strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Filename cannot be empty"
                )
            document["filename"] = document_data["filename"].strip()
        
        if "metadata" in document_data:
            document["metadata"] = document_data["metadata"]
        
        if "status" in document_data:
            document["status"] = document_data["status"]
        
        document["updated_at"] = datetime.now(timezone.utc)
        return document
    
    @app.delete("/api/v1/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_document(document_id: str):
        """Delete a document"""
        document = next((d for d in mock_documents if d["id"] == document_id), None)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        mock_documents.remove(document)
        return None
    
    @app.patch("/api/v1/documents/{document_id}/status")
    async def update_document_status(document_id: str, status: str = Form(...)):
        """Update document processing status"""
        document = next((d for d in mock_documents if d["id"] == document_id), None)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        document["status"] = status
        document["updated_at"] = datetime.now(timezone.utc)
        return document
    
    @app.get("/api/v1/documents/{document_id}/chunks")
    async def get_document_chunks(document_id: str):
        """Get all chunks for a document"""
        document = next((d for d in mock_documents if d["id"] == document_id), None)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        chunks = [c for c in mock_document_chunks if c["document_id"] == document_id]
        return chunks
    
    # Mock chat data
    mock_chats = [
        {
            "id": str(uuid4()),
            "domain_id": mock_domains[0]["id"],
            "title": "Test Chat 1",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "domain_id": mock_domains[0]["id"],
            "title": "Test Chat 2",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    mock_chat_messages = [
        {
            "id": str(uuid4()),
            "chat_id": mock_chats[0]["id"],
            "role": "user",
            "content": "Hello, how can you help me?",
            "metadata": {"source": "user_input"},
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "chat_id": mock_chats[0]["id"],
            "role": "assistant",
            "content": "I can help you with information from your documents. What would you like to know?",
            "metadata": {"source": "ai_response"},
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid4()),
            "chat_id": mock_chats[1]["id"],
            "role": "user",
            "content": "Tell me about the project structure",
            "metadata": {"source": "user_input"},
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    # Chat endpoints
    @app.post("/api/v1/chats/", status_code=status.HTTP_201_CREATED)
    async def create_chat(chat_data: dict):
        """Create a new chat"""
        # Validate domain exists
        domain = next((d for d in mock_domains if d["id"] == chat_data["domain_id"]), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid domain ID"
            )
        
        # Create new chat
        new_chat = {
            "id": str(uuid4()),
            "domain_id": chat_data["domain_id"],
            "title": chat_data.get("title", "New Chat"),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        mock_chats.append(new_chat)
        return new_chat
    
    @app.get("/api/v1/chats/")
    async def list_chats(
        domain_id: str = Query(None),
        skip: int = Query(0),
        limit: int = Query(100),
        search: str = Query(None)
    ):
        """List chats with pagination and filters"""
        chats = mock_chats
        
        # Apply domain filter
        if domain_id:
            chats = [c for c in chats if c["domain_id"] == domain_id]
        
        # Apply search filter
        if search:
            chats = [c for c in chats if search.lower() in c["title"].lower()]
        
        # Apply pagination
        total = len(chats)
        chats = chats[skip:skip + limit]
        
        return {
            "chats": chats,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    
    @app.get("/api/v1/chats/{chat_id}")
    async def get_chat(chat_id: str):
        """Get a specific chat by ID"""
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        return chat
    
    @app.get("/api/v1/chats/{chat_id}/with-messages")
    async def get_chat_with_messages(chat_id: str):
        """Get chat with messages by ID"""
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # Get messages for this chat
        messages = [m for m in mock_chat_messages if m["chat_id"] == chat_id]
        
        return {
            **chat,
            "messages": messages,
            "message_count": len(messages)
        }
    
    @app.put("/api/v1/chats/{chat_id}")
    async def update_chat(chat_id: str, chat_data: dict):
        """Update a chat"""
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # Update fields
        if "title" in chat_data:
            if chat_data["title"] and len(chat_data["title"]) > 255:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Title too long"
                )
            chat["title"] = chat_data["title"]
        
        # Ensure timestamp is different by adding a small offset
        from datetime import timedelta
        chat["updated_at"] = datetime.now(timezone.utc) + timedelta(microseconds=1)
        return chat
    
    @app.delete("/api/v1/chats/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_chat(chat_id: str):
        """Delete a chat"""
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        mock_chats.remove(chat)
        return None
    
    @app.post("/api/v1/chats/{chat_id}/messages", status_code=status.HTTP_201_CREATED)
    async def add_message(chat_id: str, message_data: dict):
        """Add a message to a chat"""
        # Validate chat exists
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # Validate message content
        if not message_data.get("content") or not message_data["content"].strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message content cannot be empty"
            )
        
        # Validate role
        allowed_roles = ['user', 'assistant', 'system']
        role = message_data.get("role", "user").lower()
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role must be one of: {', '.join(allowed_roles)}"
            )
        
        # Create new message
        new_message = {
            "id": str(uuid4()),
            "chat_id": chat_id,
            "role": role,
            "content": message_data["content"].strip(),
            "metadata": message_data.get("metadata"),
            "created_at": datetime.now(timezone.utc)
        }
        
        mock_chat_messages.append(new_message)
        return new_message
    
    @app.get("/api/v1/chats/{chat_id}/messages")
    async def get_chat_messages(
        chat_id: str,
        skip: int = Query(0),
        limit: int = Query(100)
    ):
        """Get messages for a chat with pagination"""
        # Validate chat exists
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # Get messages for this chat
        messages = [m for m in mock_chat_messages if m["chat_id"] == chat_id]
        
        # Apply pagination
        total = len(messages)
        messages = messages[skip:skip + limit]
        
        return messages
    
    @app.put("/api/v1/chats/messages/{message_id}")
    async def update_message(message_id: str, content: str = Query(...)):
        """Update a chat message"""
        message = next((m for m in mock_chat_messages if m["id"] == message_id), None)
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        # Validate content
        if not content or not content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message content cannot be empty"
            )
        
        message["content"] = content.strip()
        return message
    
    @app.delete("/api/v1/chats/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_message(message_id: str):
        """Delete a chat message"""
        message = next((m for m in mock_chat_messages if m["id"] == message_id), None)
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        mock_chat_messages.remove(message)
        return None
    
    @app.get("/api/v1/chats/{chat_id}/statistics")
    async def get_chat_statistics(chat_id: str):
        """Get statistics for a chat"""
        # Validate chat exists
        chat = next((c for c in mock_chats if c["id"] == chat_id), None)
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        # Get messages for this chat
        messages = [m for m in mock_chat_messages if m["chat_id"] == chat_id]
        
        # Calculate statistics
        user_messages = [m for m in messages if m["role"] == "user"]
        assistant_messages = [m for m in messages if m["role"] == "assistant"]
        system_messages = [m for m in messages if m["role"] == "system"]
        
        return {
            "chat_id": chat_id,
            "total_messages": len(messages),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "system_messages": len(system_messages),
            "created_at": chat["created_at"],
            "last_activity": max([m["created_at"] for m in messages]) if messages else chat["created_at"]
        }
    
    # Search endpoints
    @app.post("/api/v1/search/semantic")
    async def semantic_search(
        query: str = Query(...),
        domain_id: str = Query(None),
        limit: int = Query(10),
        similarity_threshold: float = Query(0.7)
    ):
        """Perform semantic search using vector similarity"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty"
            )
        
        # Mock search results
        mock_results = [
            {
                "chunk_id": str(uuid4()),
                "document_id": mock_documents[0]["id"],
                "document_name": mock_documents[0]["filename"],
                "domain_id": mock_domains[0]["id"],
                "domain_name": mock_domains[0]["name"],
                "content": f"Mock content matching query: {query}",
                "chunk_index": 0,
                "similarity_score": 0.85,
                "metadata": {"source": "mock_search"}
            }
        ]
        
        # Filter by domain if specified
        if domain_id:
            # Create domain-specific results
            mock_results = [
                {
                    "chunk_id": str(uuid4()),
                    "document_id": mock_documents[0]["id"],
                    "document_name": mock_documents[0]["filename"],
                    "domain_id": domain_id,
                    "domain_name": "Filtered Domain",
                    "content": f"Domain-filtered content for: {query}",
                    "chunk_index": 0,
                    "similarity_score": 0.85,
                    "metadata": {"source": "domain_filtered_search"}
                }
            ]
        # else use default results (already set above)
        
        # Apply limit
        mock_results = mock_results[:limit]
        
        return {
            "query": query,
            "results": mock_results,
            "total_results": len(mock_results),
            "response_time": 0.15,
            "domain_id": domain_id,
            "similarity_threshold": similarity_threshold,
            "metadata": {"search_type": "semantic"}
        }
    
    @app.post("/api/v1/search/vector")
    async def vector_search(
        query: str = Query(...),
        domain_id: str = Query(None),
        limit: int = Query(10),
        similarity_threshold: float = Query(0.7)
    ):
        """Perform vector similarity search"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty"
            )
        
        # Mock vector search results
        mock_results = [
            {
                "chunk_id": str(uuid4()),
                "document_id": mock_documents[0]["id"],
                "document_name": mock_documents[0]["filename"],
                "domain_id": mock_domains[0]["id"],
                "domain_name": mock_domains[0]["name"],
                "content": f"Vector search result for: {query}",
                "chunk_index": 1,
                "similarity_score": 0.92,
                "metadata": {"source": "vector_search"}
            }
        ]
        
        # Filter by domain if specified
        if domain_id:
            # Create domain-specific results
            mock_results = [
                {
                    "chunk_id": str(uuid4()),
                    "document_id": mock_documents[0]["id"],
                    "document_name": mock_documents[0]["filename"],
                    "domain_id": domain_id,
                    "domain_name": "Filtered Domain",
                    "content": f"Domain-filtered vector result for: {query}",
                    "chunk_index": 1,
                    "similarity_score": 0.92,
                    "metadata": {"source": "domain_filtered_vector_search"}
                }
            ]
        
        # Apply limit
        mock_results = mock_results[:limit]
        
        return {
            "query": query,
            "results": mock_results,
            "total_results": len(mock_results),
            "response_time": 0.08,
            "domain_id": domain_id,
            "similarity_threshold": similarity_threshold,
            "metadata": {"search_type": "vector"}
        }
    
    @app.post("/api/v1/search/hybrid")
    async def hybrid_search(
        query: str = Query(...),
        domain_id: str = Query(None),
        limit: int = Query(10),
        semantic_weight: float = Query(0.7),
        vector_weight: float = Query(0.3)
    ):
        """Perform hybrid search combining semantic and vector search"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty"
            )
        
        # Validate weights
        if abs(semantic_weight + vector_weight - 1.0) > 0.01:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Semantic and vector weights must sum to 1.0"
            )
        
        # Mock hybrid search results
        mock_results = [
            {
                "chunk_id": str(uuid4()),
                "document_id": mock_documents[0]["id"],
                "document_name": mock_documents[0]["filename"],
                "domain_id": mock_domains[0]["id"],
                "domain_name": mock_domains[0]["name"],
                "content": f"Hybrid search result for: {query}",
                "chunk_index": 2,
                "similarity_score": 0.88,
                "metadata": {"source": "hybrid_search", "weights": {"semantic": semantic_weight, "vector": vector_weight}}
            }
        ]
        
        # Filter by domain if specified
        if domain_id:
            # Create domain-specific results
            mock_results = [
                {
                    "chunk_id": str(uuid4()),
                    "document_id": mock_documents[0]["id"],
                    "document_name": mock_documents[0]["filename"],
                    "domain_id": domain_id,
                    "domain_name": "Filtered Domain",
                    "content": f"Domain-filtered hybrid result for: {query}",
                    "chunk_index": 2,
                    "similarity_score": 0.88,
                    "metadata": {"source": "domain_filtered_hybrid_search", "weights": {"semantic": semantic_weight, "vector": vector_weight}}
                }
            ]
        
        # Apply limit
        mock_results = mock_results[:limit]
        
        return {
            "query": query,
            "results": mock_results,
            "total_results": len(mock_results),
            "response_time": 0.25,
            "domain_id": domain_id,
            "metadata": {"search_type": "hybrid", "weights": {"semantic": semantic_weight, "vector": vector_weight}}
        }
    
    @app.get("/api/v1/search/by-domain/{domain_id}")
    async def search_by_domain(
        domain_id: str,
        query: str = Query(...),
        limit: int = Query(10)
    ):
        """Search within a specific domain"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty"
            )
        
        # Validate domain exists
        domain = next((d for d in mock_domains if d["id"] == domain_id), None)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found"
            )
        
        # Mock domain-specific search results
        mock_results = [
            {
                "chunk_id": str(uuid4()),
                "document_id": mock_documents[0]["id"],
                "document_name": mock_documents[0]["filename"],
                "domain_id": domain_id,
                "domain_name": domain["name"],
                "content": f"Domain-specific result for: {query}",
                "chunk_index": 0,
                "similarity_score": 0.90,
                "metadata": {"source": "domain_search"}
            }
        ]
        
        # Apply limit
        mock_results = mock_results[:limit]
        
        return {
            "query": query,
            "results": mock_results,
            "total_results": len(mock_results),
            "response_time": 0.12,
            "domain_id": domain_id,
            "metadata": {"search_type": "domain_specific"}
        }
    
    @app.get("/api/v1/search/across-domains")
    async def search_across_domains(
        query: str = Query(...),
        limit: int = Query(10)
    ):
        """Search across all domains"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty"
            )
        
        # Mock cross-domain search results
        mock_results = [
            {
                "chunk_id": str(uuid4()),
                "document_id": mock_documents[0]["id"],
                "document_name": mock_documents[0]["filename"],
                "domain_id": mock_domains[0]["id"],
                "domain_name": mock_domains[0]["name"],
                "content": f"Cross-domain result for: {query}",
                "chunk_index": 0,
                "similarity_score": 0.87,
                "metadata": {"source": "cross_domain_search"}
            }
        ]
        
        # Apply limit
        mock_results = mock_results[:limit]
        
        return {
            "query": query,
            "results": mock_results,
            "total_results": len(mock_results),
            "response_time": 0.18,
            "domain_id": None,
            "metadata": {"search_type": "cross_domain"}
        }
    
    @app.get("/api/v1/search/suggestions")
    async def get_search_suggestions(
        partial_query: str = Query(...),
        limit: int = Query(5)
    ):
        """Get search suggestions based on partial query"""
        if not partial_query or not partial_query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Partial query cannot be empty"
            )
        
        # Mock suggestions
        suggestions = [
            f"{partial_query} example",
            f"{partial_query} test",
            f"{partial_query} sample",
            f"{partial_query} demo",
            f"{partial_query} tutorial"
        ][:limit]
        
        return {
            "suggestions": suggestions,
            "query": partial_query,
            "count": len(suggestions)
        }
    
    @app.get("/api/v1/search/analytics")
    async def get_search_analytics(
        domain_id: str = Query(None),
        days: int = Query(30)
    ):
        """Get search analytics and statistics"""
        if days < 1 or days > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Days must be between 1 and 365"
            )
        
        # Mock analytics data
        analytics = {
            "total_searches": 150,
            "unique_users": 25,
            "average_response_time": 0.15,
            "top_queries": ["test query", "example search", "demo question"],
            "domain_breakdown": {
                "domain_1": 45,
                "domain_2": 35,
                "domain_3": 70
            },
            "search_types": {
                "semantic": 60,
                "vector": 40,
                "hybrid": 50
            },
            "period_days": days
        }
        
        if domain_id:
            analytics["filtered_by_domain"] = domain_id
            analytics["total_searches"] = 45  # Mock filtered count
        
        return analytics
    
    @app.get("/api/v1/search/health")
    async def search_health_check():
        """Health check for search service"""
        return {
            "status": "healthy",
            "service": "search",
            "features": {
                "semantic_search": "available",
                "vector_search": "available",
                "hybrid_search": "available",
                "analytics": "available"
            }
        }
    
    # RAG endpoints
    @app.post("/api/v1/rag/query")
    async def rag_query(
        query: str = Query(...),
        domain_id: str = Query(None),
        limit: int = Query(5),
        model_name: str = Query(None),
        temperature: float = Query(0.7),
        max_tokens: int = Query(1000)
    ):
        """Perform RAG query: retrieve context and generate response"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        # Validate model if specified
        if model_name and model_name not in ["gpt-4", "gpt-3.5-turbo", "claude-3", "placeholder"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model '{model_name}' is not properly configured"
            )
        
        # Mock RAG response
        return {
            "query": query,
            "response": f"This is a mock RAG response to: {query}",
            "context_used": [
                {
                    "chunk_id": str(uuid4()),
                    "document_id": mock_documents[0]["id"],
                    "document_name": mock_documents[0]["filename"],
                    "domain_id": domain_id or mock_domains[0]["id"],
                    "domain_name": "Mock Domain",
                    "content": f"Mock context for query: {query}",
                    "chunk_index": 0,
                    "similarity_score": 0.85,
                    "metadata": {"source": "mock_rag"}
                }
            ],
            "model_used": model_name or "placeholder",
            "parameters": {
                "temperature": temperature,
                "max_tokens": max_tokens,
                "limit": limit
            },
            "processing_time": 0.45
        }
    
    @app.post("/api/v1/rag/retrieve-context")
    async def retrieve_context(
        query: str = Query(...),
        domain_id: str = Query(None),
        limit: int = Query(5),
        similarity_threshold: float = Query(0.7)
    ):
        """Retrieve relevant context for a query without generating response"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        # Mock context retrieval
        context = [
            {
                "chunk_id": str(uuid4()),
                "document_id": mock_documents[0]["id"],
                "document_name": mock_documents[0]["filename"],
                "domain_id": domain_id or mock_domains[0]["id"],
                "domain_name": "Mock Domain",
                "content": f"Mock context for: {query}",
                "chunk_index": 0,
                "similarity_score": 0.88,
                "metadata": {"source": "context_retrieval"}
            }
        ]
        
        return {
            "query": query,
            "context": context,
            "context_count": len(context),
            "similarity_threshold": similarity_threshold
        }
    
    @app.post("/api/v1/rag/generate-response")
    async def generate_response(
        query: str = Query(...),
        context: str = Query(...),
        model_name: str = Query(None),
        temperature: float = Query(0.7),
        max_tokens: int = Query(1000)
    ):
        """Generate response using provided context (without retrieval)"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        if not context or not context.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Context cannot be empty"
            )
        
        # Mock response generation
        return {
            "query": query,
            "response": f"Mock generated response based on context: {context[:100]}...",
            "context_used": context,
            "model_used": model_name or "placeholder",
            "parameters": {
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        }
    
    @app.get("/api/v1/rag/models")
    async def get_available_models():
        """Get list of available LLM models"""
        # Mock available models
        models = [
            {
                "name": "gpt-4",
                "provider": "openai",
                "status": "available",
                "capabilities": ["text-generation", "context-understanding"]
            },
            {
                "name": "gpt-3.5-turbo",
                "provider": "openai",
                "status": "available",
                "capabilities": ["text-generation", "fast-response"]
            },
            {
                "name": "claude-3",
                "provider": "anthropic",
                "status": "available",
                "capabilities": ["text-generation", "reasoning"]
            }
        ]
        
        return {
            "models": models,
            "count": len(models),
            "status": "available"
        }
    
    @app.get("/api/v1/rag/models/{model_name}/validate")
    async def validate_model_config(model_name: str):
        """Validate that a model is properly configured"""
        # Mock model validation
        valid_models = ["gpt-4", "gpt-3.5-turbo", "claude-3", "placeholder"]
        is_valid = model_name in valid_models
        
        return {
            "model_name": model_name,
            "is_valid": is_valid,
            "status": "configured" if is_valid else "not_configured"
        }
    
    @app.get("/api/v1/rag/statistics")
    async def get_rag_statistics(
        domain_id: str = Query(None),
        days: int = Query(30)
    ):
        """Get RAG system statistics"""
        if days < 1 or days > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Days must be between 1 and 365"
            )
        
        # Mock RAG statistics
        stats = {
            "total_queries": 250,
            "successful_queries": 245,
            "failed_queries": 5,
            "average_response_time": 0.45,
            "total_context_retrieved": 1250,
            "average_context_length": 1500,
            "model_usage": {
                "gpt-4": 120,
                "gpt-3.5-turbo": 80,
                "claude-3": 50
            },
            "period_days": days
        }
        
        if domain_id:
            stats["filtered_by_domain"] = domain_id
            stats["total_queries"] = 75  # Mock filtered count
        
        return stats
    
    @app.get("/api/v1/rag/suggestions")
    async def get_query_suggestions(
        partial_query: str = Query(...),
        domain_id: str = Query(None),
        limit: int = Query(5)
    ):
        """Get query suggestions based on partial input"""
        if not partial_query or not partial_query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Partial query cannot be empty"
            )
        
        # Mock query suggestions
        suggestions = [
            f"{partial_query} example",
            f"{partial_query} explanation",
            f"{partial_query} definition",
            f"{partial_query} analysis",
            f"{partial_query} comparison"
        ][:limit]
        
        return {
            "partial_query": partial_query,
            "suggestions": suggestions,
            "count": len(suggestions)
        }
    
    @app.post("/api/v1/rag/optimize-context")
    async def optimize_context(
        query: str = Query(...),
        context: str = Query(...),
        max_context_length: int = Query(2000)
    ):
        """Optimize context for response generation"""
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        if not context or not context.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Context cannot be empty"
            )
        
        if max_context_length < 500 or max_context_length > 10000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Max context length must be between 500 and 10000"
            )
        
        # Mock context optimization
        original_length = len(context)
        optimized_context = context[:max_context_length] if len(context) > max_context_length else context
        
        return {
            "query": query,
            "original_context_length": original_length,
            "optimized_context": optimized_context,
            "optimized_context_length": len(optimized_context),
            "max_context_length": max_context_length
        }
    
    @app.get("/api/v1/rag/health")
    async def rag_health_check():
        """Health check for RAG service"""
        return {
            "status": "healthy",
            "service": "rag",
            "features": {
                "context_retrieval": "available",
                "response_generation": "available",
                "model_management": "available",
                "context_optimization": "available",
                "query_suggestions": "available"
            },
            "llm_integration": "placeholder - to be implemented in next phase"
        }
    
    # External Models endpoints
    @app.post("/api/v1/external-models/")
    async def create_external_model(
        name: str = Query(...),
        provider: str = Query(...),
        model_type: str = Query(...),
        config: str = Query(...),
        is_active: bool = Query(True)
    ):
        """Create a new external model configuration"""
        if not name or not name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model name cannot be empty"
            )
        
        if provider not in ["openai", "anthropic", "cohere", "huggingface"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported provider"
            )
        
        if model_type not in ["chat", "completion", "embedding"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported model type"
            )
        
        # Validate JSON config
        try:
            import json
            config_dict = json.loads(config)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON configuration"
            )
        
        # Mock model creation
        new_model = {
            "id": str(uuid4()),
            "name": name,
            "provider": provider,
            "model_type": model_type,
            "is_active": is_active,
            "config": config_dict,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Add to our mock database
        nonlocal mock_external_models
        mock_external_models.append(new_model)
        
        return new_model
    
    @app.get("/api/v1/external-models/")
    async def list_external_models(
        provider: str = Query(None),
        model_type: str = Query(None),
        is_active: bool = Query(None)
    ):
        """List external models with filters"""
        # Use global mock external models
        mock_models = mock_external_models
        
        # Apply filters
        filtered_models = mock_models
        if provider:
            filtered_models = [m for m in filtered_models if m["provider"] == provider]
        if model_type:
            filtered_models = [m for m in filtered_models if m["model_type"] == model_type]
        if is_active is not None:
            filtered_models = [m for m in filtered_models if m["is_active"] == is_active]
        
        return {
            "models": filtered_models,
            "count": len(filtered_models),
            "filters": {
                "provider": provider,
                "model_type": model_type,
                "is_active": is_active
            }
        }
    
    @app.get("/api/v1/external-models/providers")
    async def get_supported_providers():
        """Get list of supported LLM providers"""
        return {
            "providers": [
                {
                    "name": "openai",
                    "description": "OpenAI GPT models and embeddings",
                    "supported_types": ["chat", "completion", "embedding"],
                    "website": "https://openai.com"
                },
                {
                    "name": "anthropic",
                    "description": "Anthropic Claude models",
                    "supported_types": ["chat", "completion"],
                    "website": "https://anthropic.com"
                },
                {
                    "name": "cohere",
                    "description": "Cohere command models and embeddings",
                    "supported_types": ["chat", "completion", "embedding"],
                    "website": "https://cohere.ai"
                },
                {
                    "name": "huggingface",
                    "description": "Hugging Face open source models",
                    "supported_types": ["chat", "completion", "embedding"],
                    "website": "https://huggingface.co"
                }
            ],
            "count": 4
        }
    
    @app.get("/api/v1/external-models/providers/{provider}/models")
    async def get_provider_models(provider: str):
        """Get available models for a specific provider"""
        if provider not in ["openai", "anthropic", "cohere", "huggingface"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported provider"
            )
        
        # Mock provider models
        provider_models = {
            "openai": ["gpt-4", "gpt-3.5-turbo", "text-embedding-ada-002"],
            "anthropic": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
            "cohere": ["command", "command-light", "embed-english-v3.0"],
            "huggingface": ["gpt2", "bert-base-uncased", "sentence-transformers/all-MiniLM-L6-v2"]
        }
        
        return {
            "provider": provider,
            "models": provider_models.get(provider, []),
            "count": len(provider_models.get(provider, []))
        }
    
    @app.get("/api/v1/external-models/health")
    async def external_models_health_check():
        """Health check for external models service"""
        return {
            "status": "healthy",
            "service": "external_models",
            "features": {
                "model_management": "available",
                "provider_support": "openai, anthropic, cohere, huggingface",
                "connection_testing": "available",
                "configuration_validation": "available"
            }
        }
    
    @app.get("/api/v1/external-models/{model_id}")
    async def get_external_model(model_id: str):
        """Get external model by ID"""
        # Check if model exists in our mock database
        model = next((m for m in mock_external_models if m["id"] == model_id), None)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        return model
    
    @app.put("/api/v1/external-models/{model_id}")
    async def update_external_model(
        model_id: str,
        name: str = Query(None),
        provider: str = Query(None),
        model_type: str = Query(None),
        config: str = Query(None),
        is_active: bool = Query(None)
    ):
        """Update external model"""
        # Find model in our mock database
        model = next((m for m in mock_external_models if m["id"] == model_id), None)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Validate provider if provided
        if provider and provider not in ["openai", "anthropic", "cohere", "huggingface"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported provider"
            )
        
        # Validate model type if provided
        if model_type and model_type not in ["chat", "completion", "embedding"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported model type"
            )
        
        # Validate JSON config if provided
        if config:
            try:
                import json
                json.loads(config)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON configuration"
                )
        
        # Update the model in our mock database
        if name is not None:
            model["name"] = name
        if provider is not None:
            model["provider"] = provider
        if model_type is not None:
            model["model_type"] = model_type
        if config is not None:
            model["config"] = json.loads(config)
        if is_active is not None:
            model["is_active"] = is_active
        
        model["updated_at"] = datetime.now(timezone.utc) + timedelta(microseconds=1)
        
        return model
    
    @app.delete("/api/v1/external-models/{model_id}")
    async def delete_external_model(model_id: str):
        """Delete external model"""
        # Find model in our mock database
        nonlocal mock_external_models
        model = next((m for m in mock_external_models if m["id"] == model_id), None)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Remove model from our mock database
        mock_external_models = [m for m in mock_external_models if m["id"] != model_id]
        
        # Mock successful deletion - return 204 No Content
        from fastapi.responses import Response
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    
    @app.post("/api/v1/external-models/{model_id}/test")
    async def test_model_connection(model_id: str):
        """Test connection to external model"""
        # Find model in our mock database
        model = next((m for m in mock_external_models if m["id"] == model_id), None)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Mock connection test result
        return {
            "model_id": model_id,
            "status": "connected",
            "response_time": 0.15,
            "capabilities": ["text-generation", "context-understanding"],
            "tested_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Auth endpoints (placeholder implementation for testing)
    @app.post("/api/v1/auth/login")
    async def login(
        username: str = Query(...),
        password: str = Query(...)
    ):
        """User login endpoint"""
        if not username or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required"
            )
        
        # Mock authentication
        if username == "testuser" and password == "testpass":
            return {
                "access_token": "mock_access_token_12345",
                "refresh_token": "mock_refresh_token_67890",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": "user-123",
                    "username": username,
                    "email": "test@example.com",
                    "is_active": True
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
    
    @app.post("/api/v1/auth/register")
    async def register(
        username: str = Query(...),
        email: str = Query(...),
        password: str = Query(...),
        confirm_password: str = Query(...)
    ):
        """User registration endpoint"""
        if not username or not email or not password or not confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All fields are required"
            )
        
        if password != confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Mock user creation
        new_user = {
            "id": str(uuid4()),
            "username": username,
            "email": email,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "message": "User registered successfully"
        }
        
        return new_user
    
    @app.post("/api/v1/auth/refresh")
    async def refresh_token(
        refresh_token: str = Query(...)
    ):
        """Refresh access token endpoint"""
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )
        
        # Mock token refresh
        if refresh_token == "mock_refresh_token_67890":
            return {
                "access_token": "new_mock_access_token_54321",
                "token_type": "bearer",
                "expires_in": 3600
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    
    @app.post("/api/v1/auth/logout")
    async def logout(
        access_token: str = Query(...)
    ):
        """User logout endpoint"""
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Access token is required"
            )
        
        # Mock logout
        return {
            "message": "Successfully logged out",
            "logged_out_at": datetime.now(timezone.utc).isoformat()
        }
    
    @app.get("/api/v1/auth/me")
    async def get_current_user(
        authorization: str = Query(...)
    ):
        """Get current user information endpoint"""
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Valid authorization header required"
            )
        
        token = authorization.replace("Bearer ", "")
        
        # Mock token validation
        if token == "mock_access_token_12345":
            return {
                "id": "user-123",
                "username": "testuser",
                "email": "test@example.com",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_login": datetime.now(timezone.utc).isoformat()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )
    
    @app.post("/api/v1/auth/forgot-password")
    async def forgot_password(
        email: str = Query(...)
    ):
        """Forgot password endpoint"""
        if not email or "@" not in email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valid email address is required"
            )
        
        # Mock password reset request
        return {
            "message": "Password reset email sent",
            "email": email,
            "reset_token": "mock_reset_token_abc123",
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        }
    
    @app.post("/api/v1/auth/reset-password")
    async def reset_password(
        reset_token: str = Query(...),
        new_password: str = Query(...),
        confirm_password: str = Query(...)
    ):
        """Reset password endpoint"""
        if not reset_token or not new_password or not confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All fields are required"
            )
        
        if new_password != confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Mock password reset
        if reset_token == "mock_reset_token_abc123":
            return {
                "message": "Password reset successfully",
                "reset_at": datetime.now(timezone.utc).isoformat()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
    
    @app.get("/api/v1/auth/health")
    async def auth_health_check():
        """Health check for authentication service"""
        return {
            "status": "healthy",
            "service": "authentication",
            "features": {
                "login": "available (mock)",
                "register": "available (mock)",
                "jwt": "available (mock)",
                "oauth": "not implemented",
                "password_reset": "available (mock)"
            },
            "note": "This is a mock implementation for testing purposes"
        }
    
    return app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client for the FastAPI application."""
    app = create_test_app()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_db_session():
    """Mock database session for unit tests."""
    mock = MagicMock()
    mock.add = AsyncMock()
    mock.commit = AsyncMock()
    mock.refresh = AsyncMock()
    mock.delete = AsyncMock()
    mock.execute = AsyncMock()
    mock.scalar_one = MagicMock()
    mock.scalars = MagicMock()
    
    # Configure default return values
    mock_result = MagicMock()
    mock_item = MagicMock()
    mock_item.id = 1
    mock_item.name = "Test Item"
    mock_result.scalar_one.return_value = mock_item
    mock_result.scalars.return_value.all.return_value = [
        MagicMock(id=i, name=f"Item {i}") for i in range(1, 6)
    ]
    mock.execute.return_value = mock_result
    
    return mock


@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    mock = MagicMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=True)
    mock.exists = AsyncMock(return_value=False)
    return mock


@pytest.fixture
def mock_celery():
    """Mock Celery client for testing."""
    mock = MagicMock()
    mock.send_task = AsyncMock(return_value=MagicMock(id="test-task-id"))
    mock.control.inspect.return_value.active.return_value = {"worker1": []}
    return mock


@pytest.fixture
def sample_domain_data():
    """Sample domain data for testing."""
    return {
        "name": "Test Domain",
        "description": "A test domain for testing purposes",
        "is_public": True
    }


@pytest.fixture
def sample_document_data():
    """Sample document data for testing."""
    return {
        "title": "Test Document",
        "description": "A test document for testing purposes",
        "file_type": "pdf",
        "file_size": 1024,
        "domain_id": 1
    }


@pytest.fixture
def sample_chat_data():
    """Sample chat data for testing."""
    return {
        "title": "Test Chat",
        "domain_id": 1,
        "is_public": True
    }


@pytest.fixture
def sample_search_query():
    """Sample search query for testing."""
    return {
        "query": "test search query",
        "domain_id": 1,
        "limit": 10
    }


@pytest.fixture
def sample_rag_request():
    """Sample RAG request for testing."""
    return {
        "query": "What is RAG?",
        "domain_id": 1,
        "max_tokens": 1000,
        "temperature": 0.7
    }


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    mock = MagicMock()
    mock.Embedding.create = AsyncMock(return_value=MagicMock(
        data=[{"embedding": [0.1] * 1536}]
    ))
    mock.ChatCompletion.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content="Test response"))]
    ))
    return mock


@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client for testing."""
    mock = MagicMock()
    mock.messages.create = AsyncMock(return_value=MagicMock(
        content=[MagicMock(text="Test response")]
    ))
    return mock


# API Testing Utilities
@pytest.fixture
def api_headers():
    """Default headers for API requests."""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


@pytest.fixture
def auth_headers():
    """Headers with authentication token."""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer test-token"
    }


@pytest.fixture
def admin_headers():
    """Headers with admin authentication."""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer admin-token",
        "X-User-Role": "admin"
    }
