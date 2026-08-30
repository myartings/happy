#!/usr/bin/env python3
"""Validate accepted Trellis task evidence or an ordinary no-task delivery."""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path, PurePath

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path("docs/workspace/archive.md")
ACTIVE = Path("docs/workspace/ACTIVE.md")
ZERO_SHA = re.compile(r"^0+$")


def repository_identity(path: PurePath) -> str:
    return path.as_posix()


def literal_pathspec(identity: str) -> str:
    return f":(literal){identity}"


ARCHIVE_ID = repository_identity(ARCHIVE)
ACTIVE_ID = repository_identity(ACTIVE)


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


def empty_tree() -> str:
    return git("hash-object", "-t", "tree", "--stdin", input_text="")


def git_blob(revision: str, path: PurePath) -> bytes:
    completed = subprocess.run(
        ["git", "show", f"{revision}:{repository_identity(path)}"], cwd=ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if completed.returncode:
        raise RuntimeError(completed.stderr.decode(errors="replace").strip())
    return completed.stdout


def candidate_blob(staged: bool, path: PurePath) -> bytes:
    if not staged:
        return git_blob("HEAD", path)
    candidate_module = load_candidate_module()
    identity = repository_identity(path)
    entry = staged_entry(identity)
    if entry is None:
        raise RuntimeError(f"candidate path is not a Git blob: {identity}")
    return candidate_module.git_bytes(
        ROOT, "cat-file", "blob", entry[1]
    )


def load_candidate_module():
    path = ROOT / "scripts" / "workflow-candidate.py"
    spec = importlib.util.spec_from_file_location("workflow_candidate_runtime", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load staged candidate runtime")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def resolve_base(raw: str) -> str:
    candidate = raw.strip()
    if candidate and ZERO_SHA.fullmatch(candidate):
        if revision_exists("HEAD^"):
            return "HEAD^"
        return empty_tree()
    if candidate and revision_exists(candidate):
        return candidate
    if candidate:
        raise RuntimeError(f"base revision does not exist: {candidate}")
    if revision_exists("HEAD^"):
        return "HEAD^"
    return git("hash-object", "-t", "tree", "--stdin", input_text="")


def diff_command(staged: bool, base: str, *extra: str) -> list[str]:
    if staged:
        return ["diff", "--cached", *([base] if base else []), *extra]
    if revision_exists(base):
        return ["diff", f"{base}...HEAD", *extra]
    return ["diff", base, "HEAD", *extra]


def changed_paths(staged: bool, base: str) -> set[str]:
    # Candidate identity represents a rename as source deletion plus destination
    # addition. Disable Git's similarity presentation here so final-diff path
    # validation uses the same canonical path set regardless of local Git config.
    output = git(*diff_command(staged, base, "--no-renames", "--name-only"))
    return {line for line in output.splitlines() if line}


def archive_diff(staged: bool, base: str) -> str:
    return git(*diff_command(staged, base, "--unified=0", "--", ARCHIVE_ID))


def active_slug(evidence_root: Path) -> str:
    path = evidence_root / ACTIVE
    if not path.exists():
        return ""
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("**Feature**:"):
            return line.split(":", 1)[1].strip()
    return ""


def added_archive_lines(diff: str) -> list[str]:
    rows: list[str] = []
    for line in diff.splitlines():
        if not line.startswith("+|") or line.startswith("+++"):
            continue
        row = line[1:]
        if re.match(r"^\|+\s*\d{4}-\d{2}-\d{2}(?:\s|\|)", row):
            rows.append(row)
    return rows


def archive_cells(row: str) -> list[str]:
    if not row.startswith("|") or not row.endswith("|"):
        return []
    return [cell.strip() for cell in row[1:-1].split("|")]


def pending_merge_heads() -> list[str]:
    path = Path(git("rev-parse", "--git-path", "MERGE_HEAD"))
    if not path.is_absolute():
        path = ROOT / path
    try:
        return [line.strip() for line in path.read_text().splitlines() if line.strip()]
    except FileNotFoundError:
        return []


def staged_entry(path: str) -> tuple[str, str] | None:
    listed = subprocess.run(
        ["git", "ls-files", "--stage", "-z", "--", literal_pathspec(path)],
        cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if listed.returncode:
        raise RuntimeError(f"cannot inspect staged entry: {path}")
    records = [record for record in listed.stdout.split(b"\0") if record]
    if not records:
        return None
    if len(records) != 1:
        raise RuntimeError(f"cannot inspect staged entry: {path}")
    try:
        metadata, listed_path = records[0].split(b"\t", 1)
        mode, object_id, stage = metadata.decode("ascii").split()
    except (ValueError, UnicodeDecodeError) as exc:
        raise RuntimeError(f"cannot inspect staged entry: {path}") from exc
    if listed_path.decode("utf-8", errors="surrogateescape") != path or stage != "0":
        raise RuntimeError(f"cannot inspect staged entry: {path}")
    return mode, object_id


def revision_entry(revision: str, path: str) -> tuple[str, bytes] | None:
    listed = subprocess.run(
        ["git", "ls-tree", "-z", revision, "--", literal_pathspec(path)], cwd=ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if listed.returncode:
        raise RuntimeError(f"cannot inspect merge parent entry: {path}")
    records = [record for record in listed.stdout.split(b"\0") if record]
    if not records:
        return None
    if len(records) != 1:
        raise RuntimeError(f"cannot inspect merge parent entry: {path}")
    try:
        metadata, listed_path = records[0].split(b"\t", 1)
        mode, _, object_id = metadata.decode("ascii").split()
    except (ValueError, UnicodeDecodeError) as exc:
        raise RuntimeError(f"cannot inspect merge parent entry: {path}") from exc
    if listed_path.decode("utf-8", errors="surrogateescape") != path:
        raise RuntimeError(f"cannot inspect merge parent entry: {path}")
    blob = subprocess.run(
        ["git", "cat-file", "blob", object_id], cwd=ROOT,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if blob.returncode:
        raise RuntimeError(f"cannot inspect merge parent blob: {path}")
    return mode, blob.stdout


def candidate_entry(path: Path) -> tuple[str, bytes] | None:
    if path.is_symlink():
        return "120000", os.readlink(path).encode()
    if not path.is_file():
        return None
    mode = "100755" if path.stat().st_mode & 0o111 else "100644"
    return mode, path.read_bytes()


def canonical_lifecycle_entry_errors(
    staged: bool, evidence_root: Path, slug: str,
) -> list[str]:
    paths = (
        ACTIVE.as_posix(),
        ARCHIVE.as_posix(),
        f"docs/workspace/{slug}/workflow.json",
        f"docs/workspace/{slug}/state.md",
    )
    errors: list[str] = []
    for path in paths:
        entry = staged_entry(path) if staged else revision_entry("HEAD", path)
        snapshot = candidate_entry(evidence_root / path)
        if entry is None or entry[0] != "100644" or snapshot is None or snapshot[0] != "100644":
            errors.append(
                f"canonical lifecycle entry must be a 100644 regular blob: {path}"
            )
    return errors


def revision_lifecycle_paths(revision: str) -> set[str]:
    completed = subprocess.run(
        ["git", "ls-tree", "-r", "--name-only", revision, "docs/workspace"],
        cwd=ROOT, text=True, capture_output=True, check=False,
    )
    if completed.returncode:
        raise RuntimeError(f"cannot inspect merge parent lifecycle tree: {revision}")
    return {line for line in completed.stdout.splitlines() if line}


def revision_paths(revision: str) -> set[str]:
    completed = subprocess.run(
        ["git", "ls-tree", "-r", "--name-only", revision], cwd=ROOT,
        text=True, capture_output=True, check=False,
    )
    if completed.returncode:
        raise RuntimeError(f"cannot inspect merge parent tree: {revision}")
    return {line for line in completed.stdout.splitlines() if line}


def deterministic_merge_tree(ours: str, theirs: str) -> str:
    completed = subprocess.run(
        ["git", "merge-tree", "--write-tree", ours, theirs], cwd=ROOT,
        text=True, capture_output=True, check=False,
    )
    first_line = completed.stdout.splitlines()[0] if completed.stdout else ""
    if not re.fullmatch(r"[0-9a-f]{40,64}", first_line):
        raise RuntimeError(
            completed.stderr.strip() or "cannot compute deterministic merge tree"
        )
    return first_line


def virtual_merge_revision(ours: str, theirs: str) -> str:
    tree = git("write-tree")
    environment = os.environ.copy()
    environment.update({
        "GIT_AUTHOR_NAME": "workflow-ci",
        "GIT_AUTHOR_EMAIL": "workflow-ci@example.invalid",
        "GIT_AUTHOR_DATE": "2000-01-01T00:00:00+00:00",
        "GIT_COMMITTER_NAME": "workflow-ci",
        "GIT_COMMITTER_EMAIL": "workflow-ci@example.invalid",
        "GIT_COMMITTER_DATE": "2000-01-01T00:00:00+00:00",
    })
    completed = subprocess.run(
        ["git", "commit-tree", tree, "-p", ours, "-p", theirs], cwd=ROOT,
        text=True, input="workflow-ci prospective merge\n", capture_output=True,
        env=environment, check=False,
    )
    if completed.returncode:
        raise RuntimeError(completed.stderr.strip() or "cannot create prospective merge")
    return completed.stdout.strip()


def archive_data_rows(value: bytes | None) -> list[str]:
    if value is None:
        return []
    return [
        line for line in value.decode(errors="replace").splitlines()
        if len(archive_cells(line)) == 5
        and re.fullmatch(r"\d{4}-\d{2}-\d{2}", archive_cells(line)[0])
    ]


def lifecycle_merge_errors(
    evidence_root: Path, ours: str, theirs: str,
) -> list[str]:
    errors: list[str] = []
    paths = revision_lifecycle_paths(ours) | revision_lifecycle_paths(theirs)
    workspace_root = evidence_root / "docs" / "workspace"
    candidate_paths = {
        path.relative_to(evidence_root).as_posix()
        for path in workspace_root.rglob("*")
        if path.is_file() or path.is_symlink()
    } if workspace_root.exists() else set()
    for path in sorted(candidate_paths - paths):
        errors.append(f"merge integration added new lifecycle evidence: {path}")
    archive_path = ARCHIVE_ID
    for path in sorted(paths - {archive_path}):
        candidate = evidence_root / path
        candidate_value = candidate_entry(candidate)
        ours_value = revision_entry(ours, path)
        theirs_value = revision_entry(theirs, path)
        expected = {value for value in (ours_value, theirs_value) if value is not None}
        if candidate_value not in expected:
            errors.append(f"merge integration rewrote inherited lifecycle evidence: {path}")

    candidate_archive_entry = candidate_entry(evidence_root / ARCHIVE)
    ours_archive_entry = revision_entry(ours, archive_path)
    theirs_archive_entry = revision_entry(theirs, archive_path)
    parent_archive_modes = {
        entry[0]
        for entry in (ours_archive_entry, theirs_archive_entry)
        if entry is not None and entry[0] in {"100644", "100755"}
    }
    if (
        candidate_archive_entry is None
        or candidate_archive_entry[0] not in parent_archive_modes
    ):
        errors.append(
            "merge integration rewrote inherited lifecycle evidence: "
            f"{archive_path}"
        )
    candidate_archive = (
        candidate_archive_entry[1] if candidate_archive_entry is not None else b""
    )
    ours_archive = ours_archive_entry[1] if ours_archive_entry is not None else None
    theirs_archive = (
        theirs_archive_entry[1] if theirs_archive_entry is not None else None
    )
    ours_rows = archive_data_rows(ours_archive)
    theirs_rows = archive_data_rows(theirs_archive)
    expected_rows = theirs_rows + [row for row in ours_rows if row not in theirs_rows]
    if archive_data_rows(candidate_archive) != expected_rows:
        errors.append("merge integration archive is not the exact parent-row union")
    header = lambda value: [
        line for line in (value or b"").decode(errors="replace").splitlines()
        if line not in archive_data_rows(value)
    ]
    if header(candidate_archive) != header(theirs_archive):
        errors.append("merge integration changed archive structure outside data rows")
    return errors


def novel_non_lifecycle_merge_paths(
    staged: bool, evidence_root: Path, ours: str, theirs: str, revision: str,
) -> list[str]:
    expected_tree = deterministic_merge_tree(ours, theirs)
    expected_paths = revision_paths(expected_tree)
    if staged:
        candidate_paths = {
            path.relative_to(evidence_root).as_posix()
            for path in evidence_root.rglob("*")
            if path.is_file() or path.is_symlink()
        }
    else:
        candidate_paths = revision_paths(revision)
    novel: list[str] = []
    for path in sorted((expected_paths | candidate_paths) - lifecycle_paths(
        expected_paths | candidate_paths
    )):
        candidate_value = (
            candidate_entry(evidence_root / path)
            if staged else revision_entry(revision, path)
        )
        if candidate_value != revision_entry(expected_tree, path):
            novel.append(path)
    return novel


def source_delivery_errors(ours: str, theirs: str) -> list[str]:
    fixed_point = git("merge-base", ours, theirs)
    with tempfile.TemporaryDirectory(prefix="workflow-source-") as temp:
        clone = Path(temp) / "repository"
        cloned = subprocess.run(
            ["git", "clone", "--quiet", "--no-hardlinks", str(ROOT), str(clone)],
            text=True, capture_output=True, check=False,
        )
        if cloned.returncode:
            return [cloned.stderr.strip() or "cannot materialize source delivery"]
        checked = subprocess.run(
            ["git", "checkout", "--quiet", "--detach", ours], cwd=clone,
            text=True, capture_output=True, check=False,
        )
        if checked.returncode:
            return [checked.stderr.strip() or "cannot inspect source delivery"]
        validated = subprocess.run(
            [sys.executable, "scripts/workflow-ci.py", "--base", fixed_point],
            cwd=clone, text=True, capture_output=True, check=False,
        )
        if validated.returncode:
            detail = validated.stdout.strip() or validated.stderr.strip()
            return [f"merge source delivery is invalid: {detail}"]
    return []


def load_state_module(evidence_root: Path):
    path = evidence_root / "scripts" / "workflow-state.py"
    spec = importlib.util.spec_from_file_location("workflow_state", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow-state.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.GIT_ROOT = ROOT
    module.GIT_ATTRIBUTE_SOURCE = git("write-tree")
    return module


def load_review_module(evidence_root: Path):
    path = evidence_root / "scripts" / "workflow-review.py"
    spec = importlib.util.spec_from_file_location("workflow_review", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow-review.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def merge_integration_errors(
    staged: bool, base: str, evidence_root: Path, ours: str, theirs: str,
    revision: str,
) -> list[str]:
    # This path protects inherited task evidence only. Novel non-lifecycle merge
    # bytes remain an ordinary engineering diff and require their own applicable
    # checks and fresh Matt review.
    errors: list[str] = []
    paths = changed_paths(staged, theirs if staged else base)
    if not paths:
        errors.append("submitted Git diff is empty")
    active = active_slug(evidence_root)
    if active:
        errors.append(
            f"active Trellis task must be finished and archived before "
            f"merge submission: {active}"
        )
    errors.extend(lifecycle_merge_errors(evidence_root, ours, theirs))
    errors.extend(source_delivery_errors(ours, theirs))
    return errors


def lifecycle_paths(paths: set[str]) -> set[str]:
    return {
        path for path in paths
        if path == ACTIVE_ID
        or path == ARCHIVE_ID
        or path.startswith("docs/workspace/")
    }


def prearchive_candidate_errors(
    staged: bool, evidence_root: Path, paths: set[str], slug: str,
) -> list[str]:
    errors: list[str] = []
    errors.extend(canonical_lifecycle_entry_errors(staged, evidence_root, slug))
    active_path = ACTIVE.as_posix()
    archive_path = ARCHIVE.as_posix()
    if not staged:
        return [
            f"active Trellis task must be finished and archived before "
            f"submission: {slug}"
        ]
    workflow_root = f"docs/workspace/{slug}"
    if archive_path in paths:
        errors.append("pre-archive work candidate cannot mutate workflow archive")
    foreign_lifecycle = sorted(
        path for path in lifecycle_paths(paths)
        if path != active_path
        and not path.startswith(f"{workflow_root}/")
        and not path.startswith("docs/workspace/template/")
    )
    if foreign_lifecycle:
        errors.append(
            "pre-archive work candidate cannot mutate foreign lifecycle evidence: "
            + ", ".join(foreign_lifecycle)
        )
    required_changed = {
        active_path,
        f"{workflow_root}/workflow.json",
        f"{workflow_root}/state.md",
        f"{workflow_root}/validation.md",
        f"{workflow_root}/finish.md",
        f"{workflow_root}/evidence/checks.jsonl",
    }
    missing_changed = sorted(required_changed - paths)
    if missing_changed:
        errors.append(
            "staged work candidate lacks completed pre-archive evidence: "
            + ", ".join(missing_changed)
        )
    try:
        archive_rows = (
            evidence_root / ARCHIVE
        ).read_text(encoding="utf-8").splitlines()
        if any(
            len(cells) == 5 and cells[1] == slug
            for cells in (archive_cells(row) for row in archive_rows)
        ):
            errors.append(
                "workflow archive already contains the active slug before archive"
            )
        state_module = load_state_module(evidence_root)
        expected_active = state_module.render_active_data(
            state_module.active_data()
        ).replace("\n", os.linesep).encode("utf-8")
        if (evidence_root / ACTIVE).read_bytes() != expected_active:
            errors.append(
                "pre-archive ACTIVE projection is not canonical and unique"
            )
        errors.extend(state_module.workflow_errors(slug, check_current_scope=False))
        state = state_module.load_state(slug)
        errors.extend(state_module.prearchive_state_errors(state))
        errors.extend(state_module.finish_sections_complete(
            evidence_root / workflow_root / "finish.md"
        ))

        reviewed = state.get("checkedCandidate")
        if not isinstance(reviewed, dict):
            errors.append("pre-archive work candidate lacks final candidate identity")
        else:
            candidate = load_candidate_module().inspect_candidate(
                ROOT, str(reviewed.get("baseCommit", "")), slug,
            )
            if archive_path in changed_paths(True, str(reviewed.get("baseCommit", ""))):
                errors.append(
                    "pre-archive work candidate cannot mutate workflow archive"
                )
            if (
                reviewed.get("identityKind") != "staged-candidate-v1"
                or reviewed.get("candidateFingerprint")
                != candidate["candidateFingerprint"]
                or state.get("finalReview", {}).get("candidate") != reviewed
            ):
                errors.append("pre-archive final review is stale for the staged candidate")
        run_id = state.get("checkRunId")
        if state.get("checkEvidencePolicy") != 1 or not isinstance(run_id, str):
            errors.append("pre-archive work candidate lacks structured check evidence")
        else:
            check_module = state_module.load_check_module()
            records = check_module.evidence_records(
                evidence_root / workflow_root / "evidence" / "checks.jsonl"
            )
            run = [item for item in records if item.get("runId") == run_id]
            if not run or run[0].get("identityKind") != "staged-candidate-v1":
                errors.append(
                    "pre-archive work candidate requires staged-candidate check evidence"
                )
            else:
                candidate = load_candidate_module().inspect_candidate(
                    ROOT, str(run[0].get("candidateBaseCommit", "")), slug,
                )
                check_paths = list(candidate["changedPaths"])
                errors.extend(
                    check_module.formal_run_errors(
                        slug, run_id, current_scope=False, current_config=True,
                        applicable_paths=check_paths,
                        allow_command_failures=(
                            state.get("gates", {}).get("check", {}).get("status")
                            == "accepted_gaps"
                        ),
                    )
                )
                if (
                    run[0].get("candidateFingerprint")
                    != candidate["candidateFingerprint"]
                    or run[0].get("scopeFingerprint")
                    != candidate["candidateFingerprint"]
                ):
                    errors.append(
                        "pre-archive structured check run is stale for the staged candidate"
                    )
        if state.get("gates", {}).get("check", {}).get("status") not in (
            "passed", "accepted_gaps",
        ):
            errors.append("pre-archive work candidate check gate is not passed")
    except (RuntimeError, SystemExit, OSError, KeyError, TypeError) as exc:
        errors.append(f"cannot validate pre-archive workflow {slug}: {exc}")
    return errors


def archived_delivery_errors(
    staged: bool, base: str, evidence_root: Path, paths: set[str], slug: str,
    line: str, *, zero_base: bool = False,
) -> list[str]:
    errors: list[str] = []
    errors.extend(canonical_lifecycle_entry_errors(staged, evidence_root, slug))
    workflow_root = f"docs/workspace/{slug}"
    active_path = ACTIVE.as_posix()
    archive_path = ARCHIVE.as_posix()
    foreign_lifecycle = sorted(
        path for path in lifecycle_paths(paths)
        if path not in {active_path, archive_path}
        and not path.startswith(f"{workflow_root}/")
        and not path.startswith("docs/workspace/template/")
    )
    if foreign_lifecycle:
        errors.append(
            "archived delivery mutates foreign lifecycle evidence: "
            + ", ".join(foreign_lifecycle)
        )
    required_changed = {
        archive_path,
        f"{workflow_root}/workflow.json",
        f"{workflow_root}/state.md",
        f"{workflow_root}/validation.md",
        f"{workflow_root}/finish.md",
        f"{workflow_root}/evidence/checks.jsonl",
    }
    missing_changed = sorted(required_changed - paths)
    if missing_changed:
        errors.append(
            "archived delivery lacks completed terminal evidence: "
            + ", ".join(missing_changed)
        )
    if not staged and not zero_base:
        head_rows = added_archive_lines(
            git(
                "diff", "--unified=0", "--no-ext-diff",
                "HEAD^", "HEAD", "--", ARCHIVE_ID,
            )
        )
        if head_rows != [line]:
            errors.append(
                "archived delivery HEAD must introduce its single archive row"
            )
        row_changes = git(
            "log", "--format=%H", f"{base}..HEAD", f"-S{line}",
            "--", ARCHIVE_ID,
        ).splitlines()
        if row_changes != [git("rev-parse", "HEAD")]:
            errors.append(
                "archive row must be introduced exactly once and remain append-only "
                "across the submitted range"
            )
    try:
        state_module = load_state_module(evidence_root)
        state = state_module.load_state(slug)
        errors.extend(state_module.structural_errors(state, slug))
        if (
            evidence_root / workflow_root / "workflow.json"
        ).read_text(encoding="utf-8") != state_module.render_workflow_json(state):
            errors.append("workflow.json is not canonically serialized")
        errors.extend(state_module.completion_evidence_errors(state, slug))
        errors.extend(state_module.finish_sections_complete(
            evidence_root / workflow_root / "finish.md"
        ))
        if state.get("schemaVersion") != state_module.SCHEMA_VERSION:
            errors.append("archived delivery must use the current workflow schema")
        if state.get("phase") != "archived":
            errors.append("archived delivery workflow phase must be archived")
        if state.get("resultIdentity") != {
            "kind": state_module.RESULT_IDENTITY_KIND,
        }:
            errors.append("archived delivery has invalid result identity")
        expected_line = (
            f"| {state.get('archiveDate')} | {slug} | "
            f"{state_module.RESULT_IDENTITY_KIND} | "
            f"{state.get('archiveSummary')} | {state.get('archiveFollowUp')} |"
        )
        if line != expected_line:
            errors.append("archived delivery row does not match terminal state")
        history = state.get("history")
        if not isinstance(history, list) or not history:
            errors.append("archived delivery lacks terminal history")
        else:
            event = history[-1]
            expected_event = {
                "at": state.get("archivedAt"),
                "type": "archived",
                "phase": "archived",
                "evidence": (
                    f"{state.get('archiveSummary')}; result identity: "
                    f"{state_module.RESULT_IDENTITY_KIND}; follow-up: "
                    f"{state.get('archiveFollowUp')}"
                ),
            }
            if event != expected_event:
                errors.append("archived delivery terminal history is not canonical")
        if state.get("nextAction") != state.get("archiveFollowUp"):
            errors.append("archived delivery follow-up projection is not canonical")
        if (
            evidence_root / workflow_root / "state.md"
        ).read_text(encoding="utf-8") != state_module.render_state(state):
            errors.append("archived delivery state projection is not synchronized")

        reviewed = state.get("checkedCandidate")
        if not isinstance(reviewed, dict):
            errors.append("archived delivery lacks final candidate identity")
        else:
            candidate_module = load_candidate_module()
            if staged:
                candidate = candidate_module.inspect_candidate(
                    ROOT, str(reviewed.get("baseCommit", "")), slug,
                )
            else:
                candidate = candidate_module.inspect_commit(
                    ROOT, str(reviewed.get("baseCommit", "")), "HEAD", slug,
                )
            if (
                reviewed.get("identityKind") != "staged-candidate-v1"
                or reviewed.get("candidateFingerprint")
                != candidate["candidateFingerprint"]
                or state.get("finalReview", {}).get("candidate") != reviewed
            ):
                errors.append(
                    "archived delivery engineering candidate differs from final review"
                )
            run_id = state.get("checkRunId")
            if state.get("checkEvidencePolicy") != 1 or not isinstance(run_id, str):
                errors.append("archived delivery lacks structured check evidence")
            else:
                check_module = state_module.load_check_module()
                records = check_module.evidence_records(
                    evidence_root / workflow_root / "evidence" / "checks.jsonl"
                )
                run = [item for item in records if item.get("runId") == run_id]
                if not records or records[-1].get("runId") != run_id:
                    errors.append(
                        "archived delivery bound check run is not the final evidence run"
                    )
                if not run or run[0].get("identityKind") != "staged-candidate-v1":
                    errors.append(
                        "archived delivery requires staged-candidate check evidence"
                    )
                else:
                    check_paths = list(candidate["changedPaths"])
                    errors.extend(check_module.formal_run_errors(
                        slug, run_id, current_scope=False, current_config=True,
                        applicable_paths=check_paths,
                        allow_command_failures=(
                            state.get("gates", {}).get("check", {}).get("status")
                            == "accepted_gaps"
                        ),
                    ))
                    if state.get("checkRunFingerprint") != (
                        check_module.formal_run_fingerprint(slug, run_id)
                    ):
                        errors.append(
                            "archived delivery bound check run fingerprint changed"
                        )
                    if (
                        run[0].get("candidateFingerprint")
                        != candidate["candidateFingerprint"]
                        or run[0].get("scopeFingerprint")
                        != candidate["candidateFingerprint"]
                    ):
                        errors.append(
                            "archived delivery structured check is stale"
                        )
        for gate_name in ("check", "review", "finish"):
            if state.get("gates", {}).get(gate_name, {}).get("status") not in (
                "passed", "accepted_gaps",
            ):
                errors.append(f"archived delivery {gate_name} gate is not passed")

        archive_base = "HEAD" if staged else base
        base_archive = git_blob(archive_base, ARCHIVE).decode("utf-8").splitlines()
        candidate_archive = (evidence_root / ARCHIVE).read_text(
            encoding="utf-8"
        ).splitlines()
        if candidate_archive != [*base_archive, line]:
            errors.append(
                "archived delivery archive must equal the submission base plus one row"
            )

        previous_active = state.get("previousActive")
        if isinstance(previous_active, dict) and previous_active.get("feature"):
            try:
                previous_state = state_module.load_state(previous_active["feature"])
            except SystemExit:
                previous_state = {}
            if previous_state.get("phase") in state_module.ACTIVE_PHASES:
                expected_active_data = dict(previous_active)
                if (
                    expected_active_data.get("phase") != previous_state["phase"]
                    or expected_active_data.get("next") != previous_state["nextAction"]
                ):
                    expected_active_data["phase"] = previous_state["phase"]
                    expected_active_data["next"] = previous_state["nextAction"]
                    expected_active_data["updated"] = state.get("archiveDate", "")
            else:
                expected_active_data = {
                    "feature": "", "phase": "",
                    "updated": state.get("archiveDate", ""), "next": "",
                    "branch / worktree": "",
                }
        else:
            expected_active_data = {
                "feature": "", "phase": "",
                "updated": state.get("archiveDate", ""), "next": "",
                "branch / worktree": "",
            }
        expected_active = state_module.render_active_data(
            expected_active_data
        ).replace("\n", os.linesep).encode("utf-8")
        if (evidence_root / ACTIVE).read_bytes() != expected_active:
            errors.append("archived delivery ACTIVE projection is invalid")
    except (
        RuntimeError, SystemExit, OSError, json.JSONDecodeError, KeyError, TypeError,
    ) as exc:
        errors.append(f"cannot validate archived delivery {slug}: {exc}")
    return errors


def enforcement_errors(
    staged: bool, base: str, evidence_root: Path = ROOT, *,
    zero_base: bool = False,
) -> list[str]:
    errors: list[str] = []
    active = active_slug(evidence_root)

    try:
        paths = changed_paths(staged, base)
        added = added_archive_lines(archive_diff(staged, base))
    except RuntimeError as exc:
        return [f"cannot inspect Git diff: {exc}"]
    if not paths:
        errors.append("submitted Git diff is empty")
    effective_lifecycle = lifecycle_paths(paths)

    if not added:
        if active:
            return errors + prearchive_candidate_errors(
                staged, evidence_root, paths, active,
            )
        changed_lifecycle = sorted(effective_lifecycle)
        if changed_lifecycle:
            errors.append(
                "no-task delivery cannot mutate lifecycle evidence: "
                + ", ".join(changed_lifecycle)
            )
        return errors

    if len(added) != 1:
        return errors + [
            "formal delivery must add exactly one workflow archive row: "
            f"found {len(added)}"
        ]
    line = added[-1]
    cells = archive_cells(line)
    if len(cells) != 5:
        return errors + [
            "new workflow archive row must have exactly five cells: "
            f"found {len(cells)}"
        ]
    _, slug, result_identity, _, _ = cells
    if not re.fullmatch(r"[A-Za-z0-9._-]+", slug):
        return errors + [f"invalid archived workflow slug: {slug}"]
    if result_identity == "archive-introducing-commit":
        return errors + archived_delivery_errors(
            staged, base, evidence_root, paths, slug, line,
            zero_base=zero_base,
        )
    if result_identity == "pending":
        return errors + [
            "new workflow archive row cannot use pending; unchanged historical "
            "pending rows remain passive"
        ]
    return errors + [
        "new workflow archive row must use archive-introducing-commit; "
        "historical full-SHA rows remain passive"
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--staged", action="store_true")
    mode.add_argument("--base", default="")
    args = parser.parse_args()
    notices: list[str] = []

    try:
        if args.staged:
            base = ""
            with tempfile.TemporaryDirectory(prefix="workflow-index-") as temp:
                snapshot = Path(temp)
                git("checkout-index", "--all", f"--prefix={snapshot}{os.sep}")
                merge_heads = pending_merge_heads()
                if len(merge_heads) > 1:
                    errors = [
                        "merge integration requires exactly two parents; "
                        "octopus merges are unsupported"
                    ]
                elif merge_heads:
                    merge_head = merge_heads[0]
                    ours = git("rev-parse", "HEAD")
                    revision = virtual_merge_revision(ours, merge_head)
                    novel = novel_non_lifecycle_merge_paths(
                        True, snapshot, ours, merge_head, revision,
                    )
                    if novel:
                        notices.append(
                            "merge contains novel non-lifecycle bytes; clean-"
                            "integration evidence reuse is disabled and fresh "
                            "applicable checks plus Matt review are required: "
                            + ", ".join(novel)
                        )
                    errors = merge_integration_errors(
                        True, base, snapshot, ours, merge_head, revision,
                    )
                else:
                    errors = enforcement_errors(True, base, snapshot)
        else:
            raw_base = args.base or os.environ.get("WORKFLOW_BASE_SHA", "")
            zero_base = bool(raw_base.strip() and ZERO_SHA.fullmatch(raw_base.strip()))
            base = resolve_base(raw_base)
            dirty = git("status", "--porcelain", "--untracked-files=all")
            if dirty:
                errors = [
                    "committed workflow CI requires a clean working tree"
                ]
            else:
                parent_line = git("rev-list", "--parents", "-n", "1", "HEAD")
                parents = parent_line.split()[1:]
                if len(parents) > 2:
                    errors = [
                        "merge integration requires exactly two parents; "
                        "octopus merges are unsupported"
                    ]
                elif len(parents) == 2 and any(
                    git("merge-base", base, parent) == git("rev-parse", base)
                    for parent in parents
                ):
                    source_parent = os.environ.get("WORKFLOW_SOURCE_PARENT", "1")
                    if source_parent not in {"1", "2", "auto"}:
                        raise RuntimeError(
                            "WORKFLOW_SOURCE_PARENT must be 1, 2, or auto"
                        )
                    if source_parent == "auto":
                        base_revision = git("rev-parse", base)
                        target_indices = [
                            index for index, parent in enumerate(parents)
                            if parent == base_revision
                        ]
                        if len(target_indices) != 1:
                            raise RuntimeError(
                                "WORKFLOW_SOURCE_PARENT=auto requires the base "
                                "to equal exactly one merge parent"
                            )
                        source_index = 1 - target_indices[0]
                    else:
                        source_index = int(source_parent) - 1
                    source = parents[source_index]
                    target = parents[1 - source_index]
                    novel = novel_non_lifecycle_merge_paths(
                        False, ROOT, source, target, "HEAD",
                    )
                    if novel:
                        notices.append(
                            "merge contains novel non-lifecycle bytes; clean-"
                            "integration evidence reuse is disabled and fresh "
                            "applicable checks plus Matt review are required: "
                            + ", ".join(novel)
                        )
                    errors = merge_integration_errors(
                        False, base, ROOT, source, target, "HEAD",
                    )
                else:
                    errors = enforcement_errors(False, base, zero_base=zero_base)
    except RuntimeError as exc:
        errors = [str(exc)]
    if errors:
        print("workflow CI failed:")
        for error in sorted(set(errors)):
            print(f"- {error}")
        return 1
    for notice in notices:
        print(f"workflow CI notice: {notice}")
    mode_name = "staged diff" if args.staged else f"diff from {base}"
    print(f"workflow CI passed: {mode_name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
