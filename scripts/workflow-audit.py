#!/usr/bin/env python3
"""Audit machine-readable workflow evidence and current-phase invariants."""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_SCRIPT = ROOT / "scripts" / "workflow-state.py"


def load_state_module():
    spec = importlib.util.spec_from_file_location("workflow_state", STATE_SCRIPT)
    if spec is None or spec.loader is None:
        raise SystemExit("cannot load workflow-state.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?", default="active")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument(
        "--require-active", action="store_true",
        help="fail when no active structured workflow is recorded",
    )
    args = parser.parse_args()

    state = load_state_module()
    try:
        slug = state.resolve_slug(args.slug)
    except SystemExit as exc:
        if str(exc) == "no active workflow":
            if args.require_active:
                print("fail: no active workflow")
                return 1
            print("pass: no active workflow")
            return 0
        raise

    errors = state.workflow_errors(slug)
    if errors:
        print(f"fail: {slug}")
        for error in errors:
            print(f"- {error}")
        return 1 if args.strict else 0

    workflow = state.load_state(slug)
    pending = [
        name for name, receipt in workflow["gates"].items()
        if receipt["status"] == "pending"
    ]
    if pending:
        print(f"pass-with-gaps: {slug}")
        print("- pending future gates: " + ", ".join(pending))
    else:
        print(f"pass: {slug}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
