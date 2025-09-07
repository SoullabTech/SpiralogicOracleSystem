# soul_memory/db/memory_store.py

from sqlalchemy import create_engine, Column, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///./soul_memory.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class MemoryEntry(Base):
    __tablename__ = "memory_entries"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    content = Column(Text)
    tags = Column(String)


# Create the table
Base.metadata.create_all(bind=engine)
