"""
Tests for chat management API endpoints
"""

import pytest
from fastapi import status


class TestChatEndpoints:
    """Test chat management endpoints"""
    
    def test_create_chat_success(self, client, api_headers):
        """Test successful chat creation"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Chat Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Chat data
        chat_data = {
            "domain_id": domain_id,
            "title": "Test Chat Session"
        }
        
        # Act
        response = client.post("/api/v1/chats/", json=chat_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["domain_id"] == domain_id
        assert data["title"] == chat_data["title"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_chat_without_title(self, client, api_headers):
        """Test chat creation without title (should use default)"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for No Title Chat Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Chat data without title
        chat_data = {"domain_id": domain_id}
        
        # Act
        response = client.post("/api/v1/chats/", json=chat_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["domain_id"] == domain_id
        assert data["title"] == "New Chat"  # Default title
        assert "id" in data
    
    def test_create_chat_invalid_domain(self, client, api_headers):
        """Test chat creation with invalid domain ID"""
        # Arrange
        invalid_domain_id = "00000000-0000-0000-0000-000000000000"
        chat_data = {
            "domain_id": invalid_domain_id,
            "title": "Test Chat"
        }
        
        # Act
        response = client.post("/api/v1/chats/", json=chat_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Invalid domain ID" in data["detail"]
    
    def test_list_chats_default(self, client, api_headers):
        """Test listing chats with default parameters"""
        # Act
        response = client.get("/api/v1/chats/", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "chats" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert data["skip"] == 0
        assert data["limit"] == 100
        assert len(data["chats"]) >= 0  # May be 0 initially
    
    def test_list_chats_with_pagination(self, client, api_headers):
        """Test listing chats with pagination"""
        # Act
        response = client.get("/api/v1/chats/?skip=0&limit=1", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["skip"] == 0
        assert data["limit"] == 1
        assert len(data["chats"]) <= 1
    
    def test_list_chats_with_domain_filter(self, client, api_headers):
        """Test listing chats filtered by domain"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Chat Filter Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Create a chat in this domain
        chat_data = {"domain_id": domain_id, "title": "Filter Test Chat"}
        client.post("/api/v1/chats/", json=chat_data, headers=api_headers)
        
        # Act - Filter by domain
        response = client.get(f"/api/v1/chats/?domain_id={domain_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Even if no chats exist, the endpoint should work
        assert "chats" in data
        assert "total" in data
    
    def test_list_chats_with_search(self, client, api_headers):
        """Test listing chats with search functionality"""
        # Act - Search for chats
        response = client.get("/api/v1/chats/?search=test", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "chats" in data
        if len(data["chats"]) > 0:
            for chat in data["chats"]:
                assert "test" in chat["title"].lower()
    
    def test_get_chat_success(self, client, api_headers):
        """Test getting a specific chat by ID"""
        # First, create a chat to get its ID
        domain_data = {"name": "Domain for Get Chat Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Get Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Act
        response = client.get(f"/api/v1/chats/{chat_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == chat_id
        assert data["title"] == "Get Test Chat"
    
    def test_get_chat_not_found(self, client, api_headers):
        """Test getting a chat that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/chats/{non_existent_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_get_chat_with_messages_success(self, client, api_headers):
        """Test getting a chat with its messages"""
        # First, create a chat to get its ID
        domain_data = {"name": "Domain for Chat Messages Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Messages Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Act
        response = client.get(f"/api/v1/chats/{chat_id}/with-messages", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == chat_id
        assert "messages" in data
        assert "message_count" in data
        assert isinstance(data["messages"], list)
    
    def test_get_chat_with_messages_not_found(self, client, api_headers):
        """Test getting chat messages for non-existent chat"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/chats/{non_existent_id}/with-messages", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_update_chat_success(self, client, api_headers):
        """Test successful chat update"""
        # First, create a chat to update
        domain_data = {"name": "Domain for Update Chat Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Update Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Update data
        update_data = {"title": "Updated Chat Title"}
        
        # Act
        response = client.put(f"/api/v1/chats/{chat_id}", json=update_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["id"] == chat_id
    
    def test_update_chat_not_found(self, client, api_headers):
        """Test updating a chat that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        update_data = {"title": "Updated Title"}
        
        # Act
        response = client.put(f"/api/v1/chats/{non_existent_id}", json=update_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_update_chat_title_too_long(self, client, api_headers):
        """Test updating chat with title that's too long"""
        # First, create a chat to update
        domain_data = {"name": "Domain for Long Title Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Long Title Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Update with title that's too long
        long_title = "A" * 256  # 256 characters (exceeds 255 limit)
        update_data = {"title": long_title}
        
        # Act
        response = client.put(f"/api/v1/chats/{chat_id}", json=update_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Title too long" in data["detail"]
    
    def test_delete_chat_success(self, client, api_headers):
        """Test successful chat deletion"""
        # First, create a chat to delete
        domain_data = {"name": "Domain for Delete Chat Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Delete Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Act
        response = client.delete(f"/api/v1/chats/{chat_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify chat was deleted
        get_response = client.get(f"/api/v1/chats/{chat_id}", headers=api_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_chat_not_found(self, client, api_headers):
        """Test deleting a chat that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.delete(f"/api/v1/chats/{non_existent_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_add_message_success(self, client, api_headers):
        """Test successful message addition to chat"""
        # First, create a chat to add message to
        domain_data = {"name": "Domain for Add Message Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Add Message Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Message data
        message_data = {
            "role": "user",
            "content": "This is a test message"
        }
        
        # Act
        response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["chat_id"] == chat_id
        assert data["role"] == message_data["role"]
        assert data["content"] == message_data["content"]
        assert "id" in data
        assert "created_at" in data
    
    def test_add_message_invalid_role(self, client, api_headers):
        """Test adding message with invalid role"""
        # First, create a chat to add message to
        domain_data = {"name": "Domain for Invalid Role Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Invalid Role Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Message data with invalid role
        message_data = {
            "role": "invalid_role",
            "content": "This is a test message"
        }
        
        # Act
        response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Role must be one of:" in data["detail"]
    
    def test_add_message_empty_content(self, client, api_headers):
        """Test adding message with empty content"""
        # First, create a chat to add message to
        domain_data = {"name": "Domain for Empty Content Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Empty Content Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Message data with empty content
        message_data = {
            "role": "user",
            "content": ""
        }
        
        # Act
        response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Message content cannot be empty" in data["detail"]
    
    def test_add_message_chat_not_found(self, client, api_headers):
        """Test adding message to non-existent chat"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        message_data = {
            "role": "user",
            "content": "This is a test message"
        }
        
        # Act
        response = client.post(f"/api/v1/chats/{non_existent_id}/messages", json=message_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_get_chat_messages_success(self, client, api_headers):
        """Test getting messages for a chat"""
        # First, create a chat to get messages for
        domain_data = {"name": "Domain for Get Messages Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Get Messages Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Act
        response = client.get(f"/api/v1/chats/{chat_id}/messages", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            message = data[0]
            assert "id" in message
            assert "chat_id" in message
            assert "role" in message
            assert "content" in message
            assert "created_at" in message
    
    def test_get_chat_messages_chat_not_found(self, client, api_headers):
        """Test getting messages for non-existent chat"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/chats/{non_existent_id}/messages", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_update_message_success(self, client, api_headers):
        """Test successful message update"""
        # First, create a chat and add a message
        domain_data = {"name": "Domain for Update Message Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Update Message Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Add a message
        message_data = {"role": "user", "content": "Original message"}
        add_message_response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        message_id = add_message_response.json()["id"]
        
        # Update the message
        new_content = "Updated message content"
        
        # Act
        response = client.put(f"/api/v1/chats/messages/{message_id}?content={new_content}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["content"] == new_content
        assert data["id"] == message_id
    
    def test_update_message_not_found(self, client, api_headers):
        """Test updating a message that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        new_content = "Updated content"
        
        # Act
        response = client.put(f"/api/v1/chats/messages/{non_existent_id}?content={new_content}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Message not found" in data["detail"]
    
    def test_update_message_empty_content(self, client, api_headers):
        """Test updating message with empty content"""
        # First, create a chat and add a message
        domain_data = {"name": "Domain for Empty Update Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Empty Update Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Add a message
        message_data = {"role": "user", "content": "Original message"}
        add_message_response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        message_id = add_message_response.json()["id"]
        
        # Try to update with empty content
        empty_content = ""
        
        # Act
        response = client.put(f"/api/v1/chats/messages/{message_id}?content={empty_content}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Message content cannot be empty" in data["detail"]
    
    def test_delete_message_success(self, client, api_headers):
        """Test successful message deletion"""
        # First, create a chat and add a message
        domain_data = {"name": "Domain for Delete Message Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Delete Message Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Add a message
        message_data = {"role": "user", "content": "Message to delete"}
        add_message_response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        message_id = add_message_response.json()["id"]
        
        # Act
        response = client.delete(f"/api/v1/chats/messages/{message_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
    
    def test_delete_message_not_found(self, client, api_headers):
        """Test deleting a message that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.delete(f"/api/v1/chats/messages/{non_existent_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Message not found" in data["detail"]
    
    def test_get_chat_statistics_success(self, client, api_headers):
        """Test getting chat statistics"""
        # First, create a chat to get statistics for
        domain_data = {"name": "Domain for Statistics Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Statistics Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Act
        response = client.get(f"/api/v1/chats/{chat_id}/statistics", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["chat_id"] == chat_id
        assert "total_messages" in data
        assert "user_messages" in data
        assert "assistant_messages" in data
        assert "system_messages" in data
        assert "created_at" in data
        assert "last_activity" in data
    
    def test_get_chat_statistics_not_found(self, client, api_headers):
        """Test getting statistics for non-existent chat"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/chats/{non_existent_id}/statistics", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Chat not found" in data["detail"]
    
    def test_chat_endpoints_headers(self, client, api_headers):
        """Test that chat endpoints return proper headers"""
        # Test list chats
        response = client.get("/api/v1/chats/", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test get chat (if chats exist)
        if response.json()["chats"]:
            chat_id = response.json()["chats"][0]["id"]
            response = client.get(f"/api/v1/chats/{chat_id}", headers=api_headers)
            assert response.status_code == status.HTTP_200_OK
            assert response.headers["content-type"] == "application/json"
    
    def test_chat_data_structure(self, client, api_headers):
        """Test that chat responses have correct structure"""
        # Get list of chats
        response = client.get("/api/v1/chats/", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        if len(data["chats"]) > 0:
            chat = data["chats"][0]
            
            # Check required fields
            assert "id" in chat
            assert "domain_id" in chat
            assert "title" in chat
            assert "created_at" in chat
            assert "updated_at" in chat
            
            # Check data types
            assert isinstance(chat["id"], str)
            assert isinstance(chat["domain_id"], str)
            assert isinstance(chat["title"], str)
    
    def test_chat_message_data_structure(self, client, api_headers):
        """Test that chat message responses have correct structure"""
        # First, create a chat and add a message
        domain_data = {"name": "Domain for Message Structure Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        create_chat_response = client.post(
            "/api/v1/chats/",
            json={"domain_id": domain_id, "title": "Message Structure Test Chat"},
            headers=api_headers
        )
        chat_id = create_chat_response.json()["id"]
        
        # Add a message
        message_data = {"role": "user", "content": "Test message for structure validation"}
        add_message_response = client.post(f"/api/v1/chats/{chat_id}/messages", json=message_data, headers=api_headers)
        
        # Get the message
        message_id = add_message_response.json()["id"]
        get_message_response = client.get(f"/api/v1/chats/{chat_id}/messages", headers=api_headers)
        
        assert get_message_response.status_code == status.HTTP_200_OK
        messages = get_message_response.json()
        
        if len(messages) > 0:
            message = messages[0]
            
            # Check required fields
            assert "id" in message
            assert "chat_id" in message
            assert "role" in message
            assert "content" in message
            assert "created_at" in message
            
            # Check data types
            assert isinstance(message["id"], str)
            assert isinstance(message["chat_id"], str)
            assert isinstance(message["role"], str)
            assert isinstance(message["content"], str)
    
    def test_chat_crud_workflow(self, client, api_headers):
        """Test complete CRUD workflow for chats"""
        # 1. Create domain
        domain_data = {"name": "CRUD Test Domain for Chats"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # 2. Create chat
        chat_data = {"domain_id": domain_id, "title": "CRUD Test Chat"}
        create_chat_response = client.post("/api/v1/chats/", json=chat_data, headers=api_headers)
        assert create_chat_response.status_code == status.HTTP_201_CREATED
        
        chat_id = create_chat_response.json()["id"]
        original_chat = create_chat_response.json()
        
        # 3. Read chat
        read_response = client.get(f"/api/v1/chats/{chat_id}", headers=api_headers)
        assert read_response.status_code == status.HTTP_200_OK
        assert read_response.json()["id"] == chat_id
        
        # 4. Update chat
        update_data = {"title": "Updated CRUD Chat"}
        update_response = client.put(f"/api/v1/chats/{chat_id}", json=update_data, headers=api_headers)
        assert update_response.status_code == status.HTTP_200_OK
        
        updated_chat = update_response.json()
        assert updated_chat["title"] == update_data["title"]
        assert updated_chat["id"] == chat_id
        assert updated_chat["updated_at"] != original_chat["updated_at"]
        
        # 5. Delete chat
        delete_response = client.delete(f"/api/v1/chats/{chat_id}", headers=api_headers)
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        
        # 6. Verify deletion
        verify_response = client.get(f"/api/v1/chats/{chat_id}", headers=api_headers)
        assert verify_response.status_code == status.HTTP_404_NOT_FOUND
