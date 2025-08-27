# RAG Explorer - Development Guide

This guide provides comprehensive information for developers working on the RAG Explorer project.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

### One-Command Setup
```bash
# Linux/macOS
./scripts/setup-dev.sh

# Windows
scripts\setup-dev.bat

# Or use Make
make setup
```

## 🏗️ Project Structure

```
RAG/
├── backend/                 # FastAPI Python backend
│   ├── app/                # Application source code
│   │   ├── api/           # API route handlers
│   │   ├── core/          # Core configuration
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── tests/             # Test suite
│   ├── pyproject.toml     # Poetry configuration
│   └── Dockerfile         # Backend container
├── frontend/               # React TypeScript frontend
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container
├── database/               # Database schemas
├── nginx/                  # Nginx configuration
├── scripts/                # Development scripts
├── docker-compose.yml      # Service orchestration
└── Makefile               # Development commands
```

## 🛠️ Development Commands

### Using Make (Recommended)
```bash
make help              # Show all available commands
make setup             # Setup development environment
make dev               # Start all development servers
make dev-backend       # Start backend only
make dev-frontend      # Start frontend only
make test              # Run all tests
make lint              # Run linting
make format            # Format code
make type-check        # Run type checking
make clean             # Clean build artifacts
```

### Manual Commands
```bash
# Backend
cd backend
poetry install
poetry run uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up -d
docker-compose logs -f
```

## 🔧 Development Environment

### Backend (FastAPI)
- **Framework**: FastAPI 0.104+
- **Python**: 3.11+
- **Package Manager**: Poetry
- **Database**: PostgreSQL 15+ with pgvector
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic
- **Testing**: pytest

### Frontend (React)
- **Framework**: React 18+
- **Language**: TypeScript 5.0+
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 3.3+
- **State Management**: Zustand + React Query
- **Testing**: Vitest + Playwright
- **Linting**: ESLint + Prettier

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL with pgvector extension
- **Caching**: Redis
- **Reverse Proxy**: Nginx
- **Background Tasks**: Celery

## 📊 Database Development

### Local Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready
sleep 10

# Run migrations
cd backend
poetry run alembic upgrade head
```

### Database Schema
The database includes the following core tables:
- `domains` - RAG knowledge domains
- `documents` - Uploaded files and metadata
- `document_chunks` - Text chunks with vector embeddings
- `chats` - Chat sessions
- `chat_messages` - Individual chat messages
- `external_models` - LLM provider configurations

### Working with Migrations
```bash
# Create a new migration
cd backend
poetry run alembic revision --autogenerate -m "Description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migrations
poetry run alembic downgrade -1
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test file
poetry run pytest tests/test_api.py

# Run with verbose output
poetry run pytest -v
```

### Frontend Testing
```bash
cd frontend

# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:ui
```

### Test Structure
```
backend/tests/
├── conftest.py          # Test configuration
├── test_api/            # API endpoint tests
├── test_models/         # Model tests
├── test_services/       # Service tests
└── test_utils/          # Utility tests

frontend/src/
├── __tests__/           # Test files
├── components/          # Component tests
├── hooks/              # Hook tests
└── utils/              # Utility tests
```

## 🔍 Code Quality

### Pre-commit Hooks
The project uses pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
pre-commit install
pre-commit install --hook-type commit-msg

# Run manually
pre-commit run --all-files
```

### Code Formatting
```bash
# Backend (Python)
cd backend
poetry run black app tests
poetry run isort app tests

# Frontend (TypeScript)
cd frontend
npm run format
```

### Linting
```bash
# Backend (Python)
cd backend
poetry run flake8 app tests
poetry run mypy app

# Frontend (TypeScript)
cd frontend
npm run lint
npm run type-check
```

## 🐳 Docker Development

### Development Services
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Build
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Run production stack
docker-compose -f docker-compose.yml --profile production up -d
```

### Docker Commands
```bash
# Access database
docker-compose exec postgres psql -U rag_user -d rag_db

# Access Redis
docker-compose exec redis redis-cli

# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh
```

## 🔐 Environment Configuration

### Backend Environment
Copy `backend/env.example` to `backend/.env` and configure:

```env
# Database
DATABASE_URL=postgresql://rag_user:rag_password@localhost:5432/rag_db

# API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Security
SECRET_KEY=your-secret-key
```

### Frontend Environment
Copy `frontend/env.local.example` to `frontend/.env.local` and configure:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=RAG Explorer
```

## 📝 API Development

### API Structure
```
/api/v1/
├── /domains/            # Domain management
├── /documents/          # Document management
├── /chats/              # Chat functionality
├── /search/             # Vector search
└── /health              # Health checks
```

### API Documentation
- **Development**: http://localhost:8000/docs (Swagger UI)
- **Alternative**: http://localhost:8000/redoc (ReDoc)

### Testing API Endpoints
```bash
# Using curl
curl -X GET "http://localhost:8000/api/v1/health"

# Using httpie
http GET localhost:8000/api/v1/health

# Using the Swagger UI
# Visit http://localhost:8000/docs
```

## 🎨 Frontend Development

### Component Development
```bash
# Create new component
mkdir frontend/src/components/NewComponent
touch frontend/src/components/NewComponent/index.tsx
touch frontend/src/components/NewComponent/NewComponent.test.tsx
```

### State Management
- **Local State**: React useState/useReducer
- **Global State**: Zustand stores
- **Server State**: React Query for API calls
- **Form State**: React Hook Form

### Styling Guidelines
- Use Tailwind CSS utility classes
- Create custom components for reusable patterns
- Follow mobile-first responsive design
- Use CSS variables for theme customization

## 🚀 Deployment

### Development Deployment
```bash
# Start development stack
make dev

# Or individual services
make dev-backend
make dev-frontend
```

### Production Deployment
```bash
# Build production images
make docker-build

# Deploy with production profile
docker-compose --profile production up -d
```

### Environment-Specific Configs
- **Development**: `.env.development`
- **Testing**: `.env.test`
- **Production**: `.env.production`

## 🐛 Debugging

### Backend Debugging
```bash
# Enable debug mode
export DEBUG=true

# Use Python debugger
import pdb; pdb.set_trace()

# Use ipdb for better debugging
poetry add --group dev ipdb
import ipdb; ipdb.set_trace()
```

### Frontend Debugging
```bash
# Enable React DevTools
# Install browser extension

# Use browser dev tools
console.log('Debug info');
debugger;

# Use React Query DevTools
# Available in development mode
```

### Database Debugging
```bash
# Enable SQL logging
export SQL_DEBUG=true

# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U rag_user -d rag_db
```

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [Poetry Documentation](https://python-poetry.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

### Best Practices
- [Python Code Style](https://pep8.org/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [API Design Guidelines](https://github.com/microsoft/api-guidelines)

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes following coding standards
3. Write/update tests
4. Run quality checks (lint, format, test)
5. Commit using conventional commit format
6. Create pull request

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add JWT authentication`
- `fix(api): resolve CORS issue`
- `docs(readme): update installation instructions`

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate

## 🆘 Getting Help

### Common Issues
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review [GitHub Issues](https://github.com/your-org/rag-explorer/issues)
- Search [GitHub Discussions](https://github.com/your-org/rag-explorer/discussions)

### Support Channels
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/rag-explorer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/rag-explorer/discussions)
- **Wiki**: [GitHub Wiki](https://github.com/your-org/rag-explorer/wiki)

---

Happy coding! 🚀 If you have questions or need help, don't hesitate to reach out to the development team.
