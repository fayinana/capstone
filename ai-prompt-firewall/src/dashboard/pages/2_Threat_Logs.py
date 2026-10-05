from __future__ import annotations

import pandas as pd
import streamlit as st

from src.dashboard.components.api import api_get, check_login
from src.dashboard.components.chrome import inject_css

st.set_page_config(page_title="Threat Logs · Prompt Firewall", page_icon="🗂️", layout="wide")
inject_css()
st.markdown('<div class="hero"><h1>Threat logs</h1><p>Forensic record of prompts, decisions, and pre-check labels. Local DB only.</p></div>', unsafe_allow_html=True)

if not check_login():
    st.stop()

c1, c2, c3 = st.columns((1, 1, 2))
with c1:
    decision = st.selectbox("Decision", ["", "ALLOW", "BLOCK", "REDACT", "THROTTLE", "TEMP_BLOCK"])
with c2:
    limit = st.slider("Rows", 25, 500, 150)
with c3:
    q = st.text_input("Search prompt / rationale / IP")

payload = api_get("/admin/logs", {"limit": limit, "decision": decision or None, "q": q or None})
rows = payload.get("items") or []
if not rows:
    st.info("No logs match the filter.")
    st.stop()

df = pd.DataFrame(rows)
show = df[
    [
        c
        for c in [
            "created_at",
            "decision",
            "layer",
            "trigger_label",
            "client_ip",
            "application_id",
            "latency_ms",
            "output_flagged",
            "detected_patterns",
            "rationale",
            "prompt",
        ]
        if c in df.columns
    ]
].copy()
if "latency_ms" in show:
    show["latency_ms"] = show["latency_ms"].map(lambda x: round(float(x), 3) if x is not None else None)

st.dataframe(show, use_container_width=True, height=560)

st.markdown("#### Detail")
idx = st.number_input("Row index", min_value=0, max_value=max(len(rows) - 1, 0), value=0)
item = rows[int(idx)]
st.json(
    {
        "id": item.get("id"),
        "decision": item.get("decision"),
        "layer": item.get("layer"),
        "trigger_label": item.get("trigger_label"),
        "detected_patterns": item.get("detected_patterns"),
        "layer_scores": item.get("layer_scores"),
        "rationale": item.get("rationale"),
        "prompt": item.get("prompt"),
        "target_model": item.get("target_model"),
    }
)
