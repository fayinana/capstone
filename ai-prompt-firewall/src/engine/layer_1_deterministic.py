from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from src.engine.normalizer import normalize_text


@dataclass
class Layer1Hit:
    rule_id: str
    category: str
    pattern: str
    source: str


class Layer1Deterministic:
    def __init__(self, regex_rules: list[dict[str, Any]], deny_keywords: list[str], db_rules: list[dict[str, Any]] | None = None):
        self._regex: list[tuple[str, str, re.Pattern[str], str]] = []
        self._keywords: list[tuple[str, str, str]] = []
        self.reload(regex_rules, deny_keywords, db_rules)

    def reload(
        self,
        regex_rules: list[dict[str, Any]],
        deny_keywords: list[str],
        db_rules: list[dict[str, Any]] | None = None,
    ) -> None:
        compiled: list[tuple[str, str, re.Pattern[str], str]] = []
        for rule in regex_rules:
            compiled.append(
                (
                    str(rule.get("id") or "RX-UNKNOWN"),
                    str(rule.get("category") or "jailbreak"),
                    re.compile(str(rule["pattern"])),
                    str(rule.get("pattern") or ""),
                )
            )
        keywords: list[tuple[str, str, str]] = []
        for idx, raw in enumerate(deny_keywords):
            keywords.append((f"DL-{idx+1:03d}", normalize_text(raw), raw))
        for rule in db_rules or []:
            if not rule.get("enabled", True):
                continue
            rid = str(rule.get("id") or "DB-RULE")
            category = str(rule.get("category") or "custom")
            pattern = str(rule.get("pattern") or "")
            rtype = str(rule.get("rule_type") or "KEYWORD").upper()
            if rtype == "REGEX":
                try:
                    compiled.append((rid, category, re.compile(pattern), pattern))
                except re.error:
                    continue
            else:
                keywords.append((rid, normalize_text(pattern), pattern))
        self._regex = compiled
        self._keywords = keywords

    def evaluate(self, text: str) -> Layer1Hit | None:
        normalized = normalize_text(text)
        original = text or ""
        for rule_id, category, cre, pattern in self._regex:
            if cre.search(original) or cre.search(normalized):
                return Layer1Hit(rule_id, category, pattern, "regex")
        for rule_id, needle, pattern in self._keywords:
            if needle and needle in normalized:
                return Layer1Hit(rule_id, "deny_list", pattern, "keyword")
        return None
