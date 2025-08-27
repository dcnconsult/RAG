# Backend Testing Guide

## Overview

This document provides comprehensive guidance for testing the RAG Explorer Backend API. The testing suite uses pytest with async support and includes unit tests, integration tests, and API endpoint tests.

## Test Structure

```
tests/
├── __init__.py              # Tests package
├── conftest.py              # Pytest configuration and fixtures
├── test_health.py           # Health endpoint tests
├── test_domains.py          # Domains endpoint tests
├── test_documents.py        # Documents endpoint tests
├── test_chats.py            # Chat endpoint tests
├── test_search.py           # Search endpoint tests
├── test_rag.py              # RAG endpoint tests
├── test_auth.py             # Authentication tests
├── test_users.py            # User management tests
└── test_external_models.py  # External LLM integration tests
```

## Test Categories

### 1. Unit Tests (`@pytest.mark.unit`)
- Test individual functions and methods
- Mock external dependencies
- Fast execution
- High isolation

### 2. Integration Tests (`@pytest.mark.integration`)
- Test component interactions
- Use test database
- Test business logic flows
- Medium execution time

### 3. API Tests (`@pytest.mark.api`)
- Test HTTP endpoints
- Validate request/response formats
- Test error handling
- Use test client

### 4. Slow Tests (`@pytest.mark.slow`)
- Tests that take longer to execute
- External API calls
- Complex operations
- Can be skipped in CI

## Running Tests

### Basic Test Execution

```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=app --cov-report=term-missing

# Run specific test file
python -m pytest tests/test_health.py

# Run specific test function
python -m pytest tests/test_health.py::TestHealthEndpoint::test_health_check
```

### Using the Test Runner Script

```bash
# Run all tests with coverage
python run_tests.py

# Run only API tests
python run_tests.py --type api

# Run only unit tests
python run_tests.py --type unit

# Run fast tests (exclude slow)
python run_tests.py --type fast

# Run with verbose output
python run_tests.py --verbose

# Disable coverage
python run_tests.py --no-coverage

# Generate coverage report only
python run_tests.py --coverage-only
```

### Test Markers

```bash
# Run tests by marker
pytest -m unit
pytest -m integration
pytest -m api
pytest -m "not slow"
```

## Test Configuration

### Pytest Configuration (`pytest.ini`)

- **Test Discovery**: Automatically finds test files
- **Coverage**: 80% minimum coverage required
- **Async Support**: Automatic async test detection
- **Output**: Verbose output with short tracebacks

### Coverage Configuration

- **HTML Report**: Generated in `htmlcov/` directory
- **XML Report**: Generated as `coverage.xml`
- **Terminal Report**: Shows missing lines
- **Threshold**: Fails if coverage < 80%

## Test Fixtures

### Database Fixtures

```python
@pytest.fixture
async def db_session():
    """Create test database session"""
    # Uses in-memory SQLite for testing
    
@pytest.fixture
async def override_get_db(db_session):
    """Override database dependency"""
```

### HTTP Client Fixtures

```python
@pytest.fixture
def client(app):
    """Synchronous test client"""
    
@pytest.fixture
async def async_client(app):
    """Asynchronous test client"""
```

### Mock Fixtures

```python
@pytest.fixture
def mock_redis():
    """Mock Redis client"""
    
@pytest.fixture
def mock_celery():
    """Mock Celery tasks"""
    
@pytest.fixture
def mock_openai():
    """Mock OpenAI client"""
```

### Test Data Fixtures

```python
@pytest.fixture
def sample_domain_data():
    """Sample domain data for testing"""
    
@pytest.fixture
def sample_document_data():
    """Sample document data for testing"""
```

## Writing Tests

### Test Class Structure

```python
class TestEndpointName:
    """Test endpoint functionality"""
    
    @pytest.mark.api
    async def test_functionality(self, async_client: AsyncClient):
        """Test description"""
        # Test implementation
        pass
```

### Async Test Pattern

```python
@pytest.mark.api
async def test_async_endpoint(self, async_client: AsyncClient):
    """Test async endpoint"""
    response = await async_client.get("/api/v1/endpoint/")
    assert response.status_code == 200
    
    data = response.json()
    assert "expected_field" in data
```

### Test Data Validation

