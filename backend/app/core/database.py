"""
Database configuration and connection management
"""

import logging
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class for all database models"""
    pass


# Database engine and session factory
_engine: Optional[AsyncEngine] = None
_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


async def init_db() -> None:
    """Initialize database connection"""
    global _engine, _session_factory
    
    try:
        # Create async engine
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            poolclass=NullPool if settings.is_testing else None,
            pool_pre_ping=True,
            pool_recycle=300,
            max_overflow=10,
            pool_size=20,
            connect_args={
                "ssl": False
            }
        )
        
        # Create session factory
        _session_factory = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        
        # Test connection
        async with _engine.begin() as conn:
            await conn.run_sync(lambda _: None)
        
        logger.info("Database connection initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db() -> None:
    """Close database connection"""
    global _engine, _session_factory
    
    try:
        if _engine:
            await _engine.dispose()
            _engine = None
            logger.info("Database connection closed")
        
        _session_factory = None
        
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get database session factory"""
    if not _session_factory:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _session_factory


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session context manager"""
    if not _session_factory:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI to get database session"""
    async for session in get_db_session():
        yield session


async def create_tables() -> None:
    """Create all database tables"""
    if not _engine:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    try:
        async with _engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        raise


async def drop_tables() -> None:
    """Drop all database tables (for testing)"""
    if not _engine:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    try:
        async with _engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        logger.info("Database tables dropped successfully")
        
    except Exception as e:
        logger.error(f"Failed to drop tables: {e}")
        raise


async def check_db_health() -> bool:
    """Check database health"""
    if not _engine:
        return False
    
    try:
        async with _engine.begin() as conn:
            await conn.run_sync(lambda _: None)
        return True
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
