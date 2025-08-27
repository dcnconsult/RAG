"""
Tests for RAG (Retrieval-Augmented Generation) API endpoints
"""

import pytest
from fastapi import status


class TestRAGEndpoints:
    """Test RAG management endpoints"""
    
    def test_rag_query_success(self, client, api_headers):
        """Test successful RAG query"""
        # Act
        response = client.post(
            "/api/v1/rag/query?query=test question&limit=5&temperature=0.8&max_tokens=1500",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "test question"
        assert "response" in data
        assert "context_used" in data
        assert "model_used" in data
        assert "parameters" in data
        assert data["parameters"]["temperature"] == 0.8
        assert data["parameters"]["max_tokens"] == 1500
        assert data["parameters"]["limit"] == 5
        assert len(data["context_used"]) > 0
    
    def test_rag_query_with_domain_filter(self, client, api_headers):
        """Test RAG query with domain filter"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for RAG Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.post(
            f"/api/v1/rag/query?query=domain specific question&domain_id={domain_id}&limit=3",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "domain specific question"
        assert data["context_used"][0]["domain_id"] == domain_id
        assert data["parameters"]["limit"] == 3
    
    def test_rag_query_with_model(self, client, api_headers):
        """Test RAG query with specific model"""
        # Act
        response = client.post(
            "/api/v1/rag/query?query=model test&model_name=gpt-4&temperature=0.5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "model test"
        assert data["model_used"] == "gpt-4"
        assert data["parameters"]["temperature"] == 0.5
    
    def test_rag_query_invalid_model(self, client, api_headers):
        """Test RAG query with invalid model"""
        # Act
        response = client.post(
            "/api/v1/rag/query?query=invalid model test&model_name=invalid-model",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "not properly configured" in data["detail"]
    
    def test_rag_query_empty_query(self, client, api_headers):
        """Test RAG query with empty query"""
        # Act
        response = client.post(
            "/api/v1/rag/query?query=&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Query cannot be empty" in data["detail"]
    
    def test_retrieve_context_success(self, client, api_headers):
        """Test successful context retrieval"""
        # Act
        response = client.post(
            "/api/v1/rag/retrieve-context?query=context test&limit=8&similarity_threshold=0.8",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "context test"
        assert "context" in data
        assert "context_count" in data
        assert "similarity_threshold" in data
        assert data["similarity_threshold"] == 0.8
        assert data["context_count"] > 0
        assert len(data["context"]) > 0
    
    def test_retrieve_context_with_domain_filter(self, client, api_headers):
        """Test context retrieval with domain filter"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Context Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.post(
            f"/api/v1/rag/retrieve-context?query=domain context&domain_id={domain_id}&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "domain context"
        assert data["context"][0]["domain_id"] == domain_id
        assert data["context_count"] > 0
    
    def test_retrieve_context_empty_query(self, client, api_headers):
        """Test context retrieval with empty query"""
        # Act
        response = client.post(
            "/api/v1/rag/retrieve-context?query=&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Query cannot be empty" in data["detail"]
    
    def test_generate_response_success(self, client, api_headers):
        """Test successful response generation"""
        # Arrange
        context_text = "This is a sample context for response generation testing."
        
        # Act
        response = client.post(
            f"/api/v1/rag/generate-response?query=generate test&context={context_text}&temperature=0.6&max_tokens=800",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "generate test"
        assert "response" in data
        assert data["context_used"] == context_text
        assert data["parameters"]["temperature"] == 0.6
        assert data["parameters"]["max_tokens"] == 800
    
    def test_generate_response_with_model(self, client, api_headers):
        """Test response generation with specific model"""
        # Arrange
        context_text = "Model-specific context for testing."
        
        # Act
        response = client.post(
            f"/api/v1/rag/generate-response?query=model response&context={context_text}&model_name=claude-3",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "model response"
        assert data["model_used"] == "claude-3"
        assert data["context_used"] == context_text
    
    def test_generate_response_empty_query(self, client, api_headers):
        """Test response generation with empty query"""
        # Arrange
        context_text = "Valid context for testing."
        
        # Act
        response = client.post(
            f"/api/v1/rag/generate-response?query=&context={context_text}",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Query cannot be empty" in data["detail"]
    
    def test_generate_response_empty_context(self, client, api_headers):
        """Test response generation with empty context"""
        # Act
        response = client.post(
            "/api/v1/rag/generate-response?query=test&context=",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Context cannot be empty" in data["detail"]
    
    def test_get_available_models_success(self, client, api_headers):
        """Test getting available models"""
        # Act
        response = client.get("/api/v1/rag/models", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "models" in data
        assert "count" in data
        assert "status" in data
        assert data["status"] == "available"
        assert data["count"] > 0
        
        # Check model structure
        if data["models"]:
            model = data["models"][0]
            assert "name" in model
            assert "provider" in model
            assert "status" in model
            assert "capabilities" in model
    
    def test_validate_model_config_valid(self, client, api_headers):
        """Test model validation with valid model"""
        # Act
        response = client.get("/api/v1/rag/models/gpt-4/validate", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["model_name"] == "gpt-4"
        assert data["is_valid"] is True
        assert data["status"] == "configured"
    
    def test_validate_model_config_invalid(self, client, api_headers):
        """Test model validation with invalid model"""
        # Act
        response = client.get("/api/v1/rag/models/invalid-model/validate", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["model_name"] == "invalid-model"
        assert data["is_valid"] is False
        assert data["status"] == "not_configured"
    
    def test_get_rag_statistics_success(self, client, api_headers):
        """Test getting RAG statistics"""
        # Act
        response = client.get("/api/v1/rag/statistics?days=7", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_queries" in data
        assert "successful_queries" in data
        assert "failed_queries" in data
        assert "average_response_time" in data
        assert "total_context_retrieved" in data
        assert "average_context_length" in data
        assert "model_usage" in data
        assert data["period_days"] == 7
        assert data["total_queries"] > 0
    
    def test_get_rag_statistics_with_domain_filter(self, client, api_headers):
        """Test RAG statistics with domain filter"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Statistics Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.get(
            f"/api/v1/rag/statistics?domain_id={domain_id}&days=14",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["filtered_by_domain"] == domain_id
        assert data["period_days"] == 14
        assert data["total_queries"] == 75  # Mock filtered count
    
    def test_get_rag_statistics_invalid_days(self, client, api_headers):
        """Test RAG statistics with invalid days parameter"""
        # Test with days < 1
        response = client.get("/api/v1/rag/statistics?days=0", headers=api_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Days must be between 1 and 365" in data["detail"]
        
        # Test with days > 365
        response = client.get("/api/v1/rag/statistics?days=366", headers=api_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Days must be between 1 and 365" in data["detail"]
    
    def test_get_query_suggestions_success(self, client, api_headers):
        """Test getting query suggestions"""
        # Act
        response = client.get(
            "/api/v1/rag/suggestions?partial_query=test&limit=3",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["partial_query"] == "test"
        assert "suggestions" in data
        assert "count" in data
        assert len(data["suggestions"]) <= 3
        assert data["count"] == len(data["suggestions"])
        
        # Check that suggestions contain the partial query
        for suggestion in data["suggestions"]:
            assert "test" in suggestion.lower()
    
    def test_get_query_suggestions_with_domain_filter(self, client, api_headers):
        """Test query suggestions with domain filter"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Suggestions Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.get(
            f"/api/v1/rag/suggestions?partial_query=domain&domain_id={domain_id}&limit=4",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["partial_query"] == "domain"
        assert len(data["suggestions"]) <= 4
        assert data["count"] == len(data["suggestions"])
    
    def test_get_query_suggestions_empty_query(self, client, api_headers):
        """Test query suggestions with empty query"""
        # Act
        response = client.get(
            "/api/v1/rag/suggestions?partial_query=&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Partial query cannot be empty" in data["detail"]
    
    def test_optimize_context_success(self, client, api_headers):
        """Test successful context optimization"""
        # Arrange
        context_text = "This is a long context that needs to be optimized for better response generation. " * 50
        
        # Act
        response = client.post(
            f"/api/v1/rag/optimize-context?query=optimize test&context={context_text}&max_context_length=1000",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "optimize test"
        assert "original_context_length" in data
        assert "optimized_context" in data
        assert "optimized_context_length" in data
        assert "max_context_length" in data
        assert data["max_context_length"] == 1000
        assert data["original_context_length"] > data["optimized_context_length"]
    
    def test_optimize_context_short_context(self, client, api_headers):
        """Test context optimization with short context"""
        # Arrange
        short_context = "Short context that doesn't need optimization."
        
        # Act
        response = client.post(
            f"/api/v1/rag/optimize-context?query=short test&context={short_context}&max_context_length=2000",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "short test"
        assert data["original_context_length"] == data["optimized_context_length"]
        assert data["optimized_context"] == short_context
    
    def test_optimize_context_empty_query(self, client, api_headers):
        """Test context optimization with empty query"""
        # Arrange
        context_text = "Valid context for testing."
        
        # Act
        response = client.post(
            f"/api/v1/rag/optimize-context?query=&context={context_text}&max_context_length=2000",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Query cannot be empty" in data["detail"]
    
    def test_optimize_context_empty_context(self, client, api_headers):
        """Test context optimization with empty context"""
        # Act
        response = client.post(
            "/api/v1/rag/optimize-context?query=test&context=&max_context_length=2000",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Context cannot be empty" in data["detail"]
    
    def test_optimize_context_invalid_max_length(self, client, api_headers):
        """Test context optimization with invalid max length"""
        # Arrange
        context_text = "Valid context for testing."
        
        # Test with max_length < 500
        response = client.post(
            f"/api/v1/rag/optimize-context?query=test&context={context_text}&max_context_length=400",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "must be between 500 and 10000" in data["detail"]
        
        # Test with max_length > 10000
        response = client.post(
            f"/api/v1/rag/optimize-context?query=test&context={context_text}&max_context_length=11000",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "must be between 500 and 10000" in data["detail"]
    
    def test_rag_health_check(self, client, api_headers):
        """Test RAG service health check"""
        # Act
        response = client.get("/api/v1/rag/health", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "rag"
        assert "features" in data
        assert data["features"]["context_retrieval"] == "available"
        assert data["features"]["response_generation"] == "available"
        assert data["features"]["model_management"] == "available"
        assert data["features"]["context_optimization"] == "available"
        assert data["features"]["query_suggestions"] == "available"
    
    def test_rag_endpoints_headers(self, client, api_headers):
        """Test that RAG endpoints return proper headers"""
        # Test RAG query
        response = client.post(
            "/api/v1/rag/query?query=test&limit=5",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test context retrieval
        response = client.post(
            "/api/v1/rag/retrieve-context?query=test&limit=5",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test RAG health
        response = client.get("/api/v1/rag/health", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
    
    def test_rag_data_structure(self, client, api_headers):
        """Test that RAG responses have correct structure"""
        # Test RAG query structure
        response = client.post(
            "/api/v1/rag/query?query=structure test&limit=3",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check required fields
        assert "query" in data
        assert "response" in data
        assert "context_used" in data
        assert "model_used" in data
        assert "parameters" in data
        
        # Check data types
        assert isinstance(data["query"], str)
        assert isinstance(data["response"], str)
        assert isinstance(data["context_used"], list)
        assert isinstance(data["model_used"], str)
        assert isinstance(data["parameters"], dict)
        
        # Check context structure if context exists
        if data["context_used"]:
            context_item = data["context_used"][0]
            assert "chunk_id" in context_item
            assert "document_id" in context_item
            assert "domain_id" in context_item
            assert "content" in context_item
            assert "similarity_score" in context_item
    
    def test_rag_integration_workflow(self, client, api_headers):
        """Test complete RAG workflow integration"""
        # 1. Create a domain
        domain_data = {"name": "RAG Integration Test Domain"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # 2. Perform RAG query
        rag_response = client.post(
            f"/api/v1/rag/query?query=integration test&domain_id={domain_id}&limit=5",
            headers=api_headers
        )
        assert rag_response.status_code == status.HTTP_200_OK
        
        # 3. Retrieve context
        context_response = client.post(
            f"/api/v1/rag/retrieve-context?query=integration test&domain_id={domain_id}&limit=5",
            headers=api_headers
        )
        assert context_response.status_code == status.HTTP_200_OK
        
        # 4. Generate response with context
        context_text = "Integration test context for response generation."
        generate_response = client.post(
            f"/api/v1/rag/generate-response?query=integration test&context={context_text}",
            headers=api_headers
        )
        assert generate_response.status_code == status.HTTP_200_OK
        
        # 5. Get RAG statistics
        stats_response = client.get(
            f"/api/v1/rag/statistics?domain_id={domain_id}&days=1",
            headers=api_headers
        )
        assert stats_response.status_code == status.HTTP_200_OK
        
        # 6. Get query suggestions
        suggestions_response = client.get(
            "/api/v1/rag/suggestions?partial_query=integration&limit=3",
            headers=api_headers
        )
        assert suggestions_response.status_code == status.HTTP_200_OK
        
        # 7. Optimize context
        long_context = "Long context for optimization testing. " * 100
        optimize_response = client.post(
            f"/api/v1/rag/optimize-context?query=integration test&context={long_context}&max_context_length=1000",
            headers=api_headers
        )
        assert optimize_response.status_code == status.HTTP_200_OK
        
        # Verify all operations returned expected data
        rag_data = rag_response.json()
        context_data = context_response.json()
        generate_data = generate_response.json()
        stats_data = stats_response.json()
        suggestions_data = suggestions_response.json()
        optimize_data = optimize_response.json()
        
        assert rag_data["query"] == "integration test"
        assert context_data["query"] == "integration test"
        assert generate_data["query"] == "integration test"
        assert suggestions_data["partial_query"] == "integration"
        assert optimize_data["query"] == "integration test"
        
        assert rag_data["context_used"][0]["domain_id"] == domain_id
        assert context_data["context"][0]["domain_id"] == domain_id
        assert stats_data["filtered_by_domain"] == domain_id
