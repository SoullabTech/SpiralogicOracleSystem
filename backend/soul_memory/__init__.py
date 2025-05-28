from sqlalchemy import create_engine, Column, String, Text, DateTime
from sqlalchemy.orm import declarative_base

from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()


class MemoryEntry(Base):
    __tablename__ = "soul_memory"
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    content = Column(Text)
    tags = Column(String)


engine = create_engine("sqlite:///soul_memory.db")
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)
