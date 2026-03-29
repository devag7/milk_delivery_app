import sqlite3
import os
from pathlib import Path


def get_connection():
    # Use /tmp for Vercel serverless (only writable location)
    # Otherwise use current directory for local development
    if os.environ.get("VERCEL"):
        db_path = "/tmp/milk_delivery.db"
    else:
        db_path = Path(__file__).resolve().parent.parent / "milk_delivery.db"
    
    conn = sqlite3.connect(str(db_path), check_same_thread=False, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn
