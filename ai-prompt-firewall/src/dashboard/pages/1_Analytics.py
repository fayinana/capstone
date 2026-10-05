from __future__ import annotations

import pandas as pd
import plotly.express as px
import streamlit as st

from src.dashboard.components.api import api_get, check_login
from src.dashboard.components.chrome import inject_css, kpi

st.set_page_config(page_title="Analytics · Prompt Firewall", page_icon="📊", layout="wide")
inject_css()
st.markdown('<div class="hero"><h1>Command center</h1><p>SOC overview of inspection volume and enforcement mix.</p></div>', unsafe_allow_html=True)

if not check_login():
    st.stop()

hours = st.select_slider("Lookback (hours)", options=[6, 12, 24, 48, 72, 168], value=24)
data = api_get("/admin/summary", {"hours": hours})
totals = data.get("totals") or {}
series = data.get("series") or []
threats = data.get("threats") or []

c1, c2, c3, c4, c5 = st.columns(5)
with c1:
    kpi("Inspected", int(totals.get("inspected") or 0), "requests in window")
with c2:
    kpi("Blocked", int(totals.get("blocked") or 0), "policy denials")
with c3:
    kpi("Allowed", int(totals.get("allowed") or 0), "forwarded downstream")
with c4:
    kpi("Redacted", int(totals.get("redacted") or 0), "sanitized + forwarded")
with c5:
    kpi("Avg latency", f"{float(totals.get('avg_latency_ms') or 0):.2f} ms", "proxy decision path")

st.markdown("#### Pipeline lamps")
l1, l2, l3, rl, an = st.columns(5)
lamps = [
    (l1, "Layer 1", int(totals.get("layer_1_blocks") or 0)),
    (l2, "Layer 2", int(totals.get("layer_2_blocks") or 0)),
    (l3, "Layer 3", int(totals.get("layer_3_blocks") or 0)),
    (rl, "Rate limit", int(totals.get("rate_limit_events") or 0)),
    (an, "Anomaly", int(totals.get("anomaly_events") or 0)),
]
for col, name, n in lamps:
    color = "#3ee0c5" if n == 0 else "#ff6b8a"
    col.markdown(
        f'<div class="kpi"><span class="lamp" style="color:{color}"></span>'
        f'<b>{name}</b><div class="value">{n}</div><div class="hint">events</div></div>',
        unsafe_allow_html=True,
    )

left, right = st.columns((2, 1))
with left:
    if series:
        df = pd.DataFrame(series)
        df["hour_start"] = pd.to_datetime(df["hour_start"])
        fig = px.bar(
            df,
            x="hour_start",
            y=["allowed", "blocked", "redacted", "throttled"],
            title="Hourly mix",
            color_discrete_sequence=["#3ee0c5", "#ff6b8a", "#f0c36a", "#7aa2ff"],
        )
        fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", legend_title="")
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("No hourly metrics yet. Send traffic through `/v1/chat/completions`.")
with right:
    if threats:
        tdf = pd.DataFrame(threats)
        fig = px.pie(tdf, names="label", values="n", title="Trigger labels", hole=0.45,
                     color_discrete_sequence=px.colors.sequential.Tealgrn)
        fig.update_layout(paper_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("No non-allow events in this window.")

st.caption("Output scanner flags this window: **%s**" % int(totals.get("output_flags") or 0))
