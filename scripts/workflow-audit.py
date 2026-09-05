#!/usr/bin/env python3
"""Compatibility entrypoint for Happy's post-adoption workflow validation.

The workflow-2026.09.4 model has no active Workspace audit. This command keeps
Issue #111's declared validation seam while delegating only to the current
selective-adoption validator; it never reads docs/workspace lifecycle records.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    if not (args.all and args.strict):
        parser.error("the compatibility seam requires --all --strict")
    completed = subprocess.run(
        [sys.executable, str(ROOT / "scripts/validate-happy-workflow.py")],
        cwd=ROOT,
        check=False,
    )
    if completed.returncode:
        return completed.returncode
    print("workflow-audit compatibility validation passed; Workspaces remain passive")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
