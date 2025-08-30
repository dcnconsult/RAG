# 🚀 RAG Explorer Production Deployment Guide

## Overview

This guide covers deploying the RAG Explorer application in production using Docker. The application supports a single-image deployment (PostgreSQL + pgvector, FastAPI, Nginx) orchestrated by supervisord, and also works with a multi-service approach if preferred.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Container                        │
│                + pgvector extension                       │
│                Port: 5432                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                FastAPI Backend Container                  │
│                + Python Dependencies                      │
│                Port: 8000                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Redis Container                            │
│                Port: 6379                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Frontend Container                         │
│                (Optional - Nginx)                         │
│                Port: 3000                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop running on Windows
- At least 4GB RAM available for Docker
- Ports 5432, 6379, 8000, and 3000 available

### Current Deployment Status

- ✅ **Production Docker Infrastructure**: Complete
- ✅ **Environment Variables**: All required settings configured
- ✅ **Service Orchestration**: Docker Compose configuration ready
- 🔄 **Production Services**: Ready to start
- 🔄 **Frontend Deployment**: Ready to build and deploy

### Windows Deployment

1. **Run the deployment script:**
   ```cmd
   deploy.bat
   ```

2. **Or manually:**
   ```cmd
   docker compose -f docker-compose.prod.yml up --build -d
   ```

### Linux/Mac Deployment

1. **Make script executable:**
   ```bash
   chmod +x deploy.sh
   ```

2. **Run deployment:**
   ```bash
   ./deploy.sh
   ```

## 📋 Service Details

### Single Image (`rag_app`)

- Base Image: `pgvector/pgvector:pg15`
- Processes: Postgres, Uvicorn (FastAPI), Nginx (SPA)
- Ports: 5432 (DB), 8000 (API), 80 (SPA)
- Orchestration: supervisord

### Redis Container

- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Purpose**: Caching, sessions, background tasks

### Internals

- Frontend: Vite build output served from `/usr/share/nginx/html`
- API: FastAPI exposed on 8000, reverse proxied at `/api/v1`
- DB init: `database/init.sql` applies `pgvector`, `pgcrypto`, schema, and seeds

## 🔧 Configuration

### Environment Variables

```bash
POSTGRES_DB=rag_db
POSTGRES_USER=rag_user
POSTGRES_PASSWORD=rag_password
ENVIRONMENT=production
DATABASE_URL=postgresql://rag_user:rag_password@localhost:5432/rag_db
```

### Volumes

- `postgres_data`: PostgreSQL data persistence
- `uploads`: File upload storage
- `logs`: Application and supervisor logs
- `database/init.sql`: Database initialization script

## 📊 Health Checks

### PostgreSQL Health Check
```bash
pg_isready -U rag_user -d rag_db
```

### FastAPI Health Check
```bash
curl -f http://localhost:8000/api/v1/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5432, 6379, 8000, 3000 are free
2. **Memory issues**: Increase Docker memory allocation to 4GB+
3. **Permission errors**: Check file permissions on uploads and logs directories

### Logs

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f rag_app
docker compose -f docker-compose.prod.yml logs -f redis
```

### Container Status

```bash
docker compose -f docker-compose.prod.yml ps
```

## 🔄 Management Commands

### Start Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Rebuild and Start
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## 📈 Monitoring

### Resource Usage
```bash
docker stats
```

### Database Connections
```bash
docker exec -it rag_production_app psql -U rag_user -d rag_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### Application Metrics
- API Docs: http://localhost:8000/api/v1/docs
- Health: http://localhost:8000/api/v1/health

## 🔒 Security Considerations

- **Default passwords**: Change default database passwords in production
- **Network access**: Restrict external access to database ports
- **SSL/TLS**: Enable HTTPS for production deployments
- **Firewall**: Configure Windows Firewall appropriately

## 🚀 Scaling

### Vertical Scaling
- Increase Docker memory allocation
- Adjust PostgreSQL shared_buffers and work_mem

### Horizontal Scaling
- Use external PostgreSQL instance
- Implement Redis clustering
- Add load balancer for multiple backend instances

## 📝 Next Steps

After successful deployment:

1. **Test the application**: Navigate to http://localhost/
2. **Verify API**: Check http://localhost:8000/api/v1/docs
3. **Monitor logs**: Watch for any errors or warnings
4. **Performance tuning**: Adjust PostgreSQL and Redis settings as needed

## 🆘 Support

For deployment issues:

1. Check Docker logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify container status: `docker-compose -f docker-compose.prod.yml ps`
3. Check resource usage: `docker stats`
4. Review this deployment guide for common solutions
