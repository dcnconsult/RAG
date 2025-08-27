"""
Tests for search API endpoints
"""

import pytest
from fastapi import status


class TestSearchEndpoints:
    """Test search management endpoints"""
    
    def test_semantic_search_success(self, client, api_headers):
        """Test successful semantic search"""
        # Act
        response = client.post(
            "/api/v1/search/semantic?query=test query&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "test query"
        assert "results" in data
        assert "total_results" in data
        assert "response_time" in data
        assert data["total_results"] > 0
        assert len(data["results"]) <= 5
        
        # Check result structure
        if data["results"]:
            result = data["results"][0]
            assert "chunk_id" in result
            assert "document_id" in result
            assert "document_name" in result
            assert "domain_id" in result
            assert "domain_name" in result
            assert "content" in result
            assert "similarity_score" in result
    
    def test_semantic_search_with_domain_filter(self, client, api_headers):
        """Test semantic search with domain filter"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Search Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.post(
            f"/api/v1/search/semantic?query=domain search&domain_id={domain_id}&limit=3",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["domain_id"] == domain_id
        assert data["query"] == "domain search"
        assert len(data["results"]) <= 3
    
    def test_semantic_search_empty_query(self, client, api_headers):
        """Test semantic search with empty query"""
        # Act
        response = client.post(
            "/api/v1/search/semantic?query=&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Search query cannot be empty" in data["detail"]
    
    def test_vector_search_success(self, client, api_headers):
        """Test successful vector search"""
        # Act
        response = client.post(
            "/api/v1/search/vector?query=vector test&limit=10&similarity_threshold=0.8",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "vector test"
        assert data["metadata"]["search_type"] == "vector"
        assert "results" in data
        assert len(data["results"]) <= 10
    
    def test_vector_search_with_threshold(self, client, api_headers):
        """Test vector search with similarity threshold"""
        # Act
        response = client.post(
            "/api/v1/search/vector?query=threshold test&similarity_threshold=0.9",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "threshold test"
        assert data["similarity_threshold"] == 0.9
    
    def test_hybrid_search_success(self, client, api_headers):
        """Test successful hybrid search"""
        # Act
        response = client.post(
            "/api/v1/search/hybrid?query=hybrid test&semantic_weight=0.6&vector_weight=0.4",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "hybrid test"
        assert data["metadata"]["search_type"] == "hybrid"
        assert data["metadata"]["weights"]["semantic"] == 0.6
        assert data["metadata"]["weights"]["vector"] == 0.4
    
    def test_hybrid_search_invalid_weights(self, client, api_headers):
        """Test hybrid search with invalid weights"""
        # Act - weights don't sum to 1.0
        response = client.post(
            "/api/v1/search/hybrid?query=invalid weights&semantic_weight=0.8&vector_weight=0.3",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "weights must sum to 1.0" in data["detail"]
    
    def test_hybrid_search_weights_sum_to_one(self, client, api_headers):
        """Test hybrid search with weights that sum to 1.0"""
        # Act
        response = client.post(
            "/api/v1/search/hybrid?query=valid weights&semantic_weight=0.5&vector_weight=0.5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "valid weights"
        assert data["metadata"]["weights"]["semantic"] == 0.5
        assert data["metadata"]["weights"]["vector"] == 0.5
    
    def test_search_by_domain_success(self, client, api_headers):
        """Test search within a specific domain"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Domain Search Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.get(
            f"/api/v1/search/by-domain/{domain_id}?query=domain specific&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "domain specific"
        assert data["domain_id"] == domain_id
        assert data["metadata"]["search_type"] == "domain_specific"
        assert len(data["results"]) <= 5
    
    def test_search_by_domain_not_found(self, client, api_headers):
        """Test search within non-existent domain"""
        # Arrange
        non_existent_domain_id = "00000000-0000-0000-0000-000000000000"
        
        # Act
        response = client.get(
            f"/api/v1/search/by-domain/{non_existent_domain_id}?query=test&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Domain not found" in data["detail"]
    
    def test_search_across_domains_success(self, client, api_headers):
        """Test search across all domains"""
        # Act
        response = client.get(
            "/api/v1/search/across-domains?query=cross domain&limit=8",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "cross domain"
        assert data["domain_id"] is None
        assert data["metadata"]["search_type"] == "cross_domain"
        assert len(data["results"]) <= 8
    
    def test_get_search_suggestions_success(self, client, api_headers):
        """Test getting search suggestions"""
        # Act
        response = client.get(
            "/api/v1/search/suggestions?partial_query=test&limit=3",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["query"] == "test"
        assert "suggestions" in data
        assert "count" in data
        assert len(data["suggestions"]) <= 3
        assert data["count"] == len(data["suggestions"])
        
        # Check that suggestions contain the partial query
        for suggestion in data["suggestions"]:
            assert "test" in suggestion.lower()
    
    def test_get_search_suggestions_empty_query(self, client, api_headers):
        """Test getting search suggestions with empty query"""
        # Act
        response = client.get(
            "/api/v1/search/suggestions?partial_query=&limit=5",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Partial query cannot be empty" in data["detail"]
    
    def test_get_search_suggestions_limit_validation(self, client, api_headers):
        """Test search suggestions with different limit values"""
        # Test with minimum limit
        response = client.get(
            "/api/v1/search/suggestions?partial_query=test&limit=1",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["suggestions"]) <= 1
        
        # Test with maximum limit
        response = client.get(
            "/api/v1/search/suggestions?partial_query=test&limit=20",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["suggestions"]) <= 20
    
    def test_get_search_analytics_success(self, client, api_headers):
        """Test getting search analytics"""
        # Act
        response = client.get(
            "/api/v1/search/analytics?days=30",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_searches" in data
        assert "unique_users" in data
        assert "average_response_time" in data
        assert "top_queries" in data
        assert "domain_breakdown" in data
        assert "search_types" in data
        assert data["period_days"] == 30
        assert data["total_searches"] > 0
    
    def test_get_search_analytics_with_domain_filter(self, client, api_headers):
        """Test getting search analytics filtered by domain"""
        # First, create a domain to get its ID
        domain_data = {"name": "Domain for Analytics Test"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # Act
        response = client.get(
            f"/api/v1/search/analytics?domain_id={domain_id}&days=7",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["filtered_by_domain"] == domain_id
        assert data["period_days"] == 7
        assert data["total_searches"] == 45  # Mock filtered count
    
    def test_get_search_analytics_invalid_days(self, client, api_headers):
        """Test search analytics with invalid days parameter"""
        # Test with days < 1
        response = client.get(
            "/api/v1/search/analytics?days=0",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Days must be between 1 and 365" in data["detail"]
        
        # Test with days > 365
        response = client.get(
            "/api/v1/search/analytics?days=366",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Days must be between 1 and 365" in data["detail"]
    
    def test_search_health_check(self, client, api_headers):
        """Test search service health check"""
        # Act
        response = client.get("/api/v1/search/health", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "search"
        assert "features" in data
        assert data["features"]["semantic_search"] == "available"
        assert data["features"]["vector_search"] == "available"
        assert data["features"]["hybrid_search"] == "available"
        assert data["features"]["analytics"] == "available"
    
    def test_search_endpoints_headers(self, client, api_headers):
        """Test that search endpoints return proper headers"""
        # Test semantic search
        response = client.post(
            "/api/v1/search/semantic?query=test&limit=5",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test vector search
        response = client.post(
            "/api/v1/search/vector?query=test&limit=5",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test search health
        response = client.get("/api/v1/search/health", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
    
    def test_search_data_structure(self, client, api_headers):
        """Test that search responses have correct structure"""
        # Test semantic search structure
        response = client.post(
            "/api/v1/search/semantic?query=structure test&limit=1",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check required fields
        assert "query" in data
        assert "results" in data
        assert "total_results" in data
        assert "response_time" in data
        assert "metadata" in data
        
        # Check data types
        assert isinstance(data["query"], str)
        assert isinstance(data["results"], list)
        assert isinstance(data["total_results"], int)
        assert isinstance(data["response_time"], float)
        assert isinstance(data["metadata"], dict)
        
        # Check result structure if results exist
        if data["results"]:
            result = data["results"][0]
            assert "chunk_id" in result
            assert "document_id" in result
            assert "document_name" in result
            assert "domain_id" in result
            assert "domain_name" in result
            assert "content" in result
            assert "chunk_index" in result
            assert "similarity_score" in result
            assert "metadata" in result
    
    def test_search_pagination_and_limits(self, client, api_headers):
        """Test search pagination and limit functionality"""
        # Test different limit values
        for limit in [1, 5, 10, 20]:
            response = client.post(
                f"/api/v1/search/semantic?query=pagination test&limit={limit}",
                headers=api_headers
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert len(data["results"]) <= limit
            assert data["total_results"] >= 0
    
    def test_search_similarity_thresholds(self, client, api_headers):
        """Test search with different similarity thresholds"""
        # Test different threshold values
        for threshold in [0.5, 0.7, 0.8, 0.9]:
            response = client.post(
                f"/api/v1/search/semantic?query=threshold test&similarity_threshold={threshold}",
                headers=api_headers
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "similarity_threshold" in data
            assert data["similarity_threshold"] == threshold
    
    def test_search_error_handling(self, client, api_headers):
        """Test search error handling"""
        # Test with empty query
        response = client.post(
            "/api/v1/search/semantic?query=&limit=5",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test with invalid weights in hybrid search
        response = client.post(
            "/api/v1/search/hybrid?query=test&semantic_weight=0.8&vector_weight=0.3",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test with invalid days in analytics
        response = client.get(
            "/api/v1/search/analytics?days=0",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_search_integration_workflow(self, client, api_headers):
        """Test complete search workflow integration"""
        # 1. Create a domain
        domain_data = {"name": "Search Integration Test Domain"}
        create_domain_response = client.post("/api/v1/domains/", json=domain_data, headers=api_headers)
        domain_id = create_domain_response.json()["id"]
        
        # 2. Perform semantic search
        semantic_response = client.post(
            f"/api/v1/search/semantic?query=integration test&domain_id={domain_id}&limit=5",
            headers=api_headers
        )
        assert semantic_response.status_code == status.HTTP_200_OK
        
        # 3. Perform vector search
        vector_response = client.post(
            f"/api/v1/search/vector?query=integration test&domain_id={domain_id}&limit=5",
            headers=api_headers
        )
        assert vector_response.status_code == status.HTTP_200_OK
        
        # 4. Perform hybrid search
        hybrid_response = client.post(
            f"/api/v1/search/hybrid?query=integration test&domain_id={domain_id}&semantic_weight=0.6&vector_weight=0.4",
            headers=api_headers
        )
        assert hybrid_response.status_code == status.HTTP_200_OK
        
        # 5. Get search analytics
        analytics_response = client.get(
            f"/api/v1/search/analytics?domain_id={domain_id}&days=1",
            headers=api_headers
        )
        assert analytics_response.status_code == status.HTTP_200_OK
        
        # 6. Get search suggestions
        suggestions_response = client.get(
            "/api/v1/search/suggestions?partial_query=integration&limit=3",
            headers=api_headers
        )
        assert suggestions_response.status_code == status.HTTP_200_OK
        
        # Verify all searches returned results
        semantic_data = semantic_response.json()
        vector_data = vector_response.json()
        hybrid_data = hybrid_response.json()
        
        assert semantic_data["total_results"] > 0
        assert vector_data["total_results"] > 0
        assert hybrid_data["total_results"] > 0
        assert semantic_data["domain_id"] == domain_id
        assert vector_data["domain_id"] == domain_id
        assert hybrid_data["domain_id"] == domain_id
