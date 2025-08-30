#!/usr/bin/env python3
"""
Memory Agent - Context & Conversation Storage Service
Manages user context, conversation history, and semantic memory
"""

import os
import logging
import time
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import sqlite3
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Request/Response models
class MemoryEntry(BaseModel):
    user_id: str
    content: str
    type: str = "conversation"  # conversation, context, insight
    metadata: Optional[Dict[str, Any]] = None

class MemoryQuery(BaseModel):
    user_id: str
    query: Optional[str] = None
    type: Optional[str] = None
    limit: int = 10

class MemoryResponse(BaseModel):
    id: int
    user_id: str
    content: str
    type: str
    metadata: Dict[str, Any]
    created_at: str

class HealthResponse(BaseModel):
    status: str
    database_connected: bool
    total_memories: int
    uptime_seconds: float

# Global state
app_state = {
    "db_path": "/app/data/memory.db",
    "start_time": time.time(),
    "db_initialized": False
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources"""
    # Startup
    logger.info("🧠 Starting Memory Agent service...")
    
    try:
        init_database()
        app_state["db_initialized"] = True
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        app_state["db_initialized"] = False
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Memory Agent service...")

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(app_state["db_path"])
    cursor = conn.cursor()
    
    # Create memories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'conversation',
            metadata TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_id ON memories(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_type ON memories(type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_created_at ON memories(created_at)')
    
    conn.commit()
    conn.close()

def get_db():
    """Get database connection"""
    return sqlite3.connect(app_state["db_path"], check_same_thread=False)

# Create FastAPI app
app = FastAPI(
    title="Memory Agent - Context Storage Service",
    description="Manages user context, conversation history, and semantic memory",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "service": "Memory Agent - Context Storage Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM memories")
        total_memories = cursor.fetchone()[0]
        conn.close()
        db_connected = True
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        total_memories = 0
        db_connected = False
    
    return HealthResponse(
        status="healthy" if app_state["db_initialized"] and db_connected else "unhealthy",
        database_connected=db_connected,
        total_memories=total_memories,
        uptime_seconds=time.time() - app_state["start_time"]
    )

@app.post("/memory", response_model=dict)
async def store_memory(entry: MemoryEntry):
    """Store a memory entry"""
    if not app_state["db_initialized"]:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        metadata_json = json.dumps(entry.metadata or {})
        
        cursor.execute('''
            INSERT INTO memories (user_id, content, type, metadata)
            VALUES (?, ?, ?, ?)
        ''', (entry.user_id, entry.content, entry.type, metadata_json))
        
        memory_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Stored memory {memory_id} for user {entry.user_id}")
        
        return {
            "id": memory_id,
            "status": "stored",
            "user_id": entry.user_id
        }
        
    except Exception as e:
        logger.error(f"Failed to store memory: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to store memory: {str(e)}")

@app.post("/memory/query", response_model=List[MemoryResponse])
async def query_memories(query: MemoryQuery):
    """Query stored memories"""
    if not app_state["db_initialized"]:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Build query
        sql = "SELECT id, user_id, content, type, metadata, created_at FROM memories WHERE user_id = ?"
        params = [query.user_id]
        
        if query.type:
            sql += " AND type = ?"
            params.append(query.type)
        
        if query.query:
            sql += " AND content LIKE ?"
            params.append(f"%{query.query}%")
        
        sql += " ORDER BY created_at DESC LIMIT ?"
        params.append(query.limit)
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()
        
        # Convert to response objects
        memories = []
        for row in rows:
            memories.append(MemoryResponse(
                id=row[0],
                user_id=row[1],
                content=row[2],
                type=row[3],
                metadata=json.loads(row[4] or '{}'),
                created_at=row[5]
            ))
        
        logger.info(f"Retrieved {len(memories)} memories for user {query.user_id}")
        return memories
        
    except Exception as e:
        logger.error(f"Failed to query memories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to query memories: {str(e)}")

@app.get("/memory/user/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get memory statistics for a user"""
    if not app_state["db_initialized"]:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) FROM memories WHERE user_id = ?", (user_id,))
        total = cursor.fetchone()[0]
        
        # Get count by type
        cursor.execute('''
            SELECT type, COUNT(*) FROM memories 
            WHERE user_id = ? 
            GROUP BY type
        ''', (user_id,))
        
        type_counts = dict(cursor.fetchall())
        
        # Get latest memory
        cursor.execute('''
            SELECT created_at FROM memories 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        ''', (user_id,))
        
        latest_result = cursor.fetchone()
        latest_memory = latest_result[0] if latest_result else None
        
        conn.close()
        
        return {
            "user_id": user_id,
            "total_memories": total,
            "memories_by_type": type_counts,
            "latest_memory_at": latest_memory
        }
        
    except Exception as e:
        logger.error(f"Failed to get user stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user stats: {str(e)}")

@app.delete("/memory/user/{user_id}")
async def delete_user_memories(user_id: str):
    """Delete all memories for a user"""
    if not app_state["db_initialized"]:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM memories WHERE user_id = ?", (user_id,))
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        logger.info(f"Deleted {deleted_count} memories for user {user_id}")
        
        return {
            "user_id": user_id,
            "deleted_count": deleted_count,
            "status": "deleted"
        }
        
    except Exception as e:
        logger.error(f"Failed to delete user memories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete memories: {str(e)}")

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    workers = int(os.getenv("WORKERS", "1"))
    
    logger.info(f"Starting server on {host}:{port}")
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        workers=workers,
        log_level="info",
        access_log=True
    )