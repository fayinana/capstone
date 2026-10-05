from __future__ import annotations

import re
from dataclasses import dataclass

EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
API_KEY = re.compile(r"\b(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})\b")
AWS_SECRET = re.compile(r"(?i)aws(.{0,10})?(secret|access).{0,10}[A-Za-z0-9/+=]{30,}")
PRIVATE_KEY = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")
SSN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
CC = re.compile(r"\b(?:\d[ -]*?){13,19}\b")
PHONE = re.compile(r"\b(?:\+?\d{1,3}[-.\s])?(?:\(?\d{3}\)?[-.\s])\d{3}[-.\s]\d{4}\b")

SYSTEM_LEAK_HINTS = [
    "you are a helpful assistant with the following hidden",
    "system prompt:",
    "internal policy (do not reveal)",
    "firewall_system_instruction",
]


@dataclass
class OutputScanResult:
    flagged: bool
    policy_action: str
    text: str
    findings: list[str]


class OutputScanner:
    def __init__(self, policy: str = "redact", placeholder: str = "[REDACTED]", system_fragments: list[str] | None = None):
        self.policy = policy
        self.placeholder = placeholder
        self.system_fragments = [f.lower() for f in (system_fragments or []) if f]

    def scan(self, completion: str, system_instruction: str = "") -> OutputScanResult:
        findings: list[str] = []
        text = completion or ""

        def _sub(pattern: re.Pattern[str], label: str, current: str) -> str:
            if pattern.search(current):
                findings.append(label)
                return pattern.sub(self.placeholder, current)
            return current

        text = _sub(EMAIL, "pii_email", text)
        text = _sub(API_KEY, "secret_api_key", text)
        text = _sub(AWS_SECRET, "secret_aws", text)
        text = _sub(PRIVATE_KEY, "secret_private_key", text)
        text = _sub(SSN, "pii_ssn", text)
        if CC.search(text) and len(re.sub(r"\D", "", CC.search(text).group(0))) >= 13:
            findings.append("pii_card")
            text = CC.sub(self.placeholder, text)
        text = _sub(PHONE, "pii_phone", text)

        hay = (completion or "").lower()
        for frag in self.system_fragments + SYSTEM_LEAK_HINTS:
            if frag and frag.lower() in hay:
                findings.append("system_prompt_leak")
                break
        if system_instruction:
            snippet = system_instruction.strip()
            if len(snippet) > 24 and snippet.lower() in hay:
                findings.append("system_prompt_echo")

        flagged = bool(findings)
        action = "pass"
        if flagged:
            action = self.policy if self.policy in {"block", "redact", "warn"} else "redact"
            if action == "warn":
                text = completion
            elif action == "block":
                text = ""
        return OutputScanResult(flagged=flagged, policy_action=action, text=text, findings=findings)
