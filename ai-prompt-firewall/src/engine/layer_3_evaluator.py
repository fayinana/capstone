from __future__ import annotations

import re
from dataclasses import dataclass

from src.engine.normalizer import normalize_text

INDIRECT_MARKERS = [
    r"(?i)the (document|email|webpage|user) (says|asks|instructs) you to",
    r"(?i)when summarizing.{0,80}(ignore|disregard).{0,40}(policy|rules|instructions)",
    r"(?i)translate.{0,40}(then|and).{0,40}(ignore|bypass)",
    r"(?i)for the purpose of (research|fiction|hypothetically).{0,60}(no restrictions|unrestricted)",
]

REDACT_PHRASES = [
    r"(?i)ignore (all )?(previous|prior|above) instructions[^.!?\n]*[.!?]?",
    r"(?i)you are now (in )?(dan|developer mode)[^.!?\n]*[.!?]?",
    r"(?i)reveal (your )?(system prompt|hidden instructions)[^.!?\n]*[.!?]?",
    r"(?i)disable (all )?(safety|content) (filters|policies)[^.!?\n]*[.!?]?",
]


@dataclass
class Layer3Result:
    decision: str
    rationale: str
    sanitized_text: str | None = None


class Layer3Evaluator:
    """Local intent evaluator used only in the Layer-2 ambiguous band.

    Implemented as a fast on-box reasoning engine (no remote LLM, no weight
    download) so container start stays lightweight. It inspects multi-turn
    context for indirect injection and returns ALLOW / BLOCK / REDACT.
    """

    def evaluate(self, prompt: str, conversation: str, system_instruction: str = "") -> Layer3Result:
        blob = normalize_text("\n".join([system_instruction, conversation, prompt]))
        original = "\n".join([conversation, prompt])

        for marker in INDIRECT_MARKERS:
            if re.search(marker, original) or re.search(marker, blob):
                return Layer3Result(
                    decision="BLOCK",
                    rationale="Indirect injection: retrieved/context text tries to override the model policy.",
                )

        jail_hits = 0
        for token in (
            "unrestricted",
            "no restrictions",
            "jailbreak",
            "developer mode",
            "ignore previous",
            "system prompt",
        ):
            if token in blob:
                jail_hits += 1

        if jail_hits >= 2:
            return Layer3Result(
                decision="BLOCK",
                rationale="Multi-signal jailbreak intent across the conversation window.",
            )

        if jail_hits == 1:
            sanitized = prompt
            for pattern in REDACT_PHRASES:
                sanitized = re.sub(pattern, "[INSTRUCTION REMOVED]", sanitized)
            if sanitized == prompt:
                sanitized = re.sub(
                    r"(?i)\b(jailbreak|developer mode|unrestricted|uncensored|no restrictions)\b",
                    "[INSTRUCTION REMOVED]",
                    sanitized,
                )
            if sanitized != prompt:
                return Layer3Result(
                    decision="REDACT",
                    rationale="Ambiguous jailbreak phrasing removed; remainder forwarded.",
                    sanitized_text=sanitized,
                )

        if re.search(r"(?i)\b(how to (make|build).{0,40}(bomb|explosive|ransomware))\b", original):
            return Layer3Result(
                decision="BLOCK",
                rationale="High-risk dual-use request combined with policy-bypass language in the uncertain band.",
            )

        return Layer3Result(decision="ALLOW", rationale="No coherent injection intent in the ambiguous band.")
