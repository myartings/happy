#!/usr/bin/env python3
"""Inspect one content-addressed staged delivery candidate without mutation."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GLOBAL_MUTABLE_EVIDENCE = {
    "docs/workspace/ACTIVE.md",
    "docs/workspace/archive.md",
}
WORKSPACE_MUTABLE_EVIDENCE = {
    "workflow.json",
    "state.md",
    "validation.md",
    "finish.md",
}


class CandidateError(RuntimeError):
    """The staged index cannot identify one valid delivery candidate."""


def literal_pathspec(identity: str) -> str:
    return f":(literal){identity}"


def git_bytes(root: Path, *args: str) -> bytes:
    completed = subprocess.run(
        ["git", *args], cwd=root, capture_output=True, check=False,
    )
    if completed.returncode:
        message = completed.stderr.decode("utf-8", errors="replace").strip()
        raise CandidateError(message or "Git command failed")
    return completed.stdout


def git_text(root: Path, *args: str) -> str:
    return git_bytes(root, *args).decode("utf-8", errors="replace").strip()


def active_slug(root: Path) -> str:
    path = root / "docs" / "workspace" / "ACTIVE.md"
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return ""
    for line in lines:
        if line.startswith("**Feature**:"):
            return line.split(":", 1)[1].strip()
    return ""


def filtered_paths(raw: bytes, slug: str) -> list[str]:
    paths = {
        value.decode("utf-8", errors="surrogateescape")
        for value in raw.split(b"\0") if value
    }
    prefix = f"docs/workspace/{slug}/" if slug else ""
    return sorted(
        path for path in paths
        if path not in GLOBAL_MUTABLE_EVIDENCE
        and not (
            prefix
            and path.startswith(prefix)
            and (
                path.removeprefix(prefix) in WORKSPACE_MUTABLE_EVIDENCE
                or path.startswith(f"{prefix}evidence/")
            )
        )
    )


def delivery_paths(root: Path, base: str, slug: str) -> list[str]:
    raw = git_bytes(
        root, "diff", "--cached", "--name-only", "--no-renames", "-z", base, "--",
    )
    return filtered_paths(raw, slug)


def committed_delivery_paths(root: Path, base: str, commit: str, slug: str) -> list[str]:
    raw = git_bytes(
        root, "diff", "--name-only", "--no-renames", "-z", base, commit, "--",
    )
    return filtered_paths(raw, slug)


def index_entry(root: Path, path: str) -> dict[str, str]:
    raw = git_bytes(
        root, "ls-files", "--stage", "-z", "--", literal_pathspec(path),
    )
    records = [value for value in raw.split(b"\0") if value]
    if not records:
        return {"path": path, "mode": "000000", "kind": "deleted", "object": ""}
    if len(records) != 1:
        raise CandidateError(f"staged candidate path is ambiguous: {path}")
    try:
        metadata, recorded_path = records[0].split(b"\t", 1)
        mode, object_id, stage = metadata.decode("ascii").split(" ")
    except (ValueError, UnicodeDecodeError) as exc:
        raise CandidateError(f"cannot parse staged candidate entry: {path}") from exc
    decoded_path = recorded_path.decode("utf-8", errors="surrogateescape")
    if decoded_path != path or stage != "0":
        raise CandidateError(f"staged candidate path is unmerged or mismatched: {path}")
    kind = git_text(root, "cat-file", "-t", object_id)
    return {"path": path, "mode": mode, "kind": kind, "object": object_id}


def commit_entry(root: Path, commit: str, path: str) -> dict[str, str]:
    raw = git_bytes(
        root, "ls-tree", "-z", commit, "--", literal_pathspec(path),
    )
    records = [value for value in raw.split(b"\0") if value]
    if not records:
        return {"path": path, "mode": "000000", "kind": "deleted", "object": ""}
    if len(records) != 1:
        raise CandidateError(f"committed candidate path is ambiguous: {path}")
    try:
        metadata, recorded_path = records[0].split(b"\t", 1)
        mode, kind, object_id = metadata.decode("ascii").split(" ")
    except (ValueError, UnicodeDecodeError) as exc:
        raise CandidateError(f"cannot parse committed candidate entry: {path}") from exc
    decoded_path = recorded_path.decode("utf-8", errors="surrogateescape")
    if decoded_path != path:
        raise CandidateError(f"committed candidate path is mismatched: {path}")
    return {"path": path, "mode": mode, "kind": kind, "object": object_id}


def candidate_payload(base: str, paths: list[str], entries: list[dict[str, str]]) -> dict[str, object]:
    if not paths:
        raise CandidateError("delivery candidate is empty")
    digest = hashlib.sha256()
    digest.update(b"workflow-staged-candidate-v1\0")
    digest.update(base.encode("ascii"))
    digest.update(b"\0")
    for entry in entries:
        digest.update(entry["path"].encode("utf-8", errors="surrogateescape"))
        digest.update(b"\0")
        digest.update(entry["mode"].encode("ascii"))
        digest.update(b"\0")
        digest.update(entry["kind"].encode("ascii"))
        digest.update(b"\0")
        digest.update(entry["object"].encode("ascii"))
        digest.update(b"\0")
    return {
        "schemaVersion": 1,
        "baseCommit": base,
        "changedPaths": paths,
        "entries": entries,
        "candidateFingerprint": digest.hexdigest(),
    }


def inspect_candidate(root: Path, base: str, slug: str = "") -> dict[str, object]:
    try:
        resolved_base = git_text(root, "rev-parse", "--verify", f"{base}^{{commit}}")
    except CandidateError as exc:
        raise CandidateError(f"invalid candidate comparison base: {base}: {exc}") from exc
    selected_slug = slug or active_slug(root)
    paths = delivery_paths(root, resolved_base, selected_slug)
    entries = [index_entry(root, path) for path in paths]
    return candidate_payload(resolved_base, paths, entries)


def inspect_commit(
    root: Path, base: str, commit: str, slug: str = "",
) -> dict[str, object]:
    try:
        resolved_base = git_text(root, "rev-parse", "--verify", f"{base}^{{commit}}")
        resolved_commit = git_text(
            root, "rev-parse", "--verify", f"{commit}^{{commit}}",
        )
    except CandidateError as exc:
        raise CandidateError(f"invalid committed candidate revision: {exc}") from exc
    paths = committed_delivery_paths(root, resolved_base, resolved_commit, slug)
    entries = [commit_entry(root, resolved_commit, path) for path in paths]
    return candidate_payload(resolved_base, paths, entries)


def main() -> int:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    inspect = commands.add_parser("inspect")
    inspect.add_argument("--base", required=True)
    inspect.add_argument("--slug", default="")
    args = parser.parse_args()
    try:
        payload = inspect_candidate(ROOT, args.base, args.slug)
    except CandidateError as exc:
        print(f"cannot inspect staged candidate: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
