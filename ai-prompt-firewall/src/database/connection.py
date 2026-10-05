from __future__ import annotations

import os
from contextlib import contextmanager

import psycopg2
from psycopg2.extras import Json, RealDictCursor
from psycopg2.pool import SimpleConnectionPool

_pool: SimpleConnectionPool | None = None


def dsn() -> str:
    return (
        f"host={os.getenv('POSTGRES_HOST', 'localhost')} "
        f"port={os.getenv('POSTGRES_PORT', '5432')} "
        f"dbname={os.getenv('POSTGRES_DB', 'firewall')} "
        f"user={os.getenv('POSTGRES_USER', 'firewall')} "
        f"password={os.getenv('POSTGRES_PASSWORD', 'change-me-db')}"
    )


def init_pool(minconn: int = 1, maxconn: int = 8) -> None:
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(minconn, maxconn, dsn())


def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.closeall()
        _pool = None


@contextmanager
def get_conn():
    if _pool is None:
        init_pool()
    assert _pool is not None
    conn = _pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


def dict_cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)


JsonType = Json
