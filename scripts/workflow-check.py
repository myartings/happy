#!/usr/bin/env python3
"""Run configured deterministic project commands and optionally record results."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / ".ai" / "project.json"
DEFAULT_GROUPS = ("format", "lint", "typecheck", "test", "build", "check")


def active_slug() -> str:
    path = ROOT / "docs" / "workspace" / "ACTIVE.md"
    if not path.exists():
        return ""
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("**Feature**:"):
            return line.split(":", 1)[1].strip()
    return ""


def record(slug: str, command: str, result: str, notes: str) -> None:
    if not slug:
        return
    path = ROOT / "docs" / "workspace" / slug / "validation.md"
    if not path.exists():
        raise SystemExit(f"cannot record: {path.relative_to(ROOT)} does not exist")
    safe = lambda value: value.replace("|", "\\|").replace("\n", " ").strip()
    row = (
        f"| {dt.date.today().isoformat()} | `{safe(command)}` | "
        f"{safe(result)} | {safe(notes)} |"
    )
    text = path.read_text(encoding="utf-8")
    marker = "## Acceptance coverage"
    if marker not in text:
        raise SystemExit(f"cannot record: {path.relative_to(ROOT)} lacks {marker}")
    before, after = text.split(marker, 1)
    before = re.sub(
        r"^\|[^|\n]*<command>[^|\n]*\|.*\n?", "", before, flags=re.MULTILINE
    ).rstrip()
    path.write_text(
        f"{before}\n{row}\n\n{marker}{after}",
        encoding="utf-8",
    )


def update_check_gate(slug: str, status: str, evidence: str) -> None:
    if not slug:
        return
    completed = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts" / "workflow-state.py"),
            "gate",
            slug,
            "check",
            status,
            "--evidence",
            evidence,
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode:
        raise SystemExit(completed.stderr.strip() or completed.stdout.strip())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", action="append", choices=("setup",) + DEFAULT_GROUPS)
    parser.add_argument("--record", nargs="?", const="active", default="")
    parser.add_argument("--list", action="store_true")
    args = parser.parse_args()

    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    commands = config.get("commands", {})
    groups = tuple(args.only) if args.only else DEFAULT_GROUPS
    selected = [(group, command) for group in groups for command in commands.get(group, [])]

    if args.list:
        for group, command in selected:
            print(f"{group}: {command}")
        return 0
    if not selected:
        print("no configured commands selected")
        return 0

    slug = active_slug() if args.record == "active" else args.record
    failed = 0
    for group, command in selected:
        print(f"[{group}] {command}", flush=True)
        completed = subprocess.run(command, cwd=ROOT, shell=True, text=True)
        outcome = "passed" if completed.returncode == 0 else f"failed ({completed.returncode})"
        if slug:
            record(slug, command, outcome, group)
        if completed.returncode != 0:
            failed += 1
    if slug:
        status = "passed" if failed == 0 else "blocked"
        update_check_gate(
            slug,
            status,
            f"{len(selected)} configured commands; {failed} failures",
        )
    print(f"commands: {len(selected)}, failures: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
