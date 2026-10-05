from __future__ import annotations

import asyncio
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse

from src.config_loader import deep_merge, load_base_config, load_deny_list, load_regex_rules
from src.database import storage
from src.database.connection import close_pool, init_pool
from src.engine.layer_1_deterministic import Layer1Deterministic
from src.engine.layer_2_classifier import Layer2Classifier
from src.engine.layer_3_evaluator import Layer3Evaluator
from src.engine.output_scanner import OutputScanner
from src.engine.pipeline import DefensePipeline
from src.engine.rate_limit import RateLimiter
from src.proxy.forwarder import DownstreamForwarder
from src.proxy.handler import apply_redacted_prompt, error_body, extract_prompt_bundle
from src.siem import exporter as siem
from src.suggestions import generator as suggestions

load_dotenv()

log = logging.getLogger("firewall")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())

ROOT = Path(__file__).resolve().parents[1]


class AppState:
    settings: dict[str, Any]
    pipeline: DefensePipeline
    limiter: RateLimiter
    forwarder: DownstreamForwarder
    log_queue: asyncio.Queue
    layer1: Layer1Deterministic


state = AppState()


def _merge_runtime() -> dict[str, Any]:
    base = load_base_config()
    try:
        overlay = storage.get_runtime_settings()
    except Exception:
        overlay = {}
    return deep_merge(base, overlay or {})


def _reload_layer1() -> None:
    db_rules = []
    try:
        db_rules = storage.list_enabled_rules()
    except Exception as exc:  # noqa: BLE001
        log.warning("could not load DB rules: %s", exc)
    state.layer1.reload(load_regex_rules(), load_deny_list(), db_rules)


def build_pipeline(settings: dict[str, Any]) -> DefensePipeline:
    l2_cfg = settings.get("layer_2") or {}
    model_path = ROOT / l2_cfg.get("model_path", "src/models/classifier.onnx")
    tok_path = ROOT / l2_cfg.get("tokenizer_path", "src/models/tokenizer")
    state.layer1 = Layer1Deterministic(load_regex_rules(), load_deny_list(), [])
    layer2 = Layer2Classifier(
        str(model_path),
        str(tok_path),
        float(l2_cfg.get("low_threshold", 0.28)),
        float(l2_cfg.get("high_threshold", 0.72)),
    )
    out_cfg = settings.get("output_scanner") or {}
    scanner = OutputScanner(
        policy=str(out_cfg.get("policy") or "redact"),
        placeholder=str(out_cfg.get("redact_placeholder") or "[REDACTED]"),
    )
    max_turns = int((settings.get("proxy") or {}).get("max_conversation_turns") or 8)
    return DefensePipeline(state.layer1, layer2, Layer3Evaluator(), scanner, settings, max_turns)


def _cfg_int(data: dict[str, Any], key: str, default: int) -> int:
    value = data.get(key, default)
    if value is None:
        return default
    return int(value)


def _cfg_float(data: dict[str, Any], key: str, default: float) -> float:
    value = data.get(key, default)
    if value is None:
        return default
    return float(value)


def _apply_rate_limit(settings: dict[str, Any]) -> None:
    rl = settings.get("rate_limit") or {}
    if not hasattr(state, "limiter") or getattr(state, "limiter", None) is None:
        state.limiter = RateLimiter()
    state.limiter.configure(
        enabled=bool(rl.get("enabled", True)),
        requests_per_window=_cfg_int(rl, "requests_per_window", 60),
        window_seconds=_cfg_int(rl, "window_seconds", 60),
        burst_size=_cfg_int(rl, "burst_size", 20),
        cooldown_seconds=_cfg_int(rl, "cooldown_seconds", 120),
        temp_block_seconds=_cfg_int(rl, "temp_block_seconds", 300),
        anomaly_spike_multiplier=_cfg_float(rl, "anomaly_spike_multiplier", 4.0),
        anomaly_block_streak=_cfg_int(rl, "anomaly_block_streak", 8),
        anomaly_distinct_patterns=_cfg_int(rl, "anomaly_distinct_patterns", 4),
    )


def apply_settings(settings: dict[str, Any]) -> None:
    state.settings = settings
    _apply_rate_limit(settings)
    if hasattr(state, "pipeline") and state.pipeline:
        state.pipeline.settings = settings
        state.pipeline.output_scanner.policy = str((settings.get("output_scanner") or {}).get("policy") or "redact")
        l2 = settings.get("layer_2") or {}
        state.pipeline.layer2.low = float(l2.get("low_threshold", state.pipeline.layer2.low))
        state.pipeline.layer2.high = float(l2.get("high_threshold", state.pipeline.layer2.high))
    _reload_layer1()


