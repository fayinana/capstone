from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from src.database.connection import JsonType, dict_cursor, get_conn
from src.database.models import SCHEMA_SQL

log = logging.getLogger("firewall.db")


def init_schema() -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)


def insert_threat_log(row: dict[str, Any]) -> None:
    row = dict(row)
    row.setdefault("id", str(uuid.uuid4()))
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO threat_logs (
                    id, prompt, system_instruction, conversation_history,
                    client_ip, application_id, target_model, decision, layer,
                    trigger_label, detected_patterns, layer_scores, rationale,
                    output_flagged, latency_ms, http_status
                ) VALUES (
                    %(id)s, %(prompt)s, %(system_instruction)s, %(conversation_history)s,
                    %(client_ip)s, %(application_id)s, %(target_model)s, %(decision)s, %(layer)s,
                    %(trigger_label)s, %(detected_patterns)s, %(layer_scores)s, %(rationale)s,
                    %(output_flagged)s, %(latency_ms)s, %(http_status)s
                )
                """,
                {
                    **row,
                    "conversation_history": JsonType(row.get("conversation_history") or []),
                    "layer_scores": JsonType(row.get("layer_scores") or {}),
                    "detected_patterns": row.get("detected_patterns") or [],
                    "output_flagged": bool(row.get("output_flagged")),
                },
            )
    _bump_metrics(row)


def _bump_metrics(row: dict[str, Any]) -> None:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    decision = row.get("decision") or ""
    layer = row.get("layer") or ""
    trigger = row.get("trigger_label") or ""
    latency = float(row.get("latency_ms") or 0)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO hourly_metrics (
                    hour_start, inspected, allowed, blocked, redacted, throttled,
                    layer_1_blocks, layer_2_blocks, layer_3_blocks, output_flags,
                    rate_limit_events, anomaly_events, avg_latency_ms
                ) VALUES (
                    %s, 1,
                    CASE WHEN %s = 'ALLOW' THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'BLOCK' THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'REDACT' THEN 1 ELSE 0 END,
                    CASE WHEN %s IN ('THROTTLE','TEMP_BLOCK') THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'LAYER_1' AND %s = 'BLOCK' THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'LAYER_2' AND %s = 'BLOCK' THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'LAYER_3' AND %s = 'BLOCK' THEN 1 ELSE 0 END,
                    CASE WHEN %s THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'RATE_LIMIT' THEN 1 ELSE 0 END,
                    CASE WHEN %s = 'ANOMALY' THEN 1 ELSE 0 END,
                    %s
                )
                ON CONFLICT (hour_start) DO UPDATE SET
                    inspected = hourly_metrics.inspected + 1,
                    allowed = hourly_metrics.allowed + EXCLUDED.allowed,
                    blocked = hourly_metrics.blocked + EXCLUDED.blocked,
                    redacted = hourly_metrics.redacted + EXCLUDED.redacted,
                    throttled = hourly_metrics.throttled + EXCLUDED.throttled,
                    layer_1_blocks = hourly_metrics.layer_1_blocks + EXCLUDED.layer_1_blocks,
                    layer_2_blocks = hourly_metrics.layer_2_blocks + EXCLUDED.layer_2_blocks,
                    layer_3_blocks = hourly_metrics.layer_3_blocks + EXCLUDED.layer_3_blocks,
                    output_flags = hourly_metrics.output_flags + EXCLUDED.output_flags,
                    rate_limit_events = hourly_metrics.rate_limit_events + EXCLUDED.rate_limit_events,
                    anomaly_events = hourly_metrics.anomaly_events + EXCLUDED.anomaly_events,
                    avg_latency_ms = (hourly_metrics.avg_latency_ms * hourly_metrics.inspected + EXCLUDED.avg_latency_ms)
                        / (hourly_metrics.inspected + 1)
                """,
                (
                    now,
                    decision,
                    decision,
                    decision,
                    decision,
                    layer,
                    decision,
                    layer,
                    decision,
                    layer,
                    decision,
                    bool(row.get("output_flagged")),
                    trigger,
                    trigger,
                    latency,
                ),
            )


def list_enabled_rules() -> list[dict[str, Any]]:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT * FROM firewall_rules WHERE enabled = TRUE ORDER BY created_at")
            return list(cur.fetchall())


def insert_rule(rule: dict[str, Any]) -> str:
    rid = str(rule.get("id") or uuid.uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO firewall_rules (id, rule_type, pattern, category, description, enabled, source, suggestion_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    rid,
                    rule.get("rule_type") or "KEYWORD",
                    rule["pattern"],
                    rule.get("category"),
                    rule.get("description"),
                    rule.get("enabled", True),
                    rule.get("source") or "MANUAL",
                    rule.get("suggestion_id"),
                ),
            )
    return rid


def list_suggestions(status: str | None = None) -> list[dict[str, Any]]:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            if status:
                cur.execute(
                    "SELECT * FROM rule_suggestions WHERE status = %s ORDER BY occurrence_count DESC, created_at DESC",
                    (status,),
                )
            else:
                cur.execute("SELECT * FROM rule_suggestions ORDER BY created_at DESC LIMIT 200")
            return list(cur.fetchall())


