from __future__ import annotations

import streamlit as st

from src.dashboard.components.api import api_get, api_post, check_login
from src.dashboard.components.chrome import inject_css

st.set_page_config(page_title="Configuration · Prompt Firewall", page_icon="⚙️", layout="wide")
inject_css()
st.markdown(
    '<div class="hero"><h1>Policy & configuration</h1>'
    "<p>Live-editable controls overlay YAML. Suggested rules never auto-enter the hot path.</p></div>",
    unsafe_allow_html=True,
)

if not check_login():
    st.stop()

actor = st.session_state.get("actor") or "analyst"
bundle = api_get("/admin/settings")
settings = bundle.get("settings") or {}
if not settings:
    st.stop()

pipe = settings.get("pipeline") or {}
l2 = settings.get("layer_2") or {}
rl = settings.get("rate_limit") or {}
siem = settings.get("siem") or {}
out = settings.get("output_scanner") or {}
sug = settings.get("suggestions") or {}

st.markdown("#### Pipeline toggles")
c1, c2, c3, c4 = st.columns(4)
l1_on = c1.toggle("Layer 1 regex / deny-list", value=bool(pipe.get("layer_1_enabled", True)))
l2_on = c2.toggle("Layer 2 ONNX", value=bool(pipe.get("layer_2_enabled", True)))
l3_on = c3.toggle("Layer 3 intent (uncertain band only)", value=bool(pipe.get("layer_3_enabled", True)))
scan_on = c4.toggle("Output scanner", value=bool(pipe.get("output_scanner_enabled", True)))
if not scan_on:
    st.warning("Disabling the output scanner is an audited override.")

st.markdown("#### Layer 2 allow / review / block band")
low, high = st.slider(
    "Score thresholds (low ≤ allow & skip L3 · mid → L3 · high ≥ block)",
    0.0,
    1.0,
    (float(l2.get("low_threshold", 0.28)), float(l2.get("high_threshold", 0.72))),
)

st.markdown("#### Output scanner policy")
policy = st.selectbox("On PII / secrets / system-prompt leak", ["redact", "block", "warn"], index=["redact", "block", "warn"].index(str(out.get("policy") or "redact")))

st.markdown("#### Pre-Layer-1 rate limit & anomaly")
r1, r2, r3, r4 = st.columns(4)
rpw = r1.number_input("Requests / window", 1, 10000, int(rl.get("requests_per_window") or 60))
win = r2.number_input("Window seconds", 1, 3600, int(rl.get("window_seconds") or 60))
burst = r3.number_input("Burst size", 0, 1000, int(rl.get("burst_size", 20)))
cool = r4.number_input("Cooldown seconds", 1, 3600, int(rl.get("cooldown_seconds") or 120))
a1, a2, a3 = st.columns(3)
spike = a1.number_input("Spike multiplier", 1.0, 50.0, float(rl.get("anomaly_spike_multiplier") or 4.0))
streak = a2.number_input("Block streak → temp block", 2, 100, int(rl.get("anomaly_block_streak") or 8))
temp = a3.number_input("Temp block seconds", 10, 86400, int(rl.get("temp_block_seconds") or 300))
rl_enabled = st.toggle("Rate limit enabled", value=bool(rl.get("enabled", True)))

st.markdown("#### SIEM export (off by default, async, non-blocking)")
siem_on = st.toggle("Enable SIEM export", value=bool(siem.get("enabled", False)))
dest = st.selectbox("Destination", ["webhook", "syslog"], index=0 if (siem.get("destination") or "webhook") == "webhook" else 1)
wh = st.text_input("Webhook URL", value=str(siem.get("webhook_url") or ""))
sh = st.text_input("Syslog host", value=str(siem.get("syslog_host") or ""))
sp = st.number_input("Syslog port", 1, 65535, int(siem.get("syslog_port") or 514))
incl = st.toggle("Include raw prompt in SIEM payload", value=bool(siem.get("include_raw_prompt", False)))

st.markdown("#### Rule suggestion job")
s_on = st.toggle("Generate suggestions from recurring patterns", value=bool(sug.get("enabled", True)))
s1, s2 = st.columns(2)
s_win = s1.number_input("Window hours", 1, 168, int(sug.get("window_hours") or 24))
s_min = s2.number_input("Min occurrences", 2, 100, int(sug.get("min_count") or 3))
st.caption("Suggestions stay PENDING until you accept or dismiss them. They are never auto-enforced.")

if st.button("Save live policy", type="primary"):
    overlay = {
        "pipeline": {
            "layer_1_enabled": l1_on,
            "layer_2_enabled": l2_on,
            "layer_3_enabled": l3_on,
            "output_scanner_enabled": scan_on,
        },
        "layer_2": {"low_threshold": float(low), "high_threshold": float(high)},
        "output_scanner": {"policy": policy},
        "rate_limit": {
            "enabled": rl_enabled,
            "requests_per_window": int(rpw),
            "window_seconds": int(win),
            "burst_size": int(burst),
            "cooldown_seconds": int(cool),
            "anomaly_spike_multiplier": float(spike),
            "anomaly_block_streak": int(streak),
            "temp_block_seconds": int(temp),
        },
        "siem": {
            "enabled": siem_on,
            "destination": dest,
            "webhook_url": wh,
            "syslog_host": sh,
            "syslog_port": int(sp),
            "include_raw_prompt": incl,
        },
        "suggestions": {"enabled": s_on, "window_hours": int(s_win), "min_count": int(s_min), "never_auto_enforce": True},
    }
    api_post("/admin/settings", {"actor": actor, "overlay": overlay})
    st.success("Policy overlay saved and audited.")
    st.rerun()

st.divider()
st.markdown("#### Pending rule suggestions")
pending = api_get("/admin/suggestions", {"status": "PENDING"}).get("items") or []
if not pending:
    st.info("No pending suggestions. Repeat the same blocked phrase several times to generate one.")
for item in pending:
    with st.expander(f"{item.get('pattern')} · {item.get('occurrence_count')} hits"):
        st.write(item.get("rationale"))
        st.code((item.get("sample_prompt") or "")[:800])
        edited = st.text_input("Pattern to accept", value=item.get("pattern") or "", key=f"p-{item['id']}")
        b1, b2 = st.columns(2)
        if b1.button("Accept (enforce)", key=f"a-{item['id']}"):
            api_post(f"/admin/suggestions/{item['id']}/accept", {"actor": actor, "pattern": edited})
            st.success("Accepted. Rule is now in the Layer 1 hot set.")
            st.rerun()
        if b2.button("Dismiss", key=f"d-{item['id']}"):
            api_post(f"/admin/suggestions/{item['id']}/dismiss", {"actor": actor})
            st.rerun()

st.markdown("#### Active database rules")
rules = api_get("/admin/rules").get("items") or []
if rules:
    st.dataframe(rules, use_container_width=True)
else:
    st.caption("No extra DB rules yet (YAML signatures still apply).")

st.markdown("#### Audit trail")
audit = api_get("/admin/audit").get("items") or []
if audit:
    st.dataframe(audit, use_container_width=True, height=240)
