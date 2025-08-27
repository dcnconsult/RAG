# RAG Explorer - Project Structure

## 📁 Directory Overview

```
RAG/
├── 📄 README.md                    # Project overview and setup instructions
├── 📄 WIP.md                       # Work in progress and task breakdown
├── 📄 PROJECT_STRUCTURE.md         # This file - project organization guide
├── 🐳 docker-compose.yml          # Docker services configuration
├── 📁 database/                    # Database schemas and migrations
│   └── 📄 init.sql                # PostgreSQL initialization script
├── 📁 backend/                     # FastAPI Python backend
│   ├── 📄 pyproject.toml          # Poetry dependencies and configuration
│   ├── 📄 .env.example            # Environment variables template
│   ├── 📄 main.py                 # FastAPI application entry point
│   └── 📁 app/                    # Application source code
│       ├── 📁 api/                # API route handlers
│       ├── 📁 core/               # Core configuration and settings
│       ├── 📁 models/             # SQLAlchemy database models
│       ├── 📁 schemas/            # Pydantic data validation schemas
│       ├── 📁 services/           # Business logic and external integrations
│       └── 📁 utils/              # Utility functions and helpers
├── 📁 frontend/                    # React TypeScript frontend
│   ├── 📄 package.json            # Node.js dependencies and scripts
│   ├── 📄 vite.config.ts          # Vite build configuration
│   ├── 📄 tailwind.config.js      # Tailwind CSS configuration
│   ├── 📄 tsconfig.json           # TypeScript configuration
│   ├── 📄 tsconfig.node.json      # TypeScript Node.js configuration
│   ├── 📄 postcss.config.js       # PostCSS configuration
│   ├── 📄 index.html              # HTML entry point
│   └── 📁 src/                    # Source code
│       ├── 📄 main.tsx            # React application entry point
│       ├── 📄 App.tsx             # Main application component
│       ├── 📄 index.css           # Global styles and Tailwind imports
│       ├── 📁 components/         # Reusable UI components
│       ├── 📁 pages/              # Page components and routing
│       ├── 📁 hooks/              # Custom React hooks
│       ├── 📁 utils/              # Utility functions
│       ├── 📁 types/              # TypeScript type definitions
│       └── 📁 store/              # State management
└── 📁 docs/                        # Documentation and guides
```

## 🏗️ Architecture Overview

### Backend (FastAPI + Python)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **Alembic**: Database migration tool
- **PostgreSQL + pgvector**: Vector database for embeddings
- **LangChain**: RAG orchestration and LLM integration
- **Redis**: Caching and session management
- **Celery**: Background task processing

### Frontend (React + TypeScript)
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management
- **React Router**: Client-side routing
- **React Hook Form**: Form handling and validation

## 🔧 Key Configuration Files

### Backend Configuration
- `pyproject.toml`: Poetry dependencies, Python version, and tool configurations
- `.env.example`: Environment variables template for database, API keys, etc.
- `main.py`: FastAPI application initialization and middleware setup

### Frontend Configuration
- `vite.config.ts`: Build tool configuration with path aliases and proxy settings
- `tailwind.config.js`: Custom design system with color palette and animations
- `tsconfig.json`: TypeScript compiler options and path mapping
- `package.json`: Dependencies, scripts, and project metadata

### Infrastructure Configuration
- `docker-compose.yml`: Multi-service container orchestration
- `database/init.sql`: Database schema, tables, and initial data

## 🚀 Development Workflow

### 1. Environment Setup
```bash
# Backend
cd backend
poetry install
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd frontend
npm install
```

### 2. Database Setup
```bash
# Using Docker
docker-compose up -d postgres

# Or manual PostgreSQL setup
# Install pgvector extension and run init.sql
```

### 3. Development Servers
```bash
# Backend (FastAPI)
cd backend
poetry run uvicorn main:app --reload

# Frontend (React)
cd frontend
npm run dev
```

### 4. Testing
```bash
# Backend tests
cd backend
poetry run pytest

# Frontend tests
cd frontend
npm run test
```

