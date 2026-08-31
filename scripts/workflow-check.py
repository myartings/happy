#!/usr/bin/env python3
"""Run configured deterministic project commands and optionally record results."""

from __future__ import annotations

import argparse
import datetime as dt
import fnmatch
import hashlib
import importlib.util
import json
import os
import re
import shlex
import subprocess
import sys
import time
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / ".ai" / "project.json"
MINIMUM_PYTHON = (3, 11)
DEFAULT_GROUPS = ("format", "lint", "typecheck", "test", "build", "check")
CHECKS_START = "<!-- WORKFLOW_CHECKS_START -->"
CHECKS_END = "<!-- WORKFLOW_CHECKS_END -->"


def load_candidate_module():
    path = ROOT / "scripts" / "workflow-candidate.py"
    spec = importlib.util.spec_from_file_location("workflow_candidate_runtime", path)
    if spec is None or spec.loader is None:
        raise SystemExit("cannot load staged candidate runtime")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def active_slug() -> str:
    path = ROOT / "docs" / "workspace" / "ACTIVE.md"
    if not path.exists():
        return ""
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("**Feature**:"):
            return line.split(":", 1)[1].strip()
    return ""


def git_bytes(*args: str) -> bytes:
    completed = subprocess.run(
        ["git", *args], cwd=ROOT, capture_output=True, check=False
    )
    return completed.stdout if completed.returncode == 0 else b""


def git_output(*args: str) -> str:
    return git_bytes(*args).decode("utf-8", errors="replace")


def repository_identity() -> tuple[str, str]:
    head = git_output("rev-parse", "HEAD").strip() or "unavailable"
    status = git_bytes("status", "--porcelain=v1", "-z")
    diff = git_bytes("diff", "--binary", "HEAD") if head != "unavailable" else b""
    digest = hashlib.sha256()
    digest.update(status)
    digest.update(diff)
    for raw_path in sorted(
        value for value in git_bytes("ls-files", "--others", "--exclude-standard", "-z").split(b"\0")
        if value
    ):
        digest.update(raw_path)
        candidate = ROOT / raw_path.decode("utf-8", errors="surrogateescape")
        if candidate.is_file():
            with candidate.open("rb") as handle:
                for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                    digest.update(chunk)
    if not status and not diff and head == "unavailable":
        digest.update(b"not-a-git-worktree")
    return head, digest.hexdigest()


def path_matches(path: str, pattern: str) -> bool:
    return fnmatch.fnmatchcase(path, pattern) or Path(path).match(pattern)


def scope_paths(slug: str = "") -> list[str]:
    paths = set(git_output("diff", "--name-only", "HEAD").splitlines())
    paths.update(
        value.decode("utf-8", errors="surrogateescape")
        for value in git_bytes(
            "ls-files", "--others", "--exclude-standard", "-z"
        ).split(b"\0")
        if value
    )
    excluded = {
        "docs/workspace/ACTIVE.md",
        "docs/workspace/archive.md",
    }
    prefix = f"docs/workspace/{slug}/" if slug else ""
    return sorted(
        path for path in paths
        if (
            path and path not in excluded and not (prefix and path.startswith(prefix))
            and "__pycache__" not in Path(path).parts
            and not path.endswith((".pyc", ".pyo"))
        )
    )


def scope_fingerprint(paths: list[str]) -> str:
    digest = hashlib.sha256()
    head = git_output("rev-parse", "HEAD").strip() or "unavailable"
    digest.update(head.encode())
    for path in paths:
        digest.update(path.encode())
        candidate = ROOT / path
        if not candidate.exists():
            digest.update(b"\0deleted")
        elif candidate.is_file():
            digest.update(b"\0file\0")
            with candidate.open("rb") as handle:
                for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                    digest.update(chunk)
        else:
            digest.update(b"\0other")
    return digest.hexdigest()