async def _logger_worker() -> None:
    while True:
        row = await state.log_queue.get()
        try:
            storage.insert_threat_log(row)
            siem.enqueue(row, state.settings)
        except Exception as exc:  # noqa: BLE001
            log.warning("async log failed (non-blocking): %s", exc)
        finally:
            state.log_queue.task_done()


async def _bg_jobs() -> None:
    while True:
        await asyncio.sleep(int((state.settings.get("suggestions") or {}).get("interval_seconds") or 30))
        try:
            suggestions.run_once(state.settings)
        except Exception as exc:  # noqa: BLE001
            log.warning("suggestion job: %s", exc)
        try:
            siem.flush(state.settings)
        except Exception as exc:  # noqa: BLE001
            log.warning("siem flush: %s", exc)
        try:
            apply_settings(_merge_runtime())
        except Exception as exc:  # noqa: BLE001
            log.warning("settings refresh: %s", exc)


async def _ensure_db() -> None:
    """Best-effort DB bootstrap; never block proxy readiness for long."""
    for attempt in range(1, 4):
        try:
            init_pool()
            storage.init_schema()
            log.info("database schema ready")
            return
        except Exception as exc:  # noqa: BLE001
            log.warning("database not ready (attempt %s): %s", attempt, exc)
            close_pool()
            await asyncio.sleep(1)
    log.warning("continuing without database; telemetry will retry asynchronously")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await asyncio.wait_for(_ensure_db(), timeout=12)
    except Exception as exc:  # noqa: BLE001
        log.warning("database bootstrap skipped: %s", exc)
    try:
        settings = _merge_runtime()
    except Exception:
        settings = load_base_config()
    state.forwarder = DownstreamForwarder(timeout=float((settings.get("proxy") or {}).get("request_timeout_seconds") or 60))
    state.pipeline = build_pipeline(settings)
    state.log_queue = asyncio.Queue(maxsize=int((settings.get("logging") or {}).get("async_buffer_size") or 1000))
    try:
        apply_settings(settings)
    except Exception as exc:  # noqa: BLE001
        log.warning("settings apply deferred: %s", exc)
        state.settings = settings
        state.limiter = RateLimiter()
    worker = asyncio.create_task(_logger_worker())
    jobs = asyncio.create_task(_bg_jobs())
    log.info("firewall proxy ready (mock_downstream=%s)", state.forwarder.is_mock())
    yield
    worker.cancel()
    jobs.cancel()
    close_pool()


app = FastAPI(title="AI Prompt Injection Firewall", version="1.0.0", lifespan=lifespan)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _enqueue(row: dict[str, Any]) -> None:
    try:
        state.log_queue.put_nowait(row)
    except asyncio.QueueFull:
        log.warning("log buffer full; dropping telemetry row")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict[str, Any]:
    return {
        "status": "ready",
        "mock_downstream": state.forwarder.is_mock(),
        "layer2_loaded": True,
        "rate_limit": {
            "enabled": getattr(state.limiter, "enabled", None),
            "requests_per_window": getattr(state.limiter, "requests_per_window", None),
            "burst_size": getattr(state.limiter, "burst_size", None),
        },
    }


@app.get("/v1/models")
def list_models() -> dict[str, Any]:
    return {
        "object": "list",
        "data": [{"id": "firewall-mock", "object": "model", "owned_by": "local"}],
    }


