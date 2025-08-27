"""
Security and Validation Testing
Tests for security features, input validation, and security headers
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import json
import os
from io import BytesIO

from app.main import app
from app.core.config import settings


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def mock_file():
    """Mock file for testing"""
    return BytesIO(b"test file content")


class TestSecurityHeaders:
    """Test security headers and middleware"""
    
    def test_cors_headers(self, client):
        """Test CORS headers are properly set"""
        response = client.options("/api/v1/health")
        
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers
    
    def test_trusted_host_middleware(self, client):
        """Test trusted host middleware"""
        # Test with valid host
        response = client.get("/api/v1/health", headers={"Host": "localhost"})
        assert response.status_code == 200
        
        # Test with invalid host
        response = client.get("/api/v1/health", headers={"Host": "malicious.com"})
        assert response.status_code == 400
    
    def test_security_headers_present(self, client):
        """Test that security headers are present"""
        response = client.get("/api/v1/health")
        
        # Check for basic security headers
        headers = response.headers
        assert "server" in headers  # Should be present but not reveal too much info
        
        # In production, we should also check for:
        # - X-Content-Type-Options: nosniff
        # - X-Frame-Options: DENY
        # - X-XSS-Protection: 1; mode=block
        # - Strict-Transport-Security (if HTTPS)


class TestInputValidation:
    """Test input validation and sanitization"""
    
    def test_document_creation_validation(self, client):
        """Test document creation input validation"""
        # Test with invalid domain_id
        response = client.post(
            "/api/v1/documents/",
            data={"domain_id": "invalid-uuid"},
            files={"file": ("test.txt", b"test content")}
        )
        assert response.status_code == 422
        
        # Test with missing required fields
        response = client.post(
            "/api/v1/documents/",
            files={"file": ("test.txt", b"test content")}
        )
        assert response.status_code == 422
        
        # Test with empty file
        response = client.post(
            "/api/v1/documents/",
            data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
            files={"file": ("", b"")}
        )
        assert response.status_code == 422
    
    def test_query_parameter_validation(self, client):
        """Test query parameter validation"""
        # Test invalid skip value
        response = client.get("/api/v1/documents/?skip=-1")
        assert response.status_code == 422
        
        # Test invalid limit value
        response = client.get("/api/v1/documents/?limit=0")
        assert response.status_code == 422
        
        # Test limit too high
        response = client.get("/api/v1/documents/?limit=1001")
        assert response.status_code == 422
    
    def test_uuid_validation(self, client):
        """Test UUID format validation"""
        # Test invalid UUID format
        response = client.get("/api/v1/documents/?domain_id=invalid-uuid")
        assert response.status_code == 422
        
        # Test valid UUID format
        response = client.get("/api/v1/documents/?domain_id=123e4567-e89b-12d3-a456-426614174000")
        assert response.status_code == 200
    
    def test_sql_injection_prevention(self, client):
        """Test SQL injection prevention"""
        # Test with potentially malicious search terms
        malicious_terms = [
            "'; DROP TABLE documents; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "'; UPDATE users SET password='hacked'; --"
        ]
        
        for term in malicious_terms:
            response = client.get(f"/api/v1/documents/?search={term}")
            # Should not crash or expose database errors
            assert response.status_code in [200, 422, 400]
            
            # Check that no sensitive information is exposed
            if response.status_code == 200:
                content = response.json()
                assert "error" not in str(content).lower()
                assert "sql" not in str(content).lower()
                assert "database" not in str(content).lower()


class TestFileUploadSecurity:
    """Test file upload security measures"""
    
    def test_file_extension_validation(self, client):
        """Test file extension validation"""
        # Test with allowed extensions
        allowed_extensions = ["pdf", "docx", "txt", "md"]
        for ext in allowed_extensions:
            filename = f"test.{ext}"
            response = client.post(
                "/api/v1/documents/",
                data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
                files={"file": (filename, b"test content")}
            )
            # Should not fail due to extension
            assert response.status_code in [201, 400, 422]
        
        # Test with disallowed extensions
        disallowed_extensions = ["exe", "bat", "sh", "js", "php", "py"]
        for ext in disallowed_extensions:
            filename = f"test.{ext}"
            response = client.post(
                "/api/v1/documents/",
                data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
                files={"file": (filename, b"test content")}
            )
            # Should fail due to extension
            assert response.status_code in [400, 422]
    
    def test_file_size_validation(self, client):
        """Test file size validation"""
        # Create a file larger than MAX_FILE_SIZE
        large_content = b"x" * (settings.MAX_FILE_SIZE + 1024)
        
        response = client.post(
            "/api/v1/documents/",
            data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
            files={"file": ("large_file.txt", large_content)}
        )
        
        # Should fail due to file size
        assert response.status_code in [400, 413, 422]
    
    def test_file_content_validation(self, client):
        """Test file content validation"""
        # Test with potentially malicious content
        malicious_content = b"""
        <script>alert('xss')</script>
        <?php system($_GET['cmd']); ?>
        <img src="x" onerror="alert('xss')">
        """
        
        response = client.post(
            "/api/v1/documents/",
            data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
            files={"file": ("malicious.txt", malicious_content)}
        )
        
        # Should not crash or execute malicious code
        assert response.status_code in [201, 400, 422]
    
    def test_filename_sanitization(self, client):
        """Test filename sanitization"""
        # Test with potentially dangerous filenames
        dangerous_filenames = [
            "../../../etc/passwd",
            "file with spaces.txt",
            "file-with-special-chars-!@#$%^&*().txt",
            "file_with_unicode_测试.txt",
            "file_with_newlines\n.txt",
            "file_with_tabs\t.txt"
        ]
        
        for filename in dangerous_filenames:
            response = client.post(
                "/api/v1/documents/",
                data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
                files={"file": (filename, b"test content")}
            )
            
            # Should handle safely
            assert response.status_code in [201, 400, 422]


class TestAuthenticationSecurity:
    """Test authentication and authorization security"""
    
    def test_authentication_endpoints_exist(self, client):
        """Test that authentication endpoints are properly configured"""
        # Test auth health endpoint
        response = client.get("/api/v1/auth/health")
        assert response.status_code == 200
        
        # Test that auth endpoints are documented
        response = client.get("/api/v1/openapi.json")
        assert response.status_code == 200
        
        openapi_spec = response.json()
        paths = openapi_spec.get("paths", {})
        
        # Check that auth paths exist
        assert "/auth/health" in paths
    
    def test_jwt_token_validation(self, client):
        """Test JWT token validation (when implemented)"""
        # This test will need to be updated when JWT is implemented
        # For now, we test that the endpoint exists
        response = client.get("/api/v1/auth/health")
        assert response.status_code == 200
        
        # When JWT is implemented, test:
        # - Token expiration
        # - Invalid token format
        # - Token tampering
        # - Token replay attacks
    
    def test_password_security(self, client):
        """Test password security requirements (when implemented)"""
        # This test will need to be updated when registration is implemented
        # For now, we test that the endpoint structure exists
        
        # When implemented, test:
        # - Password complexity requirements
        # - Password length requirements
        # - Common password prevention
        # - Password hashing


class TestAPISecurity:
    """Test general API security measures"""
    
    def test_rate_limiting_headers(self, client):
        """Test rate limiting headers (when implemented)"""
        # Make multiple requests to test rate limiting
        responses = []
        for _ in range(10):
            response = client.get("/api/v1/health")
            responses.append(response)
        
        # All requests should succeed (rate limiting not yet implemented)
        for response in responses:
            assert response.status_code == 200
        
        # When rate limiting is implemented, test:
        # - Rate limit headers
        # - Rate limit enforcement
        # - Rate limit reset timing
    
    def test_error_message_security(self, client):
        """Test that error messages don't expose sensitive information"""
        # Test with invalid input
        response = client.get("/api/v1/documents/?domain_id=invalid")
        assert response.status_code == 422
        
        # Check that error message doesn't expose internal details
        error_content = response.json()
        assert "database" not in str(error_content).lower()
        assert "sql" not in str(error_content).lower()
        assert "internal" not in str(error_content).lower()
        assert "stack" not in str(error_content).lower()
    
    def test_logging_security(self, client):
        """Test that logging doesn't expose sensitive information"""
        # Test with potentially sensitive data
        response = client.post(
            "/api/v1/documents/",
            data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
            files={"file": ("test.txt", b"password: secret123")}
        )
        
        # Should not crash
        assert response.status_code in [201, 400, 422]
        
        # Check logs don't contain sensitive data (this would need log inspection)
        # In a real test, we would check the actual log files
    
    def test_csrf_protection(self, client):
        """Test CSRF protection measures"""
        # Test that API accepts requests without CSRF tokens
        # (REST APIs typically don't need CSRF protection)
        response = client.post(
            "/api/v1/documents/",
            data={"domain_id": "123e4567-e89b-12d3-a456-426614174000"},
            files={"file": ("test.txt", b"test content")}
        )
        
        # Should not fail due to missing CSRF token
        assert response.status_code in [201, 400, 422]


