"""
Health check endpoints
"""

import time
from typing import Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, check_db_health
from app.core.redis import get_redis, check_redis_health
from app.core.celery import get_celery, check_celery_health
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/detailed")
async def detailed_health_check(
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Detailed health check with all service statuses"""
    start_time = time.time()
    
    # Check database health
    db_healthy = await check_db_health()
    
    # Check Redis health
    redis_healthy = await check_redis_health()
    
    # Check Celery health
    celery_healthy = await check_celery_health()
    
    # Calculate response time
    response_time = time.time() - start_time
    
    # Overall health status
    overall_healthy = all([db_healthy, redis_healthy, celery_healthy])
    
    return {
        "status": "healthy" if overall_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "response_time": round(response_time, 3),
        "services": {
            "database": {
                "status": "healthy" if db_healthy else "unhealthy",
                "type": "postgresql",
                "url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "unknown",
            },
            "redis": {
                "status": "healthy" if redis_healthy else "unhealthy",
                "type": "redis",
                "url": settings.REDIS_URL.split("@")[-1] if "@" in settings.REDIS_URL else "unknown",
            },
            "celery": {
                "status": "healthy" if celery_healthy else "unhealthy",
                "type": "celery",
                "broker": settings.CELERY_BROKER_URL.split("@")[-1] if "@" in settings.CELERY_BROKER_URL else "unknown",
            },
        },
        "system": {
            "python_version": "3.11+",
            "fastapi_version": "0.104+",
            "sqlalchemy_version": "2.0+",
        },
    }


@router.get("/health/ready")
async def readiness_check(
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Readiness check for Kubernetes/load balancer health checks"""
    try:
        # Check database connection
        db_healthy = await check_db_health()
        
        # Check Redis connection
        redis_healthy = await check_redis_health()
        
        # Check Celery connection
        celery_healthy = await check_celery_health()
        
        # All services must be healthy for readiness
        if not all([db_healthy, redis_healthy, celery_healthy]):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not ready",
            )
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat(),
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service not ready: {str(e)}",
        )


@router.get("/health/live")
async def liveness_check() -> Dict[str, Any]:
    """Liveness check for Kubernetes health checks"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/metrics")
async def metrics() -> Dict[str, Any]:
    """Application metrics for monitoring"""
    try:
        # Get Redis info
        redis_client = get_redis()
        redis_info = await redis_client.info()
        
        # Get Celery queue stats
        celery_app = get_celery()
        inspect = celery_app.control.inspect()
        
        # Get queue statistics
        active_tasks = inspect.active() or {}
        reserved_tasks = inspect.reserved() or {}
        scheduled_tasks = inspect.scheduled() or {}
        
        # Calculate total tasks
        total_active = sum(len(tasks) for tasks in active_tasks.values())
        total_reserved = sum(len(tasks) for tasks in reserved_tasks.values())
        total_scheduled = sum(len(tasks) for tasks in scheduled_tasks.values())
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "redis": {
                    "connected_clients": redis_info.get("connected_clients", 0),
                    "used_memory": redis_info.get("used_memory", 0),
                    "used_memory_human": redis_info.get("used_memory_human", "0B"),
                    "total_commands_processed": redis_info.get("total_commands_processed", 0),
                    "total_connections_received": redis_info.get("total_connections_received", 0),
                },
                "celery": {
                    "active_tasks": total_active,
                    "reserved_tasks": total_reserved,
                    "scheduled_tasks": total_scheduled,
                    "total_tasks": total_active + total_reserved + total_scheduled,
                },
                "application": {
                    "version": settings.VERSION,
                    "environment": settings.ENVIRONMENT,
                    "debug_mode": settings.DEBUG,
                },
            },
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}",
        )