@app.post("/v1/chat/completions")
@app.post("/v1/completions")
async def chat_completions(
    request: Request,
    x_application_id: str | None = Header(default=None, alias="X-Application-Id"),
) -> JSONResponse:
    t0 = time.perf_counter()
    request_id = str(uuid.uuid4())
    client_ip = _client_ip(request)
    application_id = x_application_id or request.headers.get(os.getenv("APPLICATION_ID_HEADER", "X-Application-Id"), "default")
    body = await request.json()
    prompt, system_instruction, messages = extract_prompt_bundle(body)
    model = str(body.get("model") or "unknown")

    _apply_rate_limit(state.settings)
    pre = state.limiter.check(client_ip, application_id)
    if pre.action != "ALLOW":
        latency = (time.perf_counter() - t0) * 1000
        status = 429
        _enqueue(
            {
                "id": request_id,
                "prompt": prompt,
                "system_instruction": system_instruction,
                "conversation_history": messages,
                "client_ip": client_ip,
                "application_id": application_id,
                "target_model": model,
                "decision": pre.action,
                "layer": "PRECHECK",
                "trigger_label": pre.label,
                "detected_patterns": [pre.reason],
                "layer_scores": {},
                "rationale": pre.reason,
                "output_flagged": False,
                "latency_ms": latency,
                "http_status": status,
            }
        )
        return JSONResponse(
            error_body(
                "Rate limit or anomaly control engaged",
                "rate_limit",
                pre.action.lower(),
                {"retry_after": pre.retry_after, "request_id": request_id, "label": pre.label},
            ),
            status_code=status,
            headers={"Retry-After": str(pre.retry_after)},
        )

    result = state.pipeline.inspect_request(prompt, messages, system_instruction)
    if result.blocked:
        state.limiter.record_block(client_ip, application_id, (result.detected_patterns or [None])[0])
        latency = (time.perf_counter() - t0) * 1000
        _enqueue(
            {
                "id": request_id,
                "prompt": prompt,
                "system_instruction": system_instruction,
                "conversation_history": messages,
                "client_ip": client_ip,
                "application_id": application_id,
                "target_model": model,
                "decision": result.decision,
                "layer": result.layer,
                "trigger_label": result.trigger_label,
                "detected_patterns": result.detected_patterns,
                "layer_scores": result.layer_scores,
                "rationale": result.rationale,
                "output_flagged": False,
                "latency_ms": latency,
                "http_status": result.http_status,
            }
        )
        return JSONResponse(
            error_body(
                "Request blocked by AI prompt firewall",
                "firewall_block",
                result.layer.lower(),
                {
                    "request_id": request_id,
                    "layer": result.layer,
                    "trigger": result.trigger_label,
                    "rationale": result.rationale,
                },
            ),
            status_code=result.http_status,
        )

    fwd_body = body
    if result.redacted:
        fwd_body = apply_redacted_prompt(body, result.prompt)

    try:
        completion = await state.forwarder.chat_completions(fwd_body, dict(request.headers))
    except Exception as exc:  # noqa: BLE001
        log.exception("downstream error")
        return JSONResponse(
            error_body(f"Downstream error: {exc}", "downstream_error", "forward_failed", {"request_id": request_id}),
            status_code=502,
        )

    output_flagged = False
    scan_findings: list[str] = []
    pipe = state.settings.get("pipeline") or {}
    if pipe.get("output_scanner_enabled", True):
        message = (((completion.get("choices") or [{}])[0]).get("message") or {})
        text = str(message.get("content") or ((completion.get("choices") or [{}])[0]).get("text") or "")
        scan = state.pipeline.output_scanner.scan(text, system_instruction)
        output_flagged = scan.flagged
        scan_findings = scan.findings
        if scan.flagged and scan.policy_action == "block":
            latency = (time.perf_counter() - t0) * 1000
            _enqueue(
                {
                    "id": request_id,
                    "prompt": result.prompt,
                    "system_instruction": system_instruction,
                    "conversation_history": messages,
                    "client_ip": client_ip,
                    "application_id": application_id,
                    "target_model": model,
                    "decision": "BLOCK",
                    "layer": "OUTPUT_SCANNER",
                    "trigger_label": "OUTPUT_BLOCK",
                    "detected_patterns": scan.findings,
                    "layer_scores": result.layer_scores,
                    "rationale": "Output scanner blocked completion",
                    "output_flagged": True,
                    "latency_ms": latency,
                    "http_status": 403,
                }
            )
            return JSONResponse(
                error_body(
                    "Completion blocked by output scanner",
                    "firewall_block",
                    "output_scanner",
                    {"request_id": request_id, "findings": scan.findings},
                ),
                status_code=403,
            )
        if scan.flagged and scan.policy_action == "redact":
            if "choices" in completion and completion["choices"]:
                if "message" in completion["choices"][0]:
                    completion["choices"][0]["message"]["content"] = scan.text
                elif "text" in completion["choices"][0]:
                    completion["choices"][0]["text"] = scan.text
            completion["firewall"] = {"output_flagged": True, "findings": scan.findings, "action": "redact"}
        elif scan.flagged and scan.policy_action == "warn":
            completion["firewall"] = {"output_flagged": True, "findings": scan.findings, "action": "warn"}

    decision = "REDACT" if result.redacted or output_flagged else "ALLOW"
    if result.redacted:
        decision = "REDACT"
    latency = (time.perf_counter() - t0) * 1000
    _enqueue(
        {
            "id": request_id,
            "prompt": prompt,
            "system_instruction": system_instruction,
            "conversation_history": messages,
            "client_ip": client_ip,
            "application_id": application_id,
            "target_model": model,
            "decision": decision,
            "layer": result.layer if not output_flagged else "OUTPUT_SCANNER",
            "trigger_label": result.trigger_label if not output_flagged else "OUTPUT_FLAG",
                    "detected_patterns": result.detected_patterns + (scan_findings if output_flagged else []),
            "layer_scores": result.layer_scores,
            "rationale": result.rationale,
            "output_flagged": output_flagged,
            "latency_ms": latency,
            "http_status": 200,
        }
    )
    completion.setdefault("firewall", {})
    completion["firewall"].update(
        {
            "request_id": request_id,
            "decision": decision,
            "layer": result.layer,
            "latency_ms": round(latency, 3),
            "mock_downstream": state.forwarder.is_mock(),
        }
    )
    return JSONResponse(completion)


