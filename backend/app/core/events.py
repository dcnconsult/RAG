"""
Application event handlers for startup and shutdown
"""

import asyncio
import logging
from typing import Callable, Awaitable
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.redis import init_redis, close_redis
from app.core.celery import init_celery, close_celery

logger = logging.getLogger(__name__)


def create_start_app_handler(app: FastAPI) -> Callable[[], Awaitable[None]]:
    """Create application startup handler"""
    
    async def start_app() -> None:
        """Application startup tasks"""
        logger.info("Starting RAG Explorer Backend API...")
        
        try:
            # Initialize database
            logger.info("Initializing database connection...")
            await init_db()
            logger.info("Database connection established")
            
            # Initialize Redis
            logger.info("Initializing Redis connection...")
            await init_redis()
            logger.info("Redis connection established")
            
            # Initialize Celery
            logger.info("Initializing Celery...")
            init_celery()
            logger.info("Celery initialized")
            
            # Create uploads directory
            import os
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            logger.info(f"Uploads directory ready: {settings.UPLOAD_DIR}")
            
            logger.info("RAG Explorer Backend API started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start application: {e}")
            raise
    
    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable[[], Awaitable[None]]:
    """Create application shutdown handler"""
    
    async def stop_app() -> None:
        """Application shutdown tasks"""
        logger.info("Shutting down RAG Explorer Backend API...")
        
        try:
            # Close Celery
            logger.info("Closing Celery...")
            close_celery()
            logger.info("Celery closed")
            
            # Close Redis
            logger.info("Closing Redis connection...")
            await close_redis()
            logger.info("Redis connection closed")
            
            # Close database
            logger.info("Closing database connection...")
            await close_db()
            logger.info("Database connection closed")
            
            logger.info("RAG Explorer Backend API shut down successfully")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
    
    return stop_app


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    await create_start_app_handler(app)()
    
    yield
    
    # Shutdown
    await create_stop_app_handler(app)()