def candidate_worktree_divergence(
    paths: list[str], entries: list[dict[str, str]],
) -> list[str]:
    del paths, entries

    def checked_paths(*arguments: str) -> set[str]:
        completed = subprocess.run(
            ["git", *arguments], cwd=ROOT, capture_output=True, check=False,
        )
        if completed.returncode:
            detail = completed.stderr.decode("utf-8", errors="replace").strip()
            raise RuntimeError(detail or f"git {' '.join(arguments)} failed")
        return {
            value.decode("utf-8", errors="surrogateescape")
            for value in completed.stdout.split(b"\0")
            if value
        }

    slug = active_slug()
    evidence_root = f"docs/workspace/{slug}" if slug else ""
    allowed = {
        f"{evidence_root}/evidence/checks.jsonl",
        f"{evidence_root}/state.md",
        f"{evidence_root}/validation.md",
        f"{evidence_root}/workflow.json",
    } if evidence_root else set()
    changed = checked_paths("diff", "--name-only", "-z")
    changed.update(
        checked_paths("ls-files", "--others", "--exclude-standard", "-z")
    )
    return sorted(
        path for path in changed
        if path not in allowed
        and "__pycache__" not in Path(path).parts
        and not path.endswith((".pyc", ".pyo"))
    )


def select_applicable_profiles(config: dict, paths: list[str]) -> tuple[str, ...]:
    selection = config.get("checkSelection")
    profiles = config.get("checkProfiles")
    if not isinstance(selection, dict) or not isinstance(profiles, dict):
        raise SystemExit("--applicable requires checkSelection and checkProfiles")
    fallback = selection.get("fallbackProfile")
    if not isinstance(fallback, str) or fallback not in profiles:
        raise SystemExit("checkSelection.fallbackProfile must name a check profile")
    rules = selection.get("rules")
    if not isinstance(rules, list):
        raise SystemExit("checkSelection.rules must be a list")
    validated: list[dict] = []
    names: set[str] = set()
    for index, rule in enumerate(rules, 1):
        if not isinstance(rule, dict):
            raise SystemExit(f"checkSelection rule {index} must be an object")
        name = rule.get("name")
        profile = rule.get("profile")
        include = rule.get("include")
        exclude = rule.get("exclude", [])
        trigger = rule.get("trigger")
        if not isinstance(name, str) or not name.strip() or name in names:
            raise SystemExit(f"checkSelection rule {index} requires a unique name")
        names.add(name)
        if not isinstance(profile, str) or profile not in profiles:
            raise SystemExit(f"checkSelection rule {name} names unknown profile")
        if not isinstance(include, list) or not include or any(
            not isinstance(item, str) or not item.strip() for item in include
        ):
            raise SystemExit(f"checkSelection rule {name} requires include patterns")
        if not isinstance(exclude, list) or any(
            not isinstance(item, str) or not item.strip() for item in exclude
        ):
            raise SystemExit(f"checkSelection rule {name} has invalid exclude patterns")
        if "trigger" in rule and (
            not isinstance(trigger, list)
            or not trigger
            or any(not isinstance(item, str) or not item.strip() for item in trigger)
        ):
            raise SystemExit(f"checkSelection rule {name} has invalid trigger patterns")
        validated.append(rule)
    if not paths:
        return (fallback,)
    primary_paths = [
        path for path in paths
        if not path.startswith("docs/tasks/")
    ]
    if not primary_paths:
        return (fallback,)
    paths = primary_paths
    active: list[dict] = []
    for rule in validated:
        covered = [
            path for path in paths
            if any(path_matches(path, pattern) for pattern in rule["include"])
            and not any(
                path_matches(path, pattern) for pattern in rule.get("exclude", [])
            )
        ]
        if "trigger" in rule:
            triggered = any(
                path_matches(path, pattern)
                for path in paths
                for pattern in rule["trigger"]
            )
            covered_triggered = any(
                path_matches(path, pattern)
                for path in covered
                for pattern in rule["trigger"]
            )
            if triggered and not covered_triggered:
                return (fallback,)
        else:
            covered_triggered = bool(covered)
        if covered and covered_triggered:
            active.append(rule)
    if not active:
        return (fallback,)
    for path in paths:
        matching = [
            rule for rule in active
            if any(path_matches(path, pattern) for pattern in rule["include"])
            and not any(
                path_matches(path, pattern) for pattern in rule.get("exclude", [])
            )
        ]
        if not matching:
            return (fallback,)
        # Trigger matches are primary ownership. Triggerless rules own every
        # path they cover; a path may be a shared companion only when none of
        # its matching rules claims primary ownership.
        owners = {
            rule["profile"] for rule in matching
            if "trigger" not in rule or any(
                path_matches(path, pattern) for pattern in rule["trigger"]
            )
        }
        matching_profiles = {rule["profile"] for rule in matching}
        if len(owners) > 1 or (owners and matching_profiles != owners):
            return (fallback,)
    selected = tuple(dict.fromkeys(rule["profile"] for rule in active))
    return selected or (fallback,)


