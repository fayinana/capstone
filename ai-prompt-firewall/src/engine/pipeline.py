from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from src.engine.layer_1_deterministic import Layer1Deterministic
from src.engine.layer_2_classifier import Layer2Classifier
from src.engine.layer_3_evaluator import Layer3Evaluator
from src.engine.normalizer import conversation_window
from src.engine.output_scanner import OutputScanner


@dataclass
class PipelineResult:
    decision: str
    layer: str
    trigger_label: str
    detected_patterns: list[str] = field(default_factory=list)
    rationale: str = ""
    layer_scores: dict[str, Any] = field(default_factory=dict)
    prompt: str = ""
    blocked: bool = False
    redacted: bool = False
    http_status: int = 200


class DefensePipeline:
    def __init__(
        self,
        layer1: Layer1Deterministic,
        layer2: Layer2Classifier,
        layer3: Layer3Evaluator,
        output_scanner: OutputScanner,
        settings: dict[str, Any],
        max_turns: int = 8,
    ):
        self.layer1 = layer1
        self.layer2 = layer2
        self.layer3 = layer3
        self.output_scanner = output_scanner
        self.settings = settings
        self.max_turns = max_turns

    def inspect_request(
        self,
        prompt: str,
        messages: list[dict],
        system_instruction: str,
    ) -> PipelineResult:
        pipe = self.settings.get("pipeline", {})
        text_blob = conversation_window(messages, self.max_turns)
        combined = "\n".join([system_instruction or "", text_blob, prompt or ""])

        if pipe.get("layer_1_enabled", True):
            hit = self.layer1.evaluate(combined)
            if hit:
                return PipelineResult(
                    decision="BLOCK",
                    layer="LAYER_1",
                    trigger_label="REGEX" if hit.source == "regex" else "DENY_LIST",
                    detected_patterns=[hit.rule_id, hit.pattern[:120]],
                    rationale=f"Layer 1 {hit.source} match ({hit.rule_id} / {hit.category})",
                    prompt=prompt,
                    blocked=True,
                    http_status=403,
                    layer_scores={"rule_id": hit.rule_id, "category": hit.category},
                )

        l2_decision, l2_score = "ALLOW", 0.0
        if pipe.get("layer_2_enabled", True):
            l2_decision, l2_score = self.layer2.decide(combined)
            if l2_decision == "BLOCK":
                return PipelineResult(
                    decision="BLOCK",
                    layer="LAYER_2",
                    trigger_label="ML_HIGH",
                    detected_patterns=["layer2_high_score"],
                    rationale=f"Layer 2 classifier score {l2_score:.3f} ≥ high threshold",
                    prompt=prompt,
                    blocked=True,
                    http_status=403,
                    layer_scores={"l2": l2_score},
                )
            if l2_decision == "ALLOW":
                return PipelineResult(
                    decision="ALLOW",
                    layer="LAYER_2",
                    trigger_label="ML_LOW",
                    detected_patterns=[],
                    rationale=f"Layer 2 classifier score {l2_score:.3f} ≤ low threshold",
                    prompt=prompt,
                    layer_scores={"l2": l2_score},
                )

        if pipe.get("layer_3_enabled", True):
            l3 = self.layer3.evaluate(prompt, text_blob, system_instruction)
            if l3.decision == "BLOCK":
                return PipelineResult(
                    decision="BLOCK",
                    layer="LAYER_3",
                    trigger_label="INTENT",
                    detected_patterns=["layer3_intent"],
                    rationale=l3.rationale,
                    prompt=prompt,
                    blocked=True,
                    http_status=403,
                    layer_scores={"l2": l2_score, "l3": "BLOCK"},
                )
            if l3.decision == "REDACT":
                return PipelineResult(
                    decision="REDACT",
                    layer="LAYER_3",
                    trigger_label="INTENT_REDACT",
                    detected_patterns=["layer3_redact"],
                    rationale=l3.rationale,
                    prompt=l3.sanitized_text or prompt,
                    redacted=True,
                    layer_scores={"l2": l2_score, "l3": "REDACT"},
                )
            return PipelineResult(
                decision="ALLOW",
                layer="LAYER_3",
                trigger_label="INTENT_ALLOW",
                rationale=l3.rationale,
                prompt=prompt,
                layer_scores={"l2": l2_score, "l3": "ALLOW"},
            )

        return PipelineResult(
            decision="ALLOW",
            layer="LAYER_2",
            trigger_label="PASSTHROUGH",
            prompt=prompt,
            layer_scores={"l2": l2_score},
        )
