#!/usr/bin/env python3
"""Require the submitted Git diff to contain completed workflow evidence."""

from __future__ import annotations

import argparse
import importlib.util
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path("docs/workspace/archive.md")
ACTIVE = Path("docs/workspace/ACTIVE.md")
ZERO_SHA = re.compile(r"^0+$")


def git(*args: str, input_text: str | None = None, check: bool = True) -> str:
    completed = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, input=input_text,
        capture_output=True, check=False,
    )
    if check and completed.returncode:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())
    return completed.stdout.strip()


def revision_exists(revision: str) -> bool:
    return subprocess.run(
        ["git", "cat-file", "-e", f"{revision}^{{commit}}"], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
    ).returncode == 0


def resolve_base(raw: str) -> str:
    candidate = raw.strip()
    if candidate and ZERO_SHA.fullmatch(candidate):
        return git("hash-object", "-t", "tree", "--stdin", input_text="")
    if candidate and revision_exists(candidate):
        return candidate
    if candidate:
        raise RuntimeError(f"base revision does not exist: {candidate}")
    if revision_exists("HEAD^"):
        return "HEAD^"
    return git("hash-object", "-t", "tree", "--stdin", input_text="")


def diff_command(staged: bool, base: str, *extra: str) -> list[str]:
    if staged:
        return ["diff", "--cached", *extra]
    return ["diff", base, "HEAD", *extra]


def changed_paths(staged: bool, base: str) -> set[str]:
    output = git(*diff_command(staged, base, "--name-only"))
    return {line for line in output.splitlines() if line}


def archive_diff(staged: bool, base: str) -> str:
    return git(*diff_command(staged, base, "--unified=0", "--", ARCHIVE.as_posix()))


def active_slug(evidence_root: Path) -> str:
    path = evidence_root / ACTIVE
    if not path.exists():
        return ""
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("**Feature**:"):
            return line.split(":", 1)[1].strip()
    return ""


def archive_rows(evidence_root: Path) -> list[tuple[str, str, str]]:
    path = evidence_root / ARCHIVE
    if not path.exists():
        return []
    rows: list[tuple[str, str, str]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 5 or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", cells[0]):
            continue
        rows.append((line, cells[1], cells[2]))
    return rows


def added_archive_lines(diff: str) -> set[str]:
    return {
        line[1:] for line in diff.splitlines()
        if line.startswith("+|") and not line.startswith("+++")
    }


def load_state_module(evidence_root: Path):
    path = evidence_root / "scripts" / "workflow-state.py"
    spec = importlib.util.spec_from_file_location("workflow_state", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow-state.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def enforcement_errors(staged: bool, base: str, evidence_root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    active = active_slug(evidence_root)

    rows = archive_rows(evidence_root)
    if not rows:
        return errors + ["workflow archive has no completed workflow row"]
    line, slug, commit = rows[-1]
    if not re.fullmatch(r"[A-Za-z0-9._-]+", slug):
        return errors + [f"invalid archived workflow slug: {slug}"]

    try:
        paths = changed_paths(staged, base)
        added = added_archive_lines(archive_diff(staged, base))
    except RuntimeError as exc:
        return errors + [f"cannot inspect Git diff: {exc}"]
    if not paths:
        errors.append("submitted Git diff is empty")
    if ARCHIVE.as_posix() not in paths or line not in added:
        errors.append(f"latest archive row was not added by submitted diff: {slug}")

    if active:
        if active == slug or ACTIVE.as_posix() in paths:
            errors.append(
                f"active workflow must be finished and archived before commit: {active}"
            )
        else:
            try:
                active_state_module = load_state_module(evidence_root)
                active_errors = active_state_module.workflow_errors(active)
                active_state = active_state_module.load_state(active)
                active_record = active_state_module.active_data()
                if active_state.get("phase") not in active_state_module.ACTIVE_PHASES:
                    active_errors.append(
                        f"active phase must be non-terminal: {active_state.get('phase')}"
                    )
                if active_record.get("phase") != active_state.get("phase"):
                    active_errors.append(
                        "ACTIVE phase does not match workflow state: "
                        f"{active_record.get('phase')} != {active_state.get('phase')}"
                    )
                if active_record.get("next") != active_state.get("nextAction"):
                    active_errors.append("ACTIVE next action does not match workflow state")
                errors.extend(
                    f"unrelated active workflow is invalid: {error}"
                    for error in active_errors
                )
            except (RuntimeError, SystemExit, OSError, KeyError, TypeError) as exc:
                errors.append(f"cannot validate unrelated active workflow {active}: {exc}")

    workflow_root = f"docs/workspace/{slug}"
    required_changed = {
        f"{workflow_root}/workflow.json",
        f"{workflow_root}/state.md",
        f"{workflow_root}/validation.md",
        f"{workflow_root}/finish.md",
    }
    missing_changed = sorted(required_changed - paths)
    if missing_changed:
        errors.append("submitted diff lacks completed workflow evidence: " + ", ".join(missing_changed))

    try:
        state_module = load_state_module(evidence_root)
        errors.extend(state_module.workflow_errors(slug))
        state = state_module.load_state(slug)
        if state.get("phase") != "archived":
            errors.append(
                f"archived workflow phase must be archived: {state.get('phase')}"
            )
        if state.get("gates", {}).get("finish", {}).get("status") not in (
            "passed", "accepted_gaps",
        ):
            errors.append("archived workflow finish gate is not passed")
        errors.extend(
            state_module.finish_sections_complete(
                evidence_root / workflow_root / "finish.md"
            )
        )
        if state.get("resultCommit") != commit:
            errors.append(
                "archive row/state result commit mismatch: "
                f"{commit} != {state.get('resultCommit')}"
            )
    except (RuntimeError, SystemExit, OSError, KeyError, TypeError) as exc:
        errors.append(f"cannot validate archived workflow {slug}: {exc}")

    if commit != "pending" and not revision_exists(commit):
        errors.append(f"archive commit does not exist: {commit}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--staged", action="store_true")
    mode.add_argument("--base", default="")
    args = parser.parse_args()

    try:
        if args.staged:
            base = ""
            with tempfile.TemporaryDirectory(prefix="workflow-index-") as temp:
                snapshot = Path(temp)
                git("checkout-index", "--all", f"--prefix={snapshot}{os.sep}")
                errors = enforcement_errors(True, base, snapshot)
        else:
            base = resolve_base(args.base or os.environ.get("WORKFLOW_BASE_SHA", ""))
            errors = enforcement_errors(False, base)
    except RuntimeError as exc:
        errors = [str(exc)]
    if errors:
        print("workflow CI failed:")
        for error in sorted(set(errors)):
            print(f"- {error}")
        return 1
    mode_name = "staged diff" if args.staged else f"diff from {base}"
    print(f"workflow CI passed: {mode_name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