class TestDataValidation:
    """Test data validation and sanitization"""
    
    def test_domain_id_validation(self, client):
        """Test domain ID validation"""
        # Test with invalid UUID
        response = client.get("/api/v1/documents/?domain_id=not-a-uuid")
        assert response.status_code == 422
        
        # Test with valid UUID
        response = client.get("/api/v1/documents/?domain_id=123e4567-e89b-12d3-a456-426614174000")
        assert response.status_code == 200
    
    def test_pagination_validation(self, client):
        """Test pagination parameter validation"""
        # Test negative skip
        response = client.get("/api/v1/documents/?skip=-1")
        assert response.status_code == 422
        
        # Test zero limit
        response = client.get("/api/v1/documents/?limit=0")
        assert response.status_code == 422
        
        # Test limit too high
        response = client.get("/api/v1/documents/?limit=1001")
        assert response.status_code == 422
        
        # Test valid pagination
        response = client.get("/api/v1/documents/?skip=0&limit=10")
        assert response.status_code == 200
    
    def test_search_parameter_validation(self, client):
        """Test search parameter validation"""
        # Test with very long search terms
        long_search = "a" * 1000
        response = client.get(f"/api/v1/documents/?search={long_search}")
        assert response.status_code in [200, 400, 422]
        
        # Test with special characters
        special_chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
        response = client.get(f"/api/v1/documents/?search={special_chars}")
        assert response.status_code in [200, 400, 422]


