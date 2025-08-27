"""
Authentication API endpoints
"""

from fastapi import APIRouter

router = APIRouter()

# TODO: Implement authentication endpoints
# - POST /auth/login
# - POST /auth/register
# - POST /auth/refresh
# - POST /auth/logout
# - GET /auth/me
# - POST /auth/forgot-password
# - POST /auth/reset-password

@router.get("/health")
async def auth_health_check():
    """Health check for authentication service"""
    return {
        "status": "healthy",
        "service": "authentication",
        "features": {
            "login": "not implemented",
            "register": "not implemented",
            "jwt": "not implemented",
            "oauth": "not implemented",
        },
    }