```python
def test_response_structure(self, response_data):
    """Validate response structure"""
    required_fields = ["id", "name", "created_at"]
    
    for field in required_fields:
        assert field in response_data, f"Missing field: {field}"
    
    # Validate data types
    assert isinstance(response_data["id"], int)
    assert isinstance(response_data["name"], str)
```

### Error Handling Tests

```python
def test_invalid_input(self, client):
    """Test invalid input handling"""
    invalid_data = {"name": ""}
    
    response = client.post("/api/v1/endpoint/", json=invalid_data)
    assert response.status_code == 422
    
    error_data = response.json()
    assert "detail" in error_data
```

## Test Database

### In-Memory SQLite

- **Fast**: No disk I/O
- **Isolated**: Fresh database per test
- **Simple**: No external dependencies
- **Reset**: Automatic cleanup

### Database Operations

```python
# Create test data
async with db_session.begin():
    domain = Domain(**domain_data)
    db_session.add(domain)
    await db_session.flush()
    domain_id = domain.id

# Query test data
result = await db_session.execute(
    select(Domain).where(Domain.id == domain_id)
)
domain = result.scalar_one()
```

## Mocking External Services

### Redis Mocking

```python
@pytest.fixture
def mock_redis():
    mock = MagicMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock()
    return mock

def test_with_redis_mock(mock_redis):
    # Use mock_redis in test
    pass
```

### OpenAI Mocking

```python
@pytest.fixture
def mock_openai():
    mock = MagicMock()
    mock.embeddings.create = AsyncMock(
        return_value=MagicMock(data=[{"embedding": [0.1] * 1536}])
    )
    return mock
```

### Celery Mocking

```python
@pytest.fixture
def mock_celery():
    mock = MagicMock()
    mock.send_task = AsyncMock()
    mock.AsyncResult = MagicMock()
    return mock
```

## Test Coverage

### Coverage Requirements

- **Minimum**: 80% overall coverage
- **Critical Paths**: 90% coverage
- **API Endpoints**: 95% coverage
- **Business Logic**: 85% coverage

### Coverage Reports

```bash
# Generate HTML report
python -m coverage html

# Generate XML report
python -m coverage xml

# Show coverage in terminal
python -m coverage report
```

### Coverage Exclusions

```python
# Exclude from coverage
# pragma: no cover
def not_covered_function():
    pass

# Exclude specific lines
if __name__ == "__main__":  # pragma: no cover
    main()
```

## Continuous Integration

### GitHub Actions

```yaml
- name: Run Backend Tests
  run: |
    cd backend
    python -m pytest --cov=app --cov-report=xml
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./backend/coverage.xml
```

### Pre-commit Hooks

```yaml
- repo: local
  hooks:
    - id: pytest
      name: pytest
      entry: python -m pytest
      language: system
      pass_filenames: false
      always_run: true
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use fresh fixtures per test
- Clean up test data

### 2. Descriptive Names
- Test names should describe behavior
- Use clear, descriptive assertions
- Document test purpose

### 3. Arrange-Act-Assert
```python
def test_user_creation(self, client, sample_user_data):
    # Arrange: Prepare test data
    user_data = sample_user_data.copy()
    
    # Act: Execute the action
    response = client.post("/api/v1/users/", json=user_data)
    
    # Assert: Verify the result
    assert response.status_code == 201
    assert "id" in response.json()
```

### 4. Error Testing
- Test both success and failure cases
- Validate error messages and codes
- Test edge cases and boundaries

### 5. Performance
- Keep tests fast (< 1 second each)
- Use appropriate test markers
- Mock slow external services

## Troubleshooting

### Common Issues

1. **Import Errors**: Check PYTHONPATH and app structure
2. **Database Issues**: Verify test database configuration
3. **Async Issues**: Ensure proper async/await usage
4. **Mock Issues**: Check mock setup and return values

### Debug Mode

```bash
# Run with debug output
python -m pytest -s -v

# Run single test with debug
python -m pytest tests/test_file.py::test_function -s -v

# Use pdb for debugging
python -m pytest --pdb
```

### Test Logging

```python
import logging

def test_with_logging():
    logging.basicConfig(level=logging.DEBUG)
    # Test implementation
```

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/20/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)
