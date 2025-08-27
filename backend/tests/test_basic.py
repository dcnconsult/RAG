"""
Basic tests to verify testing infrastructure
"""

import pytest


class TestBasicInfrastructure:
    """Test basic testing infrastructure"""
    
    @pytest.mark.unit
    def test_pytest_working(self):
        """Test that pytest is working"""
        assert True
    
    @pytest.mark.unit
    def test_sample_data_fixtures(self, sample_domain_data, sample_document_data, sample_chat_data):
        """Test that sample data fixtures work correctly"""
        # Test domain data
        assert sample_domain_data["name"] == "Test Domain"
        assert sample_domain_data["is_public"] is True
        
        # Test document data
        assert sample_document_data["title"] == "Test Document"
        assert sample_document_data["file_type"] == "pdf"
        
        # Test chat data
        assert sample_chat_data["title"] == "Test Chat"
        assert sample_chat_data["is_public"] is True
    
    @pytest.mark.unit
    def test_math_operations(self):
        """Test basic math operations"""
        assert 2 + 2 == 4
        assert 3 * 4 == 12
        assert 10 / 2 == 5
    
    @pytest.mark.unit
    def test_string_operations(self):
        """Test basic string operations"""
        test_string = "Hello, World!"
        assert len(test_string) == 13
        assert "Hello" in test_string
        assert test_string.upper() == "HELLO, WORLD!"
    
    @pytest.mark.unit
    def test_list_operations(self):
        """Test basic list operations"""
        test_list = [1, 2, 3, 4, 5]
        assert len(test_list) == 5
        assert sum(test_list) == 15
        assert test_list[0] == 1
        assert test_list[-1] == 5
    
    @pytest.mark.unit
    def test_dict_operations(self):
        """Test basic dictionary operations"""
        test_dict = {"a": 1, "b": 2, "c": 3}
        assert len(test_dict) == 3
        assert test_dict["a"] == 1
        assert "b" in test_dict
        assert test_dict.get("d", 4) == 4  # Default value
    
    @pytest.mark.unit
    @pytest.mark.parametrize("input_value,expected", [
        (1, 1),
        (2, 2),
        (3, 3),
        (10, 10),
        (100, 100)
    ])
    def test_parametrized_test(self, input_value, expected):
        """Test parametrized testing"""
        assert input_value == expected
    
    @pytest.mark.unit
    def test_exception_handling(self):
        """Test exception handling"""
        with pytest.raises(ValueError):
            raise ValueError("Test exception")
        
        with pytest.raises(ValueError):
            int("not_a_number")
    
    @pytest.mark.unit
    def test_boolean_logic(self):
        """Test boolean logic"""
        assert True and True is True
        assert True or False is True
        assert not False is True
        assert (True and False) or True is True