# --- Analyst API used by the Streamlit console (local network only) ---


@app.get("/admin/summary")
def admin_summary(hours: int = 24) -> dict[str, Any]:
    return storage.metrics_summary(hours)


@app.get("/admin/logs")
def admin_logs(limit: int = 200, decision: str | None = None, q: str | None = None) -> dict[str, Any]:
    rows = storage.list_logs(limit=limit, decision=decision, q=q)
    for row in rows:
        for key in ("created_at",):
            if row.get(key):
                row[key] = row[key].isoformat()
    return {"items": rows}


@app.get("/admin/settings")
def admin_settings() -> dict[str, Any]:
    return {"settings": state.settings, "yaml": load_base_config()}


@app.post("/admin/settings")
async def admin_save_settings(request: Request) -> dict[str, str]:
    body = await request.json()
    overlay = body.get("overlay") or body
    actor = body.get("actor") or "analyst"
    pipe = overlay.get("pipeline") or {}
    if pipe.get("output_scanner_enabled") is False:
        if (state.settings.get("pipeline") or {}).get("output_scanner_enabled", True):
            storage.insert_audit(actor, "DISABLE_OUTPUT_SCANNER", overlay)
    storage.save_runtime_settings(overlay)
    apply_settings(_merge_runtime())
    storage.insert_audit(actor, "UPDATE_SETTINGS", overlay)
    return {"status": "ok"}


@app.get("/admin/suggestions")
def admin_suggestions(status: str | None = None) -> dict[str, Any]:
    rows = storage.list_suggestions(status)
    for row in rows:
        if row.get("created_at"):
            row["created_at"] = row["created_at"].isoformat()
        if row.get("updated_at"):
            row["updated_at"] = row["updated_at"].isoformat()
    return {"items": rows}


@app.post("/admin/suggestions/{suggestion_id}/accept")
async def admin_accept(suggestion_id: str, request: Request) -> dict[str, Any]:
    body = {}
    try:
        body = await request.json()
    except Exception:
        body = {}
    actor = body.get("actor") or "analyst"
    row = storage.get_suggestion(suggestion_id)
    if not row:
        return JSONResponse({"error": "not_found"}, status_code=404)
    if row.get("status") != "PENDING":
        return {"status": row.get("status")}
    pattern = body.get("pattern") or row["pattern"]
    rule_id = storage.insert_rule(
        {
            "rule_type": body.get("rule_type") or row.get("pattern_type") or "KEYWORD",
            "pattern": pattern,
            "category": row.get("category") or "custom",
            "description": f"Accepted suggestion {suggestion_id}",
            "source": "SUGGESTION",
            "suggestion_id": suggestion_id,
        }
    )
    storage.set_suggestion_status(suggestion_id, "ACCEPTED", rule_id)
    storage.insert_audit(actor, "ACCEPT_SUGGESTION", {"suggestion_id": suggestion_id, "rule_id": rule_id})
    _reload_layer1()
    return {"status": "ACCEPTED", "rule_id": rule_id}


@app.post("/admin/suggestions/{suggestion_id}/dismiss")
async def admin_dismiss(suggestion_id: str, request: Request) -> dict[str, Any]:
    body = {}
    try:
        body = await request.json()
    except Exception:
        body = {}
    actor = body.get("actor") or "analyst"
    storage.set_suggestion_status(suggestion_id, "DISMISSED")
    storage.insert_audit(actor, "DISMISS_SUGGESTION", {"suggestion_id": suggestion_id})
    return {"status": "DISMISSED"}


@app.get("/admin/audit")
def admin_audit(limit: int = 100) -> dict[str, Any]:
    rows = storage.list_audit(limit)
    for row in rows:
        if row.get("created_at"):
            row["created_at"] = row["created_at"].isoformat()
    return {"items": rows}


@app.get("/admin/rules")
def admin_rules() -> dict[str, Any]:
    return {"items": storage.list_enabled_rules()}
