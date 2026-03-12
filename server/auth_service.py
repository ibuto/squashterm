from __future__ import annotations

import hashlib
import hmac
import secrets
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

from paths import DATA_DIR

DB_PATH = DATA_DIR / "auth.db"
SESSION_DAYS = 30


def _connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _utcnow() -> str:
    return datetime.utcnow().isoformat(timespec="seconds")


def _hash_password(password: str, salt: str | None = None) -> str:
    resolved_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), resolved_salt.encode("utf-8"), 150000)
    return f"{resolved_salt}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        salt, expected = encoded.split("$", 1)
    except ValueError:
        return False
    computed = _hash_password(password, salt).split("$", 1)[1]
    return hmac.compare_digest(expected, computed)


def init_auth_db() -> None:
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
                is_active INTEGER NOT NULL DEFAULT 1,
                display_name TEXT,
                icon_url TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                key_hash TEXT NOT NULL UNIQUE,
                origin TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_by INTEGER,
                created_at TEXT NOT NULL,
                FOREIGN KEY(created_by) REFERENCES users(id)
            );
            """
        )
        columns = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        if "display_name" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN display_name TEXT")
        if "icon_url" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN icon_url TEXT")
        admin = conn.execute("SELECT id FROM users WHERE username = ?", ("admin",)).fetchone()
        if admin is None:
            conn.execute(
                "INSERT INTO users (username, password_hash, role, is_active, display_name, icon_url, created_at) VALUES (?, ?, 'admin', 1, ?, ?, ?)",
                ("admin", _hash_password("squashterm"), "Administrator", "/static/images/icon.png", _utcnow()),
            )


def list_users() -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT id, username, role, is_active, display_name, icon_url, created_at FROM users ORDER BY id"
        ).fetchall()
    return [dict(row) for row in rows]


def create_user(username: str, password: str, role: str, display_name: str | None = None, icon_url: str | None = None) -> dict:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO users (username, password_hash, role, is_active, display_name, icon_url, created_at) VALUES (?, ?, ?, 1, ?, ?, ?)",
            (username, _hash_password(password), role, display_name, icon_url, _utcnow()),
        )
        row = conn.execute(
            "SELECT id, username, role, is_active, display_name, icon_url, created_at FROM users WHERE username = ?",
            (username,),
        ).fetchone()
    return dict(row)


def update_user(user_id: int, username: str | None, password: str | None, role: str | None, is_active: bool | None, display_name: str | None, icon_url: str | None) -> dict | None:
    with _connect() as conn:
        current = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if current is None:
            return None
        next_username = username if username is not None else current["username"]
        next_hash = _hash_password(password) if password else current["password_hash"]
        next_role = role if role is not None else current["role"]
        next_is_active = int(is_active) if is_active is not None else current["is_active"]
        next_display_name = display_name if display_name is not None else current["display_name"]
        next_icon_url = icon_url if icon_url is not None else current["icon_url"]
        conn.execute(
            "UPDATE users SET username = ?, password_hash = ?, role = ?, is_active = ?, display_name = ?, icon_url = ? WHERE id = ?",
            (next_username, next_hash, next_role, next_is_active, next_display_name, next_icon_url, user_id),
        )
        row = conn.execute(
            "SELECT id, username, role, is_active, display_name, icon_url, created_at FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    return dict(row)




def get_user_by_id(user_id: int) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, username, role, is_active, display_name, icon_url, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    return dict(row) if row else None


def update_user_profile(user_id: int, display_name: str | None = None, icon_url: str | None = None) -> dict | None:
    return update_user(user_id, None, None, None, None, display_name, icon_url)


def delete_user(user_id: int) -> bool:
    with _connect() as conn:
        if conn.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone() is None:
            return False
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    return True


def authenticate_user(username: str, password: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if row is None or not row["is_active"]:
        return None
    if not verify_password(password, row["password_hash"]):
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"],
        "display_name": row["display_name"],
        "icon_url": row["icon_url"],
    }


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.utcnow() + timedelta(days=SESSION_DAYS)).isoformat(timespec="seconds")
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (token, user_id, expires_at, _utcnow()),
        )
    return token


def revoke_session(token: str) -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def get_session_user(token: str | None) -> dict | None:
    if not token:
        return None
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT users.id, users.username, users.role, users.display_name, users.icon_url
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ? AND sessions.expires_at > ? AND users.is_active = 1
            """,
            (token, _utcnow()),
        ).fetchone()
    return dict(row) if row else None


def create_api_key(name: str, origin: str | None, created_by: int) -> tuple[dict, str]:
    raw_key = secrets.token_urlsafe(36)
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    with _connect() as conn:
        conn.execute(
            "INSERT INTO api_keys (name, key_hash, origin, is_active, created_by, created_at) VALUES (?, ?, ?, 1, ?, ?)",
            (name, key_hash, origin, created_by, _utcnow()),
        )
        row = conn.execute(
            "SELECT id, name, origin, is_active, created_by, created_at FROM api_keys WHERE key_hash = ?",
            (key_hash,),
        ).fetchone()
    return dict(row), raw_key


def list_api_keys() -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT id, name, origin, is_active, created_by, created_at FROM api_keys ORDER BY id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def update_api_key(key_id: int, name: str | None, origin: str | None, is_active: bool | None) -> dict | None:
    with _connect() as conn:
        current = conn.execute("SELECT * FROM api_keys WHERE id = ?", (key_id,)).fetchone()
        if current is None:
            return None
        next_name = name if name is not None else current["name"]
        next_origin = origin if origin is not None else current["origin"]
        next_active = int(is_active) if is_active is not None else current["is_active"]
        conn.execute(
            "UPDATE api_keys SET name = ?, origin = ?, is_active = ? WHERE id = ?",
            (next_name, next_origin, next_active, key_id),
        )
        row = conn.execute(
            "SELECT id, name, origin, is_active, created_by, created_at FROM api_keys WHERE id = ?",
            (key_id,),
        ).fetchone()
    return dict(row)


def get_user_by_api_key(raw_key: str | None, origin: str | None) -> dict | None:
    if not raw_key:
        return None
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT users.id, users.username, users.role, users.display_name, users.icon_url, api_keys.origin
            FROM api_keys
            JOIN users ON users.id = api_keys.created_by
            WHERE api_keys.key_hash = ? AND api_keys.is_active = 1 AND users.is_active = 1
            """,
            (key_hash,),
        ).fetchone()
    if row is None:
        return None
    allowed_origin = row["origin"]
    if allowed_origin and origin and allowed_origin != origin:
        return None
    return {"id": row["id"], "username": row["username"], "role": row["role"], "display_name": row["display_name"], "icon_url": row["icon_url"]}