class TestEnvironmentSecurity:
    """Test environment and configuration security"""
    
    def test_secret_key_validation(self):
        """Test secret key configuration"""
        # Test that secret key is properly configured
        assert hasattr(settings, 'SECRET_KEY')
        assert settings.SECRET_KEY is not None
        assert len(settings.SECRET_KEY) >= 32
        
        # Test that secret key is not the default
        assert settings.SECRET_KEY != "your-secret-key-here"
    
    def test_environment_configuration(self):
        """Test environment configuration security"""
        # Test that debug is disabled in production
        if settings.is_production:
            assert not settings.DEBUG
        
        # Test that logging level is appropriate
        assert settings.LOG_LEVEL in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    
    def test_cors_configuration(self):
        """Test CORS configuration security"""
        # Test that CORS origins are properly configured
        assert hasattr(settings, 'CORS_ORIGINS')
        assert isinstance(settings.CORS_ORIGINS, list)
        
        # In production, CORS should be restrictive
        if settings.is_production:
            assert "*" not in settings.CORS_ORIGINS
            assert "http://localhost:3000" not in settings.CORS_ORIGINS
    
    def test_allowed_hosts_configuration(self):
        """Test allowed hosts configuration"""
        # Test that allowed hosts are properly configured
        assert hasattr(settings, 'ALLOWED_HOSTS')
        assert isinstance(settings.ALLOWED_HOSTS, list)
        assert len(settings.ALLOWED_HOSTS) > 0
        
        # In production, should not allow all hosts
        if settings.is_production:
            assert "*" not in settings.ALLOWED_HOSTS


if __name__ == "__main__":
    pytest.main([__file__])
