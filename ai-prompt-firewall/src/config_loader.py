from __future__ import annotations

import copy
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = ROOT / "config"


def load_yaml(name: str) -> dict[str, Any]:
    path = CONFIG_DIR / name
    with path.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def deep_merge(base: dict[str, Any], overlay: dict[str, Any]) -> dict[str, Any]:
    out = copy.deepcopy(base)
    for key, value in (overlay or {}).items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def load_base_config() -> dict[str, Any]:
    return load_yaml("firewall.yaml")


def load_regex_rules() -> list[dict[str, Any]]:
    data = load_yaml("rules_regex.yaml")
    return list(data.get("rules") or [])


def load_deny_list() -> list[str]:
    data = load_yaml("deny_list.yaml")
    terms = list(data.get("keywords") or []) + list(data.get("sensitive_terms") or [])
    return [str(t) for t in terms if t]
