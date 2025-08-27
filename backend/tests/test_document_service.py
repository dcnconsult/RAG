"""
Tests for document service layer
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.document_service import DocumentService
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate


class TestDocumentService:
    """Test document service functionality"""
    
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
    def document_service(self, mock_db_session):
        """Document service instance with mocked dependencies"""
        return DocumentService(db=mock_db_session)
    
    @pytest.fixture
    def sample_document_data(self):
        """Sample document data for testing"""
        return {
            "title": "Test Document",
            "description": "A test document for testing purposes",
            "file_path": "/uploads/test.pdf",
            "file_type": "pdf",
            "file_size": 1024,
            "domain_id": 1
        }
    
    @pytest.mark.unit
    async def test_create_document_success(self, document_service, mock_db_session, sample_document_data):
        """Test successful document creation"""
        # Arrange
        document_create = DocumentCreate(**sample_document_data)
        mock_document = MagicMock(spec=Document)
        mock_document.id = 1
        mock_document.title = sample_document_data["title"]
        mock_document.description = sample_document_data["description"]
        mock_document.file_type = sample_document_data["file_type"]
        mock_document.file_size = sample_document_data["file_size"]
        mock_document.domain_id = sample_document_data["domain_id"]
        
        mock_db_session.add.return_value = None
        mock_db_session.commit.return_value = None
        mock_db_session.refresh.return_value = None
        
        # Mock the Document model instantiation
        with patch('app.services.document_service.Document') as mock_document_class:
            mock_document_class.return_value = mock_document
            
            # Act
            result = await document_service.create_document(document_create)
            
            # Assert
            assert result is not None
            assert result.title == sample_document_data["title"]
            assert result.description == sample_document_data["description"]
            assert result.file_type == sample_document_data["file_type"]
            assert result.file_size == sample_document_data["file_size"]
            assert result.domain_id == sample_document_data["domain_id"]
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_document_by_id_success(self, document_service, mock_db_session):
        """Test successful document retrieval by ID"""
        # Arrange
        document_id = 1
        mock_document = MagicMock(spec=Document)
        mock_document.id = document_id
        mock_document.title = "Test Document"
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_document
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await document_service.get_document_by_id(document_id)
        
        # Assert
        assert result is not None
        assert result.id == document_id
        assert result.title == "Test Document"
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_document_by_id_not_found(self, document_service, mock_db_session):
        """Test document retrieval when document doesn't exist"""
        # Arrange
        document_id = 999
        mock_result = MagicMock()
        mock_result.scalar_one.side_effect = Exception("Not found")
        mock_db_session.execute.return_value = mock_result
        
        # Act & Assert
        with pytest.raises(Exception):
            await document_service.get_document_by_id(document_id)
        
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_documents_by_domain_success(self, document_service, mock_db_session):
        """Test successful documents retrieval by domain"""
        # Arrange
        domain_id = 1
        mock_documents = [
            MagicMock(spec=Document, id=1, title="Document 1", domain_id=domain_id),
            MagicMock(spec=Document, id=2, title="Document 2", domain_id=domain_id)
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_documents
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await document_service.get_documents_by_domain(domain_id)
        
        # Assert
        assert result is not None
        assert len(result) == 2
        assert all(doc.domain_id == domain_id for doc in result)
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_documents_with_pagination(self, document_service, mock_db_session):
        """Test documents retrieval with pagination"""
        # Arrange
        page = 2
        size = 5
        mock_documents = [MagicMock(spec=Document, id=i) for i in range(1, 6)]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_documents
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await document_service.get_documents(page=page, size=size)
        
        # Assert
        assert result is not None
        assert len(result) == 5
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_get_documents_with_search(self, document_service, mock_db_session):
        """Test documents retrieval with search parameter"""
        # Arrange
        search_term = "test"
        mock_documents = [MagicMock(spec=Document, id=1, title="Test Document")]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_documents
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await document_service.get_documents(search=search_term)
        
        # Assert
        assert result is not None
        assert len(result) == 1
        assert result[0].title == "Test Document"
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_update_document_success(self, document_service, mock_db_session):
        """Test successful document update"""
        # Arrange
        document_id = 1
        update_data = DocumentUpdate(title="Updated Document", description="Updated description")
        
        mock_document = MagicMock(spec=Document)
        mock_document.id = document_id
        mock_document.title = "Updated Document"
        mock_document.description = "Updated description"
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_document
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await document_service.update_document(document_id, update_data)
        
        # Assert
        assert result is not None
        assert result.title == "Updated Document"
        assert result.description == "Updated description"
        mock_db_session.commit.assert_called_once()
    
    @pytest.mark.unit
    async def test_update_document_not_found(self, document_service, mock_db_session):
        """Test document update when document doesn't exist"""
        # Arrange
        document_id = 999
        update_data = DocumentUpdate(title="Updated Document")
        
        mock_result = MagicMock()
        mock_result.scalar_one.side_effect = Exception("Not found")
        mock_db_session.execute.return_value = mock_result
        
        # Act & Assert
        with pytest.raises(Exception):
            await document_service.update_document(document_id, update_data)
        
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_delete_document_success(self, document_service, mock_db_session):
        """Test successful document deletion"""
        # Arrange
        document_id = 1
        mock_document = MagicMock(spec=Document)
        mock_document.id = document_id
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_document
        mock_db_session.execute.return_value = mock_result
        
        # Act
        result = await document_service.delete_document(document_id)
        
        # Assert
        assert result is True
        mock_db_session.delete.assert_called_once_with(mock_document)
        mock_db_session.commit.assert_called_once()
    
    @pytest.mark.unit
    async def test_delete_document_not_found(self, document_service, mock_db_session):
        """Test document deletion when document doesn't exist"""
        # Arrange
        document_id = 999
        
        mock_result = MagicMock()
        mock_result.scalar_one.side_effect = Exception("Not found")
        mock_db_session.execute.return_value = mock_result
        
        # Act & Assert
        with pytest.raises(Exception):
            await document_service.delete_document(document_id)
        
        mock_db_session.execute.assert_called_once()
    
    @pytest.mark.unit
    async def test_process_document_success(self, document_service, mock_db_session):
        """Test successful document processing"""
        # Arrange
        document_id = 1
        mock_document = MagicMock(spec=Document)
        mock_document.id = document_id
        mock_document.status = "pending"
        
        mock_result = MagicMock()
        mock_result.scalar_one.return_value = mock_document
        mock_db_session.execute.return_value = mock_result
        
        # Mock the processing logic
        with patch.object(document_service, '_extract_text') as mock_extract, \
             patch.object(document_service, '_chunk_text') as mock_chunk, \
             patch.object(document_service, '_generate_embeddings') as mock_embed:
            
            mock_extract.return_value = "Extracted text content"
            mock_chunk.return_value = ["Chunk 1", "Chunk 2"]
            mock_embed.return_value = [[0.1] * 1536, [0.2] * 1536]
            
            # Act
            result = await document_service.process_document(document_id)
            
            # Assert
            assert result is not None
            assert result.status == "processed"
            mock_extract.assert_called_once()
            mock_chunk.assert_called_once()
            mock_embed.assert_called_once()
            mock_db_session.commit.assert_called_once()
    
    @pytest.mark.unit
    async def test_extract_text_pdf(self, document_service):
        """Test PDF text extraction"""
        # Arrange
        file_path = "/uploads/test.pdf"
        file_type = "pdf"
        
        # Mock the PDF extraction
        with patch('app.services.document_service.PyPDF2.PdfReader') as mock_pdf:
            mock_reader = MagicMock()
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "PDF text content"
            mock_reader.pages = [mock_page]
            mock_pdf.return_value = mock_reader
            
            # Act
            result = await document_service._extract_text(file_path, file_type)
            
            # Assert
            assert result == "PDF text content"
    
    @pytest.mark.unit
    async def test_extract_text_docx(self, document_service):
        """Test DOCX text extraction"""
        # Arrange
        file_path = "/uploads/test.docx"
        file_type = "docx"
        
        # Mock the DOCX extraction
        with patch('app.services.document_service.Document') as mock_docx:
            mock_doc = MagicMock()
            mock_paragraph = MagicMock()
            mock_paragraph.text = "DOCX text content"
            mock_doc.paragraphs = [mock_paragraph]
            mock_docx.return_value = mock_doc
            
            # Act
            result = await document_service._extract_text(file_path, file_type)
            
            # Assert
            assert result == "DOCX text content"
    
    @pytest.mark.unit
    async def test_chunk_text_success(self, document_service):
        """Test text chunking functionality"""
        # Arrange
        text = "This is a long text that needs to be chunked into smaller pieces for processing."
        chunk_size = 20
        chunk_overlap = 5
        
        # Act
        result = await document_service._chunk_text(text, chunk_size, chunk_overlap)
        
        # Assert
        assert result is not None
        assert len(result) > 0
        assert all(len(chunk) <= chunk_size for chunk in result)
    
    @pytest.mark.unit
    async def test_generate_embeddings_success(self, document_service):
        """Test embedding generation"""
        # Arrange
        chunks = ["Chunk 1", "Chunk 2", "Chunk 3"]
        
        # Mock the OpenAI client
        with patch('app.services.document_service.openai') as mock_openai:
            mock_openai.Embedding.create.return_value = MagicMock(
                data=[{"embedding": [0.1] * 1536} for _ in chunks]
            )
            
            # Act
            result = await document_service._generate_embeddings(chunks)
            
            # Assert
            assert result is not None
            assert len(result) == len(chunks)
            assert all(len(embedding) == 1536 for embedding in result)
    
    @pytest.mark.unit
    async def test_get_document_statistics_success(self, document_service, mock_db_session):
        """Test successful document statistics retrieval"""
        # Arrange
        mock_stats = {
            "total_documents": 100,
            "processed_documents": 85,
            "pending_documents": 10,
            "failed_documents": 5,
            "total_size": 1048576
        }
        
        # Mock the statistics calculation
        with patch.object(document_service, '_calculate_document_statistics') as mock_calc:
            mock_calc.return_value = mock_stats
            
            # Act
            result = await document_service.get_document_statistics()
            
            # Assert
            assert result is not None
            assert result["total_documents"] == 100
            assert result["processed_documents"] == 85
            assert result["pending_documents"] == 10
            assert result["failed_documents"] == 5
            assert result["total_size"] == 1048576
            mock_calc.assert_called_once()
    
    @pytest.mark.unit
    async def test_validate_file_type_success(self, document_service):
        """Test file type validation"""
        # Arrange
        allowed_types = ["pdf", "docx", "txt"]
        file_type = "pdf"
        
        # Act
        result = await document_service._validate_file_type(file_type, allowed_types)
        
        # Assert
        assert result is True
    
    @pytest.mark.unit
    async def test_validate_file_type_invalid(self, document_service):
        """Test file type validation with invalid type"""
        # Arrange
        allowed_types = ["pdf", "docx", "txt"]
        file_type = "exe"
        
        # Act & Assert
        with pytest.raises(ValueError):
            await document_service._validate_file_type(file_type, allowed_types)
    
    @pytest.mark.unit
    async def test_validate_file_size_success(self, document_service):
        """Test file size validation"""
        # Arrange
        file_size = 1048576  # 1MB
        max_size = 10485760  # 10MB
        
        # Act
        result = await document_service._validate_file_size(file_size, max_size)
        
        # Assert
        assert result is True
    
    @pytest.mark.unit
    async def test_validate_file_size_too_large(self, document_service):
        """Test file size validation with file too large"""
        # Arrange
        file_size = 20971520  # 20MB
        max_size = 10485760  # 10MB
        
        # Act & Assert
        with pytest.raises(ValueError):
            await document_service._validate_file_size(file_size, max_size)