## 📊 Database Schema

### Core Tables
- **domains**: RAG knowledge domains
- **documents**: Uploaded files and metadata
- **document_chunks**: Text chunks with vector embeddings
- **chats**: Chat sessions
- **chat_messages**: Individual chat messages
- **external_models**: LLM provider configurations
- **vector_search_logs**: Search analytics

### Key Features
- **Vector Search**: PostgreSQL with pgvector extension
- **Document Processing**: Multi-format support (PDF, DOCX, TXT)
- **Chunking**: Configurable text chunking with overlap
- **Embeddings**: OpenAI ada-002 vector embeddings
- **Analytics**: Search performance tracking

## 🎨 Frontend Design System

### Color Palette
- **Primary**: Blue shades for main actions and branding
- **Secondary**: Gray shades for neutral elements
- **Success**: Green for positive actions and states
- **Warning**: Yellow/Orange for caution states
- **Error**: Red for error states and destructive actions
- **Accent**: Green for highlights and secondary actions

### Component Library
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Forms**: Input fields, validation states, and error handling
- **Cards**: Content containers with hover effects
- **Badges**: Status indicators and labels
- **Animations**: Smooth transitions and micro-interactions

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Grid System**: Flexible layout system
- **Typography**: Inter font family with proper scaling

## 🔐 Security & Performance

### Security Features
- **Input Validation**: Pydantic schemas for API validation
- **CORS Configuration**: Cross-origin resource sharing setup
- **Rate Limiting**: API request throttling
- **File Upload Security**: Type and size validation

### Performance Optimizations
- **Vector Indexing**: Efficient similarity search with pgvector
- **Caching**: Redis for frequently accessed data
- **Background Processing**: Celery for document processing
- **Code Splitting**: Dynamic imports and lazy loading
- **Bundle Optimization**: Vite build optimizations

## 📈 Monitoring & Analytics

### Metrics Tracked
- **Document Processing**: Upload and vectorization times
- **Search Performance**: Query response times and result counts
- **User Activity**: Chat sessions and document interactions
- **System Health**: API response times and error rates

### Logging
- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: Configurable verbosity
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Request timing and resource usage

## 🚀 Deployment

### Docker Deployment
- **Multi-stage builds**: Optimized production images
- **Health checks**: Service availability monitoring
- **Environment configuration**: Flexible deployment settings
- **Volume management**: Persistent data storage

### Production Considerations
- **SSL/TLS**: HTTPS encryption
- **Load Balancing**: Nginx reverse proxy
- **Monitoring**: Application performance monitoring
- **Backup**: Database and file backup strategies

## 🔄 Development Phases

### Phase 1: Infrastructure ✅
- [x] Project structure setup
- [x] Configuration files
- [x] Docker configuration
- [x] Database schema

### Phase 2: Backend Foundation 🚧
- [ ] FastAPI application setup
- [ ] Database models and migrations
- [ ] Basic API endpoints
- [ ] Authentication system

### Phase 3: Core Features 📋
- [ ] Domain management
- [ ] Document upload and processing
- [ ] Vector embedding system
- [ ] RAG retrieval engine

### Phase 4: Frontend Development 🎨
- [ ] Component library
- [ ] Page layouts
- [ ] State management
- [ ] API integration

### Phase 5: Testing & Deployment 🚀
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Monitoring setup

## 🤝 Contributing

### Code Standards
- **Python**: Black formatting, isort imports, mypy type checking
- **TypeScript**: ESLint rules, Prettier formatting
- **Git**: Conventional commit messages
- **Testing**: Minimum 80% code coverage

### Development Tools
- **Pre-commit hooks**: Automated code quality checks
- **Linting**: ESLint, Flake8, Black, isort
- **Type checking**: mypy, TypeScript compiler
- **Testing**: pytest, Vitest, Playwright

This structure provides a solid foundation for building a production-ready RAG application with modern best practices, scalable architecture, and excellent developer experience.
