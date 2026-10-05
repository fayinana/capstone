from __future__ import annotations

import streamlit as st

from src.dashboard.components.api import check_login
from src.dashboard.components.chrome import inject_css

st.set_page_config(page_title="Prompt Firewall · SOC", page_icon="🛡️", layout="wide")
inject_css()

st.markdown(
    """
<div class="hero">
  <h1>Decentralized AI Prompt Injection Firewall</h1>
  <p>Inline OpenAI-compatible proxy. Inspection, telemetry, and models stay on this network.</p>
</div>
""",
    unsafe_allow_html=True,
)

if not check_login():
    st.stop()

st.success("Session established. Use **Analytics**, **Threat Logs**, and **Configuration** in the sidebar.")
st.markdown(
    """
**Operator map**
- **Analytics** — volume, allow/block mix, which layer fired, latency.
- **Threat Logs** — forensic table of prompts, decisions, rate-limit and anomaly labels.
- **Configuration** — live policy, Layer 2 band, SIEM, rate limits, accept/dismiss rule suggestions.

Suggested rules are **never auto-enforced**. Accepting one writes an audited `firewall_rules` row.
"""
)