def upsert_suggestion(pattern: str, pattern_type: str, category: str, count: int, sample: str, rationale: str, window_hours: int) -> None:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(
                """
                SELECT id, status FROM rule_suggestions
                WHERE pattern = %s AND status = 'PENDING'
                LIMIT 1
                """,
                (pattern,),
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    """
                    UPDATE rule_suggestions
                    SET occurrence_count = %s, sample_prompt = %s, rationale = %s, updated_at = NOW()
                    WHERE id = %s
                    """,
                    (count, sample, rationale, existing["id"]),
                )
                return
            cur.execute(
                """
                INSERT INTO rule_suggestions (
                    id, status, pattern, pattern_type, category, occurrence_count,
                    window_hours, sample_prompt, rationale
                ) VALUES (%s, 'PENDING', %s, %s, %s, %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), pattern, pattern_type, category, count, window_hours, sample, rationale),
            )


def set_suggestion_status(suggestion_id: str, status: str, accepted_rule_id: str | None = None) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE rule_suggestions
                SET status = %s, accepted_rule_id = %s, updated_at = NOW()
                WHERE id = %s
                """,
                (status, accepted_rule_id, suggestion_id),
            )


def get_suggestion(suggestion_id: str) -> dict[str, Any] | None:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT * FROM rule_suggestions WHERE id = %s", (suggestion_id,))
            row = cur.fetchone()
            return dict(row) if row else None


def recurring_patterns(window_hours: int, min_count: int) -> list[dict[str, Any]]:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(
                """
                SELECT unnest(detected_patterns) AS pattern, COUNT(*) AS occ,
                       (array_agg(prompt ORDER BY created_at DESC))[1] AS sample_prompt
                FROM threat_logs
                WHERE created_at >= NOW() - (%s || ' hours')::interval
                  AND decision IN ('BLOCK', 'REDACT', 'THROTTLE', 'TEMP_BLOCK')
                GROUP BY 1
                HAVING COUNT(*) >= %s
                ORDER BY occ DESC
                LIMIT 50
                """,
                (str(window_hours), min_count),
            )
            return list(cur.fetchall())


def list_logs(limit: int = 200, decision: str | None = None, q: str | None = None) -> list[dict[str, Any]]:
    clauses = ["TRUE"]
    params: list[Any] = []
    if decision:
        clauses.append("decision = %s")
        params.append(decision)
    if q:
        clauses.append("(prompt ILIKE %s OR rationale ILIKE %s OR client_ip ILIKE %s)")
        params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])
    params.append(limit)
    sql = f"SELECT * FROM threat_logs WHERE {' AND '.join(clauses)} ORDER BY created_at DESC LIMIT %s"
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(sql, params)
            return list(cur.fetchall())


def metrics_summary(hours: int = 24) -> dict[str, Any]:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(
                """
                SELECT COALESCE(SUM(inspected),0) AS inspected,
                       COALESCE(SUM(allowed),0) AS allowed,
                       COALESCE(SUM(blocked),0) AS blocked,
                       COALESCE(SUM(redacted),0) AS redacted,
                       COALESCE(SUM(throttled),0) AS throttled,
                       COALESCE(SUM(layer_1_blocks),0) AS layer_1_blocks,
                       COALESCE(SUM(layer_2_blocks),0) AS layer_2_blocks,
                       COALESCE(SUM(layer_3_blocks),0) AS layer_3_blocks,
                       COALESCE(SUM(output_flags),0) AS output_flags,
                       COALESCE(SUM(rate_limit_events),0) AS rate_limit_events,
                       COALESCE(SUM(anomaly_events),0) AS anomaly_events,
                       COALESCE(AVG(avg_latency_ms),0) AS avg_latency_ms
                FROM hourly_metrics
                WHERE hour_start >= NOW() - (%s || ' hours')::interval
                """,
                (str(hours),),
            )
            totals = dict(cur.fetchone() or {})
            cur.execute(
                """
                SELECT hour_start, inspected, allowed, blocked, redacted, throttled
                FROM hourly_metrics
                WHERE hour_start >= NOW() - (%s || ' hours')::interval
                ORDER BY hour_start
                """,
                (str(hours),),
            )
            series = list(cur.fetchall())
            cur.execute(
                """
                SELECT COALESCE(trigger_label,'UNKNOWN') AS label, COUNT(*) AS n
                FROM threat_logs
                WHERE created_at >= NOW() - (%s || ' hours')::interval
                  AND decision <> 'ALLOW'
                GROUP BY 1
                ORDER BY n DESC
                """,
                (str(hours),),
            )
            threats = list(cur.fetchall())
    return {"totals": totals, "series": series, "threats": threats}


def insert_audit(actor: str, action: str, details: dict[str, Any] | None = None) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO admin_audit_logs (id, actor, action, details) VALUES (%s, %s, %s, %s)",
                (str(uuid.uuid4()), actor, action, JsonType(details or {})),
            )


def list_audit(limit: int = 100) -> list[dict[str, Any]]:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT %s", (limit,))
            return list(cur.fetchall())


def get_runtime_settings() -> dict[str, Any]:
    with get_conn() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT value FROM runtime_settings WHERE key = 'overlay'")
            row = cur.fetchone()
            return dict(row["value"]) if row else {}


def save_runtime_settings(overlay: dict[str, Any]) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO runtime_settings (key, value, updated_at)
                VALUES ('overlay', %s, NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
                """,
                (JsonType(overlay),),
            )
