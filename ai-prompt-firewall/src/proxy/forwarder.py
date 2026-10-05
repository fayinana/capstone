from __future__ import annotations

import os
import time
from typing import Any

import httpx


class DownstreamForwarder:
    def __init__(self, timeout: float = 60.0):
        self.timeout = timeout

    @property
    def base_url(self) -> str:
        return (os.getenv("TARGET_BASE_URL") or "").rstrip("/")

    def is_mock(self) -> bool:
        return not self.base_url

    async def chat_completions(self, payload: dict[str, Any], headers: dict[str, str] | None = None) -> dict[str, Any]:
        if self.is_mock():
            return self._mock(payload)
        url = f"{self.base_url}/chat/completions"
        fwd_headers = {"Content-Type": "application/json"}
        api_key = os.getenv("TARGET_API_KEY") or ""
        auth = (headers or {}).get("authorization") or (headers or {}).get("Authorization")
        if auth:
            fwd_headers["Authorization"] = auth
        elif api_key:
            fwd_headers["Authorization"] = f"Bearer {api_key}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=payload, headers=fwd_headers)
            resp.raise_for_status()
            return resp.json()

    def _mock(self, payload: dict[str, Any]) -> dict[str, Any]:
        messages = payload.get("messages") or []
        last = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                last = str(msg.get("content") or "")
                break
        preview = (last[:240] + "…") if len(last) > 240 else last
        content = (
            "Mock downstream (TARGET_BASE_URL is empty). "
            "No traffic left this host. Echo of last user turn:\n\n"
            f"{preview or '(empty prompt)'}"
        )
        return {
            "id": f"chatcmpl-mock-{int(time.time())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": payload.get("model") or "firewall-mock",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }
