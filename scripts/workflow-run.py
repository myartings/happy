#!/usr/bin/env python3
"""Orchestrate mechanical formal-workflow steps without inventing evidence."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / "scripts" / "workflow-state.py"
AUDIT = ROOT / "scripts" / "workflow-audit.py"


def run(*command: str) -> str:
    completed = subprocess.run(
        list(command), cwd=ROOT, text=True, capture_output=True, check=False,
    )
    if completed.returncode:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())
    return completed.stdout.strip()


def state(slug: str) -> dict:
    try:
        value = json.loads(
            (ROOT / "docs" / "workspace" / slug / "workflow.json").read_text(
                encoding="utf-8"
            )
        )
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"cannot load workflow state: {exc}") from exc
    if not isinstance(value, dict) or value.get("slug") != slug:
        raise RuntimeError("workflow state slug mismatch")
    return value


def required_line(raw: str, label: str) -> str:
    value = raw.strip()
    if not value or "\n" in value or "\r" in value:
        raise RuntimeError(f"{label} must be a non-empty single line")
    return value


def state_command(*args: str) -> str:
    return run(sys.executable, str(STATE), *args)


def begin(slug: str) -> None:
    current = state(slug)
    if current.get("phase") != "planning":
        raise RuntimeError(f"begin requires phase=planning, found {current.get('phase')}")
    run(sys.executable, str(AUDIT), slug, "--strict", "--require-active")
    state_command("ready", slug, "implementation")
    state_command("transition", slug, "implementation", "Implement accepted slice")
    print(f"workflow implementation started: {slug}")


def verify(slug: str, evidence: str, reuse: bool) -> None:
    current = state(slug)
    if current.get("phase") != "implementation":
        raise RuntimeError(
            f"verify requires phase=implementation, found {current.get('phase')}"
        )
    state_command(
        "gate", slug, "implementation", "passed", "--evidence",
        required_line(evidence, "implementation evidence"),
    )
    state_command(
        "transition", slug, "verification",
        "Run the final applicable check, then independent final review",
    )
    if reuse:
        print("check reuse deferred until the review-clean candidate")
    print(f"workflow verification ready for review: {slug}")


def main() -> int:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    begin_parser = commands.add_parser("begin")
    begin_parser.add_argument("slug")
    verify_parser = commands.add_parser("verify")
    verify_parser.add_argument("slug")
    verify_parser.add_argument("--implementation-evidence", required=True)
    verify_parser.add_argument("--reuse", action="store_true")
    args = parser.parse_args()
    try:
        if args.command == "begin":
            begin(args.slug)
        elif args.command == "verify":
            verify(args.slug, args.implementation_evidence, args.reuse)
    except RuntimeError as exc:
        print(f"workflow runner stopped: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
