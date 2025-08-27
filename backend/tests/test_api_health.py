"""
Tests for health check API endpoints
"""

import pytest
from fastapi import status


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check_basic(self, client, api_headers):
        """Test basic health check endpoint"""
        # Act
        response = client.get("/health", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    def test_api_health_check(self, client, api_headers):
        """Test API health check endpoint"""
        # Act
        response = client.get("/api/v1/health", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
        assert "environment" in data
    
    def test_health_check_detailed(self, client, api_headers):
        """Test detailed health check endpoint"""
        # Act
        response = client.get("/api/v1/health/detailed", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
        assert "environment" in data
        assert "response_time" in data
        assert "services" in data
        
        # Check services status
        services = data["services"]
        assert "database" in services
        assert "redis" in services
        assert "celery" in services
        
        # Check database service details
        db_service = services["database"]
        assert "status" in db_service
        assert "type" in db_service
        assert "url" in db_service
        assert db_service["type"] == "postgresql"
        
        # Check Redis service details
        redis_service = services["redis"]
        assert "status" in redis_service
        assert "type" in redis_service
        assert "url" in redis_service
        assert redis_service["type"] == "redis"
        
        # Check Celery service details
        celery_service = services["celery"]
        assert "status" in celery_service
        assert "type" in celery_service
        assert "broker" in celery_service
        assert celery_service["type"] == "celery"
    
    def test_health_check_ready(self, client, api_headers):
        """Test readiness check endpoint"""
        # Act
        response = client.get("/api/v1/health/ready", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "ready"
        assert "timestamp" in data
        assert "version" in data
        assert "environment" in data
    
    def test_health_check_response_time(self, client, api_headers):
        """Test that health check includes response time"""
        # Act
        response = client.get("/api/v1/health/detailed", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "response_time" in data
        assert isinstance(data["response_time"], (int, float))
        assert data["response_time"] >= 0
    
    def test_health_check_system_info(self, client, api_headers):
        """Test that health check includes system information"""
        # Act
        response = client.get("/api/v1/health/detailed", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "system" in data
        
        system_info = data["system"]
        assert "python_version" in system_info
        assert "fastapi_version" in system_info
        assert "sqlalchemy_version" in system_info
    
    def test_health_check_service_details(self, client, api_headers):
        """Test that health check includes service details"""
        # Act
        response = client.get("/api/v1/health/detailed", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "services" in data
        
        services = data["services"]
        assert "database" in services
        assert "redis" in services
        assert "celery" in services
        
        # Check database service details
        db_service = services["database"]
        assert "status" in db_service
        assert "type" in db_service
        assert "url" in db_service
        assert db_service["type"] == "postgresql"
        
        # Check Redis service details
        redis_service = services["redis"]
        assert "status" in redis_service
        assert "type" in redis_service
        assert "url" in redis_service
        assert redis_service["type"] == "redis"
        
        # Check Celery service details
        celery_service = services["celery"]
        assert "status" in celery_service
        assert "type" in celery_service
        assert "broker" in celery_service
        assert celery_service["type"] == "celery"
    
    def test_health_check_headers(self, client, api_headers):
        """Test that health check endpoints return proper headers"""
        # Test basic health check
        response = client.get("/health", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test API health check
        response = client.get("/api/v1/health", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test detailed health check
        response = client.get("/api/v1/health/detailed", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test readiness check
        response = client.get("/api/v1/health/ready", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
    
    def test_health_check_data_types(self, client, api_headers):
        """Test that health check responses have correct data types"""
        # Test detailed health check data types
        response = client.get("/api/v1/health/detailed", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check string fields
        assert isinstance(data["status"], str)
        assert isinstance(data["timestamp"], str)
        assert isinstance(data["version"], str)
        assert isinstance(data["environment"], str)
        
        # Check numeric fields
        assert isinstance(data["response_time"], (int, float))
        
        # Check nested objects
        assert isinstance(data["services"], dict)
        assert isinstance(data["system"], dict)
        
        # Check service status types
        for service_name, service_data in data["services"].items():
            assert isinstance(service_data["status"], str)
            assert isinstance(service_data["type"], str)
            assert isinstance(service_data.get("url", ""), str)
    
    def test_health_check_endpoint_structure(self, client, api_headers):
        """Test that all health check endpoints follow consistent structure"""
        endpoints = [
            "/health",
            "/api/v1/health", 
            "/api/v1/health/detailed",
            "/api/v1/health/ready"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint, headers=api_headers)
            assert response.status_code == status.HTTP_200_OK
            
            data = response.json()
            # All endpoints should have status and timestamp
            assert "status" in data
            assert "timestamp" in data
            
            # Status should be a valid value
            assert data["status"] in ["healthy", "ready"]
            
            # Timestamp should be a valid ISO format string
            assert "T" in data["timestamp"]  # Basic ISO format check
