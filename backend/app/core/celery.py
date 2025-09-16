"""
Celery configuration for background task processing
"""

import logging
from typing import Optional

from celery import Celery
from celery.utils.log import get_task_logger

from app.core.config import settings

logger = logging.getLogger(__name__)

# Celery app instance
_celery_app: Optional[Celery] = None


def init_celery() -> None:
    """Initialize Celery application"""
    global _celery_app
    
    try:
        _celery_app = Celery(
            "rag_explorer",
            broker=settings.CELERY_BROKER_URL,
            backend=settings.CELERY_RESULT_BACKEND,
            include=[
                "app.tasks.document_processing",
                "app.tasks.vector_embedding",
                "app.tasks.chat_processing",
            ],
        )
        
        # Configure Celery
        _celery_app.conf.update(
            task_serializer="json",
            accept_content=["json"],
            result_serializer="json",
            timezone="UTC",
            enable_utc=True,
            task_track_started=True,
            task_time_limit=30 * 60,  # 30 minutes
            task_soft_time_limit=25 * 60,  # 25 minutes
            worker_prefetch_multiplier=1,
            worker_max_tasks_per_child=1000,
            worker_max_memory_per_child=200000,  # 200MB
            result_expires=3600,  # 1 hour
            result_persistent=True,
            worker_send_task_events=True,
            task_send_sent_event=True,
            task_ignore_result=False,
            task_always_eager=settings.is_testing,  # Synchronous execution in tests
            task_eager_propagates=True,
            worker_disable_rate_limits=False,
            worker_cancel_long_running_tasks_on_connection_loss=True,
        )
        
        # Configure task routes
        _celery_app.conf.task_routes = {
            "app.tasks.document_processing.*": {"queue": "document_processing"},
            "app.tasks.vector_embedding.*": {"queue": "vector_embedding"},
            "app.tasks.chat_processing.*": {"queue": "chat_processing"},
        }
        
        # Configure task annotations
        _celery_app.conf.task_annotations = {
            "app.tasks.document_processing.*": {
                "rate_limit": "10/m",
                "time_limit": 600,  # 10 minutes
            },
            "app.tasks.vector_embedding.*": {
                "rate_limit": "100/m",
                "time_limit": 300,  # 5 minutes
            },
            "app.tasks.chat_processing.*": {
                "rate_limit": "60/m",
                "time_limit": 120,  # 2 minutes
            },
        }
        
        logger.info("Celery application initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Celery: {e}")
        raise


def close_celery() -> None:
    """Close Celery application"""
    global _celery_app
    
    try:
        if _celery_app:
            _celery_app.close()
            _celery_app = None
            logger.info("Celery application closed")
            
    except Exception as e:
        logger.error(f"Error closing Celery application: {e}")


def get_celery() -> Celery:
    """Get Celery application instance"""
    if not _celery_app:
        raise RuntimeError("Celery not initialized. Call init_celery() first.")
    return _celery_app


def get_task_logger(name: str):
    """Get Celery task logger"""
    return get_task_logger(name)


# Task utilities
def create_task_signature(task_name: str, *args, **kwargs):
    """Create a task signature for delayed execution"""
    celery_app = get_celery()
    return celery_app.signature(task_name, args=args, kwargs=kwargs)


def delay_task(task_name: str, *args, **kwargs):
    """Delay a task for execution"""
    celery_app = get_celery()
    return celery_app.send_task(task_name, args=args, kwargs=kwargs)


def schedule_task(task_name: str, eta, *args, **kwargs):
    """Schedule a task for execution at a specific time"""
    celery_app = get_celery()
    return celery_app.send_task(
        task_name,
        args=args,
        kwargs=kwargs,
        eta=eta,
    )


def retry_task(task, exc, countdown=60, max_retries=3):
    """Retry a failed task"""
    try:
        task.retry(countdown=countdown, max_retries=max_retries)
    except task.MaxRetriesExceededError:
        logger.error(f"Task {task.name} exceeded maximum retries")
        raise


# Health check
async def check_celery_health() -> bool:
    """Check Celery health"""
    if not _celery_app:
        return False
    
    try:
        # Check if Celery can connect to broker
        inspect = _celery_app.control.inspect()
        stats = inspect.stats()
        
        if stats is None:
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Celery health check failed: {e}")
        return False


# Queue management
def get_queue_stats() -> dict:
    """Get queue statistics"""
    try:
        celery_app = get_celery()
        inspect = celery_app.control.inspect()
        
        stats = {
            "active": inspect.active(),
            "reserved": inspect.reserved(),
            "scheduled": inspect.scheduled(),
            "registered": inspect.registered(),
            "stats": inspect.stats(),
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get queue stats: {e}")
        return {}


def purge_queue(queue_name: str) -> bool:
    """Purge a specific queue"""
    try:
        celery_app = get_celery()
        celery_app.control.purge(queue=queue_name)
        logger.info(f"Queue {queue_name} purged successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to purge queue {queue_name}: {e}")
        return False


def restart_workers() -> bool:
    """Restart all Celery workers"""
    try:
        celery_app = get_celery()
        celery_app.control.pool_restart()
        logger.info("All Celery workers restarted")
        return True
        
    except Exception as e:
        logger.error(f"Failed to restart workers: {e}")
        return False
