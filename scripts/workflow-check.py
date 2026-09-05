#!/usr/bin/env python3
"""Run explicitly selected command groups from .ai/project.json."""

from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / ".ai" / "project.json"


def load_commands() -> dict[str, list[str]]:
    try:
        config = json.loads(CONFIG.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit(f"cannot read {CONFIG.relative_to(ROOT)}: {exc}") from exc
    commands = config.get("commands")
    if not isinstance(commands, dict):
        raise SystemExit(".ai/project.json commands must be an object")
    validated: dict[str, list[str]] = {}
    for name, entries in commands.items():
        if (
            not isinstance(name, str)
            or not name
            or not isinstance(entries, list)
            or any(not isinstance(entry, str) or not entry.strip() for entry in entries)
        ):
            raise SystemExit("configured command groups must contain command strings")
        validated[name] = entries
    return validated


def command_argv(command: str) -> list[str]:
    argv = shlex.split(command, posix=os.name != "nt")
    if not argv:
        raise SystemExit("configured command must not be empty")
    return [sys.executable if value == "{python}" else value for value in argv]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run named .ai/project.json command groups without inference or receipts."
    )
    parser.add_argument("groups", nargs="*", help="explicit command group names")
    parser.add_argument("--list", action="store_true", help="list configured groups")
    args = parser.parse_args()
    commands = load_commands()
    if args.list:
        for name in commands:
            print(name)
        return 0
    if not args.groups:
        parser.error("select at least one command group (or use --list)")
    unknown = [name for name in args.groups if name not in commands]
    if unknown:
        raise SystemExit("unknown command group(s): " + ", ".join(unknown))
    for group in args.groups:
        for command in commands[group]:
            argv = command_argv(command)
            print(f"[{group}] {shlex.join(argv)}", flush=True)
            completed = subprocess.run(argv, cwd=ROOT, check=False)
            if completed.returncode:
                return completed.returncode
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
