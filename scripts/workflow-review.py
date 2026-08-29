#!/usr/bin/env python3
"""Generate one pinned, context-minimal package for both Matt review axes."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_candidate_module():
    path = ROOT / "scripts" / "workflow-candidate.py"
    spec = importlib.util.spec_from_file_location("workflow_candidate_runtime", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load staged candidate runtime")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def git(*args: str) -> str:
    completed = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, capture_output=True, check=False,
    )
    if completed.returncode:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())
    return completed.stdout.strip()


def whole_diff(base: str, paths: list[str]) -> bytes:
    tracked = subprocess.run(
        ["git", "diff", "--binary", base, "--", *paths], cwd=ROOT,
        capture_output=True, check=False,
    )
    if tracked.returncode:
        raise RuntimeError(tracked.stderr.decode(errors="replace").strip())
    untracked = set(git("ls-files", "--others", "--exclude-standard").splitlines())
    chunks = [tracked.stdout]
    for path in paths:
        if path not in untracked:
            continue
        added = subprocess.run(
            ["git", "diff", "--no-index", "--binary", "--", "/dev/null", path],
            cwd=ROOT, capture_output=True, check=False,
        )
        if added.returncode not in {0, 1}:
            raise RuntimeError(added.stderr.decode(errors="replace").strip())
        chunks.append(added.stdout)
    return b"".join(chunks)


def staged_diff(base: str, paths: list[str]) -> bytes:
    completed = subprocess.run(
        ["git", "diff", "--cached", "--binary", "--no-renames", base, "--", *paths],
        cwd=ROOT, capture_output=True, check=False,
    )
    if completed.returncode:
        raise RuntimeError(completed.stderr.decode(errors="replace").strip())
    return completed.stdout


def review_agent_types(model_tier: str) -> dict[str, str]:
    if model_tier not in {"standard", "capable"}:
        raise RuntimeError(f"invalid review model tier: {model_tier}")
    return {
        "spec": f"spec_review_{model_tier}",
        "standards": f"standards_review_{model_tier}",
    }


def state_for(slug: str) -> dict:
    path = ROOT / "docs" / "workspace" / slug / "workflow.json"
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"cannot load workflow state: {exc}") from exc
    if not isinstance(state, dict) or state.get("slug") != slug:
        raise RuntimeError("workflow state slug mismatch")
    return state


def changed_paths(base: str, slug: str) -> list[str]:
    paths = set(git("diff", "--name-only", base).splitlines())
    paths.update(
        value for value in git("ls-files", "--others", "--exclude-standard").splitlines()
        if value
    )
    excluded = {
        "docs/workspace/ACTIVE.md",
        "docs/workspace/archive.md",
    }
    prefix = f"docs/workspace/{slug}/"
    return sorted(
        path for path in paths
        if (
            path
            and path not in excluded
            and not path.startswith(prefix)
            and "__pycache__" not in Path(path).parts
            and not path.endswith((".pyc", ".pyo"))
        )
    )


def merge_base(base: str) -> str:
    return git("merge-base", base, "HEAD")


def ensure_private_directory(path: Path) -> None:
    if path.is_symlink():
        raise RuntimeError(f"review input path must not be a symbolic link: {path}")
    if path.exists():
        metadata = path.stat()
        if not stat.S_ISDIR(metadata.st_mode):
            raise RuntimeError(f"review input path must be a directory: {path}")
        if hasattr(os, "getuid") and metadata.st_uid != os.getuid():
            raise RuntimeError(f"review input directory has an unexpected owner: {path}")
    else:
        path.mkdir(mode=0o700)
    path.chmod(0o700)


def temporary_review_root(slug: str) -> Path:
    if not re.fullmatch(r"[A-Za-z0-9._-]+", slug):
        raise RuntimeError(
            "review input slug must contain only letters, numbers, dot, "
            "underscore, or dash"
        )
    project_root = ROOT.resolve()
    repository_key = hashlib.sha256(
        str(project_root).encode("utf-8")
    ).hexdigest()[:16]
    namespace = (
        Path(tempfile.gettempdir()).resolve()
        / "ai-coding-template-review-input"
    )
    ensure_private_directory(namespace)
    repository_root = namespace / repository_key
    ensure_private_directory(repository_root)
    path = repository_root / slug
    if path.is_symlink():
        raise RuntimeError(f"review input path must not be a symbolic link: {path}")
    if path.absolute().is_relative_to(project_root):
        raise RuntimeError("temporary review input must stay outside the project tree")
    return path


def scope_digest(paths: list[str]) -> str:
    digest = hashlib.sha256()
    for path in paths:
        digest.update(path.encode())
        candidate = ROOT / path
        digest.update(candidate.read_bytes() if candidate.is_file() else b"deleted")
    return digest.hexdigest()


def verify_diff_artifact(
    package: dict, expected_diff: bytes, recorded_diff: bytes,
) -> None:
    if (
        recorded_diff != expected_diff
        or package.get("diffFingerprint")
        != hashlib.sha256(expected_diff).hexdigest()
    ):
        raise RuntimeError("review package is stale for the complete diff artifact")


def verify_package(slug: str) -> dict:
    destination = temporary_review_root(slug) / "review-package.json"
    try:
        package = json.loads(destination.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"review package is stale or unreadable: {exc}") from exc
    if not isinstance(package, dict) or package.get("slug") != slug:
        raise RuntimeError("review package is stale: slug mismatch")
    fixed = package.get("fixedPoint")
    if not isinstance(fixed, str):
        raise RuntimeError("review package is stale: fixed point missing")
    try:
        resolved = git("rev-parse", "--verify", f"{fixed}^{{commit}}")
    except RuntimeError as exc:
        raise RuntimeError("review package is stale: fixed point is invalid") from exc
    requested_commit = package.get("requestedBaseCommit")
    if not isinstance(requested_commit, str):
        raise RuntimeError("review package is stale: requested base commit missing")
    try:
        requested_commit = git(
            "rev-parse", "--verify", f"{requested_commit}^{{commit}}"
        )
    except RuntimeError as exc:
        raise RuntimeError("review package is stale: requested base is invalid") from exc
    if merge_base(requested_commit) != resolved:
        raise RuntimeError("review package is stale: fixed point is not the merge-base")
    staged = package.get("identityKind") == "staged-candidate-v1"
    if staged:
        try:
            candidate = load_candidate_module().inspect_candidate(ROOT, resolved, slug)
        except RuntimeError as exc:
            raise RuntimeError(f"review package staged candidate is unavailable: {exc}") from exc
        paths = list(candidate["changedPaths"])
        if (
            package.get("candidateBaseCommit") != candidate["baseCommit"]
            or package.get("candidateFingerprint") != candidate["candidateFingerprint"]
            or package.get("scopeFingerprint") != candidate["candidateFingerprint"]
            or package.get("changedPaths") != paths
        ):
            raise RuntimeError("review package is stale for the staged candidate")
    else:
        paths = changed_paths(resolved, slug)
        if package.get("changedPaths") != paths or package.get("scopeFingerprint") != scope_digest(paths):
            raise RuntimeError("review package is stale for the current whole diff")
    artifact_relative = package.get("diffArtifact")
    if not isinstance(artifact_relative, str):
        raise RuntimeError("review package is stale: diff artifact missing")
    artifact = ROOT / artifact_relative
    expected_diff = staged_diff(resolved, paths) if staged else whole_diff(resolved, paths)
    try:
        recorded_diff = artifact.read_bytes()
    except OSError as exc:
        raise RuntimeError(f"review package diff artifact is unreadable: {exc}") from exc
    verify_diff_artifact(package, expected_diff, recorded_diff)
    return package


def cleanup_review_input(slug: str) -> None:
    destination = temporary_review_root(slug)
    if destination.exists() or destination.is_symlink():
        try:
            shutil.rmtree(destination)
        except OSError as exc:
            raise RuntimeError(f"review input cleanup failed: {exc}") from exc
    if destination.exists() or destination.is_symlink():
        raise RuntimeError("review input cleanup failed: temporary input remains")


def main() -> int:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    package_parser = commands.add_parser("package")
    package_parser.add_argument("slug")
    package_parser.add_argument("--base", required=True)
    package_parser.add_argument("--staged", action="store_true")
    verify_parser = commands.add_parser("verify")
    verify_parser.add_argument("slug")
    cleanup_parser = commands.add_parser("cleanup")
    cleanup_parser.add_argument("slug")
    args = parser.parse_args()
    try:
        if args.command == "verify":
            verify_package(args.slug)
            print(f"review package current: {args.slug}")
            return 0
        if args.command == "cleanup":
            cleanup_review_input(args.slug)
            print(f"review input cleaned: {args.slug}")
            return 0
        requested_base = git("rev-parse", "--verify", f"{args.base}^{{commit}}")
        fixed_point = merge_base(requested_base)
        state = state_for(args.slug)
        candidate = None
        if args.staged:
            candidate = load_candidate_module().inspect_candidate(
                ROOT, fixed_point, args.slug,
            )
            paths = list(candidate["changedPaths"])
        else:
            paths = changed_paths(fixed_point, args.slug)
        if not paths:
            raise RuntimeError("review scope is empty")
        config = json.loads((ROOT / ".ai" / "project.json").read_text(encoding="utf-8"))
        profiles = config.get("reviewProfiles")
        intensity = state.get("intensity")
        if not isinstance(profiles, dict) or intensity not in profiles:
            raise RuntimeError(f"missing review profile for intensity: {intensity}")
        review_profile = profiles[intensity]
        if (
            not isinstance(review_profile, dict)
            or not isinstance(review_profile.get("modelTier"), str)
            or type(review_profile.get("maxWords")) is not int
            or review_profile["maxWords"] <= 0
        ):
            raise RuntimeError(f"invalid review profile for intensity: {intensity}")
        resolved_agents = review_agent_types(review_profile["modelTier"])
        if (
            any(not isinstance(value, str) or not value for value in resolved_agents.values())
            or resolved_agents["spec"] == resolved_agents["standards"]
        ):
            raise RuntimeError(f"invalid independent review agents: {intensity}")
        effective_review_profile = dict(review_profile)
        effective_review_profile["agentTypes"] = resolved_agents
        review_root = temporary_review_root(args.slug)
        if review_root.exists():
            if not review_root.is_dir():
                raise RuntimeError(
                    f"review input path must be a directory: {review_root}"
                )
            shutil.rmtree(review_root)
        ensure_private_directory(review_root)
        diff_artifact = review_root / "review.diff"
        diff_bytes = (
            staged_diff(fixed_point, paths)
            if candidate is not None else whole_diff(fixed_point, paths)
        )
        diff_artifact.write_bytes(diff_bytes)
        diff_artifact.chmod(0o600)
        package = {
            "schemaVersion": 1,
            "generatedAt": dt.datetime.now(dt.timezone.utc).replace(
                microsecond=0
            ).isoformat(),
            "slug": args.slug,
            "intensity": intensity,
            "requestedBase": args.base,
            "requestedBaseCommit": requested_base,
            "fixedPoint": fixed_point,
            "comparisonHead": git("rev-parse", "HEAD"),
            "diffCommand": f"cat {diff_artifact}",
            "diffArtifact": str(diff_artifact),
            "diffFingerprint": hashlib.sha256(diff_bytes).hexdigest(),
            "changedPaths": paths,
            "scopeFingerprint": (
                candidate["candidateFingerprint"]
                if candidate is not None else scope_digest(paths)
            ),
            "standardsSources": [
                path for path in (
                    "AGENTS.md", "CONTEXT.md", "docs/ARCHITECTURE.md",
                    ".ai/project.json", ".agents/skills/review/SKILL.md",
                ) if (ROOT / path).exists()
            ],
            "reviewProfile": effective_review_profile,
            "axes": ["Spec", "Standards"],
            "requirements": {
                "parallel": True,
                "readOnly": True,
                "separateConclusions": True,
                "finalWholeDiff": True,
            },
        }
        if candidate is not None:
            package.update({
                "identityKind": "staged-candidate-v1",
                "candidateBaseCommit": candidate["baseCommit"],
                "candidateFingerprint": candidate["candidateFingerprint"],
                "candidateEntries": candidate["entries"],
            })
        destination = review_root / "review-package.json"
        destination.write_text(
            json.dumps(package, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        destination.chmod(0o600)
        print(destination)
    except (RuntimeError, OSError, json.JSONDecodeError) as exc:
        print(f"cannot package review: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
