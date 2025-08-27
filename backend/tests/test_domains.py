"""
Tests for domains endpoint
"""

import pytest
from fastapi import status
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock


class TestDomainsEndpoint:
    """Test domains endpoint functionality"""
    
    @pytest.mark.api
    async def test_create_domain(self, async_client: AsyncClient, sample_domain_data: dict):
        """Test creating a new domain"""
        response = await async_client.post(
            "/api/v1/domains/",
            json=sample_domain_data
        )
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "description" in data
        assert "is_public" in data
        assert "created_at" in data
        assert "updated_at" in data
        
        # Check data matches input
        assert data["name"] == sample_domain_data["name"]
        assert data["description"] == sample_domain_data["description"]
        assert data["is_public"] == sample_domain_data["is_public"]
    
    @pytest.mark.api
    async def test_create_domain_invalid_data(self, async_client: AsyncClient):
        """Test creating domain with invalid data"""
        invalid_data = {"name": ""}  # Missing required fields
        
        response = await async_client.post(
            "/api/v1/domains/",
            json=invalid_data
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    @pytest.mark.api
    async def test_get_domains_list(self, async_client: AsyncClient):
        """Test getting list of domains"""
        response = await async_client.get("/api/v1/domains/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert "pages" in data
        
        # Check data types
        assert isinstance(data["items"], list)
        assert isinstance(data["total"], int)
        assert isinstance(data["page"], int)
        assert isinstance(data["size"], int)
        assert isinstance(data["pages"], int)
    
    @pytest.mark.api
    async def test_get_domains_with_pagination(self, async_client: AsyncClient):
        """Test getting domains with pagination parameters"""
        response = await async_client.get("/api/v1/domains/?page=1&size=5")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["page"] == 1
        assert data["size"] == 5
    
    @pytest.mark.api
    async def test_get_domains_with_search(self, async_client: AsyncClient):
        """Test getting domains with search parameter"""
        response = await async_client.get("/api/v1/domains/?search=test")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "items" in data
    
    @pytest.mark.api
    async def test_get_domain_by_id(self, async_client: AsyncClient):
        """Test getting a specific domain by ID"""
        # First create a domain
        domain_data = {
            "name": "Test Domain for Get",
            "description": "Domain to test get by ID",
            "is_public": True
        }
        
        create_response = await async_client.post(
            "/api/v1/domains/",
            json=domain_data
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        
        domain_id = create_response.json()["id"]
        
        # Now get the domain by ID
        response = await async_client.get(f"/api/v1/domains/{domain_id}")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["id"] == domain_id
        assert data["name"] == domain_data["name"]
        assert data["description"] == domain_data["description"]
    
    @pytest.mark.api
    async def test_get_domain_not_found(self, async_client: AsyncClient):
        """Test getting a domain that doesn't exist"""
        response = await async_client.get("/api/v1/domains/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.api
    async def test_update_domain(self, async_client: AsyncClient):
        """Test updating a domain"""
        # First create a domain
        domain_data = {
            "name": "Test Domain for Update",
            "description": "Domain to test update",
            "is_public": True
        }
        
        create_response = await async_client.post(
            "/api/v1/domains/",
            json=domain_data
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        
        domain_id = create_response.json()["id"]
        
        # Update the domain
        update_data = {
            "name": "Updated Domain Name",
            "description": "Updated description",
            "is_public": False
        }
        
        response = await async_client.put(
            f"/api/v1/domains/{domain_id}",
            json=update_data
        )
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["is_public"] == update_data["is_public"]
    
    @pytest.mark.api
    async def test_update_domain_not_found(self, async_client: AsyncClient):
        """Test updating a domain that doesn't exist"""
        update_data = {
            "name": "Updated Name",
            "description": "Updated description"
        }
        
        response = await async_client.put(
            "/api/v1/domains/99999",
            json=update_data
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.api
    async def test_delete_domain(self, async_client: AsyncClient):
        """Test deleting a domain"""
        # First create a domain
        domain_data = {
            "name": "Test Domain for Delete",
            "description": "Domain to test delete",
            "is_public": True
        }
        
        create_response = await async_client.post(
            "/api/v1/domains/",
            json=domain_data
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        
        domain_id = create_response.json()["id"]
        
        # Delete the domain
        response = await async_client.delete(f"/api/v1/domains/{domain_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify domain is deleted
        get_response = await async_client.get(f"/api/v1/domains/{domain_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.api
    async def test_delete_domain_not_found(self, async_client: AsyncClient):
        """Test deleting a domain that doesn't exist"""
        response = await async_client.delete("/api/v1/domains/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    @pytest.mark.api
    async def test_get_domain_statistics(self, async_client: AsyncClient):
        """Test getting domain statistics"""
        response = await async_client.get("/api/v1/domains/statistics")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "total_domains" in data
        assert "public_domains" in data
        assert "private_domains" in data
        assert "total_documents" in data
        assert "total_chats" in data
        
        # Check data types
        assert isinstance(data["total_domains"], int)
        assert isinstance(data["public_domains"], int)
        assert isinstance(data["private_domains"], int)
        assert isinstance(data["total_documents"], int)
        assert isinstance(data["total_chats"], int)
