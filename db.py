import sqlite3
from datetime import datetime, timedelta

DB_PATH = "data/flows.db"

"""
Create and return a connection to the SQLite database.
"""
def get_conn():
    return sqlite3.connect(DB_PATH)

"""
Initialize the SQLite database by creating required tables if they do not exist.
This function sets up the application database schema, including:
    - flows: stores captured network traffic data and ML predictions
    - users: stores user information linked to IP addresses and devices
"""
def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS flows (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                captured_at TEXT NOT NULL,
                src_addr  TEXT,
                dst_addr  TEXT,
                sport     TEXT,
                dport     TEXT,
                proto     TEXT,
                state     TEXT,
                tot_pkts  INTEGER,
                tot_bytes INTEGER,
                dur       REAL,
                prediction INTEGER,
                confidence REAL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT NOT NULL,
                email      TEXT,
                ip_address TEXT NOT NULL,
                device     TEXT,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()

"""
Insert a batch of network flow records into the database.
Each flow is timestamped with the current UTC time and stored
along with its metadata and prediction result.

Args:
    flow_dicts (list[dict]): List of flow records to insert.
"""
def insert_flows(flow_dicts):
    rows = []
    for r in flow_dicts:
        row = (
            datetime.now().isoformat(),
            r.get("SrcAddr") or r.get("saddr"),
            r.get("DstAddr") or r.get("daddr"),
            r.get("Sport") or r.get("sport"),
            r.get("Dport") or r.get("dport"),
            r.get("Proto") or r.get("proto"),
            r.get("State") or r.get("state"),
            r.get("TotPkts") or r.get("pkts"),
            r.get("TotBytes") or r.get("bytes"),
            r.get("Dur") or r.get("dur"),
            r.get("prediction"),
            r.get("confidence")
        )
        rows.append(row)

    with get_conn() as conn:
        conn.executemany("""
            INSERT INTO flows
            (captured_at, src_addr, dst_addr, sport, dport, proto, state, tot_pkts, tot_bytes, dur, prediction, confidence)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, rows)
        conn.commit()

"""
Insert a new user into the database.
A timestamp (created_at) is automatically generated at insertion time.
"""
def insert_user(name, email, ip_address, device):
    with get_conn() as conn:
        conn.execute("""
            INSERT INTO users (name, email, ip_address, device, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (name, email, ip_address, device, datetime.now().isoformat()))
        conn.commit()

"""
Delete flow records older than the specified number of days.

Args:
   days (int, optional): Retention period in days. Defaults to 30.
"""
def delete_old_flows(days=30):
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    with get_conn() as conn:
        conn.execute("DELETE FROM flows WHERE captured_at < ?", (cutoff,))
        conn.commit()

"""
Retrieve the most recent flow records from the database.

Args:
   limit (int, optional): Maximum number of records to return. Defaults to 500.

Returns:
    list[dict]: List of flow records ordered by capture time (newest first).
"""
def get_all_flows():
    with get_conn() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM flows ORDER BY captured_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]

"""
Retrieve all users from the database ordered by name.

Returns:
    list[dict] : A list of users represented as dictionaries.
"""
def get_all_users():
    with get_conn() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM users ORDER BY name").fetchall()
    return [dict(r) for r in rows]

"""
Delete a user from the database by their ID.

Args : user_id (int): ID of the user to delete
"""
def delete_user(user_id):
    with get_conn() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()