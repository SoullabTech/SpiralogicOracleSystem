# flows/daily_journal_processing.py

from prefect import flow, task
from datetime import datetime
import requests


@task
def analyze_entry(entry_text: str) -> dict:
    # Stub for NLP / keyword / emotion detection
    keywords = ["grief", "rupture", "longing"]
    detected = [k for k in keywords if k in entry_text.lower()]
    return {"keywords": detected, "timestamp": datetime.utcnow().isoformat()}


@task
def trigger_adjuster_if_needed(keywords: list, user_id: str):
    if "rupture" in keywords:
        # Trigger internal endpoint or log
        requests.post(
            "https://yourdomain.com/api/adjuster/log",
            json={
                "user_id": user_id,
                "message": "Detected energetic rupture during journaling",
                "phase": "adjustment",
            },
        )


@flow(name="daily_journal_processing")
def daily_journal_processing_flow(user_id: str, entry_text: str):
    insights = analyze_entry(entry_text)
    trigger_adjuster_if_needed(insights["keywords"], user_id)
    return insights
