"""
Tests for document management API endpoints
"""

import pytest
from fastapi import status


class TestDocumentEndpoints:
    """Test document management endpoints"""
    
    def test_list_documents_default(self, client, api_headers):
        """Test listing documents with default parameters"""
        # Act
        response = client.get("/api/v1/documents/", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "documents" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert data["skip"] == 0
        assert data["limit"] == 100
        assert len(data["documents"]) >= 0  # May be 0 initially
    
    def test_list_documents_with_pagination(self, client, api_headers):
        """Test listing documents with pagination"""
        # Act
        response = client.get("/api/v1/documents/?skip=0&limit=1", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["skip"] == 0
        assert data["limit"] == 1
        assert len(data["documents"]) <= 1
    
    def test_list_documents_with_status_filter(self, client, api_headers):
        """Test listing documents filtered by status"""
        # Act - Filter by status
        response = client.get("/api/v1/documents/?status=processed", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        if len(data["documents"]) > 0:
            for doc in data["documents"]:
                assert doc["status"] == "processed"
    
    def test_list_documents_with_search(self, client, api_headers):
        """Test listing documents with search functionality"""
        # Act - Search for documents
        response = client.get("/api/v1/documents/?search=test", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "documents" in data
        if len(data["documents"]) > 0:
            for doc in data["documents"]:
                assert "test" in doc["filename"].lower()
    
    def test_get_document_not_found(self, client, api_headers):
        """Test getting a document that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/documents/{non_existent_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Document not found" in data["detail"]
    
    def test_get_document_with_chunks_not_found(self, client, api_headers):
        """Test getting document chunks for non-existent document"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/documents/{non_existent_id}/with-chunks", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Document not found" in data["detail"]
    
    def test_update_document_not_found(self, client, api_headers):
        """Test updating a document that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        update_data = {"filename": "Updated Name"}
        
        # Act
        response = client.put(f"/api/v1/documents/{non_existent_id}", json=update_data, headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Document not found" in data["detail"]
    
    def test_delete_document_not_found(self, client, api_headers):
        """Test deleting a document that doesn't exist"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.delete(f"/api/v1/documents/{non_existent_id}", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Document not found" in data["detail"]
    
    def test_get_document_chunks_not_found(self, client, api_headers):
        """Test getting chunks for non-existent document"""
        # Arrange
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(f"/api/v1/documents/{non_existent_id}/chunks", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Document not found" in data["detail"]
    
    def test_document_endpoints_headers(self, client, api_headers):
        """Test that document endpoints return proper headers"""
        # Test list documents
        response = client.get("/api/v1/documents/", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
    
    def test_document_data_structure(self, client, api_headers):
        """Test that document responses have correct structure"""
        # Get list of documents
        response = client.get("/api/v1/documents/", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        if len(data["documents"]) > 0:
            document = data["documents"][0]
            
            # Check required fields
            assert "id" in document
            assert "domain_id" in document
            assert "filename" in document
            assert "file_type" in document
            assert "file_path" in document
            assert "file_size" in document
            assert "status" in document
            assert "created_at" in document
            assert "updated_at" in document
            
            # Check data types
            assert isinstance(document["id"], str)
            assert isinstance(document["domain_id"], str)
            assert isinstance(document["filename"], str)
            assert isinstance(document["file_type"], str)
            assert isinstance(document["file_size"], int)
            assert isinstance(document["status"], str)
    
    def test_document_pagination_structure(self, client, api_headers):
        """Test that document pagination responses have correct structure"""
        # Test with different pagination parameters
        response = client.get("/api/v1/documents/?skip=0&limit=5", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "documents" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        
        # Check data types
        assert isinstance(data["total"], int)
        assert isinstance(data["skip"], int)
        assert isinstance(data["limit"], int)
        assert isinstance(data["documents"], list)
        
        # Check pagination logic
        assert data["skip"] >= 0
        assert data["limit"] > 0
        assert len(data["documents"]) <= data["limit"]
    
    def test_document_search_functionality(self, client, api_headers):
        """Test document search functionality with various queries"""
        # Test empty search
        response = client.get("/api/v1/documents/?search=", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Test search with special characters
        response = client.get("/api/v1/documents/?search=test_123", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Test search with spaces
        response = client.get("/api/v1/documents/?search=test document", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
    
    def test_document_status_filtering(self, client, api_headers):
        """Test document status filtering with various statuses"""
        # Test with valid statuses
        valid_statuses = ["uploaded", "processing", "processed", "error"]
        
        for status_val in valid_statuses:
            response = client.get(f"/api/v1/documents/?status={status_val}", headers=api_headers)
            assert response.status_code == status.HTTP_200_OK
            
            data = response.json()
            if len(data["documents"]) > 0:
                for doc in data["documents"]:
                    assert doc["status"] == status_val
    
    def test_document_domain_filtering(self, client, api_headers):
        """Test document domain filtering"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Document Filter Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        assert create_domain_response.status_code == status.HTTP_201_CREATED
        
        domain_id = create_domain_response.json()["id"]
        
        # Test filtering by domain
        response = client.get(f"/api/v1/documents/?domain_id={domain_id}", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        # Even if no documents exist, the endpoint should work
        assert "documents" in data
        assert "total" in data
    
    def test_document_endpoint_error_handling(self, client, api_headers):
        """Test that document endpoints handle errors gracefully"""
        # Test with invalid UUID format
        invalid_id = "invalid-uuid-format"
        
        # Test get document with invalid ID
        response = client.get(f"/api/v1/documents/{invalid_id}", headers=api_headers)
        # Should either return 404 or 422 depending on validation
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_422_UNPROCESSABLE_ENTITY]
        
        # Test update document with invalid ID
        response = client.put(f"/api/v1/documents/{invalid_id}", json={"filename": "test"}, headers=api_headers)
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_422_UNPROCESSABLE_ENTITY]
        
        # Test delete document with invalid ID
        response = client.delete(f"/api/v1/documents/{invalid_id}", headers=api_headers)
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_422_UNPROCESSABLE_ENTITY]
    
    def test_document_endpoint_response_consistency(self, client, api_headers):
        """Test that document endpoints return consistent response formats"""
        # Test list endpoint
        list_response = client.get("/api/v1/documents/", headers=api_headers)
        assert list_response.status_code == status.HTTP_200_OK
        
        # Test individual document endpoint (if documents exist)
        list_data = list_response.json()
        if len(list_data["documents"]) > 0:
            document_id = list_data["documents"][0]["id"]
            
            # Get individual document
            get_response = client.get(f"/api/v1/documents/{document_id}", headers=api_headers)
            assert get_response.status_code == status.HTTP_200_OK
            
            # Compare structure
            list_doc = list_data["documents"][0]
            get_doc = get_response.json()
            
            # Both should have the same fields
            assert set(list_doc.keys()) == set(get_doc.keys())
            
            # Values should match
            for key in list_doc.keys():
                if key not in ["updated_at"]:  # Skip timestamp fields that might change
                    assert list_doc[key] == get_doc[key]
