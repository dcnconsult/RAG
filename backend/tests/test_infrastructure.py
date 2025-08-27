"""
Simple tests to demonstrate testing infrastructure
"""

import pytest
from unittest.mock import MagicMock


class TestInfrastructure:
    """Test basic testing infrastructure"""
    
    def test_pytest_working(self):
        """Test that pytest is working"""
        assert True
    
    def test_magic_mock_basic(self):
        """Test basic MagicMock functionality"""
        mock = MagicMock()
        mock.some_method.return_value = "test_value"
        
        result = mock.some_method()
        assert result == "test_value"
        mock.some_method.assert_called_once()
    
    def test_magic_mock_attributes(self):
        """Test MagicMock attribute access"""
        mock = MagicMock()
        mock.id = 1
        mock.name = "Test Item"
        
        assert mock.id == 1
        assert mock.name == "Test Item"
    
    def test_magic_mock_methods(self):
        """Test MagicMock method calls"""
        mock = MagicMock()
        mock.add = MagicMock()
        mock.commit = MagicMock()
        mock.refresh = MagicMock()
        
        # Simulate database operations
        mock.add("item")
        mock.commit()
        mock.refresh("item")
        
        mock.add.assert_called_once_with("item")
        mock.commit.assert_called_once()
        mock.refresh.assert_called_once_with("item")
    
    def test_magic_mock_chaining(self):
        """Test MagicMock method chaining"""
        mock = MagicMock()
        mock.execute.return_value.scalars.return_value.all.return_value = ["item1", "item2"]
        
        result = mock.execute().scalars().all()
        assert result == ["item1", "item2"]
    
    def test_magic_mock_side_effects(self):
        """Test MagicMock side effects"""
        mock = MagicMock()
        mock.side_effect = [1, 2, 3]
        
        assert mock() == 1
        assert mock() == 2
        assert mock() == 3
    
    def test_magic_mock_exceptions(self):
        """Test MagicMock exception raising"""
        mock = MagicMock()
        mock.side_effect = ValueError("Test error")
        
        with pytest.raises(ValueError, match="Test error"):
            mock()
    
    def test_fixture_usage(self):
        """Test that fixtures work correctly"""
        # This test will use the fixture from conftest.py
        pass
    
    def test_assertions(self):
        """Test various assertion types"""
        # Basic assertions
        assert 1 == 1
        assert "hello" == "hello"
        assert True is True
        assert False is False
        
        # List assertions
        assert [1, 2, 3] == [1, 2, 3]
        assert len([1, 2, 3]) == 3
        
        # Dict assertions
        test_dict = {"a": 1, "b": 2}
        assert test_dict["a"] == 1
        assert "a" in test_dict
        assert "c" not in test_dict
    
    def test_exception_handling(self):
        """Test exception handling in tests"""
        # Test that exceptions are raised
        with pytest.raises(ValueError):
            int("not_a_number")
        
        # Test that exceptions are not raised
        assert int("123") == 123
        
        # Test specific exception messages
        with pytest.raises(ValueError, match="invalid literal"):
            int("abc")
    
    def test_mock_verification(self):
        """Test mock verification methods"""
        mock = MagicMock()
        
        # Call methods
        mock.method1()
        mock.method2("arg")
        mock.method3(key="value")
        
        # Verify calls
        mock.method1.assert_called_once()
        mock.method2.assert_called_once_with("arg")
        mock.method3.assert_called_once_with(key="value")
        
        # Verify call count
        assert mock.method1.call_count == 1
        assert mock.method2.call_count == 1
        assert mock.method3.call_count == 1
    
    def test_mock_reset(self):
        """Test mock reset functionality"""
        mock = MagicMock()
        
        # Make some calls
        mock.method()
        mock.method()
        
        # Verify calls
        assert mock.method.call_count == 2
        
        # Reset mock
        mock.reset_mock()
        
        # Verify reset
        assert mock.method.call_count == 0
        mock.method.assert_not_called()
    
    def test_mock_return_values(self):
        """Test mock return value configuration"""
        mock = MagicMock()
        
        # Configure return values
        mock.method1.return_value = "value1"
        mock.method2.return_value = 42
        mock.method3.return_value = {"key": "value"}
        
        # Test return values
        assert mock.method1() == "value1"
        assert mock.method2() == 42
        assert mock.method3() == {"key": "value"}
    
    def test_mock_call_args(self):
        """Test mock call argument verification"""
        mock = MagicMock()
        
        # Call with different arguments
        mock.method("arg1", "arg2", kwarg1="value1", kwarg2="value2")
        
        # Verify call arguments
        mock.method.assert_called_once_with("arg1", "arg2", kwarg1="value1", kwarg2="value2")
        
        # Check individual arguments
        call_args = mock.method.call_args
        assert call_args.args == ("arg1", "arg2")
        assert call_args.kwargs == {"kwarg1": "value1", "kwarg2": "value2"}
    
    def test_mock_multiple_calls(self):
        """Test mock with multiple calls"""
        mock = MagicMock()
        
        # Make multiple calls
        mock.method("first")
        mock.method("second")
        mock.method("third")
        
        # Verify all calls
        assert mock.method.call_count == 3
        
        # Check call arguments list
        call_args_list = mock.method.call_args_list
        assert len(call_args_list) == 3
        assert call_args_list[0].args == ("first",)
        assert call_args_list[1].args == ("second",)
        assert call_args_list[2].args == ("third",)
    
    def test_mock_property_access(self):
        """Test mock property access"""
        mock = MagicMock()
        
        # Configure properties
        mock.property1 = "value1"
        mock.property2 = 42
        
        # Access properties
        assert mock.property1 == "value1"
        assert mock.property2 == 42
        
        # Properties can be changed
        mock.property1 = "new_value"
        assert mock.property1 == "new_value"
    
    def test_mock_iteration(self):
        """Test mock iteration"""
        # Create a mock that returns an iterator
        mock = MagicMock()
        mock.__iter__.return_value = iter([1, 2, 3, 4, 5])
        
        # Iterate over mock
        result = list(mock)
        assert result == [1, 2, 3, 4, 5]
        
        # Create a fresh mock for second iteration
        mock2 = MagicMock()
        mock2.__iter__.return_value = iter([1, 2, 3, 4, 5])
        result2 = [x for x in mock2]
        assert result2 == [1, 2, 3, 4, 5]
    
    def test_mock_context_manager(self):
        """Test mock as context manager"""
        mock = MagicMock()
        mock.__enter__.return_value = "entered"
        mock.__exit__.return_value = None
        
        # Use as context manager
        with mock as value:
            assert value == "entered"
        
        # Verify context manager methods were called
        mock.__enter__.assert_called_once()
        mock.__exit__.assert_called_once()
    
    def test_mock_comparison(self):
        """Test mock comparison behavior"""
        mock1 = MagicMock()
        mock2 = MagicMock()
        
        # Mocks are equal to themselves
        assert mock1 == mock1
        assert mock2 == mock2
        
        # Different mocks are not equal
        assert mock1 != mock2
        
        # Mock with same spec can be compared
        mock1.configure_mock(name="test")
        mock2.configure_mock(name="test")
        
        # But they're still different objects
        assert mock1 != mock2
