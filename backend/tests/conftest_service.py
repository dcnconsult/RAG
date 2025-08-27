"""
Test configuration and fixtures for service layer testing
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

# Mock the VECTOR import before importing models
import sys
from unittest.mock import MagicMock

# Create a mock VECTOR type
class MockVECTOR:
    def __init__(self, dimension=None):
        self.dimension = dimension
    
    def __call__(self, *args, **kwargs):
        return MagicMock()

# Mock the module import
mock_sqlalchemy_postgresql = MagicMock()
mock_sqlalchemy_postgresql.VECTOR = MockVECTOR
mock_sqlalchemy_postgresql.JSONB = MagicMock()

# Patch the import
sys.modules['sqlalchemy.dialects.postgresql'] = mock_sqlalchemy_postgresql

# Now we can import the models
from app.models.domain import Domain
from app.models.document import Document, DocumentChunk
from app.models.chat import Chat, ChatMessage
from app.models.external_model import ExternalModel


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db_session():
    """Mock database session for unit tests."""
    mock = MagicMock()
    mock.add = AsyncMock()
    mock.commit = AsyncMock()
    mock.refresh = AsyncMock()
    mock.delete = AsyncMock()
    mock.execute = AsyncMock()
    mock.scalar_one = MagicMock()
    mock.scalars = MagicMock()
    
    # Configure default return values
    mock_result = MagicMock()
    mock_item = MagicMock()
    mock_item.id = 1
    mock_item.name = "Test Item"
    mock_result.scalar_one.return_value = mock_item
    mock_result.scalars.return_value.all.return_value = [
        MagicMock(id=i, name=f"Item {i}") for i in range(1, 6)
    ]
    mock.execute.return_value = mock_result
    
    return mock


@pytest.fixture
def sample_domain_data():
    """Sample domain data for testing."""
    return {
        "name": "Test Domain",
        "description": "A test domain for testing purposes",
        "is_public": True
    }


@pytest.fixture
def sample_document_data():
    """Sample document data for testing."""
    return {
        "title": "Test Document",
        "description": "A test document for testing purposes",
        "file_type": "pdf",
        "file_size": 1024,
        "domain_id": 1
    }


@pytest.fixture
def sample_chat_data():
    """Sample chat data for testing."""
    return {
        "title": "Test Chat",
        "domain_id": 1,
        "is_public": True
    }


@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    mock = MagicMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=True)
    mock.exists = AsyncMock(return_value=False)
    return mock


@pytest.fixture
def mock_celery():
    """Mock Celery client for testing."""
    mock = MagicMock()
    mock.send_task = AsyncMock(return_value=MagicMock(id="test-task-id"))
    mock.control.inspect.return_value.active.return_value = {"worker1": []}
    return mock


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    mock = MagicMock()
    mock.Embedding.create = AsyncMock(return_value=MagicMock(
        data=[{"embedding": [0.1] * 1536}]
    ))
    mock.ChatCompletion.create = AsyncMock(return_value=MagicMock(
        choices=[MagicMock(message=MagicMock(content="Test response"))]
    ))
    return mock


@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client for testing."""
    mock = MagicMock()
    mock.messages.create = AsyncMock(return_value=MagicMock(
        content=[MagicMock(text="Test response")]
    ))
    return mock