def applicable_profile_identity(profiles: tuple[str, ...]) -> str:
    return "+".join(profiles)


def digest_json(value: object) -> str:
    return hashlib.sha256(
        json.dumps(value, ensure_ascii=False, sort_keys=True).encode()
    ).hexdigest()


def evidence_records(path: Path) -> list[dict[str, object]]:
    records = []
    if not path.exists():
        return records
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            record = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(
                f"invalid structured check evidence at {path}:{line_number}: {exc.msg}"
            ) from exc
        if not isinstance(record, dict):
            raise SystemExit(
                f"invalid structured check evidence at {path}:{line_number}: object required"
            )
        required_types = {
            "schemaVersion": int,
            "timestamp": str,
            "profile": str,
            "group": str,
            "command": str,
            "exitCode": int,
            "result": str,
            "durationMs": int,
            "head": str,
            "workingTreeFingerprint": str,
        }
        for name, expected_type in required_types.items():
            value = record.get(name)
            if type(value) is not expected_type or (
                expected_type is str and not value.strip()
            ):
                raise SystemExit(
                    f"invalid structured check evidence at {path}:{line_number}: "
                    f"{name} must be {expected_type.__name__}"
                )
        if record["schemaVersion"] != 1:
            raise SystemExit(
                f"invalid structured check evidence at {path}:{line_number}: "
                "schemaVersion must be 1"
            )
        if record["exitCode"] < 0 or record["durationMs"] < 0:
            raise SystemExit(
                f"invalid structured check evidence at {path}:{line_number}: "
                "exitCode and durationMs must be non-negative"
            )
        identity_types = {
            "runId": str,
            "scopeFingerprint": str,
            "configFingerprint": str,
            "commandSetFingerprint": str,
            "commandIndex": int,
            "commandCount": int,
        }
        present = [name for name in identity_types if name in record]
        if present:
            for name, expected_type in identity_types.items():
                value = record.get(name)
                if type(value) is not expected_type or (
                    expected_type is str and not value.strip()
                ):
                    raise SystemExit(
                        f"invalid structured check evidence at {path}:{line_number}: "
                        f"{name} must be {expected_type.__name__}"
                    )
            if not 0 <= record["commandIndex"] < record["commandCount"]:
                raise SystemExit(
                    f"invalid structured check evidence at {path}:{line_number}: "
                    "commandIndex must be within commandCount"
                )
        reused_from = record.get("reusedFromRunId")
        if reused_from is not None and (
            not isinstance(reused_from, str) or not reused_from.strip()
        ):
            raise SystemExit(
                f"invalid structured check evidence at {path}:{line_number}: "
                "reusedFromRunId must be str"
            )
        result = record["result"]
        exit_code = record["exitCode"]
        valid_result = (
            result == "passed" and exit_code == 0 and reused_from is None
        ) or (
            result == "reused" and exit_code == 0 and reused_from is not None
        ) or (
            exit_code > 0
            and result == f"failed ({exit_code})"
            and reused_from is None
        )
        if not valid_result:
            raise SystemExit(
                f"invalid structured check evidence at {path}:{line_number}: "
                "result is inconsistent with exitCode/reuse provenance"
            )
        identity_kind = record.get("identityKind")
        if identity_kind is not None:
            if identity_kind != "staged-candidate-v1":
                raise SystemExit(
                    f"invalid structured check evidence at {path}:{line_number}: "
                    "identityKind is unsupported"
                )
            for name in ("candidateBaseCommit", "candidateFingerprint"):
                value = record.get(name)
                if not isinstance(value, str) or not value.strip():
                    raise SystemExit(
                        f"invalid structured check evidence at {path}:{line_number}: "
                        f"{name} must be str"
                    )
        records.append(record)
    return records


