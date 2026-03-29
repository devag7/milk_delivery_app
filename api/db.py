import sqlite3
import os
from pathlib import Path


def get_connection():
    # In serverless deployments project files can be read-only; /tmp is writable.
    base_dir = Path(__file__).resolve().parent.parent
    local_db_path = base_dir / "milk_delivery.db"

    if os.access(base_dir, os.W_OK):
        db_path = local_db_path
    else:
        db_path = Path("/tmp/milk_delivery.db")

    conn = sqlite3.connect(str(db_path), check_same_thread=False, timeout=5)
    conn.row_factory = sqlite3.Row
    return conn
