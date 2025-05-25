import re

def clean_text(text: str) -> str:
    """Clean input text by removing punctuation, extra whitespace, and lowercasing."""
    text = re.sub(r"[^\w\s]", "", text)  # Remove punctuation
    text = text.lower()                  # Convert to lowercase
    text = re.sub(r"\s+", " ", text).strip()  # Remove extra spaces
    return text
