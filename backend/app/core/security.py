"""
MVP Security Module for RAG Explorer Backend
Minimal security for demonstration with extensibility for future hardening
"""

import re
from typing import List
from fastapi import HTTPException, status


class MVPInputValidator:
    """Minimal input validation for MVP - extensible for future hardening"""
    
    # Basic patterns for validation
    UUID_PATTERN = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    
    @classmethod
    def validate_uuid(cls, value: str) -> bool:
        """Validate UUID format"""
        if not isinstance(value, str):
            return False
        return bool(cls.UUID_PATTERN.match(value))
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: int = 1000) -> str:
        """Basic string sanitization for MVP"""
        if not isinstance(value, str):
            raise ValueError("Input must be a string")
        
        # Remove null bytes and truncate
        value = value.replace('\x00', '')
        if len(value) > max_length:
            value = value[:max_length]
        
        return value.strip()
    
    @classmethod
    def validate_filename(cls, value: str) -> bool:
        """Basic filename validation for MVP"""
        if not isinstance(value, str):
            return False
        
        # Prevent directory traversal (essential for MVP)
        if '..' in value or '/' in value or '\\' in value:
            return False
        
        # Basic pattern - alphanumeric, dots, underscores, hyphens
        return bool(re.match(r'^[a-zA-Z0-9._-]+$', value))
    
    @classmethod
    def validate_file_extension(cls, filename: str, allowed_extensions: List[str]) -> bool:
        """Validate file extension for MVP"""
        if not filename or '.' not in filename:
            return False
        
        extension = filename.rsplit('.', 1)[1].lower()
        return extension in [ext.lower() for ext in allowed_extensions]


class MVPSecurityConfig:
    """Minimal security configuration for MVP"""
    
    # File upload security (essential for MVP)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.rtf']
    BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.js', '.php', '.py', '.jar']
    
    # Input validation limits
    MAX_STRING_LENGTH = 1000
    MAX_SEARCH_LENGTH = 500


# Global instance for MVP
input_validator = MVPInputValidator()


def validate_and_sanitize_input(value: str, field_name: str, max_length: int = None) -> str:
    """Basic input validation for MVP"""
    try:
        if max_length is None:
            max_length = MVPSecurityConfig.MAX_STRING_LENGTH
        
        # Sanitize the input
        sanitized = input_validator.sanitize_string(value, max_length)
        
        if not sanitized:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} cannot be empty"
            )
        
        return sanitized
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}: {str(e)}"
        )


def validate_file_upload(filename: str, file_size: int) -> tuple[bool, str]:
    """Basic file upload validation for MVP"""
    # Check file extension
    if not input_validator.validate_file_extension(filename, MVPSecurityConfig.ALLOWED_EXTENSIONS):
        return False, f"File type not allowed. Allowed types: {', '.join(MVPSecurityConfig.ALLOWED_EXTENSIONS)}"
    
    # Check blocked extensions (essential for MVP)
    for ext in MVPSecurityConfig.BLOCKED_EXTENSIONS:
        if filename.lower().endswith(ext):
            return False, f"File type {ext} is not allowed for security reasons"
    
    # Check file size
    if not (0 < file_size <= MVPSecurityConfig.MAX_FILE_SIZE):
        return False, f"File size exceeds maximum allowed size of {MVPSecurityConfig.MAX_FILE_SIZE} bytes"
    
    # Check filename for dangerous patterns (essential for MVP)
    if not input_validator.validate_filename(filename):
        return False, "Filename contains invalid characters"
    
    return True, "File validation passed"


# Future extensibility - placeholder functions for when hardening is needed
def add_advanced_security_middleware():
    """Placeholder for future security middleware"""
    pass


def add_rate_limiting():
    """Placeholder for future rate limiting"""
    pass


def add_authentication_middleware():
    """Placeholder for future authentication"""
    pass


def add_csrf_protection():
    """Placeholder for future CSRF protection"""
    pass 
