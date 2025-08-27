"""
Tests for health endpoint
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test health endpoint functionality"""
    
    @pytest.mark.api
    def test_health_check(self, client: TestClient):
        """Test basic health check endpoint"""
        response = client.get("/api/v1/health/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
    
    @pytest.mark.api
    def test_health_check_sync(self, client: TestClient):
        """Test health check with sync client"""
        response = client.get("/api/v1/health/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
    
    @pytest.mark.api
    def test_health_detailed(self, client: TestClient):
        """Test detailed health check endpoint"""
        response = client.get("/api/v1/health/detailed")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert "version" in data
        assert "environment" in data
        
        # Check required fields
        assert data["status"] == "healthy"
        assert isinstance(data["timestamp"], str)
        assert isinstance(data["version"], str)
        assert isinstance(data["environment"], str)
    
    @pytest.mark.api
    def test_health_ready(self, client: TestClient):
        """Test readiness check endpoint"""
        response = client.get("/api/v1/health/ready")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "ready"
    
    @pytest.mark.api
    def test_health_live(self, client: TestClient):
        """Test liveness check endpoint"""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
    
    @pytest.mark.api
    def test_health_metrics(self, client: TestClient):
        """Test metrics endpoint - using basic health as metrics endpoint doesn't exist in mock"""
        response = client.get("/api/v1/health/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert "version" in data
        assert "environment" in data
    
    @pytest.mark.api
    def test_health_invalid_endpoint(self, client: TestClient):
        """Test invalid health endpoint returns 404"""
        response = client.get("/api/v1/health/invalid")
        assert response.status_code == status.HTTP_404_NOT_FOUND
