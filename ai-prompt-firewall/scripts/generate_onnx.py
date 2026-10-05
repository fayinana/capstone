#!/usr/bin/env python3
"""Build a tiny on-disk Layer-2 ONNX classifier. No network, no pretrained weights."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "src" / "models"
TOK_DIR = MODEL_DIR / "tokenizer"

TERMS = [
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


def main() -> None:
    TOK_DIR.mkdir(parents=True, exist_ok=True)
    n_base = 4
    n_lex = len(TERMS)
    n_extra = 4
    n = n_base + n_lex + n_extra

    # Hand-set logistic weights: lexical injection signals dominate.
    w = np.zeros((1, n), dtype=np.float32)
    w[0, 0] = 0.08  # length
    w[0, 1] = 0.25  # special chars
    w[0, 2] = 0.12  # uppercase
    w[0, 3] = 0.08  # token density
    hot = {"ignore", "instructions", "jailbreak", "unrestricted", "system prompt", "dan"}
    for i, term in enumerate(TERMS):
        w[0, n_base + i] = 2.4 if term in hot else 1.4
    w[0, -4] = 1.6  # ignore+instruction combo
    w[0, -3] = 1.5  # system prompt
    w[0, -2] = 1.4  # unrestricted/uncensored
    w[0, -1] = 0.9  # base64
    b = np.array([-1.15], dtype=np.float32)

    w_init = numpy_helper.from_array(w.T, name="W")  # Gemm: X[N,F] @ W[F,1]
    b_init = numpy_helper.from_array(b, name="B")

    x = helper.make_tensor_value_info("features", TensorProto.FLOAT, [None, n])
    y = helper.make_tensor_value_info("score", TensorProto.FLOAT, [None, 1])
    gemm = helper.make_node("Gemm", ["features", "W", "B"], ["logits"], transB=0)
    sig = helper.make_node("Sigmoid", ["logits"], ["score"])
    graph = helper.make_graph([gemm, sig], "prompt_injection_clf", [x], [y], [w_init, b_init])
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 13)])
    model.ir_version = 8
    onnx.checker.check_model(model)
    out = MODEL_DIR / "classifier.onnx"
    onnx.save(model, out)
    (TOK_DIR / "vocab.json").write_text(json.dumps({"terms": TERMS, "feature_dim": n}, indent=2), encoding="utf-8")
    print(f"wrote {out} dim={n}")


if __name__ == "__main__":
    main()
