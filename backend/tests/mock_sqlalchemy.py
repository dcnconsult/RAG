"""
Mock SQLAlchemy types for testing when pgvector is not available
"""

from sqlalchemy import TypeDecorator, String
from sqlalchemy.dialects.postgresql import JSONB


class MockVECTOR(TypeDecorator):
    """Mock VECTOR type for testing when pgvector is not available"""
    
    impl = String
    cache_ok = True
    
    def __init__(self, dimension=None):
        self.dimension = dimension
        super().__init__()
    
    def process_bind_param(self, value, dialect):
        """Process the value when binding to the database"""
        if value is None:
            return None
        # Convert list to string representation for testing
        if isinstance(value, list):
            return str(value)
        return str(value)
    
    def process_result_value(self, value, dialect):
        """Process the value when retrieving from the database"""
        if value is None:
            return None
        # Convert string back to list for testing
        try:
            # Simple parsing for testing - in real usage this would be more sophisticated
            if value.startswith('[') and value.endswith(']'):
                return eval(value)  # Safe for testing only
            return value
        except:
            return value


# Mock the VECTOR type
VECTOR = MockVECTOR

# Re-export JSONB for convenience
__all__ = ['VECTOR', 'JSONB']
