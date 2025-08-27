"""
Redis configuration and connection management
"""

import logging
from typing import Optional, Any
import json

import redis.asyncio as redis
from redis.asyncio import Redis

from app.core.config import settings

logger = logging.getLogger(__name__)


# Redis client instance
_redis_client: Optional[Redis] = None


async def init_redis() -> None:
    """Initialize Redis connection"""
    global _redis_client
    
    try:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30,
        )
        
        # Test connection
        await _redis_client.ping()
        
        logger.info("Redis connection initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Redis: {e}")
        raise


async def close_redis() -> None:
    """Close Redis connection"""
    global _redis_client
    
    try:
        if _redis_client:
            await _redis_client.close()
            _redis_client = None
            logger.info("Redis connection closed")
            
    except Exception as e:
        logger.error(f"Error closing Redis connection: {e}")


def get_redis() -> Redis:
    """Get Redis client instance"""
    if not _redis_client:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return _redis_client


async def check_redis_health() -> bool:
    """Check Redis health"""
    if not _redis_client:
        return False
    
    try:
        await _redis_client.ping()
        return True
        
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return False


# Cache utility functions
async def set_cache(key: str, value: Any, expire: int = 3600) -> bool:
    """Set cache value with expiration"""
    try:
        redis_client = get_redis()
        
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        
        await redis_client.setex(key, expire, value)
        return True
        
    except Exception as e:
        logger.error(f"Failed to set cache: {e}")
        return False


async def get_cache(key: str, default: Any = None) -> Any:
    """Get cache value"""
    try:
        redis_client = get_redis()
        value = await redis_client.get(key)
        
        if value is None:
            return default
        
        # Try to parse JSON
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value
            
    except Exception as e:
        logger.error(f"Failed to get cache: {e}")
        return default


async def delete_cache(key: str) -> bool:
    """Delete cache value"""
    try:
        redis_client = get_redis()
        await redis_client.delete(key)
        return True
        
    except Exception as e:
        logger.error(f"Failed to delete cache: {e}")
        return False


async def clear_cache_pattern(pattern: str) -> bool:
    """Clear cache by pattern"""
    try:
        redis_client = get_redis()
        keys = await redis_client.keys(pattern)
        
        if keys:
            await redis_client.delete(*keys)
            logger.info(f"Cleared {len(keys)} cache keys matching pattern: {pattern}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to clear cache pattern: {e}")
        return False


# Session management
async def set_session(session_id: str, data: dict, expire: int = 3600) -> bool:
    """Set session data"""
    return await set_cache(f"session:{session_id}", data, expire)


async def get_session(session_id: str) -> Optional[dict]:
    """Get session data"""
    return await get_cache(f"session:{session_id}")


async def delete_session(session_id: str) -> bool:
    """Delete session data"""
    return await delete_cache(f"session:{session_id}")


# Rate limiting
async def increment_rate_limit(key: str, expire: int = 60) -> int:
    """Increment rate limit counter"""
    try:
        redis_client = get_redis()
        count = await redis_client.incr(key)
        
        # Set expiration on first increment
        if count == 1:
            await redis_client.expire(key, expire)
        
        return count
        
    except Exception as e:
        logger.error(f"Failed to increment rate limit: {e}")
        return 0


async def check_rate_limit(key: str, limit: int) -> bool:
    """Check if rate limit is exceeded"""
    try:
        redis_client = get_redis()
        count = await redis_client.get(key)
        
        if count is None:
            return True
        
        return int(count) < limit
        
    except Exception as e:
        logger.error(f"Failed to check rate limit: {e}")
        return True  # Allow if check fails


# Pub/Sub utilities
async def publish_message(channel: str, message: Any) -> bool:
    """Publish message to Redis channel"""
    try:
        redis_client = get_redis()
        
        if isinstance(message, (dict, list)):
            message = json.dumps(message)
        
        await redis_client.publish(channel, message)
        return True
        
    except Exception as e:
        logger.error(f"Failed to publish message: {e}")
        return False


async def subscribe_to_channel(channel: str):
    """Subscribe to Redis channel"""
    try:
        redis_client = get_redis()
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(channel)
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    yield data
                except (json.JSONDecodeError, TypeError):
                    yield message["data"]
                    
    except Exception as e:
        logger.error(f"Failed to subscribe to channel: {e}")
        raise
    finally:
        if 'pubsub' in locals():
            await pubsub.close()
