from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class JournalEntry(BaseModel):
    id: str
    timestamp: datetime
    content: str
    tags: Optional[List[str]] = []
