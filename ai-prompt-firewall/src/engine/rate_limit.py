from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass


@dataclass
class PrecheckResult:
    action: str  # ALLOW | THROTTLE | TEMP_BLOCK
    label: str
    retry_after: int
    reason: str


class RateLimiter:
    def __init__(
        self,
        requests_per_window: int = 60,
        window_seconds: int = 60,
        burst_size: int = 20,
        cooldown_seconds: int = 120,
        temp_block_seconds: int = 300,
        anomaly_spike_multiplier: float = 4.0,
        anomaly_block_streak: int = 8,
        anomaly_distinct_patterns: int = 4,
        enabled: bool = True,
    ):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.burst_size = burst_size
        self.cooldown_seconds = cooldown_seconds
        self.temp_block_seconds = temp_block_seconds
        self.anomaly_spike_multiplier = anomaly_spike_multiplier
        self.anomaly_block_streak = anomaly_block_streak
        self.anomaly_distinct_patterns = anomaly_distinct_patterns
        self.enabled = enabled
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._hour: dict[str, deque[float]] = defaultdict(deque)
        self._blocks: dict[str, deque[float]] = defaultdict(deque)
        self._patterns: dict[str, set[str]] = defaultdict(set)
        self._cooldown_until: dict[str, float] = {}
        self._temp_until: dict[str, float] = {}

    def configure(self, **kwargs) -> None:
        for key, value in kwargs.items():
            if hasattr(self, key) and value is not None:
                setattr(self, key, value)

    def _key(self, client_ip: str, application_id: str) -> str:
        return f"{client_ip or 'unknown'}|{application_id or 'default'}"

    def record_block(self, client_ip: str, application_id: str, pattern: str | None = None) -> None:
        key = self._key(client_ip, application_id)
        now = time.time()
        q = self._blocks[key]
        q.append(now)
        while q and now - q[0] > 600:
            q.popleft()
        if pattern:
            self._patterns[key].add(pattern)
            if len(self._patterns[key]) >= self.anomaly_distinct_patterns:
                self._temp_until[key] = now + self.temp_block_seconds

    def check(self, client_ip: str, application_id: str) -> PrecheckResult:
        if not self.enabled:
            return PrecheckResult("ALLOW", "PRECHECK", 0, "rate_limit_disabled")
        key = self._key(client_ip, application_id)
        now = time.time()

        until = self._temp_until.get(key, 0)
        if until > now:
            return PrecheckResult("TEMP_BLOCK", "ANOMALY", int(until - now), "temporary_anomaly_block")

        until = self._cooldown_until.get(key, 0)
        if until > now:
            return PrecheckResult("THROTTLE", "RATE_LIMIT", int(until - now), "abuse_cooldown")

        hits = self._hits[key]
        hits.append(now)
        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()

        hour = self._hour[key]
        hour.append(now)
        while hour and now - hour[0] > 3600:
            hour.popleft()

        if len(hits) > self.requests_per_window + self.burst_size:
            self._cooldown_until[key] = now + self.cooldown_seconds
            return PrecheckResult("THROTTLE", "RATE_LIMIT", self.cooldown_seconds, "window_exceeded")

        blocks = self._blocks[key]
        while blocks and now - blocks[0] > 600:
            blocks.popleft()
        if len(blocks) >= self.anomaly_block_streak:
            self._temp_until[key] = now + self.temp_block_seconds
            return PrecheckResult("TEMP_BLOCK", "ANOMALY", self.temp_block_seconds, "block_streak")

        baseline = max(len(hour) / 60.0, 1.0)
        current_rpm = len(hits) / max(self.window_seconds / 60.0, 0.01)
        if current_rpm > baseline * self.anomaly_spike_multiplier and len(hits) > self.burst_size:
            self._temp_until[key] = now + self.temp_block_seconds
            return PrecheckResult("TEMP_BLOCK", "ANOMALY", self.temp_block_seconds, "traffic_spike")

        return PrecheckResult("ALLOW", "PRECHECK", 0, "ok")
