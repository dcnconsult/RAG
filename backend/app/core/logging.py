"""
Application logging configuration
"""

import logging
import logging.config
import sys
from pathlib import Path
from typing import Dict, Any

from app.core.config import settings


def setup_logging() -> None:
    """Setup application logging configuration"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Define logging configuration
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
                "datefmt": "%Y-%m-%dT%H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG" if settings.DEBUG else "INFO",
                "formatter": "default",
                "stream": sys.stdout,
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json" if settings.LOG_FORMAT == "json" else "default",
                "filename": log_dir / "app.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": log_dir / "error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
            "access_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json" if settings.LOG_FORMAT == "json" else "default",
                "filename": log_dir / "access.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False,
            },
            "app": {  # Application logger
                "handlers": ["console", "file"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
            "uvicorn": {  # Uvicorn logger
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.access": {  # Access logs
                "handlers": ["console", "access_file"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {  # Error logs
                "handlers": ["console", "error_file"],
                "level": "ERROR",
                "propagate": False,
            },
            "sqlalchemy": {  # SQLAlchemy logger
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False,
            },
            "celery": {  # Celery logger
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False,
            },
            "redis": {  # Redis logger
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False,
            },
            "httpx": {  # HTTP client logger
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False,
            },
            "openai": {  # OpenAI logger
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False,
            },
            "anthropic": {  # Anthropic logger
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False,
            },
        },
    }
    
    # Apply logging configuration
    logging.config.dictConfig(logging_config)
    
    # Set specific logger levels based on environment
    if settings.is_development:
        logging.getLogger("app").setLevel(logging.DEBUG)
        logging.getLogger("uvicorn").setLevel(logging.DEBUG)
    
    if settings.is_testing:
        logging.getLogger("app").setLevel(logging.DEBUG)
        logging.getLogger("uvicorn").setLevel(logging.WARNING)
    
    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info("Logging configuration initialized")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Log level: {settings.LOG_LEVEL}")
    logger.info(f"Log format: {settings.LOG_FORMAT}")


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name"""
    return logging.getLogger(name)


def log_request(request_id: str, method: str, url: str, status_code: int, duration: float) -> None:
    """Log HTTP request information"""
    logger = get_logger("app.access")
    logger.info(
        f"Request {request_id}: {method} {url} - {status_code} - {duration:.3f}s"
    )


def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    """Log error information with context"""
    logger = get_logger("app.error")
    error_context = context or {}
    logger.error(
        f"Error: {type(error).__name__}: {str(error)}",
        extra={"error_type": type(error).__name__, "context": error_context},
        exc_info=True,
    )


def log_performance(operation: str, duration: float, details: Dict[str, Any] = None) -> None:
    """Log performance metrics"""
    logger = get_logger("app.performance")
    performance_data = {
        "operation": operation,
        "duration": duration,
        "details": details or {},
    }
    logger.info(f"Performance: {operation} took {duration:.3f}s", extra=performance_data)
