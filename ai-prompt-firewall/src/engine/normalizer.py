from __future__ import annotations

import re
import unicodedata

HOMOGLYPHS = str.maketrans(
    {
        "а": "a",
        "е": "e",
        "о": "o",
        "р": "p",
        "с": "c",
        "у": "y",
        "х": "x",
        "і": "i",
        "ј": "j",
        "ѕ": "s",
        "ԁ": "d",
        "ɡ": "g",
        "Α": "A",
        "Β": "B",
        "Ε": "E",
        "Η": "H",
        "Ι": "I",
        "Κ": "K",
        "Μ": "M",
        "Ν": "N",
        "Ο": "O",
        "Ρ": "P",
        "Τ": "T",
        "Χ": "X",
        "Υ": "Y",
        "а".upper(): "A",
        "е".upper(): "E",
        "о".upper(): "O",
        "і".upper(): "I",
        "０": "0",
        "１": "1",
        "５": "5",
        "＠": "@",
        "！": "!",
    }
)

_SPACE_LETTERS = re.compile(r"(?:(?<=\b)|(?<=\s))(?:[a-zA-Z]\s+){3,}[a-zA-Z]\b")
_WS = re.compile(r"\s+")
_ZERO_WIDTH = dict.fromkeys(map(ord, ["\u200b", "\u200c", "\u200d", "\ufeff", "\u2060"]))


def fold_spaced_letters(text: str) -> str:
    def _collapse(match: re.Match[str]) -> str:
        return re.sub(r"\s+", "", match.group(0))

    return _SPACE_LETTERS.sub(_collapse, text)


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = text.translate(_ZERO_WIDTH)
    try:
        from unidecode import unidecode

        text = unidecode(text)
    except Exception:
        pass
    text = text.translate(HOMOGLYPHS)
    text = fold_spaced_letters(text)
    text = text.lower()
    text = _WS.sub(" ", text).strip()
    return text


def conversation_window(messages: list[dict], max_turns: int = 8) -> str:
    recent = messages[-max_turns:]
    parts: list[str] = []
    for msg in recent:
        role = str(msg.get("role") or "user")
        content = msg.get("content") or ""
        if isinstance(content, list):
            content = " ".join(
                str(part.get("text") or "") for part in content if isinstance(part, dict)
            )
        parts.append(f"{role}: {content}")
    return "\n".join(parts)
