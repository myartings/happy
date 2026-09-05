#!/usr/bin/env python3
"""Check staged or outgoing changes for bounded submission safety."""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PASSIVE_HISTORY_PREFIX = "docs/workspace/"
PRESERVED_WORKSPACE_PATHS = {
    "docs/workspace/ACTIVE.md",
    "docs/workspace/archive.md",
}
RETIRED_WORKSPACE_PREFIX = "docs/workspace/template/"
SECRET_PATTERNS = (
    ("private key", re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("GitHub token", re.compile(rb"\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b")),
    ("AWS access key", re.compile(rb"\bAKIA[A-Z0-9]{16}\b")),
)


def git(*args: str, check: bool = True) -> bytes:
    completed = subprocess.run(
        ["git", *args], cwd=ROOT, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, check=False,
    )
    if check and completed.returncode:
        raise RuntimeError(completed.stderr.decode(errors="replace").strip())
    return completed.stdout


def load_config(root: Path) -> dict:
    config_path = root / ".ai" / "project.json"
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"invalid .ai/project.json: {exc}") from exc
    required = {"schemaVersion", "name", "commands", "protectedPaths", "tracker"}
    missing = sorted(required - set(config))
    if missing:
        raise RuntimeError("project config missing keys: " + ", ".join(missing))
    if not isinstance(config["commands"], dict):
        raise RuntimeError("project config commands must be an object")
    if not isinstance(config["protectedPaths"], list):
        raise RuntimeError("project config protectedPaths must be a list")
    return config


def load_protected_paths(revision: str) -> list[str]:
    try:
        config = json.loads(git("show", f"{revision}:.ai/project.json"))
    except (RuntimeError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            f"invalid {revision} .ai/project.json: {exc}"
        ) from exc
    patterns = config.get("protectedPaths")
    if not isinstance(patterns, list):
        raise RuntimeError(
            f"invalid {revision} .ai/project.json: protectedPaths must be a list"
        )
    return patterns


def changed_paths(staged: bool, base: str | None) -> list[str]:
    if staged:
        raw = git("diff", "--cached", "--no-renames", "--name-only", "-z")
    else:
        assert base is not None
        git("rev-parse", "--verify", f"{base}^{{commit}}")
        raw = git("diff", f"{base}...HEAD", "--no-renames", "--name-only", "-z")
    return sorted(
        value.decode("utf-8", errors="surrogateescape")
        for value in raw.split(b"\0") if value
    )


def candidate_blob(path: str, staged: bool) -> bytes | None:
    revision = f":{path}" if staged else f"HEAD:{path}"
    completed = subprocess.run(
        ["git", "show", revision], cwd=ROOT, stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL, check=False,
    )
    return completed.stdout if completed.returncode == 0 else None


def protected(path: str, patterns: list[str]) -> bool:
    return any(
        fnmatch.fnmatchcase(path, pattern)
        or fnmatch.fnmatchcase(f"{path}/", pattern)
        or Path(path).match(pattern)
        for pattern in patterns
    )


def workspace_path_error(paths: list[str], staged: bool) -> str | None:
    for path in paths:
        if not path.startswith(PASSIVE_HISTORY_PREFIX):
            continue
        if path.startswith(RETIRED_WORKSPACE_PREFIX):
            if candidate_blob(path, staged) is not None:
                return f"retired Workspace scaffold reintroduced: {path}"
            continue
        return f"passive historical Workspace changed: {path}"
    return None


def candidate_entries(staged: bool) -> list[tuple[str, str, str]]:
    if staged:
        raw = git("ls-files", "--stage", "-z")
        records = []
        for record in raw.split(b"\0"):
            if not record:
                continue
            metadata, raw_path = record.split(b"\t", 1)
            mode, object_id, stage = metadata.decode("ascii").split()
            if stage != "0":
                raise RuntimeError("submission contains unmerged index entries")
            records.append((mode, object_id, raw_path.decode("utf-8", errors="surrogateescape")))
        return records
    raw = git("ls-tree", "-r", "-z", "HEAD")
    records = []
    for record in raw.split(b"\0"):
        if not record:
            continue
        metadata, raw_path = record.split(b"\t", 1)
        mode, kind, object_id = metadata.decode("ascii").split()
        if kind == "blob":
            records.append((mode, object_id, raw_path.decode("utf-8", errors="surrogateescape")))
    return records


def materialize_candidate(destination: Path, staged: bool) -> None:
    seen: set[str] = set()
    for mode, object_id, path in candidate_entries(staged):
        if (
            path.startswith(PASSIVE_HISTORY_PREFIX)
            and path not in PRESERVED_WORKSPACE_PATHS
        ) or mode not in {"100644", "100755"}:
            continue
        parts = Path(path).parts
        normalized = path.casefold()
        if (
            not path or path.startswith(("/", "\\")) or "\\" in path
            or ".." in parts or normalized in seen
        ):
            raise RuntimeError(f"submission contains unsupported path entry: {path}")
        seen.add(normalized)
        target = destination.joinpath(*parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(git("cat-file", "blob", object_id))
        if mode == "100755":
            target.chmod(0o755)


def validate_candidate(root: Path) -> int:
    candidates = (
        root / "scripts" / "validate-happy-workflow.py",
        root / "scripts" / "validate-source.py",
        root / "scripts" / "validate-template.py",
    )
    validator = next((path for path in candidates if path.is_file()), None)
    if validator is None:
        raise RuntimeError("submission has no structural validator")
    return subprocess.run([sys.executable, str(validator)], cwd=root, check=False).returncode


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--staged", action="store_true")
    mode.add_argument("--base")
    args = parser.parse_args()
    try:
        paths = changed_paths(args.staged, args.base)
        with tempfile.TemporaryDirectory(prefix="workflow-ci-candidate-") as directory:
            candidate_root = Path(directory)
            materialize_candidate(candidate_root, args.staged)
            config = load_config(candidate_root)
            reference = "HEAD" if args.staged else args.base
            assert reference is not None
            protected_patterns = list(config["protectedPaths"])
            protected_patterns.extend(load_protected_paths(reference))
            validation_result = validate_candidate(candidate_root)
    except RuntimeError as exc:
        print(f"workflow-ci: {exc}", file=sys.stderr)
        return 1
    if not paths:
        print("workflow-ci: no submitted changes", file=sys.stderr)
        return 1
    workspace_error = workspace_path_error(paths, args.staged)
    if workspace_error:
        print("workflow-ci: " + workspace_error, file=sys.stderr)
        return 1
    blocked = [path for path in paths if protected(path, protected_patterns)]
    if blocked:
        print("workflow-ci: protected paths changed: " + ", ".join(blocked), file=sys.stderr)
        return 1
    findings: list[str] = []
    for path in paths:
        blob = candidate_blob(path, args.staged)
        if blob is None:
            continue
        for label, pattern in SECRET_PATTERNS:
            if pattern.search(blob):
                findings.append(f"{path}: {label}")
    if findings:
        print("workflow-ci: possible secrets: " + "; ".join(findings), file=sys.stderr)
        return 1
    if validation_result:
        return validation_result
    print(f"workflow-ci: passed for {len(paths)} submitted path(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
