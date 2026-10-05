from __future__ import annotations

import json
import logging
import socket
from typing import Any
from urllib import request

log = logging.getLogger("firewall.siem")

_buffer: list[dict[str, Any]] = []
_MAX = 500


def enqueue(event: dict[str, Any], settings: dict[str, Any]) -> None:
    siem = settings.get("siem") or {}
    if not siem.get("enabled"):
        return
    payload = dict(event)
    if not siem.get("include_raw_prompt"):
        payload.pop("prompt", None)
        payload.pop("system_instruction", None)
        payload.pop("conversation_history", None)
    _buffer.append(payload)
    if len(_buffer) > _MAX:
        del _buffer[: len(_buffer) - _MAX]


def flush(settings: dict[str, Any]) -> None:
    siem = settings.get("siem") or {}
    if not siem.get("enabled") or not _buffer:
        _buffer.clear()
        return
    batch = list(_buffer)
    _buffer.clear()
    dest = (siem.get("destination") or "webhook").lower()
    try:
        if dest == "syslog":
            _syslog(batch, siem)
        else:
            _webhook(batch, siem)
    except Exception as exc:  # noqa: BLE001
        log.warning("SIEM export failed (non-blocking): %s", exc)
        _buffer[:0] = batch[:200]


def _webhook(batch: list[dict[str, Any]], siem: dict[str, Any]) -> None:
    url = siem.get("webhook_url") or ""
    if not url:
        return
    data = json.dumps({"events": batch}).encode("utf-8")
    req = request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    timeout = float(siem.get("timeout_seconds") or 3)
    with request.urlopen(req, timeout=timeout) as resp:
        resp.read()


def _syslog(batch: list[dict[str, Any]], siem: dict[str, Any]) -> None:
    host = siem.get("syslog_host") or ""
    port = int(siem.get("syslog_port") or 514)
    if not host:
        return
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        for event in batch:
            msg = f"<134>firewall {json.dumps(event, default=str)}\n".encode("utf-8")
            sock.sendto(msg, (host, port))
    finally:
        sock.close()
