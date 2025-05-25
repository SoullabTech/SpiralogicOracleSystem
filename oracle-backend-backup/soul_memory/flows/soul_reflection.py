from prefect import flow, task
from soul_memory.db.memory_store import SessionLocal, MemoryEntry


@task
def save_entry(entry_data):
    db = SessionLocal()
    entry = MemoryEntry(**entry_data)
    db.add(entry)
    db.commit()
    db.close()


@flow
def soul_reflection(entry_data: dict):
    save_entry(entry_data)
