# RAG Explorer - Setup Guide

## 🚀 Quick Start

This guide will help you get the RAG Explorer application up and running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Docker & Docker Compose** - [Download Docker](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download Git](https://git-scm.com/)

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd RAG
```

### 2. Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Install Poetry (if not already installed)
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Copy environment file
cp .env.example .env

# Edit environment variables
# You'll need to add your API keys and database configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://rag_user:rag_password@localhost:5432/rag_db

# API Keys (get these from the respective services)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

### 3. Set Up the Database

**Option A: Using Docker (Recommended)**
```bash
# From the project root directory
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

**Option B: Manual PostgreSQL Setup**
```bash
# Install PostgreSQL 15+ with pgvector extension
# Create database and user
# Run the initialization script
psql -U postgres -d rag_db -f database/init.sql
```

### 4. Set Up the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file (optional)
cp .env.example .env.local

# Edit frontend environment variables if needed
nano .env.local
```

**Frontend Environment Variables:**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=RAG Explorer
```

### 5. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Database (if using Docker):**
```bash
# Keep Docker services running
docker-compose up postgres redis
```

### 6. Verify Installation

- **Frontend**: Open [http://localhost:3000](http://localhost:3000)
- **Backend API**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database**: Check connection with `docker-compose ps`

## 🐳 Docker Setup (Alternative)

If you prefer to run everything in Docker:

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Kill the process or use different ports
```

**2. Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart the service
docker-compose restart postgres
```

**3. Python Dependencies**
```bash
cd backend
poetry env remove --all
poetry install
```

**4. Node Dependencies**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**5. Permission Issues (Linux/Mac)**
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in
```

### Environment-Specific Issues

**Windows:**
- Ensure WSL2 is enabled for Docker Desktop
- Use PowerShell or Command Prompt (not Git Bash for some commands)

**macOS:**
- Ensure Docker Desktop has sufficient resources allocated
- Check firewall settings

**Linux:**
- Ensure Docker service is running: `sudo systemctl start docker`
- Check user permissions for Docker

## 📚 Next Steps

Once your application is running:

1. **Create Your First Domain**: Navigate to the Domains page
2. **Upload Documents**: Use the Document Upload page
3. **Start Chatting**: Begin a conversation with your knowledge base
4. **Explore the API**: Check out the interactive API documentation

## 🛠️ Development Workflow

### Making Changes

1. **Backend Changes**: The server will automatically reload
2. **Frontend Changes**: Vite will hot-reload your changes
3. **Database Changes**: Use Alembic for migrations

### Testing

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

### Code Quality

```bash
# Backend formatting
cd backend
poetry run black .
poetry run isort .

# Frontend formatting
cd frontend
npm run format
npm run lint
```

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**: Look at terminal output and Docker logs
2. **Verify prerequisites**: Ensure all required software is installed
3. **Check environment variables**: Verify your `.env` files are correct
4. **Search issues**: Check if your problem has been reported before
5. **Ask for help**: Create an issue with detailed error information

## 🎯 Production Deployment

For production deployment:

1. **Environment Variables**: Set production values
2. **Database**: Use production PostgreSQL instance
3. **Security**: Enable HTTPS, set up firewalls
4. **Monitoring**: Set up logging and monitoring
5. **Backup**: Configure database and file backups

## 🚀 Performance Tips

- **Vector Search**: Optimize pgvector index parameters
- **Caching**: Use Redis for frequently accessed data
- **File Processing**: Process documents in background tasks
- **Frontend**: Enable code splitting and lazy loading

---

**Happy coding! 🎉**

Your RAG Explorer application should now be running and ready for development.
