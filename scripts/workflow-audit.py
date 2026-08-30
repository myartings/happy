#!/usr/bin/env python3
"""Audit machine-readable workflow evidence and current-phase invariants."""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def staged_candidate_context() -> bool:
    """Accept inherited staged context only for the repository that issued it."""
    if os.environ.get("AI_CODING_STAGED_CANDIDATE") != "1":
        return False
    staged_root = os.environ.get("AI_CODING_STAGED_ROOT", "")
    if not staged_root:
        return False
    try:
        return Path(staged_root).resolve() == ROOT.resolve()
    except OSError:
        return False
STATE_SCRIPT = ROOT / "scripts" / "workflow-state.py"


def check_evidence_errors(state, slug: str) -> list[str]:
    errors: list[str] = []
    evidence_path = state.workflow_dir(slug) / "evidence" / "checks.jsonl"
    if not evidence_path.exists():
        return errors
    required = {
        "schemaVersion": int, "timestamp": str, "profile": str,
        "group": str, "command": str, "exitCode": int,
        "result": str, "durationMs": int, "head": str,
        "workingTreeFingerprint": str,
    }
    identity_types = {
        "runId": str, "scopeFingerprint": str, "configFingerprint": str,
        "commandSetFingerprint": str, "commandIndex": int, "commandCount": int,
    }
    for line_number, line in enumerate(
        evidence_path.read_text(encoding="utf-8").splitlines(), 1
    ):
        if not line.strip():
            continue
        try:
            record = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{slug}: invalid checks.jsonl:{line_number}: {exc.msg}")
            continue
        if not isinstance(record, dict):
            errors.append(f"{slug}: invalid checks.jsonl:{line_number}: object required")
            continue
        for name, expected_type in required.items():
            value = record.get(name)
            if type(value) is not expected_type or (
                expected_type is str and not value.strip()
            ):
                errors.append(
                    f"{slug}: invalid checks.jsonl:{line_number}: "
                    f"{name} must be {expected_type.__name__}"
                )
        if record.get("schemaVersion") != 1:
            errors.append(
                f"{slug}: invalid checks.jsonl:{line_number}: schemaVersion must be 1"
            )
        for name in ("exitCode", "durationMs"):
            value = record.get(name)
            if type(value) is int and value < 0:
                errors.append(
                    f"{slug}: invalid checks.jsonl:{line_number}: "
                    f"{name} must be non-negative"
                )
        present = [name for name in identity_types if name in record]
        if present:
            for name, expected_type in identity_types.items():
                value = record.get(name)
                if type(value) is not expected_type or (
                    expected_type is str and not value.strip()
                ):
                    errors.append(
                        f"{slug}: invalid checks.jsonl:{line_number}: "
                        f"{name} must be {expected_type.__name__}"
                    )
            index = record.get("commandIndex")
            count = record.get("commandCount")
            if type(index) is int and type(count) is int and not 0 <= index < count:
                errors.append(
                    f"{slug}: invalid checks.jsonl:{line_number}: "
                    "commandIndex must be within commandCount"
                )
        reused_from = record.get("reusedFromRunId")
        if reused_from is not None and (
            not isinstance(reused_from, str) or not reused_from.strip()
        ):
            errors.append(
                f"{slug}: invalid checks.jsonl:{line_number}: reusedFromRunId must be str"
            )
        if record.get("result") == "reused" and reused_from is None:
            errors.append(
                f"{slug}: invalid checks.jsonl:{line_number}: "
                "reused result requires reusedFromRunId"
            )
    return errors


def repository_errors(state) -> list[str]:
    """Audit current repository authorities; terminal Workspace history is passive."""
    errors: list[str] = []
    if not state.ACTIVE.exists():
        return errors + ["missing ACTIVE workflow index"]

    active = state.active_data()
    slug = active.get("feature", "")
    if not slug:
        stale_fields = [
            label for label in ("phase", "next", "branch / worktree")
            if active.get(label, "")
        ]
        if stale_fields:
            errors.append(
                "ACTIVE has no Feature but retains fields: " + ", ".join(stale_fields)
            )
        return errors

    errors.extend(f"{slug}: {error}" for error in state.workflow_errors(slug))
    errors.extend(check_evidence_errors(state, slug))
    try:
        workflow = state.load_state(slug)
    except (SystemExit, OSError, KeyError, TypeError) as exc:
        return errors + [f"{slug}: cannot load state: {exc}"]
    phase = workflow.get("phase")
    if phase not in state.ACTIVE_PHASES:
        errors.append(f"ACTIVE workflow must be non-terminal: {slug}={phase}")
    if active.get("phase") != phase:
        errors.append(
            f"ACTIVE phase mismatch for {slug}: {active.get('phase')} != {phase}"
        )
    if active.get("next") != workflow.get("nextAction"):
        errors.append(f"ACTIVE next action mismatch for {slug}")
    return errors
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
        "--all", action="store_true",
        help="audit current repository workflow authorities and the active Workspace",
    )
    parser.add_argument(
        "--require-active", action="store_true",
        help="fail when no active structured workflow is recorded",
    )
    args = parser.parse_args()

    state = load_state_module()
    if args.all:
        if args.slug != "active" or args.require_active:
            parser.error("--all cannot be combined with a slug or --require-active")
        errors = repository_errors(state)
        if errors:
            print("fail: repository workflows")
            for error in errors:
                print(f"- {error}")
            return 1 if args.strict else 0
        print("pass: repository workflows")
        return 0
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
