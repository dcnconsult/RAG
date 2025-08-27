"""
Tests for domain service layer
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.domain_service import DomainService
from app.models.domain import Domain
from app.schemas.domain import DomainCreate, DomainUpdate


class TestDomainService:
    """Test domain service functionality"""
    
    @pytest.fixture
    def mock_db_session(self):
        """Mock database session"""
        mock = MagicMock()
        mock.add = AsyncMock()
        mock.commit = AsyncMock()
        mock.refresh = AsyncMock()
        mock.delete = AsyncMock()
        mock.execute = AsyncMock()
        mock.scalar_one = MagicMock()
        mock.scalars = MagicMock()
        return mock
    
    @pytest.fixture
    def domain_service(self, mock_db_session):
        """Domain service instance with mocked dependencies"""
        return DomainService(db=mock_db_session)
    
    @pytest.fixture
    def sample_domain_data(self):
        """Sample domain data for testing"""
        return {
            "name": "Test Domain",
            "description": "A test domain for testing purposes",
            "is_public": True
        }
    
    @pytest.mark.unit
    async def test_create_domain_success(self, domain_service, mock_db_session, sample_domain_data):
        """Test successful domain creation"""
        # Arrange
        domain_create = DomainCreate(**sample_domain_data)
        mock_domain = MagicMock(spec=Domain)
        mock_domain.id = 1
        mock_domain.name = sample_domain_data["name"]
        mock_domain.description = sample_domain_data["description"]
        mock_domain.is_public = sample_domain_data["is_public"]
        
        mock_db_session.add.return_value = None
        mock_db_session.commit.return_value = None
        mock_db_session.refresh.return_value = None
        
        # Mock the Domain model instantiation
        with patch('app.services.domain_service.Domain') as mock_domain_class:
            mock_domain_class.return_value = mock_domain
            
            # Act
            result = await domain_service.create_domain(domain_create)
            
            # Assert
            assert result is not None
            assert result.name == sample_domain_data["name"]
            assert result.description == sample_domain_data["description"]
            assert result.is_public == sample_domain_data["is_public"]
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domain_by_id_success(self, domain_service, mock_db_session):
        """Test successful domain retrieval by ID"""
        # Arrange
        domain_id = 1
        mock_domain = MagicMock(spec=Domain)
        mock_domain.id = domain_id
        mock_domain.name = "Test Domain"
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_domain
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.get_domain_by_id(domain_id)
        
        # Assert
        assert result is not None
        assert result.id == domain_id
        assert result.name == "Test Domain"
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domain_by_id_not_found(self, domain_service, mock_db_session):
        """Test domain retrieval when domain doesn't exist"""
        # Arrange
        domain_id = 999
        mock_result = MagicMock()
        mock_result.scalar_one.side_effect = Exception("Not found")
        mock_db_session.execute.return_value = mock_result
        
        # Act & Assert
        with pytest.raises(Exception):
            await domain_service.get_domain_by_id(domain_id)
        
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domains_list_success(self, domain_service, mock_db_session):
        """Test successful domains list retrieval"""
        # Arrange
        mock_domains = [
            MagicMock(spec=Domain, id=1, name="Domain 1"),
            MagicMock(spec=Domain, id=2, name="Domain 2")
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_domains
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.get_domains()
        
        # Assert
        assert result is not None
        assert len(result) == 2
        assert result[0].id == 1
        assert result[1].id == 2
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domains_with_pagination(self, domain_service, mock_db_session):
        """Test domains retrieval with pagination"""
        # Arrange
        page = 2
        size = 5
        mock_domains = [MagicMock(spec=Domain, id=i) for i in range(1, 6)]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_domains
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.get_domains(page=page, size=size)
        
        # Assert
        assert result is not None
        assert len(result) == 5
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domains_with_search(self, domain_service, mock_db_session):
        """Test domains retrieval with search parameter"""
        # Arrange
        search_term = "test"
        mock_domains = [MagicMock(spec=Domain, id=1, name="Test Domain")]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_domains
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.get_domains(search=search_term)
        
        # Assert
        assert result is not None
        assert len(result) == 1
        assert result[0].name == "Test Domain"
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_update_domain_success(self, domain_service, mock_db_session):
        """Test successful domain update"""
        # Arrange
        domain_id = 1
        update_data = DomainUpdate(name="Updated Domain", description="Updated description")
        
        mock_domain = MagicMock(spec=Domain)
        mock_domain.id = domain_id
        mock_domain.name = "Updated Domain"
        mock_domain.description = "Updated description"
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_domain
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.update_domain(domain_id, update_data)
        
        # Assert
        assert result is not None
        assert result.name == "Updated Domain"
        assert result.description == "Updated description"
        mock_db_session.commit.assert_called_once()
    
    @pytest.mark.unit
    async def test_update_domain_not_found(self, domain_service, mock_db_session):
        """Test domain update when domain doesn't exist"""
        # Arrange
        domain_id = 999
        update_data = DomainUpdate(name="Updated Domain")
        
        mock_result = MagicMock()
        mock_result.scalar_one.side_effect = Exception("Not found")
        mock_db_session.execute.return_value = mock_result
        
        # Act & Assert
        with pytest.raises(Exception):
            await domain_service.update_domain(domain_id, update_data)
        
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_delete_domain_success(self, domain_service, mock_db_session):
        """Test successful domain deletion"""
        # Arrange
        domain_id = 1
        mock_domain = MagicMock(spec=Domain)
        mock_domain.id = domain_id
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_domain
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.delete_domain(domain_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once_with(mock_domain)
        mock_db_session.commit.assert_called_once()
    
    @pytest.mark.unit
    async def test_delete_domain_not_found(self, domain_service, mock_db_session):
        """Test domain deletion when domain doesn't exist"""
        # Arrange
        domain_id = 999
        
        mock_result = MagicMock()
        mock_result.scalar_one.side_effect = Exception("Not found")
        mock_db_session.execute.return_value = mock_result
        
        # Act & Assert
        with pytest.raises(Exception):
            await domain_service.delete_domain(domain_id)
        
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domain_statistics_success(self, domain_service, mock_db_session):
        """Test successful domain statistics retrieval"""
        # Arrange
        mock_stats = {
            "total_domains": 10,
            "public_domains": 7,
            "private_domains": 3,
            "total_documents": 150,
            "total_chats": 25
        }
        
        # Mock the statistics calculation
        with patch.object(domain_service, '_calculate_domain_statistics') as mock_calc:
            mock_calc.return_value = mock_stats
            
            # Act
            result = await domain_service.get_domain_statistics()
            
            # Assert
            assert result is not None
            assert result["total_domains"] == 10
            assert result["public_domains"] == 7
            assert result["private_domains"] == 3
            assert result["total_documents"] == 150
            assert result["total_chats"] == 25
            mock_calc.assert_called_once()
    
    @pytest.mark.unit
    async def test_validate_domain_name_unique(self, domain_service, mock_db_session):
        """Test domain name uniqueness validation"""
        # Arrange
        domain_name = "Test Domain"
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = None  # No existing domain with this name
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.validate_domain_name_unique(domain_name)
        
        # Assert
        assert result is True
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_validate_domain_name_not_unique(self, domain_service, mock_db_session):
        """Test domain name uniqueness validation when name already exists"""
        # Arrange
        domain_name = "Existing Domain"
        mock_existing_domain = MagicMock(spec=Domain, id=1, name=domain_name)
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_existing_domain
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.validate_domain_name_unique(domain_name)
        
        # Assert
        assert result is False
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_domains_by_user(self, domain_service, mock_db_session):
        """Test retrieving domains by user ID"""
        # Arrange
        user_id = 1
        mock_domains = [
            MagicMock(spec=Domain, id=1, name="User Domain 1"),
            MagicMock(spec=Domain, id=2, name="User Domain 2")
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_domains
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.get_domains_by_user(user_id)
        
        # Assert
        assert result is not None
        assert len(result) == 2
        assert result[0].name == "User Domain 1"
        assert result[1].name == "User Domain 2"
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_public_domains(self, domain_service, mock_db_session):
        """Test retrieving public domains"""
        # Arrange
        mock_public_domains = [
            MagicMock(spec=Domain, id=1, name="Public Domain 1", is_public=True),
            MagicMock(spec=Domain, id=2, name="Public Domain 2", is_public=True)
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_public_domains
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await domain_service.get_public_domains()
        
        # Assert
        assert result is not None
        assert len(result) == 2
        assert all(domain.is_public for domain in result)
        mock_db_session.execute.assert_called_once()
