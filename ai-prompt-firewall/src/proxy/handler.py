from __future__ import annotations

import copy
from typing import Any


def extract_prompt_bundle(body: dict[str, Any]) -> tuple[str, str, list[dict[str, Any]]]:
    messages = list(body.get("messages") or [])
    system_instruction = ""
    prompt = ""
    for msg in messages:
        role = msg.get("role")
        content = _stringify_content(msg.get("content"))
        if role == "system" and not system_instruction:
            system_instruction = content
        if role == "user":
            prompt = content
    if not prompt:
        prompt = _stringify_content(body.get("prompt") or body.get("input") or "")
    return prompt, system_instruction, messages


def apply_redacted_prompt(body: dict[str, Any], sanitized: str) -> dict[str, Any]:
    patched = copy.deepcopy(body)
    messages = patched.get("messages") or []
    for msg in reversed(messages):
        if msg.get("role") == "user":
            msg["content"] = sanitized
            break
    else:
        patched["prompt"] = sanitized
    patched["messages"] = messages
    return patched


def _stringify_content(content: Any) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                parts.append(str(item.get("text") or item.get("content") or ""))
            else:
                parts.append(str(item))
        return "\n".join(parts)
    return str(content)


def error_body(message: str, err_type: str, code: str, extra: dict[str, Any] | None = None, status: int = 403) -> dict[str, Any]:
    payload = {
        "error": {
            "message": message,
            "type": err_type,
            "code": code,
            **(extra or {}),
        }
    }
    return payload