def render_automated_checks(validation: Path, records: list[dict[str, object]]) -> None:
    text = validation.read_text(encoding="utf-8")
    heading = "## Automated check evidence"
    rows = [
        "| Date | Profile / group | Command | Result | Exit code | Revision / working tree | Duration |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for item in records:
        safe = lambda value: str(value).replace("|", "\\|").replace("\n", " ")
        timestamp = safe(item.get("timestamp", ""))
        profile = safe(item.get("profile") or item.get("group", ""))
        group = safe(item.get("group", ""))
        label = profile if profile == group else f"{profile} / {group}"
        command = safe(item.get("command", ""))
        result = safe(item.get("result", ""))
        exit_code = safe(item.get("exitCode", ""))
        revision = safe(item.get("head", ""))[:12]
        fingerprint = safe(item.get("workingTreeFingerprint", ""))[:12]
        duration = safe(item.get("durationMs", ""))
        rows.append(
            f"| {timestamp} | {label} | `{command}` | {result} | {exit_code} | "
            f"{revision}; working tree `{fingerprint}` | {duration} ms |"
        )
    block = f"{CHECKS_START}\n" + "\n".join(rows) + f"\n{CHECKS_END}"
    if CHECKS_START in text and CHECKS_END in text:
        text = re.sub(
            re.escape(CHECKS_START) + r".*?" + re.escape(CHECKS_END),
            block,
            text,
            flags=re.DOTALL,
        )
    else:
        marker = "## Acceptance coverage"
        if marker not in text:
            raise SystemExit(
                f"cannot record: {validation.relative_to(ROOT).as_posix()} lacks {marker}"
            )
        text = text.replace(marker, f"{heading}\n\n{block}\n\n{marker}", 1)
    validation.write_text(text, encoding="utf-8")


def record(slug: str, item: dict[str, object]) -> None:
    if not slug:
        return
    workflow = ROOT / "docs" / "workspace" / slug
    validation = workflow / "validation.md"
    if not validation.exists():
        raise SystemExit(
            f"cannot record: {validation.relative_to(ROOT).as_posix()} does not exist"
        )
    evidence = workflow / "evidence" / "checks.jsonl"
    evidence.parent.mkdir(exist_ok=True)
    with evidence.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(item, ensure_ascii=False, sort_keys=True) + "\n")
    render_automated_checks(validation, evidence_records(evidence))


def update_check_gate(slug: str, status: str, evidence: str, run_id: str) -> None:
    if not slug:
        return
    completed = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts" / "workflow-state.py"),
            "check-receipt",
            slug,
            status,
            "--run-id",
            run_id,
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


def reusable_run(
    records: list[dict[str, object]],
    profile: str,
    selected: list[tuple[str, str]],
    scope_identity: str,
    config_identity: str,
    command_identity: str,
) -> str:
    run_ids = []
    for item in records:
        run_id = item.get("runId")
        if isinstance(run_id, str) and run_id not in run_ids:
            run_ids.append(run_id)
    for run_id in reversed(run_ids):
        run = sorted(
            (item for item in records if item.get("runId") == run_id),
            key=lambda item: item.get("commandIndex", -1),
        )
        if len(run) != len(selected):
            continue
        if any(item.get("result") != "passed" or item.get("exitCode") != 0 for item in run):
            continue
        if any(
            item.get("profile") != profile
            or item.get("scopeFingerprint") != scope_identity
            or item.get("configFingerprint") != config_identity
            or item.get("commandSetFingerprint") != command_identity
            or item.get("commandCount") != len(selected)
            for item in run
        ):
            continue
        if [
            (item.get("group"), item.get("command")) for item in run
        ] != selected:
            continue
        return run_id
    return ""


def selected_commands(config: dict, profile: str) -> list[tuple[str, str]]:
    profiles = config.get("checkProfiles")
    commands = config.get("commands", {})
    if not isinstance(profiles, dict) or profile not in profiles:
        raise SystemExit(f"unknown check profile: {profile}")
    groups = tuple(profiles[profile])
    invalid = [group for group in groups if group not in commands]
    if invalid:
        raise SystemExit(
            "check profile references unknown command groups: " + ", ".join(invalid)
        )
    return [
        (group, command) for group in groups for command in commands.get(group, [])
    ]


def selected_union_commands(
    config: dict, selected_profiles: tuple[str, ...],
) -> list[tuple[str, str]]:
    profiles = config.get("checkProfiles")
    commands = config.get("commands", {})
    if not isinstance(profiles, dict):
        raise SystemExit("checkProfiles must be an object")
    groups: list[str] = []
    for profile in selected_profiles:
        if profile not in profiles:
            raise SystemExit(f"unknown check profile: {profile}")
        for group in profiles[profile]:
            if group not in groups:
                groups.append(group)
    invalid = [group for group in groups if group not in commands]
    if invalid:
        raise SystemExit(
            "check profile references unknown command groups: " + ", ".join(invalid)
        )
    selected: list[tuple[str, str]] = []
    seen_commands: set[str] = set()
    for group in groups:
        for command in commands.get(group, []):
            if not isinstance(command, str) or not command.strip():
                raise SystemExit("configured commands must be non-empty strings")
            if command in seen_commands:
                continue
            seen_commands.add(command)
            selected.append((group, command))
    return selected


