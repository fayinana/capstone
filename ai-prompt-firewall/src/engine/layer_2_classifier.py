from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import onnxruntime as ort

from src.engine.normalizer import normalize_text

INJECTION_LEXICON = [
    "ignore",
    "instructions",
    "jailbreak",
    "dan",
    "unrestricted",
    "uncensored",
    "system prompt",
    "override",
    "bypass",
    "developer mode",
    "no restrictions",
    "hidden instructions",
    "pretend",
    "roleplay",
    "sudo",
    "filter",
]


def extract_features(text: str, vocab: list[str]) -> np.ndarray:
    norm = normalize_text(text)
    tokens = norm.split()
    n = max(len(tokens), 1)
    length = min(len(norm) / 2000.0, 1.0)
    special = sum(1 for ch in text if not ch.isalnum() and not ch.isspace()) / max(len(text), 1)
    upper_ratio = sum(1 for ch in text if ch.isupper()) / max(len(text), 1)
    features = [length, special, upper_ratio, min(len(tokens) / 400.0, 1.0)]
    for term in vocab:
        features.append(min(norm.count(term) / 3.0, 1.0))
    # extra engineered signals
    features.append(1.0 if "ignore" in norm and "instruction" in norm else 0.0)
    features.append(1.0 if "system prompt" in norm else 0.0)
    features.append(1.0 if "unrestricted" in norm or "uncensored" in norm else 0.0)
    features.append(1.0 if "base64" in norm else 0.0)
    return np.asarray(features, dtype=np.float32).reshape(1, -1)


class Layer2Classifier:
    def __init__(self, model_path: str, tokenizer_path: str, low: float, high: float):
        self.low = low
        self.high = high
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        vocab_file = Path(tokenizer_path) / "vocab.json"
        self.vocab = json.loads(vocab_file.read_text(encoding="utf-8")).get("terms", INJECTION_LEXICON)
        self.input_name = self.session.get_inputs()[0].name

    def score(self, text: str) -> float:
        feats = extract_features(text, self.vocab)
        outputs = self.session.run(None, {self.input_name: feats})
        raw = float(np.array(outputs[0]).reshape(-1)[0])
        return max(0.0, min(1.0, raw))

    def decide(self, text: str) -> tuple[str, float]:
        value = self.score(text)
        if value >= self.high:
            return "BLOCK", value
        if value <= self.low:
            return "ALLOW", value
        return "ESCALATE", value
