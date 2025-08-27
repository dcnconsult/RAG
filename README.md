# RAG Explorer - Intelligent Document Retrieval & Chat

A modern, intuitive RAG (Retrieval-Augmented Generation) application that allows users to create, manage, and interact with knowledge domains powered by PostgreSQL vector databases.

## 🚀 Features

### Core RAG Capabilities
- **Domain Management**: Create, select, and delete RAG domains
- **Document Upload**: Support for multiple file formats (PDF, DOCX, TXT, etc.)
- **Vector Database**: PostgreSQL with pgvector extension for efficient similarity search
- **Intelligent Retrieval**: Semantic search and context-aware document retrieval
- **Chat Interface**: Natural language conversations with your knowledge base

### Advanced Features
- **External Model Integration**: Connect to external LLMs for enhanced responses
- **Multi-format Support**: Handle various document types seamlessly
- **Real-time Processing**: Stream document processing and vectorization
- **Responsive Design**: Modern, intuitive UI that works on all devices

## 🏗️ Architecture

```
RAG Explorer/
├── frontend/          # React + TypeScript + Tailwind CSS
├── backend/           # FastAPI + Python + PostgreSQL
├── database/          # Database migrations and schemas
├── docs/             # Documentation and guides
└── scripts/          # Utility scripts and setup
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + Headless UI
- React Query for state management
- React Hook Form for form handling

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL 15+ with pgvector
- SQLAlchemy + Alembic
- LangChain for RAG orchestration
- OpenAI/Anthropic API integration

**Infrastructure:**
- Docker & Docker Compose
- Poetry for Python dependency management
- Pre-commit hooks for code quality

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Docker & Docker Compose (optional)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd RAG
```

### 2. Backend Setup
```bash
cd backend
poetry install
cp .env.example .env
# Edit .env with your database and API keys
poetry run alembic upgrade head
poetry run uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Database Setup
```bash
# Using Docker (recommended)
docker-compose up -d postgres

# Or manual PostgreSQL setup
# Install pgvector extension and create database
```

## 📖 Usage

1. **Create a Domain**: Set up a new RAG domain with a descriptive name
2. **Upload Documents**: Add PDFs, Word docs, or text files to your domain
3. **Process & Vectorize**: Documents are automatically processed and embedded
4. **Chat & Retrieve**: Ask questions and get relevant information from your documents
5. **External Models**: Connect to OpenAI, Anthropic, or other LLMs for enhanced responses

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rag_db
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
VECTOR_DIMENSION=1536
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

**Frontend (.env.local):**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=RAG Explorer
```

## 🧪 Testing

```bash
# Backend tests
cd backend
poetry run pytest

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

## 📊 Performance Metrics

- **Document Processing**: < 30 seconds per MB
- **Query Response**: < 2 seconds average
- **Vector Search**: < 100ms for similarity queries
- **Concurrent Users**: 100+ simultaneous users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/rag-explorer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/rag-explorer/discussions)

## 🔮 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and usage tracking
- [ ] Mobile app (React Native)
- [ ] Enterprise SSO integration
- [ ] Advanced document preprocessing pipelines
