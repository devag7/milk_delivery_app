import sqlite3
from pathlib import Path


def get_connection():
    db_path = Path(__file__).resolve().parent.parent / "milk_delivery.db"
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn
