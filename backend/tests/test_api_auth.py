"""
Tests for Authentication API endpoints
"""

import pytest
from fastapi import status


class TestAuthEndpoints:
    """Test authentication management endpoints"""
    
    def test_login_success(self, client, api_headers):
        """Test successful user login"""
        # Act
        response = client.post(
            "/api/v1/auth/login?username=testuser&password=testpass",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
        assert data["user"]["username"] == "testuser"
        assert data["user"]["is_active"] is True
    
    def test_login_missing_username(self, client, api_headers):
        """Test login with missing username"""
        # Act
        response = client.post(
            "/api/v1/auth/login?password=testpass",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_login_missing_password(self, client, api_headers):
        """Test login with missing password"""
        # Act
        response = client.post(
            "/api/v1/auth/login?username=testuser",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_login_invalid_credentials(self, client, api_headers):
        """Test login with invalid credentials"""
        # Act
        response = client.post(
            "/api/v1/auth/login?username=wronguser&password=wrongpass",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "Invalid credentials" in data["detail"]
    
    def test_register_success(self, client, api_headers):
        """Test successful user registration"""
        # Act
        response = client.post(
            "/api/v1/auth/register?username=newuser&email=new@example.com&password=password123&confirm_password=password123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "new@example.com"
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        assert "User registered successfully" in data["message"]
    
    def test_register_missing_fields(self, client, api_headers):
        """Test registration with missing fields"""
        # Act
        response = client.post(
            "/api/v1/auth/register?username=newuser&email=new@example.com",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_register_password_mismatch(self, client, api_headers):
        """Test registration with password mismatch"""
        # Act
        response = client.post(
            "/api/v1/auth/register?username=newuser&email=new@example.com&password=password123&confirm_password=different123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Passwords do not match" in data["detail"]
    
    def test_register_short_password(self, client, api_headers):
        """Test registration with short password"""
        # Act
        response = client.post(
            "/api/v1/auth/register?username=newuser&email=new@example.com&password=123&confirm_password=123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Password must be at least 8 characters long" in data["detail"]
    
    def test_refresh_token_success(self, client, api_headers):
        """Test successful token refresh"""
        # Act
        response = client.post(
            "/api/v1/auth/refresh?refresh_token=mock_refresh_token_67890",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
        assert data["access_token"] == "new_mock_access_token_54321"
    
    def test_refresh_token_missing(self, client, api_headers):
        """Test token refresh with missing token"""
        # Act
        response = client.post(
            "/api/v1/auth/refresh",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_refresh_token_invalid(self, client, api_headers):
        """Test token refresh with invalid token"""
        # Act
        response = client.post(
            "/api/v1/auth/refresh?refresh_token=invalid_token",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "Invalid refresh token" in data["detail"]
    
    def test_logout_success(self, client, api_headers):
        """Test successful user logout"""
        # Act
        response = client.post(
            "/api/v1/auth/logout?access_token=mock_access_token_12345",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "Successfully logged out" in data["message"]
        assert "logged_out_at" in data
    
    def test_logout_missing_token(self, client, api_headers):
        """Test logout with missing access token"""
        # Act
        response = client.post(
            "/api/v1/auth/logout",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_get_current_user_success(self, client, api_headers):
        """Test successful current user retrieval"""
        # Act
        response = client.get(
            "/api/v1/auth/me?authorization=Bearer mock_access_token_12345",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == "user-123"
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["is_active"] is True
        assert "created_at" in data
        assert "last_login" in data
    
    def test_get_current_user_missing_auth(self, client, api_headers):
        """Test current user retrieval with missing authorization"""
        # Act
        response = client.get(
            "/api/v1/auth/me",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_get_current_user_invalid_format(self, client, api_headers):
        """Test current user retrieval with invalid authorization format"""
        # Act
        response = client.get(
            "/api/v1/auth/me?authorization=invalid_format",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "Valid authorization header required" in data["detail"]
    
    def test_get_current_user_invalid_token(self, client, api_headers):
        """Test current user retrieval with invalid token"""
        # Act
        response = client.get(
            "/api/v1/auth/me?authorization=Bearer invalid_token",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "Invalid access token" in data["detail"]
    
    def test_forgot_password_success(self, client, api_headers):
        """Test successful forgot password request"""
        # Act
        response = client.post(
            "/api/v1/auth/forgot-password?email=user@example.com",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "Password reset email sent" in data["message"]
        assert data["email"] == "user@example.com"
        assert "reset_token" in data
        assert "expires_at" in data
    
    def test_forgot_password_missing_email(self, client, api_headers):
        """Test forgot password with missing email"""
        # Act
        response = client.post(
            "/api/v1/auth/forgot-password",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_forgot_password_invalid_email(self, client, api_headers):
        """Test forgot password with invalid email format"""
        # Act
        response = client.post(
            "/api/v1/auth/forgot-password?email=invalid_email",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Valid email address is required" in data["detail"]
    
    def test_reset_password_success(self, client, api_headers):
        """Test successful password reset"""
        # Act
        response = client.post(
            "/api/v1/auth/reset-password?reset_token=mock_reset_token_abc123&new_password=newpassword123&confirm_password=newpassword123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "Password reset successfully" in data["message"]
        assert "reset_at" in data
    
    def test_reset_password_missing_fields(self, client, api_headers):
        """Test password reset with missing fields"""
        # Act
        response = client.post(
            "/api/v1/auth/reset-password?reset_token=mock_reset_token_abc123&new_password=newpassword123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert "detail" in data
    
    def test_reset_password_mismatch(self, client, api_headers):
        """Test password reset with password mismatch"""
        # Act
        response = client.post(
            "/api/v1/auth/reset-password?reset_token=mock_reset_token_abc123&new_password=newpassword123&confirm_password=different123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Passwords do not match" in data["detail"]
    
    def test_reset_password_short_password(self, client, api_headers):
        """Test password reset with short password"""
        # Act
        response = client.post(
            "/api/v1/auth/reset-password?reset_token=mock_reset_token_abc123&new_password=123&confirm_password=123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Password must be at least 8 characters long" in data["detail"]
    
    def test_reset_password_invalid_token(self, client, api_headers):
        """Test password reset with invalid token"""
        # Act
        response = client.post(
            "/api/v1/auth/reset-password?reset_token=invalid_token&new_password=newpassword123&confirm_password=newpassword123",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Invalid or expired reset token" in data["detail"]
    
    def test_auth_health_check(self, client, api_headers):
        """Test authentication service health check"""
        # Act
        response = client.get("/api/v1/auth/health", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "authentication"
        assert "features" in data
        assert data["features"]["login"] == "available (mock)"
        assert data["features"]["register"] == "available (mock)"
        assert data["features"]["jwt"] == "available (mock)"
        assert data["features"]["oauth"] == "not implemented"
        assert data["features"]["password_reset"] == "available (mock)"
        assert "This is a mock implementation for testing purposes" in data["note"]
    
    def test_auth_endpoints_headers(self, client, api_headers):
        """Test that auth endpoints return proper headers"""
        # Test login
        response = client.post(
            "/api/v1/auth/login?username=testuser&password=testpass",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test health check
        response = client.get("/api/v1/auth/health", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
    
    def test_auth_data_structure(self, client, api_headers):
        """Test that auth responses have correct structure"""
        # Test login structure
        response = client.post(
            "/api/v1/auth/login?username=testuser&password=testpass",
            headers=api_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check required fields
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert "user" in data
        
        # Check data types
        assert isinstance(data["access_token"], str)
        assert isinstance(data["refresh_token"], str)
        assert isinstance(data["token_type"], str)
        assert isinstance(data["expires_in"], int)
        assert isinstance(data["user"], dict)
        
        # Check user structure
        user = data["user"]
        assert "id" in user
        assert "username" in user
        assert "email" in user
        assert "is_active" in user
    
    def test_auth_integration_workflow(self, client, api_headers):
        """Test complete authentication workflow integration"""
        # 1. Register a new user
        register_response = client.post(
            "/api/v1/auth/register?username=workflowuser&email=workflow@example.com&password=password123&confirm_password=password123",
            headers=api_headers
        )
        assert register_response.status_code == status.HTTP_200_OK
        
        # 2. Login with the new user (using test credentials)
        login_response = client.post(
            "/api/v1/auth/login?username=testuser&password=testpass",
            headers=api_headers
        )
        assert login_response.status_code == status.HTTP_200_OK
        
        # 3. Get current user information
        access_token = login_response.json()["access_token"]
        me_response = client.get(
            f"/api/v1/auth/me?authorization=Bearer {access_token}",
            headers=api_headers
        )
        assert me_response.status_code == status.HTTP_200_OK
        
        # 4. Refresh the token
        refresh_token = login_response.json()["refresh_token"]
        refresh_response = client.post(
            f"/api/v1/auth/refresh?refresh_token={refresh_token}",
            headers=api_headers
        )
        assert refresh_response.status_code == status.HTTP_200_OK
        
        # 5. Request password reset
        forgot_response = client.post(
            "/api/v1/auth/forgot-password?email=workflow@example.com",
            headers=api_headers
        )
        assert forgot_response.status_code == status.HTTP_200_OK
        
        # 6. Reset password
        reset_token = forgot_response.json()["reset_token"]
        reset_response = client.post(
            f"/api/v1/auth/reset-password?reset_token={reset_token}&new_password=newpassword123&confirm_password=newpassword123",
            headers=api_headers
        )
        assert reset_response.status_code == status.HTTP_200_OK
        
        # 7. Logout
        logout_response = client.post(
            f"/api/v1/auth/logout?access_token={access_token}",
            headers=api_headers
        )
        assert logout_response.status_code == status.HTTP_200_OK
        
        # Verify all operations returned expected data
        register_data = register_response.json()
        login_data = login_response.json()
        me_data = me_response.json()
        refresh_data = refresh_response.json()
        forgot_data = forgot_response.json()
        reset_data = reset_response.json()
        logout_data = logout_response.json()
        
        assert register_data["username"] == "workflowuser"
        assert login_data["user"]["username"] == "testuser"
        assert me_data["username"] == "testuser"
        assert "new_mock_access_token" in refresh_data["access_token"]
        assert forgot_data["email"] == "workflow@example.com"
        assert "Password reset successfully" in reset_data["message"]
        assert "Successfully logged out" in logout_data["message"]
    
    def test_auth_validation_workflow(self, client, api_headers):
        """Test authentication validation workflow"""
        # 1. Test valid login
        valid_login_response = client.post(
            "/api/v1/auth/login?username=testuser&password=testpass",
            headers=api_headers
        )
        assert valid_login_response.status_code == status.HTTP_200_OK
        
        # 2. Test invalid login
        invalid_login_response = client.post(
            "/api/v1/auth/login?username=wrong&password=wrong",
            headers=api_headers
        )
        assert invalid_login_response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # 3. Test invalid registration
        invalid_register_response = client.post(
            "/api/v1/auth/register?username=user&email=invalid&password=123&confirm_password=123",
            headers=api_headers
        )
        assert invalid_register_response.status_code == status.HTTP_400_BAD_REQUEST
        
        # 4. Test invalid token refresh
        invalid_refresh_response = client.post(
            "/api/v1/auth/refresh?refresh_token=invalid",
            headers=api_headers
        )
        assert invalid_refresh_response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # 5. Test invalid current user request
        invalid_me_response = client.get(
            "/api/v1/auth/me?authorization=Bearer invalid",
            headers=api_headers
        )
        assert invalid_me_response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Verify error messages
        assert "Invalid credentials" in invalid_login_response.json()["detail"]
        assert "Password must be at least 8 characters long" in invalid_register_response.json()["detail"]
        assert "Invalid refresh token" in invalid_refresh_response.json()["detail"]
        assert "Invalid access token" in invalid_me_response.json()["detail"]
