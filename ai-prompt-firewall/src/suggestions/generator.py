from __future__ import annotations

import logging
from typing import Any

from src.database import storage

log = logging.getLogger("firewall.suggestions")


def run_once(settings: dict[str, Any]) -> int:
    cfg = settings.get("suggestions") or {}
    if not cfg.get("enabled", True):
        return 0
    window = int(cfg.get("window_hours") or 24)
    min_count = int(cfg.get("min_count") or 3)
    created = 0
    try:
        rows = storage.recurring_patterns(window, min_count)
    except Exception as exc:  # noqa: BLE001
        log.warning("suggestion scan skipped: %s", exc)
        return 0
    for row in rows:
        pattern = (row.get("pattern") or "").strip()
        if not pattern or pattern.startswith("layer"):
            # skip generic ML labels; keep concrete rule ids / phrases
            if not pattern.startswith("RX-") and not pattern.startswith("DL-"):
                continue
        storage.upsert_suggestion(
            pattern=pattern,
            pattern_type="KEYWORD",
            category="recurring_block",
            count=int(row.get("occ") or 0),
            sample=str(row.get("sample_prompt") or "")[:2000],
            rationale=(
                f"Pattern '{pattern}' appeared {row.get('occ')} times in blocked/redacted "
                f"traffic over {window}h. Suggested for analyst review; not enforced."
            ),
            window_hours=window,
        )
        created += 1
    return created