def require_supported_python() -> None:
    """Reject unsupported runtimes before parsing or executing configured checks."""
    active = (sys.version_info[0], sys.version_info[1])
    if active < MINIMUM_PYTHON:
        raise SystemExit(
            "workflow-check requires Python 3.11 or newer; "
            f"active interpreter is {active[0]}.{active[1]}"
        )


def run_configured_command(
    command: str, *, environment: dict[str, str]
) -> subprocess.CompletedProcess[str]:
    """Run a configured command, resolving repository Python at execution time."""
    marker = "{python}"
    if command == marker or command.startswith(f"{marker} "):
        try:
            arguments = shlex.split(command[len(marker):].strip(), posix=True)
        except ValueError as exc:
            raise SystemExit(f"invalid configured Python command {command!r}: {exc}")
        try:
            return subprocess.run(
                [sys.executable, *arguments], cwd=ROOT, text=True, env=environment,
            )
        except OSError as exc:
            print(
                f"cannot execute active Python interpreter {sys.executable!r}: {exc}",
                file=sys.stderr,
            )
            return subprocess.CompletedProcess(command, 127)
    return subprocess.run(
        command, cwd=ROOT, shell=True, text=True, env=environment,
    )


def formal_run_errors(
    slug: str,
    run_id: str,
    current_scope: bool = True,
    current_config: bool = True,
    applicable_paths: list[str] | None = None,
    accepted_failure_indexes: tuple[int, ...] = (),
) -> list[str]:
    errors: list[str] = []
    evidence = ROOT / "docs" / "workspace" / slug / "evidence" / "checks.jsonl"
    try:
        records = evidence_records(evidence)
    except SystemExit as exc:
        return [str(exc)]
    run = sorted(
        (item for item in records if item.get("runId") == run_id),
        key=lambda item: item.get("commandIndex", -1),
    )
    if not run:
        return [f"bound structured check run does not exist: {run_id}"]
    count = run[0].get("commandCount")
    if type(count) is not int or count <= 0 or len(run) != count:
        errors.append("bound structured check run is incomplete")
        return errors
    if [item.get("commandIndex") for item in run] != list(range(count)):
        errors.append("bound structured check run command indexes are incomplete")
    if (
        any(type(index) is not int or index < 0 for index in accepted_failure_indexes)
        or len(set(accepted_failure_indexes)) != len(accepted_failure_indexes)
        or tuple(sorted(accepted_failure_indexes)) != accepted_failure_indexes
        or any(index >= count for index in accepted_failure_indexes)
    ):
        errors.append("accepted command indexes are invalid")
    identity_fields = (
        "profile", "scopeFingerprint", "configFingerprint",
        "commandSetFingerprint", "commandCount",
    )
    if run[0].get("identityKind") == "staged-candidate-v1":
        identity_fields += (
            "identityKind", "candidateBaseCommit", "candidateFingerprint",
        )
    for field in identity_fields:
        if any(item.get(field) != run[0].get(field) for item in run):
            errors.append(f"bound structured check run has inconsistent {field}")
    failed_indexes: list[int] = []
    invalid_outcome_indexes: list[int] = []
    for item in run:
        index = item.get("commandIndex")
        exit_code = item.get("exitCode")
        result = item.get("result")
        if exit_code == 0 and result in ("passed", "reused"):
            continue
        if (
            type(index) is int
            and type(exit_code) is int
            and exit_code > 0
            and result == f"failed ({exit_code})"
        ):
            failed_indexes.append(index)
            continue
        if type(index) is int:
            invalid_outcome_indexes.append(index)
    if accepted_failure_indexes:
        if invalid_outcome_indexes:
            errors.append(
                "bound structured check run has invalid command outcomes at indexes: "
                + ", ".join(str(index) for index in invalid_outcome_indexes)
            )
        if tuple(failed_indexes) != accepted_failure_indexes:
            errors.append(
                "accepted command indexes do not exactly match failed command indexes"
            )
    elif failed_indexes or invalid_outcome_indexes:
        errors.append("bound structured check run is not completely successful")
    profile = run[0].get("profile")
    if not isinstance(profile, str):
        return errors + ["bound structured check run profile is invalid"]
    recorded_commands = [
        (item.get("group"), item.get("command")) for item in run
    ]
    if run[0].get("commandSetFingerprint") != digest_json(recorded_commands):
        errors.append("bound structured check run command set is stale")
    if current_config:
        try:
            config = json.loads(CONFIG.read_text(encoding="utf-8"))
            selection_paths = (
                scope_paths(slug) if applicable_paths is None else applicable_paths
            )
            applicable_profiles = select_applicable_profiles(
                config, selection_paths,
            )
            applicable_identity = applicable_profile_identity(applicable_profiles)
            selected = (
                selected_union_commands(config, applicable_profiles)
                if profile == applicable_identity
                else selected_commands(config, profile)
            )
        except (OSError, json.JSONDecodeError, SystemExit) as exc:
            return errors + [f"cannot resolve bound check profile: {exc}"]
        allowed_profiles = {"full", applicable_identity}
        if profile not in allowed_profiles:
            errors.append("bound structured check run is not a full or applicable profile")
        if recorded_commands != selected:
            errors.append("bound structured check run commands do not match its profile")
        if (
            run[0].get("configFingerprint")
            != hashlib.sha256(CONFIG.read_bytes()).hexdigest()
        ):
            errors.append("bound structured check run configuration is stale")
    if current_scope:
        if run[0].get("identityKind") == "staged-candidate-v1":
            try:
                candidate = load_candidate_module().inspect_candidate(
                    ROOT, str(run[0].get("candidateBaseCommit", "")), slug,
                )
                paths = list(candidate["changedPaths"])
                current_identity = str(candidate["candidateFingerprint"])
            except RuntimeError as exc:
                errors.append(f"bound staged candidate is unavailable: {exc}")
                paths = []
                current_identity = ""
        else:
            paths = scope_paths(slug)
            current_identity = scope_fingerprint(paths)
        if run[0].get("scopeFingerprint") != current_identity:
            errors.append(
                "bound structured check run scope is stale: "
                f"{str(run[0].get('scopeFingerprint'))[:12]} != "
                f"{current_identity[:12]} for {paths}"
            )
    for item in run:
        if item.get("result") != "reused":
            continue
        source_id = item.get("reusedFromRunId")
        source = sorted(
            (record for record in records if record.get("runId") == source_id),
            key=lambda record: record.get("commandIndex", -1),
        )
        source_count = source[0].get("commandCount") if source else None
        if (
            type(source_count) is not int
            or source_count <= 0
            or len(source) != source_count
            or [record.get("commandIndex") for record in source]
            != list(range(source_count))
            or any(
                record.get("exitCode") != 0 or record.get("result") != "passed"
                for record in source
            )
            or any(
                record.get(field) != run[0].get(field)
                for record in source
                for field in identity_fields
            )
            or [
                (record.get("group"), record.get("command")) for record in source
            ] != recorded_commands
        ):
            errors.append("bound reused check run has invalid source evidence")
            break
    return errors


