from __future__ import annotations

import streamlit as st


def inject_css() -> None:
    st.markdown(
        """
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
html, body, [class*="css"]  { font-family: 'IBM Plex Sans', sans-serif; }
.block-container { padding-top: 1.4rem; max-width: 1400px; }
.hero {
  background: linear-gradient(135deg, #102033 0%, #0b1220 55%, #132a3a 100%);
  border: 1px solid #1f3b52;
  border-radius: 16px;
  padding: 22px 26px;
  margin-bottom: 18px;
}
.hero h1 { font-size: 1.55rem; margin: 0 0 6px 0; letter-spacing: 0.02em; }
.hero p { color: #9db0c8; margin: 0; }
.kpi {
  background: #121a2b;
  border: 1px solid #1e2c44;
  border-radius: 14px;
  padding: 14px 16px;
}
.kpi .label { color: #8aa0b8; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; }
.kpi .value { font-family: 'IBM Plex Mono', monospace; font-size: 1.7rem; margin-top: 4px; }
.kpi .hint { color: #6f869e; font-size: 0.78rem; }
.lamp {
  display: inline-block; width: 10px; height: 10px; border-radius: 50%;
  margin-right: 6px; box-shadow: 0 0 8px currentColor;
}
.badge {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 0.72rem; letter-spacing: 0.04em; font-family: 'IBM Plex Mono', monospace;
}
.ok { background: #12372c; color: #3ee0c5; }
.warn { background: #3a2e12; color: #f0c36a; }
.bad { background: #3a1520; color: #ff6b8a; }
div[data-testid="stSidebar"] { background: #0a101c; }
</style>
        """,
        unsafe_allow_html=True,
    )


def kpi(label: str, value, hint: str = "") -> None:
    st.markdown(
        f'<div class="kpi"><div class="label">{label}</div>'
        f'<div class="value">{value}</div><div class="hint">{hint}</div></div>',
        unsafe_allow_html=True,
    )
