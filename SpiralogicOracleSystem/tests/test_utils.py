import pytest
from oracle_backend.soul_memory.utils.text_cleaning import clean_text

@pytest.mark.parametrize("input_text, expected_output", [
    ("  Hello, World!  ", "hello world"),
    ("Symbols #$%^&*", "symbols"),
    ("MiXeD CaSe TeXt", "mixed case text"),
    ("     ", ""),  # Only spaces
    ("", ""),       # Empty string
])
def test_clean_text(input_text, expected_output):
    assert clean_text(input_text) == expected_output