def formal_run_fingerprint(slug: str, run_id: str) -> str:
    evidence = ROOT / "docs" / "workspace" / slug / "evidence" / "checks.jsonl"
    records = evidence_records(evidence)
    digest = hashlib.sha256()
    pending = [run_id]
    seen: set[str] = set()
    while pending:
        current = pending.pop(0)
        if current in seen:
            raise SystemExit("structured check reuse provenance contains a cycle")
        seen.add(current)
        run = sorted(
            (item for item in records if item.get("runId") == current),
            key=lambda item: item.get("commandIndex", -1),
        )
        if not run:
            raise SystemExit(f"structured check run does not exist: {current}")
        digest.update(current.encode())
        digest.update(b"\0")
        for item in run:
            digest.update(
                json.dumps(
                    item, ensure_ascii=False, sort_keys=True,
                    separators=(",", ":"),
                ).encode()
            )
            digest.update(b"\0")
        sources = sorted({
            item["reusedFromRunId"] for item in run
            if isinstance(item.get("reusedFromRunId"), str)
        })
        pending.extend(sources)
    return digest.hexdigest()


def main() -> int:
    require_supported_python()
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", action="append")
    parser.add_argument("--profile")
    parser.add_argument("--applicable", action="store_true")
    parser.add_argument("--record", nargs="?", const="active", default="")
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--reuse", action="store_true")
    parser.add_argument("--staged", action="store_true")
    parser.add_argument("--base", default="")
    args = parser.parse_args()

    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    commands = config.get("commands", {})
    if sum(bool(value) for value in (args.only, args.profile, args.applicable)) > 1:
        parser.error("--only, --profile, and --applicable are mutually exclusive")
    if args.reuse and (not args.record or args.list):
        parser.error("--reuse requires --record and cannot be combined with --list")
    if args.staged != bool(args.base):
        parser.error("--staged and --base must be provided together")
    profiles = config.get("checkProfiles")
    profile = args.profile
    slug = active_slug() if args.record == "active" else args.record
    candidate: dict[str, object] | None = None
    if args.staged:
        try:
            candidate_base = git_output("merge-base", args.base, "HEAD").strip()
            if not candidate_base:
                raise RuntimeError("candidate comparison base has no merge-base")
            candidate = load_candidate_module().inspect_candidate(
                ROOT, candidate_base, slug or active_slug(),
            )
        except RuntimeError as exc:
            raise SystemExit(f"cannot bind staged check candidate: {exc}") from exc
        paths = list(candidate["changedPaths"])
    else:
        paths = scope_paths(slug or active_slug())
    if args.applicable:
        applicable_profiles = select_applicable_profiles(config, paths)
        profile = applicable_profile_identity(applicable_profiles)
        selected = selected_union_commands(config, applicable_profiles)
    elif profile:
        selected = selected_commands(config, profile)
    elif args.only:
        groups = tuple(args.only)
        invalid_groups = [group for group in groups if group not in commands]
        if invalid_groups:
            raise SystemExit(
                "check profile references unknown command groups: "
                + ", ".join(invalid_groups)
            )
        selected = [
            (group, command)
            for group in groups
            for command in commands.get(group, [])
        ]
    elif isinstance(profiles, dict) and "full" in profiles:
        profile = "full"
        selected = selected_commands(config, profile)
    else:
        raise SystemExit("current checkProfiles.full configuration is required")
    if any(not isinstance(command, str) or not command.strip() for _, command in selected):
        raise SystemExit("configured commands must be non-empty strings")

    if args.list:
        print(f"selected profile: {profile or 'custom'}")
        for group, command in selected:
            print(f"{group}: {command}")
        return 0
    if not selected:
        print("no configured commands selected")
        return 0

    formal_full = ((profile == "full" or args.applicable) and not args.only)
    if slug and formal_full:
        state_path = ROOT / "docs" / "workspace" / slug / "workflow.json"
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise SystemExit(f"cannot validate formal check phase: {exc}") from exc
        if state.get("phase") != "verification":
            raise SystemExit(
                "formal workflow-check recording requires phase=verification, "
                f"found {state.get('phase')}"
            )
        if args.staged:
            if state.get("gates", {}).get("review", {}).get("status") != "pending":
                raise SystemExit(
                    "final staged candidate check must precede final review"
                )
            try:
                divergent = candidate_worktree_divergence(
                    paths, list(candidate["entries"]),
                )
            except RuntimeError as exc:
                raise SystemExit(
                    f"cannot inspect formal staged check worktree: {exc}"
                ) from exc
            if divergent:
                raise SystemExit(
                    "formal staged check has worktree paths outside the staged candidate: "
                    + ", ".join(divergent)
                )

    run_id = str(uuid.uuid4())
    scope_identity = (
        str(candidate["candidateFingerprint"])
        if candidate is not None else scope_fingerprint(paths)
    )
    candidate_fields = (
        {
            "identityKind": "staged-candidate-v1",
            "candidateBaseCommit": candidate["baseCommit"],
            "candidateFingerprint": candidate["candidateFingerprint"],
        }
        if candidate is not None else {}
    )
    config_identity = hashlib.sha256(CONFIG.read_bytes()).hexdigest()
    command_identity = digest_json(selected)
    if args.reuse and slug:
        evidence = ROOT / "docs" / "workspace" / slug / "evidence" / "checks.jsonl"
        source_run = reusable_run(
            evidence_records(evidence), profile or "custom", selected,
            scope_identity, config_identity, command_identity,
        )
        if source_run:
            head, fingerprint = repository_identity()
            for index, (group, command) in enumerate(selected):
                record(
                    slug,
                    {
                        "schemaVersion": 1,
                        "timestamp": dt.datetime.now(dt.timezone.utc).replace(
                            microsecond=0
                        ).isoformat(),
                        "profile": profile or "custom",
                        "group": group,
                        "command": command,
                        "exitCode": 0,
                        "result": "reused",
                        "durationMs": 0,
                        "head": head,
                        "workingTreeFingerprint": fingerprint,
                        "runId": run_id,
                        "scopeFingerprint": scope_identity,
                        "configFingerprint": config_identity,
                        "commandSetFingerprint": command_identity,
                        "commandIndex": index,
                        "commandCount": len(selected),
                        "reusedFromRunId": source_run,
                        **candidate_fields,
                    },
                )
            update_check_gate(
                slug, "passed",
                f"Reused exact successful {profile} run {source_run}; "
                f"{len(selected)} commands; scope/config/command fingerprints match",
                run_id,
            )
            print(f"reused exact successful check run: {source_run}")
            return 0
    failed = 0
    command_env = os.environ.copy()
    if candidate is not None:
        command_env["AI_CODING_STAGED_CANDIDATE"] = "1"
        command_env["AI_CODING_STAGED_BASE"] = str(candidate["baseCommit"])
        command_env["AI_CODING_STAGED_ROOT"] = str(ROOT.resolve())
    for index, (group, command) in enumerate(selected):
        if candidate is not None:
            try:
                divergent = candidate_worktree_divergence(
                    paths, list(candidate["entries"]),
                )
            except RuntimeError as exc:
                print(
                    f"cannot inspect staged worktree before check command: {exc}",
                    file=sys.stderr,
                )
                failed += 1
                break
            if divergent:
                print(
                    "worktree paths outside the staged candidate before check command: "
                    + ", ".join(divergent),
                    file=sys.stderr,
                )
                failed += 1
                break
        print(f"[{group}] {command}", flush=True)
        head, fingerprint = repository_identity()
        started = time.monotonic()
        completed = run_configured_command(command, environment=command_env)
        duration_ms = round((time.monotonic() - started) * 1000)
        outcome = "passed" if completed.returncode == 0 else f"failed ({completed.returncode})"
        if slug:
            record(
                slug,
                {
                    "schemaVersion": 1,
                    "timestamp": dt.datetime.now(dt.timezone.utc).replace(
                        microsecond=0
                    ).isoformat(),
                    "profile": profile or "custom",
                    "group": group,
                    "command": command,
                    "exitCode": completed.returncode,
                    "result": outcome,
                    "durationMs": duration_ms,
                    "head": head,
                    "workingTreeFingerprint": fingerprint,
                    "runId": run_id,
                    "scopeFingerprint": scope_identity,
                    "configFingerprint": config_identity,
                    "commandSetFingerprint": command_identity,
                    "commandIndex": index,
                    "commandCount": len(selected),
                    **candidate_fields,
                },
            )
        if completed.returncode != 0:
            failed += 1
        if candidate is not None:
            try:
                divergent = candidate_worktree_divergence(
                    paths, list(candidate["entries"]),
                )
            except RuntimeError as exc:
                print(
                    f"cannot re-inspect staged worktree after check command: {exc}",
                    file=sys.stderr,
                )
                failed += 1
                break
            if divergent:
                print(
                    "check command changed paths outside workflow evidence: "
                    + ", ".join(divergent),
                    file=sys.stderr,
                )
                failed += 1
                break
    if candidate is not None:
        try:
            divergent = candidate_worktree_divergence(
                paths, list(candidate["entries"]),
            )
        except RuntimeError as exc:
            print(f"cannot re-inspect staged check worktree: {exc}", file=sys.stderr)
            divergent = []
            failed += 1
        if divergent:
            print(
                "worktree paths outside the staged candidate after checks: "
                + ", ".join(divergent),
                file=sys.stderr,
            )
            failed += 1
        try:
            after = load_candidate_module().inspect_candidate(
                ROOT, str(candidate["baseCommit"]), slug or active_slug(),
            )
        except RuntimeError as exc:
            print(f"staged candidate became invalid during check: {exc}", file=sys.stderr)
            failed += 1
        else:
            if after["candidateFingerprint"] != candidate["candidateFingerprint"]:
                print("staged candidate changed during check", file=sys.stderr)
                failed += 1
    if slug and formal_full:
        status = "passed" if failed == 0 else "blocked"
        update_check_gate(
            slug,
            status,
            f"{len(selected)} configured commands; {failed} failures",
            run_id,
        )
    elif slug:
        print("targeted evidence recorded; formal check gate unchanged")
    print(f"commands: {len(selected)}, failures: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
