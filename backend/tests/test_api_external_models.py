"""
Tests for External Models API endpoints
"""

import pytest
from fastapi import status


class TestExternalModelsEndpoints:
    """Test external model management endpoints"""
    
    def test_create_external_model_success(self, client, api_headers):
        """Test successful external model creation"""
        # Arrange
        model_data = {
            "name": "test-model",
            "provider": "openai",
            "model_type": "chat",
            "config": '{"api_key": "test_key", "temperature": 0.7}',
            "is_active": True
        }
        
        # Act
        response = client.post(
            f"/api/v1/external-models/?name={model_data['name']}&provider={model_data['provider']}&model_type={model_data['model_type']}&config={model_data['config']}&is_active={model_data['is_active']}",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == model_data["name"]
        assert data["provider"] == model_data["provider"]
        assert data["model_type"] == model_data["model_type"]
        assert data["is_active"] == model_data["is_active"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_external_model_empty_name(self, client, api_headers):
        """Test external model creation with empty name"""
        # Act
        response = client.post(
            "/api/v1/external-models/?name=&provider=openai&model_type=chat&config={}",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Model name cannot be empty" in data["detail"]
    
    def test_create_external_model_invalid_provider(self, client, api_headers):
        """Test external model creation with invalid provider"""
        # Act
        response = client.post(
            "/api/v1/external-models/?name=test&provider=invalid&model_type=chat&config={}",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Unsupported provider" in data["detail"]
    
    def test_create_external_model_invalid_type(self, client, api_headers):
        """Test external model creation with invalid model type"""
        # Act
        response = client.post(
            "/api/v1/external-models/?name=test&provider=openai&model_type=invalid&config={}",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Unsupported model type" in data["detail"]
    
    def test_create_external_model_invalid_json_config(self, client, api_headers):
        """Test external model creation with invalid JSON config"""
        # Act
        response = client.post(
            "/api/v1/external-models/?name=test&provider=openai&model_type=chat&config=invalid_json&is_active=true",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Invalid JSON configuration" in data["detail"]
    
    def test_create_external_model_with_different_providers(self, client, api_headers):
        """Test external model creation with different providers"""
        providers = ["openai", "anthropic", "cohere", "huggingface"]
        
        for provider in providers:
            response = client.post(
                f"/api/v1/external-models/?name=test-{provider}&provider={provider}&model_type=chat&config={{}}&is_active=true",
                headers=api_headers
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["provider"] == provider
    
    def test_create_external_model_with_different_types(self, client, api_headers):
        """Test external model creation with different model types"""
        model_types = ["chat", "completion", "embedding"]
        
        for model_type in model_types:
            response = client.post(
                f"/api/v1/external-models/?name=test-{model_type}&provider=openai&model_type={model_type}&config={{}}&is_active=true",
                headers=api_headers
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["model_type"] == model_type
    
    def test_list_external_models_success(self, client, api_headers):
        """Test successful listing of external models"""
        # Act
        response = client.get("/api/v1/external-models/", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "models" in data
        assert "count" in data
        assert "filters" in data
        assert data["count"] > 0
        assert len(data["models"]) > 0
        
        # Check model structure
        if data["models"]:
            model = data["models"][0]
            assert "id" in model
            assert "name" in model
            assert "provider" in model
            assert "model_type" in model
            assert "is_active" in model
            assert "created_at" in model
            assert "updated_at" in model
    
    def test_list_external_models_with_provider_filter(self, client, api_headers):
        """Test listing external models with provider filter"""
        # Act
        response = client.get("/api/v1/external-models/?provider=openai", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["filters"]["provider"] == "openai"
        
        # All returned models should have the specified provider
        for model in data["models"]:
            assert model["provider"] == "openai"
    
    def test_list_external_models_with_type_filter(self, client, api_headers):
        """Test listing external models with model type filter"""
        # Act
        response = client.get("/api/v1/external-models/?model_type=chat", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["filters"]["model_type"] == "chat"
        
        # All returned models should have the specified type
        for model in data["models"]:
            assert model["model_type"] == "chat"
    
    def test_list_external_models_with_active_filter(self, client, api_headers):
        """Test listing external models with active status filter"""
        # Act
        response = client.get("/api/v1/external-models/?is_active=true", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["filters"]["is_active"] is True
        
        # All returned models should be active
        for model in data["models"]:
            assert model["is_active"] is True
    
    def test_list_external_models_with_multiple_filters(self, client, api_headers):
        """Test listing external models with multiple filters"""
        # Act
        response = client.get(
            "/api/v1/external-models/?provider=openai&model_type=chat&is_active=true",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["filters"]["provider"] == "openai"
        assert data["filters"]["model_type"] == "chat"
        assert data["filters"]["is_active"] is True
        
        # All returned models should match all filters
        for model in data["models"]:
            assert model["provider"] == "openai"
            assert model["model_type"] == "chat"
            assert model["is_active"] is True
    
    def test_get_external_model_success(self, client, api_headers):
        """Test successful retrieval of external model"""
        # Act
        response = client.get("/api/v1/external-models/valid-model-id", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == "valid-model-id"
        assert data["name"] == "gpt-4"
        assert data["provider"] == "openai"
        assert data["model_type"] == "chat"
        assert data["is_active"] is True
        assert "config" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_get_external_model_not_found(self, client, api_headers):
        """Test retrieval of non-existent external model"""
        # Act
        response = client.get("/api/v1/external-models/non-existent-id", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Model not found" in data["detail"]
    
    def test_update_external_model_success(self, client, api_headers):
        """Test successful update of external model"""
        # Act
        response = client.put(
            "/api/v1/external-models/valid-model-id?name=updated-model&provider=anthropic&model_type=completion&is_active=false",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == "valid-model-id"
        assert data["name"] == "updated-model"
        assert data["provider"] == "anthropic"
        assert data["model_type"] == "completion"
        assert data["is_active"] is False
    
    def test_update_external_model_not_found(self, client, api_headers):
        """Test update of non-existent external model"""
        # Act
        response = client.put(
            "/api/v1/external-models/non-existent-id?name=test",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Model not found" in data["detail"]
    
    def test_update_external_model_invalid_provider(self, client, api_headers):
        """Test update with invalid provider"""
        # Act
        response = client.put(
            "/api/v1/external-models/valid-model-id?provider=invalid",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Unsupported provider" in data["detail"]
    
    def test_update_external_model_invalid_type(self, client, api_headers):
        """Test update with invalid model type"""
        # Act
        response = client.put(
            "/api/v1/external-models/valid-model-id?model_type=invalid",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Unsupported model type" in data["detail"]
    
    def test_update_external_model_invalid_json_config(self, client, api_headers):
        """Test update with invalid JSON config"""
        # Act
        response = client.put(
            "/api/v1/external-models/valid-model-id?config=invalid_json",
            headers=api_headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Invalid JSON configuration" in data["detail"]
    
    def test_delete_external_model_success(self, client, api_headers):
        """Test successful deletion of external model"""
        # Act
        response = client.delete("/api/v1/external-models/valid-model-id", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
    
    def test_delete_external_model_not_found(self, client, api_headers):
        """Test deletion of non-existent external model"""
        # Act
        response = client.delete("/api/v1/external-models/non-existent-id", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Model not found" in data["detail"]
    
    def test_test_model_connection_success(self, client, api_headers):
        """Test successful model connection test"""
        # Act
        response = client.post("/api/v1/external-models/valid-model-id/test", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["model_id"] == "valid-model-id"
        assert data["status"] == "connected"
        assert "response_time" in data
        assert "capabilities" in data
        assert "tested_at" in data
        assert len(data["capabilities"]) > 0
    
    def test_test_model_connection_not_found(self, client, api_headers):
        """Test connection test for non-existent model"""
        # Act
        response = client.post("/api/v1/external-models/non-existent-id/test", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "Model not found" in data["detail"]
    
    def test_get_provider_models_success(self, client, api_headers):
        """Test successful retrieval of provider models"""
        # Test with OpenAI
        response = client.get("/api/v1/external-models/providers/openai/models", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["provider"] == "openai"
        assert "models" in data
        assert "count" in data
        assert data["count"] > 0
        
        # Test with Anthropic
        response = client.get("/api/v1/external-models/providers/anthropic/models", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["provider"] == "anthropic"
        assert data["count"] > 0
    
    def test_get_provider_models_invalid_provider(self, client, api_headers):
        """Test retrieval of models for invalid provider"""
        # Act
        response = client.get("/api/v1/external-models/providers/invalid/models", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Unsupported provider" in data["detail"]
    
    def test_get_supported_providers_success(self, client, api_headers):
        """Test successful retrieval of supported providers"""
        # Act
        response = client.get("/api/v1/external-models/providers", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "providers" in data
        assert "count" in data
        assert data["count"] == 4
        
        # Check provider structure
        if data["providers"]:
            provider = data["providers"][0]
            assert "name" in provider
            assert "description" in provider
            assert "supported_types" in provider
            assert "website" in provider
            assert len(provider["supported_types"]) > 0
    
    def test_external_models_health_check(self, client, api_headers):
        """Test external models service health check"""
        # Act
        response = client.get("/api/v1/external-models/health", headers=api_headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "external_models"
        assert "features" in data
        assert data["features"]["model_management"] == "available"
        assert "openai, anthropic, cohere, huggingface" in data["features"]["provider_support"]
        assert data["features"]["connection_testing"] == "available"
        assert data["features"]["configuration_validation"] == "available"
    
    def test_external_models_endpoints_headers(self, client, api_headers):
        """Test that external models endpoints return proper headers"""
        # Test list models
        response = client.get("/api/v1/external-models/", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test get model
        response = client.get("/api/v1/external-models/valid-model-id", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
        
        # Test health check
        response = client.get("/api/v1/external-models/health", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"
    
    def test_external_models_data_structure(self, client, api_headers):
        """Test that external models responses have correct structure"""
        # Test list models structure
        response = client.get("/api/v1/external-models/", headers=api_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check required fields
        assert "models" in data
        assert "count" in data
        assert "filters" in data
        
        # Check data types
        assert isinstance(data["models"], list)
        assert isinstance(data["count"], int)
        assert isinstance(data["filters"], dict)
        
        # Check model structure if models exist
        if data["models"]:
            model = data["models"][0]
            assert "id" in model
            assert "name" in model
            assert "provider" in model
            assert "model_type" in model
            assert "is_active" in model
            assert "created_at" in model
            assert "updated_at" in model
    
    def test_external_models_integration_workflow(self, client, api_headers):
        """Test complete external models workflow integration"""
        # 1. Create a new model
        create_response = client.post(
            "/api/v1/external-models/?name=workflow-test&provider=openai&model_type=chat&config={}&is_active=true",
            headers=api_headers
        )
        assert create_response.status_code == status.HTTP_200_OK
        
        # 2. List models to verify creation
        list_response = client.get("/api/v1/external-models/", headers=api_headers)
        assert list_response.status_code == status.HTTP_200_OK
        
        # 3. Get the created model
        model_id = create_response.json()["id"]
        get_response = client.get(f"/api/v1/external-models/{model_id}", headers=api_headers)
        assert get_response.status_code == status.HTTP_200_OK
        
        # 4. Update the model
        update_response = client.put(
            f"/api/v1/external-models/{model_id}?name=updated-workflow-test&is_active=false",
            headers=api_headers
        )
        assert update_response.status_code == status.HTTP_200_OK
        
        # 5. Test the model connection
        test_response = client.post(f"/api/v1/external-models/{model_id}/test", headers=api_headers)
        assert test_response.status_code == status.HTTP_200_OK
        
        # 6. Delete the model
        delete_response = client.delete(f"/api/v1/external-models/{model_id}", headers=api_headers)
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        
        # 7. Verify deletion
        verify_response = client.get(f"/api/v1/external-models/{model_id}", headers=api_headers)
        assert verify_response.status_code == status.HTTP_404_NOT_FOUND
        
        # Verify all operations returned expected data
        create_data = create_response.json()
        get_data = get_response.json()
        update_data = update_response.json()
        test_data = test_response.json()
        
        assert create_data["name"] == "workflow-test"
        assert get_data["name"] == "workflow-test"
        assert update_data["name"] == "updated-workflow-test"
        assert update_data["is_active"] is False
        assert test_data["model_id"] == model_id
        assert test_data["status"] == "connected"
    
    def test_external_models_validation_workflow(self, client, api_headers):
        """Test external models validation workflow"""
        # 1. Test valid model creation
        valid_response = client.post(
            "/api/v1/external-models/?name=valid&provider=openai&model_type=chat&config={}&is_active=true",
            headers=api_headers
        )
        assert valid_response.status_code == status.HTTP_200_OK
        
        # 2. Test invalid provider
        invalid_provider_response = client.post(
            "/api/v1/external-models/?name=invalid&provider=invalid&model_type=chat&config={}&is_active=true",
            headers=api_headers
        )
        assert invalid_provider_response.status_code == status.HTTP_400_BAD_REQUEST
        
        # 3. Test invalid model type
        invalid_type_response = client.post(
            "/api/v1/external-models/?name=invalid&provider=openai&model_type=invalid&config={}&is_active=true",
            headers=api_headers
        )
        assert invalid_type_response.status_code == status.HTTP_400_BAD_REQUEST
        
        # 4. Test invalid JSON config
        invalid_json_response = client.post(
            "/api/v1/external-models/?name=invalid&provider=openai&model_type=chat&config=invalid&is_active=true",
            headers=api_headers
        )
        assert invalid_json_response.status_code == status.HTTP_400_BAD_REQUEST
        
        # 5. Test empty name
        empty_name_response = client.post(
            "/api/v1/external-models/?name=&provider=openai&model_type=chat&config={}&is_active=true",
            headers=api_headers
        )
        assert empty_name_response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Verify error messages
        assert "Unsupported provider" in invalid_provider_response.json()["detail"]
        assert "Unsupported model type" in invalid_type_response.json()["detail"]
        assert "Invalid JSON configuration" in invalid_json_response.json()["detail"]
        assert "Model name cannot be empty" in empty_name_response.json()["detail"]
