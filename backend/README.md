# RAG Explorer Backend

Backend API for RAG Explorer - Intelligent Document Retrieval & Chat

## Features

- FastAPI-based REST API
- PostgreSQL with pgvector for vector storage
- RAG (Retrieval-Augmented Generation) system
- Document processing and embedding
- Chat functionality with LLM integration
- User authentication and management

## Development

### Setup

```bash
# Install dependencies
poetry install

# Run development server
poetry run uvicorn main:app --reload
```

### Testing

```bash
# Run all tests
python run_tests.py

# Run specific test types
python run_tests.py --type api
python run_tests.py --type unit
```

## API Documentation

- Swagger UI: `/api/v1/docs`
- ReDoc: `/api/v1/redoc`
- OpenAPI: `/api/v1/openapi.json`
- Health: `/api/v1/health`

## Docker (Single Image)

In production, the API runs inside the single image alongside PostgreSQL and Nginx, orchestrated by supervisord. The API is reverse-proxied under `/api/v1`.
