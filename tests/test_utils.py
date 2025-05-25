from soul_memory.utils.text_cleaning import clean_text

def test_clean_text():
    text = "Hello...   World!!"
    cleaned = clean_text(text)
    assert "hello" in cleaned.lower()

