from __future__ import annotations

import os
from typing import Any

import httpx
import streamlit as st

PROXY_URL = os.getenv("FIREWALL_ADMIN_URL", os.getenv("PROXY_URL", "http://127.0.0.1:8080")).rstrip("/")


def check_login() -> bool:
    if st.session_state.get("authed"):
        return True
    st.markdown("### Analyst sign-in")
    st.caption("Local console only. Credentials never leave this deployment.")
    user = st.text_input("Username")
    pw = st.text_input("Password", type="password")
    if st.button("Enter console", type="primary"):
        expected_user = os.getenv("ADMIN_USERNAME", "analyst")
        expected_pw = os.getenv("ADMIN_PASSWORD", "change-me")
        if user == expected_user and pw == expected_pw:
            st.session_state.authed = True
            st.session_state.actor = user
            st.rerun()
        st.error("Invalid credentials")
    return False


def api_get(path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    try:
        r = httpx.get(f"{PROXY_URL}{path}", params=params, timeout=8.0)
        r.raise_for_status()
        return r.json()
    except Exception as exc:  # noqa: BLE001
        st.error(f"Proxy API unavailable ({path}): {exc}")
        return {}


def api_post(path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    r = httpx.post(f"{PROXY_URL}{path}", json=payload or {}, timeout=8.0)
    r.raise_for_status()
    return r.json()
