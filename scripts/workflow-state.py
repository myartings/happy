#!/usr/bin/env python3
"""Manage formal task workflow state with machine-enforced phase gates."""

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
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GIT_ROOT = ROOT
GIT_ATTRIBUTE_SOURCE = ""
WORKSPACE = ROOT / "docs" / "workspace"
TEMPLATE = WORKSPACE / "template"
ACTIVE = WORKSPACE / "ACTIVE.md"
ARCHIVE = WORKSPACE / "archive.md"
SCHEMA_VERSION = 3
SUPPORTED_SCHEMA_VERSIONS = (1, 2, SCHEMA_VERSION)
RESULT_IDENTITY_KIND = "archive-introducing-commit"
COMPLETION_EVIDENCE_KIND = "prearchive-workspace-v1"
ACTIVE_PHASES = ("planning", "design", "implementation", "verification", "finish")
PHASES = ACTIVE_PHASES + ("archived",)
INTENSITIES = ("low-risk", "feature", "high-risk")
LAYOUTS = ("standard",)
WORKSPACE_KINDS = ("standard", "parent")
GATE_NAMES = (
    "acceptance", "decisions", "scoping", "risk", "implementation", "check",
    "review", "finish",
)
CORE_REQUIRED_GATES = (
    "acceptance", "scoping", "implementation", "check", "review", "finish",
)
GATE_STATUSES = (
    "pending", "passed", "accepted_gaps", "not_required", "blocked",
)
TRANSITIONS = {
    "planning": {"design", "implementation"},
    "design": {"planning", "implementation"},
    "implementation": {"planning", "verification"},
    "verification": {"implementation", "finish"},
    "finish": {"implementation"},
    "archived": set(),
}
DELIVERY_SOURCE_POLICY_VERSION = 1
RIGHT_SIZING_POLICY_VERSION = 1
RIGHT_SIZING_CONTRACT_POLICY_VERSION = 1
PARALLEL_ASSESSMENT_POLICY_VERSION = 2
CHECK_EVIDENCE_POLICY_VERSION = 1
CHECK_ACCEPTED_FAILURES_POLICY_VERSION = 1
REVIEW_CONVERGENCE_POLICY_VERSION = 2
SUPPORTED_REVIEW_CONVERGENCE_POLICIES = (1, REVIEW_CONVERGENCE_POLICY_VERSION)
REVIEW_LEDGER_POLICY_VERSION = 1
SAME_ROOT_FAILURE_LIMIT = 2
REVIEW_IMPACTS = (
    "initial", "spec-only", "standards-only", "shared", "final", "scope-change",
    "check-recovery",
)
REVIEW_AXES = ("spec-review", "standards-review")
PARALLEL_DECISIONS = ("pending", "serial", "batch-plan")
RIGHT_SIZING_ROUTES = {
    "acceptance": ("accept-slice", "split-required", "batch-mechanical"),
    "continuation": (
        "continue", "diagnose", "reconcile-contract", "split-remainder",
    ),
}
RIGHT_SIZING_CONTINUATION_TRIGGERS = {
    "continue": ("no-progress",),
    "diagnose": ("same-root-failure",),
    "reconcile-contract": ("contract-conflict", "reviewer-scope-expansion"),
    "split-remainder": ("independent-remainders",),
}
GITHUB_ISSUE_URL = re.compile(
    r"https://github\.com/([^/]+)/([^/]+)/issues/([1-9][0-9]*)/?"
)


def today() -> str:
    return dt.date.today().isoformat()


def timestamp() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def session_stamp() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def require_slug(raw: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9._-]+", raw):
        raise SystemExit("slug must contain only letters, numbers, dot, underscore, or dash")
    return raw


def workflow_dir(slug: str) -> Path:
    return WORKSPACE / require_slug(slug)


def state_path(slug: str) -> Path:
    return workflow_dir(slug) / "workflow.json"


def replace_placeholders(path: Path, slug: str) -> None:
    for file in path.rglob("*"):
        if not file.is_file():
            continue
        text = file.read_text(encoding="utf-8")
        text = text.replace("<feature>", slug).replace("<date>", today())
        file.write_text(text, encoding="utf-8")


def active_data() -> dict[str, str]:
    if not ACTIVE.exists():
        return {}
    result: dict[str, str] = {}
    for line in ACTIVE.read_text(encoding="utf-8").splitlines():
        match = re.match(r"\*\*(.+?)\*\*:\s*(.*)", line)
        if match:
            result[match.group(1).lower()] = match.group(2).strip()
    return result


def render_active_data(data: dict[str, str]) -> str:
    def field(label: str, value: str) -> str:
        return f"**{label}**:{f' {value}' if value else ''}\n"

    return (
        "# Active Workflow\n\n"
        + field("Feature", data.get("feature", ""))
        + field("Phase", data.get("phase", ""))
        + field("Updated", data.get("updated", ""))
        + field("Next", data.get("next", ""))
        + field("Branch / Worktree", data.get("branch / worktree", ""))
    )


def write_active_data(data: dict[str, str]) -> None:
    ACTIVE.write_text(
        render_active_data(data),
        encoding="utf-8",
    )


def write_active(slug: str, phase: str, next_action: str = "", branch: str = "") -> None:
    write_active_data(
        {
            "feature": slug,
            "phase": phase,
            "updated": today(),
            "next": next_action,
            "branch / worktree": branch,
        }
    )


def current_branch() -> str:
    result = subprocess.run(
        ["git", "branch", "--show-current"], cwd=ROOT, text=True,
        capture_output=True, check=False,
    )
    return result.stdout.strip()


def gate(status: str = "pending", evidence: str = "") -> dict[str, str]:
    return {"status": status, "evidence": evidence, "updated": timestamp()}


def initial_gates(
    intensity: str, risk_required: bool, decisions_required: bool
) -> dict[str, dict[str, str]]:
    return {name: gate() for name in GATE_NAMES}


def new_state(
    slug: str,
    intensity: str,
    risk_required: bool,
    decisions_required: bool,
    workspace_kind: str = "standard",
    phase: str = "planning",
) -> dict[str, Any]:
    state = {
        "schemaVersion": SCHEMA_VERSION,
        "slug": slug,
        "intensity": intensity,
        "layout": "standard",
        "workspaceKind": workspace_kind,
        "phase": phase,
        "nextAction": "Resolve scope and acceptance criteria",
        "riskRequired": risk_required or intensity == "high-risk",
        "decisionsRequired": decisions_required or intensity == "high-risk",
        "gates": initial_gates(intensity, risk_required, decisions_required),
        "history": [
            {
                "at": timestamp(),
                "type": "created",
                "phase": phase,
                "evidence": "Workflow created",
            }
        ],
        "updated": timestamp(),
    }
    if intensity in ("feature", "high-risk"):
        state["deliverySourcePolicy"] = DELIVERY_SOURCE_POLICY_VERSION
        state["deliverySource"] = {"kind": "pending"}
    return state


def render_workflow_json(state: dict[str, Any]) -> str:
    return json.dumps(state, ensure_ascii=False, indent=2) + "\n"


def save_state(state: dict[str, Any], *, preserve_updated: bool = False) -> None:
    if not preserve_updated:
        state["updated"] = timestamp()
    path = state_path(state["slug"])
    path.write_text(render_workflow_json(state), encoding="utf-8")
    (path.parent / "state.md").write_text(render_state(state), encoding="utf-8")


def load_state(slug: str) -> dict[str, Any]:
    path = state_path(slug)
    if not path.exists():
        raise SystemExit(
            f"missing current workflow state: {path.relative_to(ROOT).as_posix()}"
        )
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"invalid workflow state: {exc}") from exc
    return state


def render_state(state: dict[str, Any]) -> str:
    lines = [
        f"# Workflow State: `{state['slug']}`",
        "",
        f"**Phase**: {state['phase']}",
        f"**Intensity**: {state['intensity']}",
    ]
    if "layout" in state:
        lines.append(f"**Layout**: {state['layout']}")
    assessment = state.get("parallelAssessment")
    if isinstance(assessment, dict):
        reassessments = state.get("parallelReassessments", [])
        if isinstance(reassessments, list) and reassessments:
            current = reassessments[-1]
            lines.append(
                f"**Initial execution topology**: "
                f"{assessment.get('decision', 'pending')} "
                f"({assessment.get('readyUnits', 0)} ready units)"
            )
            lines.append(
                f"**Current execution topology**: "
                f"{current.get('decision', 'pending')} "
                f"({current.get('readyUnits', 0)} ready units)"
            )
            lines.append(f"**Topology trigger**: {current.get('trigger', '')}")
            lines.append(f"**Topology reason**: {current.get('reason', '')}")
        else:
            lines.append(
                f"**Execution topology**: {assessment.get('decision', 'pending')} "
                f"({assessment.get('readyUnits', 0)} ready units)"
            )
            if assessment.get("reason"):
                lines.append(f"**Topology reason**: {assessment['reason']}")
    right_sizing = state.get("rightSizingAssessments")
    if isinstance(right_sizing, list) and right_sizing:
        current_right_sizing = right_sizing[-1]
        lines.append(
            f"**Right-sizing**: {current_right_sizing.get('stage', '')} / "
            f"{current_right_sizing.get('route', '')}"
        )
    source = state.get("deliverySource")
    if isinstance(source, dict):
        if source.get("kind") == "tracker":
            lines.append(f"**Delivery source**: GitHub Issue {source.get('url', '')}")
        elif source.get("kind") == "local-only":
            lines.append(
                "**Delivery source**: approved local-only — "
                f"{source.get('reason', '')} (approval: {source.get('approval', '')})"
            )
        else:
            lines.append("**Delivery source**: pending")
    lines.extend([
        f"**Updated**: {state['updated'][:10]}",
        "**Owner**: AI coding session",
        "",
        "## Next action",
        "",
        f"- [ ] {state['nextAction']}",
        "",
        "## Gate summary",
        "",
        "| Gate | Status | Evidence |",
        "| --- | --- | --- |",
    ])
    for name in GATE_NAMES:
        receipt = state["gates"][name]
        evidence = receipt.get("evidence", "").replace("|", "\\|")
        lines.append(f"| {name} | {receipt['status']} | {evidence} |")
    lines.extend(
        [
            "",
            "## Phase history",
            "",
            "| Date | Event | Phase/gate | Evidence |",
            "| --- | --- | --- | --- |",
        ]
    )
    for event in state["history"]:
        subject = event.get("gate", event.get("phase", ""))
        evidence = event.get("evidence", "").replace("|", "\\|")
        lines.append(
            f"| {event['at'][:10]} | {event['type']} | {subject} | {evidence} |"
        )
    if state["phase"] == "archived":
        identity = state.get("resultIdentity")
        current_identity = isinstance(identity, dict)
        result = identity.get("kind", "") if current_identity else state.get("resultCommit", "")
        result_label = "Result identity" if current_identity else "Result commit"
        lines.extend(
            [
                "",
                "## Archive",
                "",
                f"- Archived at: `{state['archivedAt']}`",
                f"- {result_label}: `{result}`",
                f"- Summary: {state['archiveSummary']}",
                f"- Follow-up: {state['archiveFollowUp']}",
            ]
        )
    return "\n".join(lines) + "\n"


def required_for_phase(state: dict[str, Any], phase: str) -> list[str]:
    if phase in ("planning", "design"):
        return []
    if phase == "implementation":
        return ["acceptance", "decisions", "scoping", "risk"]
    if phase == "verification":
        return required_for_phase(state, "implementation") + ["implementation"]
    if phase == "finish":
        return required_for_phase(state, "verification") + ["check", "review"]
    if phase == "archived":
        return required_for_phase(state, "finish") + ["finish"]
    raise ValueError(f"unknown phase: {phase}")


def receipt_satisfies(name: str, status: str) -> bool:
    if status in ("passed", "not_required"):
        return True
    return name in ("check", "review", "finish") and status == "accepted_gaps"


def right_sizing_acceptance(state: dict[str, Any]) -> dict[str, Any] | None:
    assessments = state.get("rightSizingAssessments")
    if not isinstance(assessments, list):
        return None
    start = state.get("rightSizingEpochStart", 0)
    if type(start) is not int or not 0 <= start <= len(assessments):
        return None
    matches = [
        item for item in assessments
        [start:]
        if isinstance(item, dict) and item.get("stage") == "acceptance"
    ]
    return matches[-1] if matches else None


def right_sizing_acceptance_required(state: dict[str, Any]) -> bool:
    return state.get("rightSizingAcceptanceRequired") is True or (
        right_sizing_acceptance(state) is not None
    )


def right_sizing_continuation_trigger(state: dict[str, Any]) -> str | None:
    history = state.get("history")
    if not isinstance(history, list):
        return None
    last_continue = max(
        (
            index for index, item in enumerate(history)
            if isinstance(item, dict) and item.get("type") == "replan"
        ),
        default=-1,
    )
    for index, item in enumerate(history):
        if (
            isinstance(item, dict)
            and item.get("type") == "right_sizing_assessment"
            and item.get("stage") == "continuation"
            and item.get("route") == "continue"
        ):
            last_continue = max(last_continue, index)
    def boundary_results(gate_name: str, phase: str) -> list[str]:
        boundary = None
        results: dict[int, str] = {}
        for index, item in enumerate(history[last_continue + 1:], last_continue + 1):
            if not isinstance(item, dict):
                continue
            if item.get("type") == "transition" and item.get("phase") == phase:
                boundary = index
            elif (
                boundary is not None
                and item.get("type") == "gate"
                and item.get("gate") == gate_name
                and item.get("status") in ("passed", "blocked")
            ):
                results[boundary] = item["status"]
        return list(results.values())

    review_results = boundary_results("review", "verification")
    if len(review_results) >= 2 and review_results[-2:] == ["blocked", "blocked"]:
        return "repeated blocked review boundaries"
    implementation_results = boundary_results("implementation", "implementation")
    if (
        len(implementation_results) >= 2
        and implementation_results[-2:] == ["blocked", "blocked"]
    ):
        return "repeated blocked implementation attempts"
    return None


def prerequisite_errors(state: dict[str, Any], phase: str) -> list[str]:
    errors = []
    for name in required_for_phase(state, phase):
        status = state["gates"].get(name, {}).get("status", "missing")
        if not receipt_satisfies(name, status):
            errors.append(f"{phase} requires {name}=passed, found {status}")
    if phase == "implementation":
        source = state.get("deliverySource")
        if (
            state.get("intensity") in ("feature", "high-risk")
            and (
                state.get("deliverySourcePolicy") != DELIVERY_SOURCE_POLICY_VERSION
                or not isinstance(source, dict)
                or source.get("kind") == "pending"
            )
        ):
            errors.append(
                "implementation requires a tracker Issue or approved local-only "
                "delivery source; delivery source is pending"
            )
        if state.get("rightSizingPolicy") == RIGHT_SIZING_POLICY_VERSION:
            acceptance = right_sizing_acceptance(state)
            if right_sizing_acceptance_required(state) and acceptance is None:
                errors.append(
                    "implementation requires a right-sizing acceptance assessment"
                )
            elif acceptance is not None and acceptance.get("route") == "split-required":
                errors.append(
                    "implementation blocked: right-sizing acceptance assessment "
                    "requires candidate decomposition"
                )
            trigger = right_sizing_continuation_trigger(state)
            if trigger:
                continuations = [
                    item for item in state.get("rightSizingAssessments", [])
                    if isinstance(item, dict)
                    and item.get("stage") == "continuation"
                ]
                route = continuations[-1].get("route") if continuations else None
                route_detail = (
                    f"; latest route {route} does not authorize another broad attempt"
                    if route and route != "continue" else ""
                )
                errors.append(
                    "implementation requires a right-sizing continuation "
                    f"reassessment after {trigger}{route_detail}"
                )
    return errors


def project_tracker() -> dict[str, Any]:
    path = ROOT / ".ai" / "project.json"
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    tracker = config.get("tracker") if isinstance(config, dict) else None
    return tracker if isinstance(tracker, dict) else {}


def parsed_issue_url(raw: str) -> tuple[str, str]:
    url = single_line(raw, "tracker URL")
    match = GITHUB_ISSUE_URL.fullmatch(url)
    if not match:
        raise SystemExit(
            "tracker source requires an absolute GitHub Issue URL: "
            "https://github.com/OWNER/REPOSITORY/issues/NUMBER"
        )
    return url, f"{match.group(1)}/{match.group(2)}"


def validated_issue_url(raw: str) -> tuple[str, str]:
    url, actual = parsed_issue_url(raw)
    tracker = project_tracker()
    if tracker.get("provider") == "none":
        raise SystemExit("tracker provider is none; use an approved local-only source")
    target = tracker.get("target")
    if isinstance(target, str) and target and actual.casefold() != target.casefold():
        raise SystemExit(
            f"GitHub Issue URL target {actual} does not match configured tracker target {target}"
        )
    return url, actual


def ensure_unique_non_archived_tracker_source(slug: str, url: str) -> None:
    identity = url.rstrip("/").casefold()
    for candidate in sorted(WORKSPACE.iterdir()):
        if candidate.name in (slug, "template") or not candidate.is_dir():
            continue
        candidate_state_path = candidate / "workflow.json"
        if not candidate_state_path.is_file():
            continue
        try:
            candidate_state = json.loads(
                candidate_state_path.read_text(encoding="utf-8")
            )
        except (OSError, json.JSONDecodeError) as exc:
            raise SystemExit(
                "cannot verify tracker Issue uniqueness because Workspace state "
                f"is invalid: {candidate.name}: {exc}"
            ) from exc
        if candidate_state.get("phase") == "archived":
            continue
        candidate_source = candidate_state.get("deliverySource")
        if not isinstance(candidate_source, dict):
            continue
        if candidate_source.get("kind") != "tracker":
            continue
        candidate_url = candidate_source.get("url")
        if not isinstance(candidate_url, str):
            raise SystemExit(
                "cannot verify tracker Issue uniqueness because Workspace has "
                f"an invalid tracker source: {candidate.name}"
            )
        if candidate_url.rstrip("/").casefold() == identity:
            raise SystemExit(
                "tracker Issue already belongs to non-archived Workspace: "
                f"{candidate.name}"
            )


def delivery_source_line(source: dict[str, Any]) -> str:
    if source.get("kind") == "tracker":
        return f"- Delivery source: GitHub Issue {source['url']}"
    return (
        f"- Delivery source: approved local-only — {source['reason']} "
        f"(approval: {source['approval']})"
    )


def load_check_module():
    path = ROOT / "scripts" / "workflow-check.py"
    spec = importlib.util.spec_from_file_location("workflow_check", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow-check.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_review_module():
    path = ROOT / "scripts" / "workflow-review.py"
    spec = importlib.util.spec_from_file_location("workflow_review", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow-review.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_candidate_module():
    path = ROOT / "scripts" / "workflow-candidate.py"
    spec = importlib.util.spec_from_file_location("workflow_candidate_state", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow-candidate.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def checked_candidate(state: dict[str, Any]) -> dict[str, str]:
    value = state.get("checkedCandidate")
    expected = {"identityKind", "baseCommit", "candidateFingerprint"}
    if not isinstance(value, dict) or set(value) != expected:
        raise SystemExit("final review requires a bound staged final check candidate")
    if value.get("identityKind") not in (
        "staged-candidate-v1", "worktree-candidate-v1",
    ):
        raise SystemExit("final review requires a checked candidate identity")
    if not isinstance(value.get("candidateFingerprint"), str) or not value[
        "candidateFingerprint"
    ].strip():
        raise SystemExit("final review candidate identity is invalid")
    if value["identityKind"] == "worktree-candidate-v1":
        return value
    if not isinstance(value.get("baseCommit"), str) or not value["baseCommit"].strip():
        raise SystemExit("final review candidate base is invalid")
    try:
        current = load_candidate_module().inspect_candidate(
            ROOT, value["baseCommit"], str(state.get("slug", "")),
        )
    except RuntimeError as exc:
        raise SystemExit(f"final review candidate is unavailable: {exc}") from exc
    if current.get("candidateFingerprint") != value["candidateFingerprint"]:
        raise SystemExit("final review candidate changed after the final check")
    return value


def final_review_errors(state: dict[str, Any]) -> list[str]:
    final = state.get("finalReview")
    review_status = state.get("gates", {}).get("review", {}).get("status")
    if final is None:
        return [] if review_status == "pending" else ["review gate requires finalReview"]
    if not isinstance(final, dict) or set(final) != {"candidate", "outcomes"}:
        return ["finalReview must contain only candidate and outcomes"]
    if final.get("candidate") != state.get("checkedCandidate"):
        return ["finalReview candidate must match the final check candidate"]
    outcomes = final.get("outcomes")
    if not isinstance(outcomes, dict) or not set(outcomes).issubset(set(REVIEW_AXES)):
        return ["finalReview outcomes contain an invalid review axis"]
    errors: list[str] = []
    for axis, outcome in outcomes.items():
        if not isinstance(outcome, dict) or set(outcome) != {"status", "evidence"}:
            errors.append(f"finalReview {axis} outcome is invalid")
        elif outcome.get("status") not in ("accepted", "accepted_gaps", "blocked"):
            errors.append(f"finalReview {axis} status is invalid")
        elif not isinstance(outcome.get("evidence"), str) or not outcome["evidence"].strip():
            errors.append(f"finalReview {axis} evidence is required")
    if review_status in ("passed", "accepted_gaps", "blocked"):
        if set(outcomes) != set(REVIEW_AXES):
            errors.append("review gate requires both final review outcomes")
        statuses = {item.get("status") for item in outcomes.values() if isinstance(item, dict)}
        if review_status == "passed" and statuses != {"accepted"}:
            errors.append("review=passed requires both final axes accepted")
        if review_status == "accepted_gaps" and (
            "accepted_gaps" not in statuses or "blocked" in statuses
        ):
            errors.append(
                "review=accepted_gaps requires an explicit accepted gap and no "
                "blocked final axis"
            )
        if review_status == "blocked" and "blocked" not in statuses:
            errors.append("review=blocked requires a blocked final axis")
    return errors


def is_zoned_timestamp(value: Any) -> bool:
    try:
        parsed = dt.datetime.fromisoformat(value)
        return parsed.tzinfo is not None
    except (TypeError, ValueError):
        return False


def check_binding_errors(
    state: dict[str, Any], path: Path, *, current_scope: bool | None = None
) -> list[str]:
    receipt = state.get("gates", {}).get("check", {})
    status = receipt.get("status")
    structured_statuses = ("passed", "accepted_gaps")
    if status not in structured_statuses:
        if any(
            key in state
            for key in (
                "checkEvidencePolicy", "checkRunId", "checkRunFingerprint",
                "checkedCandidate", "checkAcceptedFailures",
                "checkAcceptedFailuresFingerprint",
            )
        ):
            return [
                "structured check binding requires check=passed or "
                "check=accepted_gaps"
            ]
        return []
    errors: list[str] = []
    try:
        accepted_failure_indexes = accepted_check_failure_indexes(state)
    except SystemExit as exc:
        errors.append(str(exc))
        accepted_failure_indexes = ()
    version = state.get("checkEvidencePolicy")
    run_id = state.get("checkRunId")
    fingerprint = state.get("checkRunFingerprint")
    if version is None and run_id is None and fingerprint is None:
        return errors + [
            f"check={status} requires a bound structured workflow-check run"
        ]
    if type(version) is not int or version != CHECK_EVIDENCE_POLICY_VERSION:
        errors.append(
            f"checkEvidencePolicy must be {CHECK_EVIDENCE_POLICY_VERSION}"
        )
    if not isinstance(run_id, str) or not run_id.strip():
        return errors + ["checkRunId must be a non-empty string"]
    if not isinstance(fingerprint, str) or not re.fullmatch(r"[0-9a-f]{64}", fingerprint):
        errors.append("checkRunFingerprint must be a SHA-256 hex digest")
    try:
        check_module = load_check_module()
        errors.extend(
            check_module.formal_run_binding_errors(
                state.get("slug", ""), run_id, fingerprint,
                current_scope=(
                    state.get("phase") != "archived"
                    if current_scope is None else current_scope
                ),
                current_config=(
                    state.get("phase") != "archived"
                    if current_scope is None else current_scope
                ),
                accepted_failure_indexes=accepted_failure_indexes,
            )
        )
        if (
            isinstance(fingerprint, str)
            and check_module.formal_run_fingerprint(
                state.get("slug", ""), run_id
            ) != fingerprint
        ):
            errors.append("bound structured check run content changed")
        records = check_module.evidence_records(path / "evidence" / "checks.jsonl")
        run = [item for item in records if item.get("runId") == run_id]
        if not records or records[-1].get("runId") != run_id:
            errors.append("bound structured check run is not the final evidence run")
        if run:
            identity = run[0]
            expected_candidate = (
                {
                    "identityKind": "staged-candidate-v1",
                    "baseCommit": identity.get("candidateBaseCommit"),
                    "candidateFingerprint": identity.get("candidateFingerprint"),
                }
                if identity.get("identityKind") == "staged-candidate-v1"
                else {
                    "identityKind": "worktree-candidate-v1",
                    "baseCommit": str(identity.get("head", "")),
                    "candidateFingerprint": identity.get("scopeFingerprint"),
                }
            )
            if state.get("checkedCandidate") != expected_candidate:
                errors.append(
                    "checkedCandidate does not match the bound structured check run"
                )
    except (RuntimeError, OSError, SystemExit) as exc:
        errors.append(f"cannot validate bound structured check run: {exc}")
    return errors


def check_accepted_failures_fingerprint(state: dict[str, Any]) -> str:
    payload = {
        "policy": state.get("checkAcceptedFailures"),
        "runId": state.get("checkRunId"),
        "runFingerprint": state.get("checkRunFingerprint"),
        "candidate": state.get("checkedCandidate"),
    }
    canonical = json.dumps(
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def accepted_check_failure_indexes(state: dict[str, Any]) -> tuple[int, ...]:
    status = state.get("gates", {}).get("check", {}).get("status")
    if status != "accepted_gaps":
        if any(
            key in state for key in (
                "checkAcceptedFailures", "checkAcceptedFailuresFingerprint",
            )
        ):
            raise SystemExit(
                "accepted failure policy requires check=accepted_gaps"
            )
        return ()
    value = state.get("checkAcceptedFailures")
    expected = {"policyVersion", "commandIndexes", "approval"}
    if not isinstance(value, dict) or set(value) != expected:
        raise SystemExit(
            "check=accepted_gaps requires a canonical checkAcceptedFailures policy"
        )
    if value.get("policyVersion") != CHECK_ACCEPTED_FAILURES_POLICY_VERSION:
        raise SystemExit(
            "checkAcceptedFailures policyVersion must be "
            f"{CHECK_ACCEPTED_FAILURES_POLICY_VERSION}"
        )
    indexes = value.get("commandIndexes")
    if not isinstance(indexes, list) or not indexes:
        raise SystemExit("checkAcceptedFailures commandIndexes must be non-empty")
    if any(type(index) is not int or index < 0 for index in indexes):
        raise SystemExit(
            "checkAcceptedFailures commandIndexes must be non-negative integers"
        )
    if indexes != sorted(indexes) or len(set(indexes)) != len(indexes):
        raise SystemExit(
            "checkAcceptedFailures commandIndexes must be sorted and unique"
        )
    approval = value.get("approval")
    if not isinstance(approval, str) or not approval.strip():
        raise SystemExit("checkAcceptedFailures approval must be non-empty")
    fingerprint = state.get("checkAcceptedFailuresFingerprint")
    if not isinstance(fingerprint, str) or not re.fullmatch(
        r"[0-9a-f]{64}", fingerprint,
    ):
        raise SystemExit(
            "checkAcceptedFailuresFingerprint must be a SHA-256 hex digest"
        )
    if fingerprint != check_accepted_failures_fingerprint(state):
        raise SystemExit("checkAcceptedFailures fingerprint changed")
    return tuple(indexes)


def clear_check_binding(state: dict[str, Any]) -> None:
    for key in (
        "checkEvidencePolicy", "checkRunId", "checkRunFingerprint",
        "checkedCandidate", "checkAcceptedFailures",
        "checkAcceptedFailuresFingerprint", "finalReview", "completionEvidence",
    ):
        state.pop(key, None)


def committed_parallel_reassessments(path: Path) -> tuple[list[dict[str, Any]], str]:
    """Return the HEAD baseline list, or an error when committed evidence is invalid."""
    relative = (path / "workflow.json").relative_to(ROOT).as_posix()
    shown = subprocess.run(
        ["git", "show", f"HEAD:{relative}"], cwd=ROOT, text=True,
        capture_output=True, check=False,
    )
    if shown.returncode:
        return [], ""
    try:
        committed = json.loads(shown.stdout)
    except json.JSONDecodeError:
        return [], "committed workflow state is invalid JSON"
    baseline = committed.get("parallelReassessments", [])
    if not isinstance(baseline, list):
        return [], "committed parallelReassessments must be a list"
    return baseline, ""


def parallel_assessment_errors(state: dict[str, Any], path: Path) -> list[str]:
    version = state.get("parallelAssessmentPolicy")
    assessment = state.get("parallelAssessment")
    reassessments = state.get("parallelReassessments")
    if version is None and assessment is None and reassessments is None:
        return []
    errors: list[str] = []
    if version != PARALLEL_ASSESSMENT_POLICY_VERSION:
        errors.append(
            "parallelAssessmentPolicy must be "
            f"{PARALLEL_ASSESSMENT_POLICY_VERSION}"
        )
    if not isinstance(assessment, dict):
        return errors + ["parallelAssessment must be an object"]
    decision = assessment.get("decision")
    if decision != "batch-plan":
        errors.append("initial parallel assessment must be batch-plan")
    ready_units = assessment.get("readyUnits")
    if type(ready_units) is not int or ready_units < 0:
        errors.append("parallel assessment readyUnits must be a non-negative integer")
    reason = assessment.get("reason")
    if not isinstance(reason, str):
        errors.append("parallel assessment reason must be a string")
    elif not reason.strip():
        errors.append("completed parallel opportunity assessment requires a reason")
    if type(ready_units) is int and ready_units < 2:
        errors.append("batch-plan parallel assessment requires at least two ready units")
    if not isinstance(reassessments, list):
        errors.append("parallelReassessments must be a list")
    else:
        for index, item in enumerate(reassessments, 1):
            label = f"parallel re-evaluation {index}"
            if not isinstance(item, dict):
                errors.append(f"{label} must be an object")
                continue
            if item.get("decision") not in ("serial", "batch-plan"):
                errors.append(f"{label} has invalid decision")
            units = item.get("readyUnits")
            if type(units) is not int or units < 0:
                errors.append(f"{label} readyUnits must be a non-negative integer")
            elif item.get("decision") == "batch-plan" and units < 2:
                errors.append(f"{label} batch-plan requires at least two ready units")
            for field in ("trigger", "reason", "at"):
                value = item.get(field)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"{label} requires non-empty {field}")
        history_items = [
            item for item in state.get("history", [])
            if isinstance(item, dict) and item.get("type") == "parallel_reassessment"
        ]
        projected = [
            {
                key: item.get(key)
                for key in ("decision", "readyUnits", "trigger", "reason", "at")
            }
            for item in history_items
        ]
        if projected != reassessments:
            errors.append("parallel re-evaluations do not match workflow history")
        baseline, baseline_error = committed_parallel_reassessments(path)
        if baseline_error:
            errors.append(baseline_error)
        elif reassessments[:len(baseline)] != baseline:
            errors.append("committed parallel re-evaluation history changed")
    return errors


def committed_right_sizing_assessments(
    path: Path,
) -> tuple[list[dict[str, Any]], bool, dict[str, Any] | None, str]:
    relative = (path / "workflow.json").relative_to(ROOT).as_posix()
    shown = subprocess.run(
        ["git", "show", f"HEAD:{relative}"], cwd=ROOT, text=True,
        capture_output=True, check=False,
    )
    if shown.returncode:
        return [], False, None, ""
    try:
        committed = json.loads(shown.stdout)
    except json.JSONDecodeError:
        return [], False, None, "committed workflow state is invalid JSON"
    marker_present = (
        "rightSizingPolicy" in committed
        or "rightSizingAssessments" in committed
        or "rightSizingAcceptanceRequired" in committed
        or "rightSizingContractPolicy" in committed
        or "rightSizingContractPolicyStart" in committed
        or "rightSizingEpochStart" in committed
    )
    baseline = committed.get("rightSizingAssessments", [])
    if not isinstance(baseline, list):
        return (
            [], marker_present, None,
            "committed rightSizingAssessments must be a list",
        )
    metadata = (
        {
            "rightSizingContractPolicy": committed.get(
                "rightSizingContractPolicy"
            ),
            "rightSizingContractPolicyStart": committed.get(
                "rightSizingContractPolicyStart"
            ),
            "rightSizingReplanEpochs": [
                item.get("rightSizingEpochStart")
                for item in committed.get("history", [])
                if isinstance(item, dict) and item.get("type") == "replan"
            ],
        }
        if "rightSizingContractPolicy" in committed
        or "rightSizingContractPolicyStart" in committed
        or "rightSizingEpochStart" in committed
        else None
    )
    return baseline, marker_present, metadata, ""


def committed_marker_free_tracker(path: Path, current_source: dict[str, Any]) -> bool:
    relative = (path / "workflow.json").relative_to(ROOT).as_posix()
    shown = subprocess.run(
        ["git", "show", f"HEAD:{relative}"], cwd=ROOT, text=True,
        capture_output=True, check=False,
    )
    if shown.returncode:
        return False
    try:
        committed = json.loads(shown.stdout)
    except json.JSONDecodeError:
        return False
    source = committed.get("deliverySource")
    markers = (
        "rightSizingPolicy", "rightSizingAssessments",
        "rightSizingAcceptanceRequired", "rightSizingContractPolicy",
        "rightSizingContractPolicyStart",
    )
    return (
        isinstance(source, dict)
        and source.get("kind") == "tracker"
        and source == current_source
        and not any(name in committed for name in markers)
    )


def right_sizing_errors(state: dict[str, Any], path: Path) -> list[str]:
    version = state.get("rightSizingPolicy")
    assessments = state.get("rightSizingAssessments")
    contract_policy = state.get("rightSizingContractPolicy")
    contract_policy_start = state.get("rightSizingContractPolicyStart")
    acceptance_required = state.get("rightSizingAcceptanceRequired")
    epoch_start = state.get("rightSizingEpochStart", 0)
    baseline, committed_marker, committed_contract_policy, baseline_error = (
        committed_right_sizing_assessments(path)
    )
    if (
        version is None and assessments is None
        and contract_policy is None and contract_policy_start is None
        and acceptance_required is None
    ):
        if baseline_error:
            return [baseline_error]
        if committed_marker:
            return ["committed right-sizing policy marker changed"]
        source = state.get("deliverySource")
        if (
            isinstance(source, dict)
            and source.get("kind") == "tracker"
            and not committed_marker_free_tracker(path, source)
        ):
            return [
                "tracker delivery source requires prospective right-sizing policy"
            ]
        return []
    errors: list[str] = []
    if version != RIGHT_SIZING_POLICY_VERSION:
        errors.append(
            f"rightSizingPolicy must be {RIGHT_SIZING_POLICY_VERSION}"
        )
    if acceptance_required is not None and type(acceptance_required) is not bool:
        errors.append("rightSizingAcceptanceRequired must be bool")
    elif acceptance_required is False:
        errors.append("rightSizingAcceptanceRequired cannot be false")
    if not isinstance(assessments, list):
        return errors + ["rightSizingAssessments must be a list"]
    if type(epoch_start) is not int or not 0 <= epoch_start <= len(assessments):
        errors.append("rightSizingEpochStart is invalid")
    assessment_count = 0
    replan_epoch_starts: list[int] = []
    for item in state.get("history", []):
        if not isinstance(item, dict):
            continue
        if item.get("type") == "right_sizing_assessment":
            assessment_count += 1
        elif item.get("type") == "replan":
            marker = item.get("rightSizingEpochStart")
            if type(marker) is not int or marker != assessment_count:
                errors.append("replan right-sizing epoch boundary is invalid")
            else:
                replan_epoch_starts.append(marker)
    expected_epoch_start = replan_epoch_starts[-1] if replan_epoch_starts else 0
    if epoch_start != expected_epoch_start:
        errors.append("rightSizingEpochStart does not match replan history")
    if contract_policy is None and contract_policy_start is not None:
        errors.append(
            "rightSizingContractPolicyStart requires rightSizingContractPolicy"
        )
    if contract_policy is not None:
        if contract_policy != RIGHT_SIZING_CONTRACT_POLICY_VERSION:
            errors.append(
                "rightSizingContractPolicy must be "
                f"{RIGHT_SIZING_CONTRACT_POLICY_VERSION}"
            )
        if (
            type(contract_policy_start) is not int
            or not 0 <= contract_policy_start <= len(assessments)
        ):
            errors.append("rightSizingContractPolicyStart is invalid")
    required_fields = {
        "at", "phase", "stage", "route", "outcome", "acceptanceSeam",
        "dependencies", "reviewBoundary", "rollbackBoundary",
        "contextBoundary", "consequence", "evidence", "remainderSlices",
        "dependencyInterfaces", "safeStop",
    }
    optional_fields = {"contractFingerprint", "trigger"}
    acceptance_count = 0
    for index, item in enumerate(assessments, 1):
        label = f"right-sizing assessment {index}"
        if (
            not isinstance(item, dict)
            or not required_fields.issubset(item)
            or set(item) - required_fields - optional_fields
        ):
            errors.append(f"{label} has invalid shape")
            continue
        stage = item.get("stage")
        if stage not in RIGHT_SIZING_ROUTES:
            errors.append(f"{label} has invalid stage")
        elif item.get("route") not in RIGHT_SIZING_ROUTES[stage]:
            errors.append(f"{label} has invalid route for {stage}")
        # `epoch_start` is a zero-based slice boundary while `index` is
        # intentionally one-based for diagnostics.
        if stage == "acceptance" and index > epoch_start:
            acceptance_count += 1
        if item.get("phase") not in ACTIVE_PHASES:
            errors.append(f"{label} has invalid phase")
        if not is_zoned_timestamp(item.get("at")):
            errors.append(f"{label} has invalid timestamp")
        contract_fingerprint = item.get("contractFingerprint")
        if contract_fingerprint is not None and not (
            isinstance(contract_fingerprint, str)
            and re.fullmatch(r"[0-9a-f]{64}", contract_fingerprint)
        ):
            errors.append(f"{label} has invalid contractFingerprint")
        trigger = item.get("trigger")
        if stage == "acceptance" and trigger is not None:
            errors.append(f"{label} acceptance must not have a trigger")
        if (
            stage == "continuation"
            and trigger is not None
            and trigger not in RIGHT_SIZING_CONTINUATION_TRIGGERS.get(
                item.get("route"), ()
            )
        ):
            errors.append(f"{label} has invalid trigger for its route")
        if (
            contract_policy == RIGHT_SIZING_CONTRACT_POLICY_VERSION
            and type(contract_policy_start) is int
            and index > contract_policy_start
        ):
            if not isinstance(contract_fingerprint, str):
                errors.append(f"{label} requires contractFingerprint")
            if stage == "acceptance" and item.get("phase") not in (
                "planning", "design",
            ):
                errors.append(
                    f"{label} acceptance requires planning or design phase"
                )
            if stage == "continuation":
                if item.get("phase") not in ("implementation", "verification"):
                    errors.append(
                        f"{label} continuation requires implementation or "
                        "verification phase"
                    )
                if trigger is None:
                    errors.append(f"{label} continuation requires trigger")
        for field in (
            "outcome", "acceptanceSeam", "dependencies", "reviewBoundary",
            "rollbackBoundary", "contextBoundary", "consequence", "evidence",
        ):
            value = item.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{label} requires non-empty {field}")
        split_fields = (
            "remainderSlices", "dependencyInterfaces", "safeStop",
        )
        if item.get("route") == "split-remainder":
            for field in split_fields:
                value = item.get(field)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"{label} requires non-empty {field}")
        elif any(item.get(field) is not None for field in split_fields):
            errors.append(f"{label} has unexpected split-remainder fields")
    if acceptance_count > 1:
        errors.append("right-sizing acceptance assessment is immutable")
    projected = [
        {key: value for key, value in item.items() if key != "type"}
        for item in state.get("history", [])
        if isinstance(item, dict) and item.get("type") == "right_sizing_assessment"
    ]
    if projected != assessments:
        errors.append("right-sizing assessments do not match workflow history")
    if baseline_error:
        errors.append(baseline_error)
    elif assessments[:len(baseline)] != baseline:
        errors.append("committed right-sizing assessment history changed")
    if committed_contract_policy is not None:
        if {
            "rightSizingContractPolicy": committed_contract_policy.get(
                "rightSizingContractPolicy"
            ),
            "rightSizingContractPolicyStart": committed_contract_policy.get(
                "rightSizingContractPolicyStart"
            ),
        } != {
            "rightSizingContractPolicy": contract_policy,
            "rightSizingContractPolicyStart": contract_policy_start,
        }:
            errors.append("committed right-sizing contract policy changed")
        committed_replan_epochs = committed_contract_policy.get(
            "rightSizingReplanEpochs", []
        )
        if (
            not isinstance(committed_replan_epochs, list)
            or replan_epoch_starts[:len(committed_replan_epochs)]
            != committed_replan_epochs
        ):
            errors.append("committed replan epoch history changed")
    return errors


def delivery_source_errors(state: dict[str, Any], path: Path) -> list[str]:
    version = state.get("deliverySourcePolicy")
    source = state.get("deliverySource")
    if version is None and source is None:
        if state.get("intensity") not in ("feature", "high-risk"):
            return []
        return ["Feature/High-risk workflow requires delivery source metadata"]
    errors: list[str] = []
    if version != DELIVERY_SOURCE_POLICY_VERSION:
        errors.append(
            f"deliverySourcePolicy must be {DELIVERY_SOURCE_POLICY_VERSION}"
        )
    if not isinstance(source, dict):
        return errors + ["deliverySource must be an object"]
    kind = source.get("kind")
    if kind not in ("pending", "tracker", "local-only"):
        return errors + [f"invalid delivery source kind: {kind}"]
    if kind == "pending":
        if state.get("phase") == "archived":
            errors.append("archived Feature/High-risk workflow cannot have pending delivery source")
        return errors
    if kind == "tracker":
        try:
            _, actual = parsed_issue_url(source.get("url", ""))
            snapshot = source.get("target")
            if not isinstance(snapshot, str) or actual.casefold() != snapshot.casefold():
                errors.append("tracker delivery source target snapshot does not match URL")
        except SystemExit as exc:
            errors.append(str(exc))
    else:
        for key in ("reason", "approval"):
            value = source.get(key)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"local-only delivery source requires non-empty {key}")
    task_links = path / "task-links.md"
    if task_links.exists():
        expected = delivery_source_line(source)
        if task_links.read_text(encoding="utf-8").splitlines().count(expected) != 1:
            errors.append("delivery source does not match task-links.md")
    return errors


def unresolved_placeholders(path: Path) -> list[str]:
    leftovers = []
    pattern = re.compile(r"<[^>\n]+>")
    for name in (
        "context.md", "decisions.md", "spec-links.md", "task-links.md",
        "contexts/implement.jsonl", "contexts/check.jsonl",
    ):
        file = path / name
        if file.exists() and pattern.search(file.read_text(encoding="utf-8")):
            leftovers.append(file.name)
    return leftovers


def linked_path_errors(path: Path) -> list[str]:
    errors = []
    for name in ("spec-links.md", "task-links.md"):
        file = path / name
        if not file.exists():
            continue
        text = file.read_text(encoding="utf-8")
        for relative in re.findall(r"`((?:docs|scripts|src|tests)/[^`]+)`", text):
            if not (ROOT / relative).exists():
                errors.append(f"{name} links missing path: {relative}")
    return errors


def context_manifest_errors(path: Path) -> list[str]:
    errors = []
    contexts = path / "contexts"
    supported = {"implement.jsonl", "check.jsonl"}
    if contexts.exists():
        for manifest in contexts.glob("*.jsonl"):
            if manifest.name not in supported:
                errors.append(
                    f"unsupported context manifest: contexts/{manifest.name}; "
                    "use implement.jsonl or check.jsonl"
                )
    for role in ("implement", "check"):
        manifest = contexts / f"{role}.jsonl"
        if not manifest.exists():
            continue
        entries = 0
        for line_number, raw_line in enumerate(
            manifest.read_text(encoding="utf-8").splitlines(), start=1
        ):
            if not raw_line.strip():
                continue
            entries += 1
            try:
                entry = json.loads(raw_line)
            except json.JSONDecodeError as exc:
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} invalid JSON: {exc.msg}"
                )
                continue
            if not isinstance(entry, dict):
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} must be a JSON object"
                )
                continue
            relative = entry.get("path")
            reason = entry.get("reason")
            if not isinstance(relative, str) or not relative.strip():
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} requires non-empty path"
                )
                continue
            candidate = Path(relative)
            if candidate.is_absolute() or ".." in candidate.parts:
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} path must be repository-relative"
                )
                continue
            resolved = (ROOT / candidate).resolve()
            if not resolved.is_relative_to(ROOT.resolve()):
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} path must be repository-relative"
                )
            elif not resolved.exists():
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} links missing path: {relative}"
                )
            if not isinstance(reason, str) or not reason.strip():
                errors.append(
                    f"contexts/{role}.jsonl:{line_number} requires non-empty reason"
                )
        if entries == 0:
            errors.append(f"contexts/{role}.jsonl must contain at least one entry")
    return errors


def structural_errors(state: dict[str, Any], expected_slug: str) -> list[str]:
    errors = []
    for retired in (
        "legacyImport", "policyUpgraded", "agentTelemetryPolicy", "agentEvents",
        "reviewAdmissions", "reviewConclusions", "reviewGates",
        "reviewLedgerPolicy", "reviewLedgerStartRevision",
        "reviewConvergencePolicy", "reviewConvergenceV1PrefixLength",
    ):
        if retired in state:
            errors.append(f"retired workflow state field: {retired}")
    schema_version = state.get("schemaVersion")
    if schema_version not in SUPPORTED_SCHEMA_VERSIONS:
        errors.append(
            "schemaVersion must be one of "
            + ", ".join(str(version) for version in SUPPORTED_SCHEMA_VERSIONS)
        )
    if state.get("slug") != expected_slug:
        errors.append("state slug/path mismatch")
    if state.get("intensity") not in INTENSITIES:
        errors.append(f"invalid intensity: {state.get('intensity')}")
    if state.get("layout", "standard") not in LAYOUTS:
        errors.append(f"invalid layout: {state.get('layout')}")
    if schema_version == SCHEMA_VERSION and "workspaceKind" not in state:
        errors.append(f"schema {SCHEMA_VERSION} workflow requires workspaceKind")
    elif state.get("workspaceKind", "standard") not in WORKSPACE_KINDS:
        errors.append(f"invalid workspaceKind: {state.get('workspaceKind')}")
    if state.get("phase") not in PHASES:
        errors.append(f"invalid phase: {state.get('phase')}")
    if state.get("phase") == "archived":
        required = [
            "archivedAt", "archiveDate", "archiveSummary", "archiveFollowUp",
        ]
        required.append("resultIdentity" if schema_version == SCHEMA_VERSION else "resultCommit")
        for name in required:
            value = state.get(name)
            if name == "resultIdentity":
                if value != {"kind": RESULT_IDENTITY_KIND}:
                    errors.append(
                        "current archived workflow requires resultIdentity kind "
                        f"{RESULT_IDENTITY_KIND}"
                    )
            elif not isinstance(value, str) or not value.strip():
                errors.append(f"archived workflow requires {name}")
        if schema_version == SCHEMA_VERSION and "resultCommit" in state:
            errors.append("current archived workflow cannot store resultCommit")
        archive_date = state.get("archiveDate")
        if archive_date is not None and not re.fullmatch(
            r"\d{4}-\d{2}-\d{2}", str(archive_date)
        ):
            errors.append("archiveDate must use YYYY-MM-DD")
    gates = state.get("gates")
    if not isinstance(gates, dict):
        return errors + ["gates must be an object"]
    for name in GATE_NAMES:
        receipt = gates.get(name)
        if not isinstance(receipt, dict):
            errors.append(f"missing gate receipt: {name}")
            continue
        status = receipt.get("status")
        evidence = receipt.get("evidence", "").strip()
        if status not in GATE_STATUSES:
            errors.append(f"invalid {name} gate status: {status}")
        if status != "pending" and not evidence:
            errors.append(f"{name}={status} requires evidence")
        if name in CORE_REQUIRED_GATES and status == "not_required":
            errors.append(f"{name} cannot be not_required for a formal workflow")
    if state.get("decisionsRequired") and gates.get("decisions", {}).get("status") == "not_required":
        errors.append("decisions cannot be not_required when decisionsRequired=true")
    if state.get("riskRequired") and gates.get("risk", {}).get("status") == "not_required":
        errors.append("risk cannot be not_required when riskRequired=true")
    return errors


def prearchive_state_errors(state: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if state.get("phase") != "finish":
        errors.append(
            "pre-archive work candidate phase must be finish: "
            f"{state.get('phase')}"
        )
    if state.get("gates", {}).get("finish", {}).get("status") not in (
        "passed", "accepted_gaps",
    ):
        errors.append("pre-archive work candidate finish gate is not passed")
    errors.extend(final_review_errors(state))
    if state.get("gates", {}).get("review", {}).get("status") not in (
        "passed", "accepted_gaps",
    ):
        errors.append("pre-archive work candidate review gate is not passed")
    terminal_fields = sorted(
        name for name in (
            "archivedAt", "archiveDate", "resultCommit", "resultIdentity",
            "archiveSummary", "archiveFollowUp",
        )
        if name in state
    )
    if terminal_fields:
        errors.append(
            "pre-archive work candidate contains terminal metadata: "
            + ", ".join(terminal_fields)
        )
    history = state.get("history")
    if isinstance(history, list) and any(
        isinstance(event, dict)
        and (
            event.get("type") == "archived"
            or event.get("phase") == "archived"
        )
        for event in history
    ):
        errors.append("pre-archive work candidate contains terminal history")
    return errors


def workflow_errors(
    slug: str,
    require_current_phase: bool = True,
    check_current_scope: bool | None = None,
) -> list[str]:
    path = workflow_dir(slug)
    if not (path / "workflow.json").exists():
        return ["missing workflow file: workflow.json"]
    try:
        state = load_state(slug)
    except SystemExit as exc:
        return [str(exc)]
    required = [
        "state.md", "workflow.json", "context.md", "decisions.md",
        "spec-links.md", "task-links.md", "validation.md", "finish.md",
    ]
    if state.get("workspaceKind") == "parent" or (path / "children.json").exists():
        required.extend(("README.md", "journal.md"))
    errors = [
        f"missing workflow file: {name}" for name in required if not (path / name).exists()
    ]
    if errors:
        return errors
    structure = structural_errors(state, slug)
    errors.extend(structure)
    if (path / "workflow.json").read_text(encoding="utf-8") != render_workflow_json(state):
        errors.append("workflow.json is not canonically serialized")
    errors.extend(
        f"unresolved placeholder: {name}" for name in unresolved_placeholders(path)
    )
    errors.extend(linked_path_errors(path))
    errors.extend(delivery_source_errors(state, path))
    errors.extend(right_sizing_errors(state, path))
    errors.extend(parallel_assessment_errors(state, path))
    errors.extend(final_review_errors(state))
    errors.extend(
        check_binding_errors(state, path, current_scope=check_current_scope)
    )
    errors.extend(completion_evidence_errors(state, slug))
    if (path / "contexts").exists():
        errors.extend(context_manifest_errors(path))
    if require_current_phase and state.get("phase") in PHASES:
        errors.extend(prerequisite_errors(state, state["phase"]))
    if not structure:
        expected = render_state(state)
        state_md = path / "state.md"
        if state_md.exists() and state_md.read_text(encoding="utf-8") != expected:
            errors.append("state.md is not synchronized with workflow.json")
    return errors


def resolve_slug(raw: str) -> str:
    if raw != "active":
        return require_slug(raw)
    slug = active_data().get("feature", "")
    if not slug:
        raise SystemExit("no active workflow")
    return require_slug(slug)


def init_project(_: argparse.Namespace) -> None:
    required = [
        "README.md", "state.md", "workflow.json", "context.md", "decisions.md",
        "spec-links.md", "task-links.md", "validation.md", "journal.md", "finish.md",
        "children.md", "children.json", "integration.md",
        "session.md", "session-index.md", "contexts/implement.jsonl",
        "contexts/check.jsonl", "evidence/checks.jsonl",
    ]
    missing = [name for name in required if not (TEMPLATE / name).exists()]
    if missing:
        raise SystemExit("missing workflow templates: " + ", ".join(missing))
    json.loads((TEMPLATE / "children.json").read_text(encoding="utf-8"))
    json.loads((TEMPLATE / "workflow.json").read_text(encoding="utf-8"))
    print("workflow project initialized")


def create(args: argparse.Namespace) -> None:
    slug = require_slug(args.slug)
    previous_active = active_data()
    destination = workflow_dir(slug)
    if destination.exists():
        raise SystemExit(
            f"workflow already exists: {destination.relative_to(ROOT).as_posix()}"
        )
    shutil.copytree(TEMPLATE, destination)
    replace_placeholders(destination, slug)
    (destination / "session.md").unlink()
    (destination / "session-index.md").unlink(missing_ok=True)
    shutil.rmtree(destination / "sessions", ignore_errors=True)
    shutil.rmtree(destination / "contexts", ignore_errors=True)
    if not args.parent:
        for name in (
            "README.md", "journal.md", "evidence/checks.jsonl",
            "children.md", "children.json", "integration.md",
        ):
            (destination / name).unlink(missing_ok=True)
    state = new_state(
        slug,
        args.intensity,
        args.risk_required,
        args.decisions_required,
        workspace_kind="parent" if args.parent else "standard",
    )
    if previous_active.get("feature") and previous_active.get("feature") != slug:
        state["previousActive"] = previous_active
    save_state(state)
    write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(destination.relative_to(ROOT).as_posix())


def single_line(value: str, label: str) -> str:
    cleaned = value.strip()
    if not cleaned or "\n" in cleaned or "\r" in cleaned:
        raise SystemExit(f"{label} must be a non-empty single line")
    return cleaned


def activate(args: argparse.Namespace) -> None:
    slug = require_slug(args.slug)
    state = load_state(slug)
    if state["phase"] == "archived":
        raise SystemExit(
            f"archived workflow is immutable: {slug}; create a new workflow for follow-up"
        )
    write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(slug)


def show_active(_: argparse.Namespace) -> None:
    data = active_data()
    if not data.get("feature"):
        print("no active workflow")
        return
    print(json.dumps(data, ensure_ascii=False, indent=2))


def status(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    print(json.dumps(load_state(slug), ensure_ascii=False, indent=2))


def ready(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    errors = workflow_errors(slug, require_current_phase=False)
    errors.extend(prerequisite_errors(state, args.phase))
    if state["phase"] != args.phase and args.phase not in TRANSITIONS[state["phase"]]:
        errors.append(f"unsupported transition: {state['phase']} -> {args.phase}")
    if errors:
        raise SystemExit("; ".join(errors))
    print(f"ready: {slug} -> {args.phase}")


def reset_downstream(state: dict[str, Any], phase: str) -> None:
    if phase == "implementation":
        names = ("implementation", "check", "review", "finish")
    elif phase in ("planning", "design"):
        names = ("implementation", "check", "review", "finish")
    else:
        return
    for name in names:
        if state["gates"][name]["status"] != "not_required":
            state["gates"][name] = gate()
    if "check" in names:
        clear_check_binding(state)


def transition(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    current = state["phase"]
    target = args.phase
    if target == current:
        errors = workflow_errors(slug, require_current_phase=False)
        errors.extend(prerequisite_errors(state, target))
        if errors:
            raise SystemExit("; ".join(errors))
        state["nextAction"] = args.next_action or state["nextAction"]
        state["history"].append(
            {
                "at": timestamp(),
                "type": "transition",
                "phase": target,
                "evidence": state["nextAction"],
            }
        )
        save_state(state)
        write_active(slug, target, state["nextAction"], current_branch())
        print(f"{slug}: {target}")
        return
    if target not in TRANSITIONS[current]:
        raise SystemExit(f"unsupported transition: {current} -> {target}")
    errors = workflow_errors(slug, require_current_phase=False)
    errors.extend(prerequisite_errors(state, target))
    if errors:
        raise SystemExit("; ".join(errors))
    if PHASES.index(target) < PHASES.index(current):
        reset_downstream(state, target)
    state["phase"] = target
    state["nextAction"] = args.next_action or f"Continue {target}"
    state["history"].append(
        {
            "at": timestamp(),
            "type": "transition",
            "phase": target,
            "evidence": state["nextAction"],
        }
    )
    save_state(state)
    write_active(slug, target, state["nextAction"], current_branch())
    print(f"{slug}: {target}")


def replan(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if state.get("phase") not in ("implementation", "verification", "finish"):
        raise SystemExit(
            "replan requires implementation, verification, or finish phase"
        )
    gates = state.get("gates", {})
    if not any(
        gates.get(name, {}).get("status") == "blocked"
        for name in ("acceptance", "scoping")
    ):
        raise SystemExit(
            "replan requires blocked acceptance or scoping contract evidence"
        )
    reason = single_line(args.reason, "replan reason")
    next_action = single_line(args.next_action, "replan next action")
    assessments = state.get("rightSizingAssessments", [])
    if not isinstance(assessments, list):
        raise SystemExit("replan requires valid rightSizingAssessments")

    state["phase"] = "planning"
    state["nextAction"] = next_action
    state["gates"] = initial_gates(
        state["intensity"], state["riskRequired"], state["decisionsRequired"]
    )
    clear_check_binding(state)
    if state.get("rightSizingPolicy") == RIGHT_SIZING_POLICY_VERSION:
        state["rightSizingEpochStart"] = len(assessments)
    state["history"].append(
        {
            "at": timestamp(),
            "type": "replan",
            "phase": "planning",
            "evidence": reason,
            "rightSizingEpochStart": len(assessments),
        }
    )
    save_state(state)
    if active_data().get("feature") == slug:
        write_active(slug, "planning", next_action, current_branch())
    print(f"replanned: {slug}")


def finish_evidence_errors(text: str, validation_text: str) -> list[str]:
    headings = (
        "Summary", "Verification", "Whole-diff review", "Rollback or mitigation",
        "Lessons promoted", "Follow-up",
    )
    errors = []
    for index, heading in enumerate(headings):
        next_heading = headings[index + 1] if index + 1 < len(headings) else None
        if next_heading:
            pattern = rf"## {re.escape(heading)}\s*\n(.*?)\n## {re.escape(next_heading)}"
        else:
            pattern = rf"## {re.escape(heading)}\s*\n(.*)\Z"
        match = re.search(pattern, text, re.DOTALL)
        body = match.group(1).strip() if match else ""
        body = re.sub(r"^-\s*`[^`]+`:\s*$", "", body, flags=re.MULTILINE).strip()
        if not body:
            errors.append(f"finish section is empty: {heading}")
    coverage = re.search(
        r"## Acceptance coverage\s*\n(.*?)(?:\n## |\Z)",
        validation_text,
        re.DOTALL,
    )
    rows = []
    if coverage:
        for line in coverage.group(1).splitlines():
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if (
                len(cells) >= 3
                and cells[0].lower() not in ("criterion", "---")
                and not all(set(cell) <= {"-", ":"} for cell in cells[:3])
            ):
                rows.append(cells)
    accepted = {"verified", "accepted gap", "not applicable"}
    if not rows or any(row[1].lower() not in accepted for row in rows):
        errors.append("acceptance coverage is incomplete")
    return errors


def finish_sections_complete(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    validation = path.parent / "validation.md"
    validation_text = validation.read_text(encoding="utf-8") if validation.exists() else ""
    return finish_evidence_errors(text, validation_text)


def completion_workspace_records(slug: str) -> list[tuple[str, str, str, bytes]]:
    workspace = workflow_dir(slug)
    excluded = {"workflow.json", "state.md"}
    records: list[tuple[str, str, str, bytes]] = []
    for path in sorted(workspace.rglob("*")):
        relative = path.relative_to(workspace).as_posix()
        if relative in excluded:
            continue
        metadata = path.lstat()
        if path.is_symlink():
            kind = "symlink"
            mode = "120000"
            data = path.readlink().as_posix().encode(
                "utf-8", errors="surrogateescape",
            )
        elif path.is_file():
            kind = "blob"
            mode = "100755" if metadata.st_mode & stat.S_IXUSR else "100644"
            data = path.read_bytes()
        else:
            continue
        records.append((relative, kind, mode, data))
    return records


def completion_workspace_entries(slug: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for relative, kind, mode, data in completion_workspace_records(slug):
        repository_path = f"docs/workspace/{slug}/{relative}"
        object_id = worktree_index_object_id(repository_path, mode, data)
        if object_id is None:
            raise OSError(f"cannot hash completion Workspace entry: {relative}")
        entries.append({
            "path": relative,
            "kind": kind,
            "mode": mode,
            "object": object_id,
        })
    return entries


def worktree_index_object_id(relative: str, mode: str, data: bytes) -> str | None:
    global GIT_ATTRIBUTE_SOURCE
    command = ["git", "hash-object"]
    if mode == "120000":
        command.append("--no-filters")
    else:
        command.append(f"--path={relative}")
    command.append("--stdin")
    if not GIT_ATTRIBUTE_SOURCE:
        tree = subprocess.run(
            ["git", "write-tree"], cwd=GIT_ROOT, text=True,
            capture_output=True, check=False,
        )
        if tree.returncode:
            return None
        GIT_ATTRIBUTE_SOURCE = tree.stdout.strip()
    environment = os.environ.copy()
    environment["GIT_ATTR_SOURCE"] = GIT_ATTRIBUTE_SOURCE
    result = subprocess.run(
        command, cwd=GIT_ROOT, input=data, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, check=False, env=environment,
    )
    if result.returncode:
        return None
    return result.stdout.decode("ascii").strip()


def completion_workspace_index_errors(slug: str) -> list[str]:
    prefix = f"docs/workspace/{slug}/"
    excluded = {f"{prefix}workflow.json", f"{prefix}state.md"}
    expected: dict[str, tuple[str, str]] = {}
    errors: list[str] = []
    for relative, _, mode, data in completion_workspace_records(slug):
        repository_path = f"{prefix}{relative}"
        object_id = worktree_index_object_id(
            repository_path, mode, data,
        )
        if object_id is None:
            errors.append(f"cannot hash completion Workspace entry: {relative}")
            continue
        expected[repository_path] = (mode, object_id)
    listed = subprocess.run(
        ["git", "ls-files", "--stage", "-z", "--", prefix],
        cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if listed.returncode:
        return errors + ["cannot inspect completion Workspace index"]
    actual: dict[str, tuple[str, str]] = {}
    for record in (item for item in listed.stdout.split(b"\0") if item):
        try:
            metadata, listed_path = record.split(b"\t", 1)
            mode, object_id, stage = metadata.decode("ascii").split()
            path = listed_path.decode("utf-8", errors="surrogateescape")
        except (ValueError, UnicodeDecodeError):
            errors.append("cannot parse completion Workspace index entry")
            continue
        if path in excluded:
            continue
        if stage != "0" or path in actual:
            errors.append(f"completion Workspace index entry is unmerged: {path}")
            continue
        object_type = subprocess.run(
            ["git", "cat-file", "-t", object_id], cwd=ROOT, text=True,
            capture_output=True, check=False,
        )
        if object_type.returncode or object_type.stdout.strip() != "blob":
            errors.append(f"completion Workspace index entry is not a blob: {path}")
        actual[path] = (mode, object_id)
    if actual != expected:
        errors.append("completion Workspace index differs from the bound snapshot")
    return errors


def completion_prearchive_state(
    state: dict[str, Any], *, preserve_evidence: bool = False,
) -> dict[str, Any]:
    projected = json.loads(json.dumps(state))
    identity = projected.get("completionEvidence")
    if not preserve_evidence:
        projected.pop("completionEvidence", None)
    if projected.get("phase") == "archived" and isinstance(identity, dict):
        projected["schemaVersion"] = identity.get("prearchiveSchemaVersion")
        projected["phase"] = "finish"
        projected["nextAction"] = identity.get("prearchiveNextAction")
        projected["updated"] = identity.get("prearchiveUpdated")
        for name in (
            "archivedAt", "archiveDate", "resultCommit", "resultIdentity",
            "archiveSummary", "archiveFollowUp",
        ):
            projected.pop(name, None)
        history = projected.get("history")
        if isinstance(history, list) and history:
            projected["history"] = history[:-1]
    return projected


def completion_fingerprint(
    state: dict[str, Any], slug: str, *,
    prearchive_active: dict[str, Any] | None = None,
    prearchive_archive_object: str | None = None,
) -> str:
    identity = state.get("completionEvidence")
    if isinstance(identity, dict):
        if prearchive_active is None:
            prearchive_active = identity.get("prearchiveActive")
        if prearchive_archive_object is None:
            prearchive_archive_object = identity.get("prearchiveArchiveObject")
    payload = {
        "kind": COMPLETION_EVIDENCE_KIND,
        "state": completion_prearchive_state(state),
        "prearchiveActive": prearchive_active,
        "prearchiveArchiveObject": prearchive_archive_object,
        "workspaceEntries": completion_workspace_entries(slug),
    }
    canonical = json.dumps(
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def build_completion_evidence(state: dict[str, Any], slug: str) -> dict[str, Any]:
    archive_relative = ARCHIVE.relative_to(ROOT).as_posix()
    archive_object = worktree_index_object_id(
        archive_relative, "100644", ARCHIVE.read_bytes(),
    )
    if archive_object is None:
        raise SystemExit("cannot bind the pre-archive workflow archive object")
    prearchive_active = active_data()
    return {
        "kind": COMPLETION_EVIDENCE_KIND,
        "prearchiveSchemaVersion": state.get("schemaVersion"),
        "prearchiveNextAction": state.get("nextAction"),
        "prearchiveUpdated": state.get("updated"),
        "prearchiveActive": prearchive_active,
        "prearchiveArchiveObject": archive_object,
        "fingerprint": completion_fingerprint(
            state, slug, prearchive_active=prearchive_active,
            prearchive_archive_object=archive_object,
        ),
    }


def completion_evidence_inventory_errors(slug: str) -> list[str]:
    evidence = workflow_dir(slug) / "evidence"
    actual = {
        path.relative_to(evidence).as_posix()
        for path in evidence.rglob("*")
        if path.is_file() or path.is_symlink()
    } if evidence.exists() else set()
    if actual != {"checks.jsonl"}:
        return [
            "completion evidence inventory must contain only evidence/checks.jsonl"
        ]
    return []


def completion_evidence_errors(state: dict[str, Any], slug: str) -> list[str]:
    identity = state.get("completionEvidence")
    required = (
        state.get("phase") == "finish"
        and state.get("gates", {}).get("finish", {}).get("status")
        in ("passed", "accepted_gaps")
    ) or (
        state.get("phase") == "archived"
        and state.get("schemaVersion") == SCHEMA_VERSION
    )
    if not required and identity is None:
        return []
    inventory_errors = completion_evidence_inventory_errors(slug)
    expected_keys = {
        "kind", "prearchiveSchemaVersion", "prearchiveNextAction",
        "prearchiveUpdated", "prearchiveActive", "prearchiveArchiveObject",
        "fingerprint",
    }
    if not isinstance(identity, dict) or set(identity) != expected_keys:
        return inventory_errors + ["completion evidence identity is missing or malformed"]
    errors: list[str] = list(inventory_errors)
    if identity.get("kind") != COMPLETION_EVIDENCE_KIND:
        errors.append("completion evidence kind is invalid")
    active = identity.get("prearchiveActive")
    if not isinstance(active, dict) or set(active) != {
        "feature", "phase", "updated", "next", "branch / worktree",
    }:
        errors.append("completion evidence pre-archive ACTIVE identity is invalid")
    elif state.get("phase") == "finish":
        active_relative = ACTIVE.relative_to(ROOT).as_posix()
        expected_active = worktree_index_object_id(
            active_relative, "100644", render_active_data(active).encode("utf-8"),
        )
        current_active = worktree_index_object_id(
            active_relative, "100644", ACTIVE.read_bytes(),
        )
        if expected_active is None or current_active != expected_active:
            errors.append("ACTIVE differs from its bound pre-archive projection")
    archive_object = identity.get("prearchiveArchiveObject")
    if not isinstance(archive_object, str) or not re.fullmatch(
        r"(?:[0-9a-f]{40}|[0-9a-f]{64})", archive_object,
    ):
        errors.append("completion evidence pre-archive archive object is invalid")
    elif state.get("phase") == "finish":
        current_object = worktree_index_object_id(
            ARCHIVE.relative_to(ROOT).as_posix(), "100644", ARCHIVE.read_bytes(),
        )
        if current_object != archive_object:
            errors.append("workflow archive differs from its bound pre-archive object")
    elif state.get("phase") == "archived":
        row = (
            f"| {state.get('archiveDate')} | {slug} | {RESULT_IDENTITY_KIND} | "
            f"{state.get('archiveSummary')} | {state.get('archiveFollowUp')} |\n"
        ).encode("utf-8")
        archive_relative = ARCHIVE.relative_to(ROOT).as_posix()
        current_object = worktree_index_object_id(
            archive_relative, "100644", ARCHIVE.read_bytes(),
        )
        prearchive_blob = subprocess.run(
            ["git", "cat-file", "blob", archive_object], cwd=GIT_ROOT,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        projection_matches = False
        if not prearchive_blob.returncode:
            separator = (
                b"" if not prearchive_blob.stdout
                or prearchive_blob.stdout.endswith(b"\n") else b"\n"
            )
            expected_object = worktree_index_object_id(
                archive_relative, "100644",
                prearchive_blob.stdout + separator + row,
            )
            projection_matches = expected_object == current_object
        else:
            current_blob = subprocess.run(
                ["git", "cat-file", "blob", current_object or ""], cwd=GIT_ROOT,
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
            )
            prearchive_candidates: list[bytes] = []
            if not current_blob.returncode and current_blob.stdout.endswith(row):
                prefix = current_blob.stdout[:-len(row)]
                prearchive_candidates.append(prefix)
                if prefix.endswith(b"\n"):
                    prearchive_candidates.append(prefix[:-1])
            projection_matches = any(
                worktree_index_object_id(
                    archive_relative, "100644", candidate,
                ) == archive_object
                for candidate in prearchive_candidates
            )
        if not projection_matches:
            errors.append("workflow archive is not the bound canonical projection")
    fingerprint = identity.get("fingerprint")
    if not isinstance(fingerprint, str) or not re.fullmatch(r"[0-9a-f]{64}", fingerprint):
        errors.append("completion evidence fingerprint is invalid")
    try:
        current = completion_fingerprint(state, slug)
    except OSError as exc:
        errors.append(f"cannot inspect completion evidence: {exc}")
    else:
        if fingerprint != current:
            errors.append("completion evidence differs from the bound pre-archive snapshot")
    return errors


def record_gate(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if state["phase"] == "archived":
        raise SystemExit(
            f"archived workflow is immutable: {slug}; gate receipts cannot change"
        )
    evidence = args.evidence.strip()
    if not evidence:
        raise SystemExit("gate evidence must not be empty")
    if args.status == "blocked" and args.name in ("implementation", "review"):
        boundary_phase = (
            "implementation" if args.name == "implementation" else "verification"
        )
        history = state.get("history", [])
        last_boundary = max(
            (
                index for index, item in enumerate(history)
                if isinstance(item, dict)
                and item.get("type") == "transition"
                and item.get("phase") == boundary_phase
            ),
            default=-1,
        )
        last_result = max(
            (
                index for index, item in enumerate(history)
                if isinstance(item, dict)
                and item.get("type") == "gate"
                and item.get("gate") == args.name
                and item.get("status") in ("passed", "blocked")
            ),
            default=-1,
        )
        if last_boundary < 0 or last_result > last_boundary:
            raise SystemExit(
                f"{args.name}=blocked is already recorded for the current "
                f"{boundary_phase} boundary"
            )
    if args.name == "check" and args.status in ("passed", "accepted_gaps"):
        raise SystemExit(
            f"check={args.status} requires a bound structured workflow-check run; "
            "run workflow-check.py --applicable --record <slug>"
        )
    if args.name == "check":
        clear_check_binding(state)
    if args.name == "scoping" and args.status == "passed":
        if (
            state.get("rightSizingPolicy") == RIGHT_SIZING_POLICY_VERSION
            and right_sizing_acceptance_required(state)
        ):
            acceptance = right_sizing_acceptance(state)
            if acceptance is None:
                raise SystemExit(
                    "scoping=passed requires a right-sizing acceptance assessment"
                )
            if acceptance.get("route") == "split-required":
                raise SystemExit(
                    "scoping=passed blocked: right-sizing acceptance assessment "
                    "requires candidate decomposition"
                )
            fingerprint = acceptance.get("contractFingerprint")
            if not isinstance(fingerprint, str) or fingerprint != (
                right_sizing_contract_fingerprint(slug)
            ):
                raise SystemExit(
                    "scoping=passed requires a current right-sizing contract snapshot"
                )
    if args.name == "review" and args.status in (
        "passed", "accepted_gaps", "blocked",
    ):
        identity = checked_candidate(state)
        projected = dict(state)
        projected["gates"] = dict(state["gates"])
        projected["gates"]["review"] = gate(args.status, evidence)
        errors = final_review_errors(projected)
        if args.status in ("passed", "accepted_gaps"):
            errors.extend(check_binding_errors(state, workflow_dir(slug)))
        if errors:
            raise SystemExit("; ".join(errors))
        if identity["identityKind"] == "staged-candidate-v1":
            cleaned = subprocess.run(
                [sys.executable, str(ROOT / "scripts" / "workflow-review.py"),
                 "cleanup", slug],
                cwd=ROOT, text=True, capture_output=True, check=False,
            )
            if cleaned.returncode:
                raise SystemExit(
                    cleaned.stderr.strip() or cleaned.stdout.strip()
                    or "review input cleanup failed"
                )
    cannot_waive = args.name in CORE_REQUIRED_GATES
    cannot_waive = cannot_waive or (
        args.name == "decisions" and state["decisionsRequired"]
    )
    cannot_waive = cannot_waive or (
        args.name == "risk" and state["riskRequired"]
    )
    if args.status == "not_required" and cannot_waive:
        raise SystemExit(f"{args.name} is required for {state['intensity']} workflow")
    if args.name == "finish" and args.status in ("passed", "accepted_gaps"):
        errors = finish_sections_complete(workflow_dir(slug) / "finish.md")
        errors.extend(completion_evidence_inventory_errors(slug))
        errors.extend(check_binding_errors(state, workflow_dir(slug)))
        if errors:
            raise SystemExit("; ".join(errors))
    recorded_at = timestamp()
    receipt: dict[str, Any] = gate(args.status, evidence)
    receipt["updated"] = recorded_at
    history_event: dict[str, Any] = {
        "at": recorded_at,
        "type": "gate",
        "gate": args.name,
        "status": args.status,
        "evidence": evidence,
    }
    if args.name == "review" and args.status in (
        "passed", "accepted_gaps", "blocked",
    ):
        receipt["candidate"] = state["checkedCandidate"]
    state["gates"][args.name] = receipt
    state["history"].append(history_event)
    if args.name == "finish" and args.status in ("passed", "accepted_gaps"):
        state["updated"] = recorded_at
        state["completionEvidence"] = build_completion_evidence(state, slug)
    elif args.name == "finish":
        state.pop("completionEvidence", None)
    save_state(
        state,
        preserve_updated=(
            args.name == "finish"
            and args.status in ("passed", "accepted_gaps")
        ),
    )
    if active_data().get("feature") == slug:
        write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(f"gate: {slug} {args.name}={args.status}")


def record_check_receipt(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if state["phase"] == "archived":
        raise SystemExit(f"archived workflow is immutable: {slug}")
    if state["phase"] != "verification":
        raise SystemExit(
            "structured check receipt requires phase=verification, "
            f"found {state['phase']}"
        )
    review_status = state.get("gates", {}).get("review", {}).get("status")
    if review_status not in ("pending", "passed", "accepted_gaps"):
        raise SystemExit(
            "structured check receipt requires review=pending or a completed "
            "same-candidate review, "
            f"found {review_status}"
        )
    evidence = args.evidence.strip()
    run_id = args.run_id.strip()
    if not evidence or not run_id:
        raise SystemExit("structured check receipt requires evidence and run id")
    raw_indexes = args.accepted_command_index or []
    approval = args.approval.strip()
    if args.status != "accepted_gaps" and (raw_indexes or approval):
        raise SystemExit(
            "accepted failure indexes and approval require status=accepted_gaps"
        )
    accepted_failure_indexes: tuple[int, ...] = ()
    if args.status == "accepted_gaps":
        if not raw_indexes:
            raise SystemExit(
                "accepted check failures require at least one "
                "--accepted-command-index"
            )
        if len(set(raw_indexes)) != len(raw_indexes):
            raise SystemExit("accepted command indexes must be unique")
        if any(index < 0 for index in raw_indexes):
            raise SystemExit("accepted command indexes must be non-negative")
        if not approval:
            raise SystemExit("accepted check failures require --approval")
        accepted_failure_indexes = tuple(sorted(raw_indexes))
    if args.status in ("passed", "accepted_gaps"):
        check_module = load_check_module()
        try:
            errors = check_module.formal_run_errors(
                slug, run_id, current_scope=True,
                accepted_failure_indexes=accepted_failure_indexes,
            )
        except (RuntimeError, OSError, SystemExit) as exc:
            errors = [str(exc)]
        if errors:
            raise SystemExit("; ".join(sorted(set(errors))))
        records = check_module.evidence_records(
            workflow_dir(slug) / "evidence" / "checks.jsonl"
        )
        if not records or records[-1].get("runId") != run_id:
            raise SystemExit(
                "structured check receipt requires the final evidence run"
            )
        run = [item for item in records if item.get("runId") == run_id]
        identity = run[0] if run else {}
        if (
            args.status == "accepted_gaps"
            and identity.get("identityKind") != "staged-candidate-v1"
        ):
            raise SystemExit(
                "check=accepted_gaps requires a staged-candidate-v1 run"
            )
        if identity.get("identityKind") == "staged-candidate-v1":
            checked_candidate = {
                "identityKind": "staged-candidate-v1",
                "baseCommit": identity["candidateBaseCommit"],
                "candidateFingerprint": identity["candidateFingerprint"],
            }
        else:
            checked_candidate = {
                "identityKind": "worktree-candidate-v1",
                "baseCommit": str(identity.get("head", "")),
                "candidateFingerprint": identity["scopeFingerprint"],
            }
        final_review = state.get("finalReview")
        complete_same_candidate_review = (
            isinstance(final_review, dict)
            and final_review.get("candidate") == checked_candidate
            and isinstance(final_review.get("outcomes"), dict)
            and set(final_review["outcomes"]) == set(REVIEW_AXES)
            and state.get("gates", {}).get("review", {}).get("status")
            in ("passed", "accepted_gaps")
        )
        if review_status in ("passed", "accepted_gaps") and not complete_same_candidate_review:
            raise SystemExit(
                "structured check receipt after review requires the exact reviewed candidate"
            )
        fingerprint = check_module.formal_run_fingerprint(slug, run_id)
        clear_check_binding(state)
        if complete_same_candidate_review:
            state["finalReview"] = final_review
        state["checkEvidencePolicy"] = CHECK_EVIDENCE_POLICY_VERSION
        state["checkRunId"] = run_id
        state["checkRunFingerprint"] = fingerprint
        state["checkedCandidate"] = checked_candidate
        if args.status == "accepted_gaps":
            state["checkAcceptedFailures"] = {
                "policyVersion": CHECK_ACCEPTED_FAILURES_POLICY_VERSION,
                "commandIndexes": list(accepted_failure_indexes),
                "approval": approval,
            }
            state["checkAcceptedFailuresFingerprint"] = (
                check_accepted_failures_fingerprint(state)
            )
    else:
        clear_check_binding(state)
        if review_status in ("passed", "accepted_gaps"):
            reset_evidence = "completed review invalidated by blocked recheck"
            state["gates"]["review"] = gate("pending", reset_evidence)
            state["history"].append(
                {
                    "at": timestamp(),
                    "type": "gate",
                    "gate": "review",
                    "status": "pending",
                    "evidence": reset_evidence,
                }
            )
    state["gates"]["check"] = gate(args.status, evidence)
    history_evidence = f"{evidence}; structured run: {run_id}"
    if args.status == "accepted_gaps":
        history_evidence += (
            "; accepted command indexes: "
            + ", ".join(str(index) for index in accepted_failure_indexes)
            + f"; approval: {approval}"
        )
    state["history"].append(
        {
            "at": timestamp(),
            "type": "gate",
            "gate": "check",
            "status": args.status,
            "evidence": history_evidence,
        }
    )
    save_state(state)
    if active_data().get("feature") == slug:
        write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(f"gate: {slug} check={args.status}")


def record_parallel_assessment(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if args.ready_units < 0:
        raise SystemExit("parallel assessment ready units must be non-negative")
    if state.get("phase") == "archived":
        raise SystemExit(
            f"archived workflow is immutable: {slug}; assessment cannot change"
        )
    if args.ready_units < 2:
        raise SystemExit("batch-plan parallel assessment requires at least two ready units")
    scoping = state.get("gates", {}).get("scoping", {})
    if state.get("parallelAssessmentPolicy") is not None:
        raise SystemExit("parallel assessment is already recorded")
    if scoping.get("status") != "pending":
        raise SystemExit("parallel assessment may change only before scoping passes")
    if state.get("phase") not in ("planning", "design"):
        raise SystemExit("parallel assessment may change only during planning or design")
    reason = single_line(args.reason, "parallel assessment reason")
    state["parallelAssessmentPolicy"] = PARALLEL_ASSESSMENT_POLICY_VERSION
    state["parallelAssessment"] = {
        "decision": "batch-plan",
        "readyUnits": args.ready_units,
        "reason": reason,
    }
    state["parallelReassessments"] = []
    state["history"].append(
        {
            "at": timestamp(),
            "type": "parallel_assessment",
            "phase": state["phase"],
            "evidence": (
                f"batch-plan; ready units: {args.ready_units}; reason: {reason}"
            ),
        }
    )
    save_state(state)
    print(f"parallel assessment: {slug} -> batch-plan")


def record_parallel_reassessment(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if args.ready_units < 0:
        raise SystemExit("parallel re-evaluation ready units must be non-negative")
    if args.decision == "batch-plan" and args.ready_units < 2:
        raise SystemExit(
            "batch-plan parallel re-evaluation requires at least two ready units"
        )
    trigger = single_line(args.trigger, "parallel re-evaluation trigger")
    reason = single_line(args.reason, "parallel re-evaluation reason")
    if state.get("phase") != "implementation":
        raise SystemExit("parallel re-evaluation is allowed only during implementation")
    assessment = state.get("parallelAssessment")
    if (
        state.get("parallelAssessmentPolicy") != PARALLEL_ASSESSMENT_POLICY_VERSION
        or not isinstance(assessment, dict)
        or assessment.get("decision") != "batch-plan"
        or state.get("gates", {}).get("scoping", {}).get("status") != "passed"
    ):
        raise SystemExit(
            "parallel re-evaluation requires task topology metadata and a passed "
            "scoping receipt"
        )
    event = {
        "decision": args.decision,
        "readyUnits": args.ready_units,
        "trigger": trigger,
        "reason": reason,
        "at": timestamp(),
    }
    reassessments = state.setdefault("parallelReassessments", [])
    if not isinstance(reassessments, list):
        raise SystemExit("parallelReassessments must be a list")
    reassessments.append(event)
    state["history"].append(
        {
            "at": event["at"],
            "type": "parallel_reassessment",
            "phase": state["phase"],
            "decision": args.decision,
            "readyUnits": args.ready_units,
            "trigger": trigger,
            "reason": reason,
            "evidence": (
                f"{args.decision}; ready units: {args.ready_units}; "
                f"trigger: {trigger}; reason: {reason}"
            ),
        }
    )
    save_state(state)
    print(f"parallel re-evaluation: {slug} -> {args.decision}")


def right_sizing_contract_fingerprint(slug: str) -> str:
    path = workflow_dir(slug)
    files = {
        path / "context.md", path / "decisions.md",
        path / "spec-links.md", path / "task-links.md",
    }
    for links in (path / "spec-links.md", path / "task-links.md"):
        if not links.is_file():
            continue
        for relative in re.findall(r"`([^`]+)`", links.read_text(encoding="utf-8")):
            candidate = (ROOT / relative).resolve()
            if candidate.is_file() and candidate.is_relative_to(ROOT.resolve()):
                files.add(candidate)
    digest = hashlib.sha256()
    for candidate in sorted(files, key=lambda item: item.relative_to(ROOT).as_posix()):
        relative = candidate.relative_to(ROOT).as_posix()
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(candidate.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def record_review_conclusion(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if state.get("phase") != "verification":
        raise SystemExit(
            "review conclusion requires phase=verification, "
            f"found {state.get('phase')}"
        )
    if state.get("gates", {}).get("review", {}).get("status") != "pending":
        raise SystemExit("review conclusion requires review=pending")
    if state.get("gates", {}).get("check", {}).get("status") not in (
        "passed", "accepted_gaps",
    ):
        raise SystemExit("final review requires the applicable final check first")
    identity = checked_candidate(state)
    binding_errors = check_binding_errors(state, workflow_dir(slug))
    if binding_errors:
        raise SystemExit(
            "final review requires a valid bound final check: "
            + "; ".join(binding_errors)
        )
    if identity["identityKind"] == "staged-candidate-v1":
        try:
            package = load_review_module().verify_package(slug)
        except RuntimeError as exc:
            raise SystemExit(
                f"final review requires a current review package: {exc}"
            ) from exc
        package_identity = {
            "identityKind": package.get("identityKind"),
            "baseCommit": package.get("candidateBaseCommit"),
            "candidateFingerprint": package.get("candidateFingerprint"),
        }
        if package_identity != identity:
            raise SystemExit(
                "final review package does not match the checked candidate identity"
            )
    final = state.setdefault(
        "finalReview", {"candidate": dict(identity), "outcomes": {}},
    )
    if final.get("candidate") != identity or not isinstance(final.get("outcomes"), dict):
        raise SystemExit("final review state is invalid")
    conclusions = final["outcomes"]
    if args.axis in conclusions:
        raise SystemExit(f"review axis {args.axis} already has a conclusion")
    conclusion = {
        "status": args.status,
        "evidence": single_line(args.evidence, "review conclusion evidence"),
    }
    conclusions[args.axis] = conclusion
    save_state(state)
    print(json.dumps(conclusion, ensure_ascii=False))


def note(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    workflow = workflow_dir(slug)
    journal = workflow / "journal.md"
    if not (workflow / "workflow.json").exists():
        raise SystemExit(
            f"workflow not found: {workflow.relative_to(ROOT).as_posix()}"
        )
    with journal.open("a", encoding="utf-8") as handle:
        if handle.tell() == 0:
            handle.write(f"# Journal: `{slug}`\n")
        handle.write(f"\n- {today()}: {args.message}\n")
    print(f"noted: {slug}")


def record_right_sizing(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if state.get("phase") == "archived":
        raise SystemExit(
            f"archived workflow is immutable: {slug}; right-sizing receipts cannot change"
        )
    if args.route not in RIGHT_SIZING_ROUTES[args.stage]:
        raise SystemExit(f"invalid {args.stage} right-sizing route: {args.route}")
    assessments = state.get("rightSizingAssessments", [])
    if not isinstance(assessments, list):
        raise SystemExit("rightSizingAssessments must be a list")
    if args.stage == "acceptance":
        source = state.get("deliverySource")
        if not isinstance(source, dict) or source.get("kind") != "tracker":
            raise SystemExit(
                "acceptance right-sizing requires a tracker-backed delivery source"
            )
        start = state.get("rightSizingEpochStart", 0)
        if type(start) is not int or not 0 <= start <= len(assessments):
            raise SystemExit("rightSizingEpochStart is invalid")
        if any(
            isinstance(item, dict) and item.get("stage") == "acceptance"
            for item in assessments[start:]
        ):
            raise SystemExit("right-sizing acceptance assessment is immutable")
        if state.get("phase") not in ("planning", "design"):
            raise SystemExit(
                "acceptance right-sizing is allowed only during planning or design"
            )
        if state.get("gates", {}).get("acceptance", {}).get("status") != "passed":
            raise SystemExit(
                "acceptance right-sizing requires acceptance=passed"
            )
        if state.get("gates", {}).get("scoping", {}).get("status") != "pending":
            raise SystemExit(
                "acceptance right-sizing must be recorded before scoping passes"
            )
        if args.trigger:
            raise SystemExit("acceptance right-sizing does not accept --trigger")
    elif state.get("phase") not in ("implementation", "verification"):
        raise SystemExit(
            "continuation right-sizing requires implementation or verification phase"
        )
    elif not right_sizing_continuation_trigger(state):
        raise SystemExit(
            "continuation right-sizing requires repeated blocked implementation "
            "or review evidence"
        )
    elif args.trigger not in RIGHT_SIZING_CONTINUATION_TRIGGERS[args.route]:
        allowed = ", ".join(RIGHT_SIZING_CONTINUATION_TRIGGERS[args.route])
        raise SystemExit(
            f"continuation route {args.route} requires --trigger {allowed}"
        )
    split_values = (
        args.remainder_slices, args.dependency_interfaces, args.safe_stop,
    )
    if args.route == "split-remainder" and not all(split_values):
        raise SystemExit(
            "split-remainder requires --remainder-slices, "
            "--dependency-interfaces, and --safe-stop"
        )
    if args.route != "split-remainder" and any(split_values):
        raise SystemExit(
            "split-remainder fields are allowed only with --route split-remainder"
        )
    receipt = {
        "at": timestamp(),
        "phase": state["phase"],
        "stage": args.stage,
        "route": args.route,
        "outcome": single_line(args.outcome, "right-sizing outcome"),
        "acceptanceSeam": single_line(
            args.acceptance_seam, "right-sizing acceptance seam"
        ),
        "dependencies": single_line(
            args.dependencies, "right-sizing dependencies"
        ),
        "reviewBoundary": single_line(
            args.review_boundary, "right-sizing review boundary"
        ),
        "rollbackBoundary": single_line(
            args.rollback_boundary, "right-sizing rollback boundary"
        ),
        "contextBoundary": single_line(
            args.context_boundary, "right-sizing context boundary"
        ),
        "consequence": single_line(
            args.consequence, "right-sizing consequence"
        ),
        "evidence": single_line(args.evidence, "right-sizing evidence"),
        "contractFingerprint": right_sizing_contract_fingerprint(slug),
        "trigger": args.trigger,
        "remainderSlices": (
            single_line(args.remainder_slices, "right-sizing remainder slices")
            if args.remainder_slices else None
        ),
        "dependencyInterfaces": (
            single_line(
                args.dependency_interfaces,
                "right-sizing dependency interfaces",
            )
            if args.dependency_interfaces else None
        ),
        "safeStop": (
            single_line(args.safe_stop, "right-sizing safe stop")
            if args.safe_stop else None
        ),
    }
    state["rightSizingPolicy"] = RIGHT_SIZING_POLICY_VERSION
    state.setdefault(
        "rightSizingContractPolicyStart", len(assessments)
    )
    state.setdefault(
        "rightSizingContractPolicy", RIGHT_SIZING_CONTRACT_POLICY_VERSION
    )
    if args.stage == "acceptance":
        state["rightSizingAcceptanceRequired"] = True
    state.setdefault("rightSizingAssessments", []).append(receipt)
    state["history"].append({"type": "right_sizing_assessment", **receipt})
    save_state(state)
    print(json.dumps(receipt, ensure_ascii=False))


def record_source(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    if state.get("phase") not in ("planning", "design"):
        raise SystemExit("delivery source may be changed only during planning or design")
    if state.get("gates", {}).get("acceptance", {}).get("status") != "pending":
        raise SystemExit("delivery source must be recorded before acceptance passes")
    if args.kind == "tracker":
        if state.get("gates", {}).get("scoping", {}).get("status") != "pending":
            raise SystemExit(
                "tracker delivery source must be recorded before scoping passes"
            )
        if not args.url:
            raise SystemExit("tracker source requires --url")
        if args.reason or args.approval:
            raise SystemExit("tracker source accepts --url only")
        url, target = validated_issue_url(args.url)
        ensure_unique_non_archived_tracker_source(slug, url)
        source = {"kind": "tracker", "url": url, "target": target}
    else:
        if args.url:
            raise SystemExit("local-only source does not accept --url")
        if not args.reason:
            raise SystemExit("local-only source requires --reason")
        if not args.approval:
            raise SystemExit("local-only source requires --approval")
        source = {
            "kind": "local-only",
            "reason": single_line(args.reason, "local-only reason"),
            "approval": single_line(args.approval, "local-only approval"),
        }
    task_links = workflow_dir(slug) / "task-links.md"
    if not task_links.exists():
        raise SystemExit("delivery source requires task-links.md")
    lines = [
        line for line in task_links.read_text(encoding="utf-8").splitlines()
        if not line.startswith("- Delivery source:")
    ]
    insertion = next(
        (index + 1 for index, line in enumerate(lines) if line.startswith("- Delivery slice:")),
        2,
    )
    lines.insert(insertion, delivery_source_line(source))
    state["deliverySourcePolicy"] = DELIVERY_SOURCE_POLICY_VERSION
    state["deliverySource"] = source
    if source["kind"] == "tracker":
        state.setdefault("rightSizingPolicy", RIGHT_SIZING_POLICY_VERSION)
        state.setdefault("rightSizingAssessments", [])
        state.setdefault("rightSizingAcceptanceRequired", True)
        state.setdefault(
            "rightSizingContractPolicy", RIGHT_SIZING_CONTRACT_POLICY_VERSION
        )
        state.setdefault("rightSizingContractPolicyStart", 0)
    state["history"].append(
        {
            "at": timestamp(),
            "type": "delivery_source",
            "phase": state["phase"],
            "evidence": delivery_source_line(source).removeprefix("- "),
        }
    )
    task_links.write_text("\n".join(lines) + "\n", encoding="utf-8")
    save_state(state)
    print(f"delivery source: {slug} {source['kind']}")


def create_session(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    path = workflow_dir(slug)
    if not path.exists():
        raise SystemExit(f"workflow not found: {path.relative_to(ROOT).as_posix()}")
    scope = args.scope.strip()
    if not scope or "\n" in scope or "\r" in scope:
        raise SystemExit("session scope must be a non-empty single line")
    safe_scope = re.sub(r"[^A-Za-z0-9._-]+", "-", scope).strip("-") or "session"
    sessions = path / "sessions"
    sessions.mkdir(exist_ok=True)
    base = f"{session_stamp()}-{safe_scope}"
    destination = sessions / f"{base}.md"
    counter = 2
    while destination.exists():
        destination = sessions / f"{base}-{counter}.md"
        counter += 1
    session_id = destination.stem
    content = (TEMPLATE / "session.md").read_text(encoding="utf-8")
    replacements = {
        "<session-id>": session_id,
        "<feature>": slug,
        "<date>": today(),
        "<session-scope>": scope,
        "<branch>": current_branch() or "detached",
    }
    for source, target in replacements.items():
        content = content.replace(source, target)
    destination.write_text(content, encoding="utf-8")
    index = path / "session-index.md"
    if not index.exists():
        index.write_text(
            (TEMPLATE / "session-index.md").read_text(encoding="utf-8").replace(
                "<feature>", slug
            ),
            encoding="utf-8",
        )
    with index.open("a", encoding="utf-8") as handle:
        handle.write(
            f"| {today()} | [`{session_id}`](sessions/{destination.name}) | "
            f"{scope} | {current_branch() or 'detached'} |  | Created |\n"
        )
    print(f"created session: {destination.relative_to(ROOT).as_posix()}")


def validate(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    errors = workflow_errors(slug)
    if errors:
        raise SystemExit("\n".join(f"- {error}" for error in errors))
    print(f"valid: {slug}")


def archived_active_projection(state: dict[str, Any]) -> dict[str, str]:
    previous_active = state.get("previousActive")
    if isinstance(previous_active, dict) and previous_active.get("feature"):
        try:
            previous_state = load_state(previous_active["feature"])
        except SystemExit:
            previous_state = {}
        if previous_state.get("phase") in ACTIVE_PHASES:
            restored = dict(previous_active)
            if (
                restored.get("phase") != previous_state["phase"]
                or restored.get("next") != previous_state["nextAction"]
            ):
                restored["phase"] = previous_state["phase"]
                restored["next"] = previous_state["nextAction"]
                restored["updated"] = state.get("archiveDate", "")
            return restored
    return {
        "feature": "",
        "phase": "",
        "updated": state.get("archiveDate", ""),
        "next": "",
        "branch / worktree": "",
    }


def prearchive_lifecycle_objects(
    slug: str, state: dict[str, Any],
) -> dict[str, str] | None:
    identity = state.get("completionEvidence")
    if not isinstance(identity, dict) or not isinstance(
        identity.get("prearchiveActive"), dict,
    ):
        return None
    archive_object = identity.get("prearchiveArchiveObject")
    if not isinstance(archive_object, str):
        return None
    prearchive_state = completion_prearchive_state(
        state, preserve_evidence=True,
    )
    data = {
        ACTIVE.relative_to(ROOT).as_posix(): render_active_data(
            identity["prearchiveActive"]
        ).encode("utf-8"),
        state_path(slug).relative_to(ROOT).as_posix(): render_workflow_json(
            prearchive_state
        ).encode("utf-8"),
        (workflow_dir(slug) / "state.md").relative_to(ROOT).as_posix(): render_state(
            prearchive_state
        ).encode("utf-8"),
    }
    result: dict[str, str] = {
        ARCHIVE.relative_to(ROOT).as_posix(): archive_object,
    }
    for relative, content in data.items():
        object_id = worktree_index_object_id(relative, "100644", content)
        if object_id is None:
            return None
        result[relative] = object_id
    return result


def canonical_lifecycle_entry_errors(
    slug: str, *, allow_prearchive_index: dict[str, Any] | None = None,
) -> list[str]:
    paths = (
        ACTIVE,
        ARCHIVE,
        workflow_dir(slug) / "workflow.json",
        workflow_dir(slug) / "state.md",
    )
    errors: list[str] = []
    actual_objects: dict[str, str] = {}
    working_objects: dict[str, str] = {}
    for path in paths:
        relative = path.relative_to(ROOT).as_posix()
        if path.is_symlink() or not path.is_file():
            errors.append(
                f"canonical lifecycle path must be a regular file: {relative}"
            )
            continue
        listed = subprocess.run(
            ["git", "ls-files", "--stage", "-z", "--", relative],
            cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        records = [record for record in listed.stdout.split(b"\0") if record]
        try:
            metadata, listed_path = records[0].split(b"\t", 1)
            mode, object_id, stage = metadata.decode("ascii").split()
        except (IndexError, ValueError, UnicodeDecodeError):
            errors.append(f"cannot inspect canonical lifecycle entry: {relative}")
            continue
        if (
            listed.returncode
            or len(records) != 1
            or listed_path.decode("utf-8", errors="surrogateescape") != relative
            or stage != "0"
            or mode != "100644"
        ):
            errors.append(
                f"canonical lifecycle entry must be a 100644 regular blob: {relative}"
            )
            continue
        object_type = subprocess.run(
            ["git", "cat-file", "-t", object_id], cwd=ROOT, text=True,
            capture_output=True, check=False,
        )
        if object_type.returncode or object_type.stdout.strip() != "blob":
            errors.append(
                f"canonical lifecycle entry must reference a blob: {relative}"
            )
            continue
        expected_object = worktree_index_object_id(
            relative, mode, path.read_bytes(),
        )
        if expected_object is None:
            errors.append(f"cannot hash canonical lifecycle entry: {relative}")
            continue
        actual_objects[relative] = object_id
        working_objects[relative] = expected_object
    if errors:
        return errors
    if actual_objects == working_objects:
        return []
    if allow_prearchive_index is not None:
        prearchive_objects = prearchive_lifecycle_objects(
            slug, allow_prearchive_index,
        )
        if prearchive_objects is not None and actual_objects == prearchive_objects:
            return []
    for relative in sorted(actual_objects):
        if actual_objects[relative] != working_objects[relative]:
            errors.append(
                "canonical lifecycle index differs from the working projection: "
                f"{relative}"
            )
    return errors


def archive(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    follow_up = args.follow_up or "None"
    for label, value in (("summary", args.summary), ("follow-up", follow_up)):
        if "|" in value or "\n" in value or "\r" in value:
            raise SystemExit(
                f"archive {label} must be a single line without pipe characters"
            )
    if state.get("phase") == "archived":
        identity = state.get("resultIdentity")
        expected_line = (
            f"| {state.get('archiveDate')} | {slug} | {RESULT_IDENTITY_KIND} | "
            f"{state.get('archiveSummary')} | {state.get('archiveFollowUp')} |"
        )
        rows = ARCHIVE.read_text(encoding="utf-8").splitlines() if ARCHIVE.exists() else []
        retry_errors = workflow_errors(slug, check_current_scope=False)
        retry_errors.extend(canonical_lifecycle_entry_errors(
            slug, allow_prearchive_index=state,
        ))
        retry_errors.extend(completion_workspace_index_errors(slug))
        if identity != {"kind": RESULT_IDENTITY_KIND}:
            retry_errors.append("archived retry requires current result identity")
        if rows.count(expected_line) != 1:
            retry_errors.append("archived retry requires one canonical archive row")
        expected_event = {
            "at": state.get("archivedAt"),
            "type": "archived",
            "phase": "archived",
            "evidence": (
                f"{state.get('archiveSummary')}; result identity: "
                f"{RESULT_IDENTITY_KIND}; follow-up: {state.get('archiveFollowUp')}"
            ),
        }
        history = state.get("history")
        if not isinstance(history, list) or not history or history[-1] != expected_event:
            retry_errors.append("archived retry requires canonical terminal history")
        if state.get("nextAction") != state.get("archiveFollowUp"):
            retry_errors.append("archived retry requires canonical follow-up projection")
        expected_active = render_active_data(archived_active_projection(state))
        if not ACTIVE.exists() or ACTIVE.read_text(encoding="utf-8") != expected_active:
            retry_errors.append("archived retry requires canonical ACTIVE projection")
        try:
            checked_candidate(state)
        except SystemExit as exc:
            retry_errors.append(str(exc))
        if retry_errors:
            raise SystemExit("\n".join(f"- {error}" for error in sorted(set(retry_errors))))
        print(f"archived: {slug} (already canonical)")
        return
    errors = workflow_errors(slug, check_current_scope=False)
    errors.extend(canonical_lifecycle_entry_errors(slug))
    errors.extend(completion_workspace_index_errors(slug))
    current_active = active_data()
    if current_active.get("feature") != slug:
        errors.append(
            "archive requires the slug to match the canonical ACTIVE Workspace"
        )
    if ACTIVE.read_text(encoding="utf-8") != render_active_data(current_active):
        errors.append("archive ACTIVE projection is not canonical and unique")
    if ARCHIVE.exists() and any(
        len(cells) == 5 and cells[1] == slug
        for cells in (
            [cell.strip() for cell in line[1:-1].split("|")]
            for line in ARCHIVE.read_text(encoding="utf-8").splitlines()
            if line.startswith("|") and line.endswith("|")
        )
    ):
        errors.append("workflow archive already contains the active slug")
    if state["phase"] != "finish":
        errors.append(f"archive requires phase=finish, found {state['phase']}")
    if state["gates"]["finish"]["status"] not in ("passed", "accepted_gaps"):
        errors.append("archive requires finish gate passed")
    errors.extend(finish_sections_complete(workflow_dir(slug) / "finish.md"))
    if errors:
        raise SystemExit("\n".join(f"- {error}" for error in sorted(set(errors))))
    prearchive_paths = [
        "docs/workspace/ACTIVE.md",
        "docs/workspace/archive.md",
        f"docs/workspace/{slug}",
    ]
    unstaged_prearchive = subprocess.run(
        [
            "git", "diff", "--quiet", "--",
            *prearchive_paths,
        ],
        cwd=ROOT, text=True, capture_output=True, check=False,
    )
    if unstaged_prearchive.returncode:
        raise SystemExit(
            "archive requires the working lifecycle projection to match the "
            "staged checked candidate"
        )
    staged_ci = subprocess.run(
        [sys.executable, "scripts/workflow-ci.py", "--staged"], cwd=ROOT,
        text=True, capture_output=True, check=False,
    )
    if staged_ci.returncode:
        detail = staged_ci.stdout.strip() or staged_ci.stderr.strip()
        raise SystemExit(
            "archive requires the exact staged checked/reviewed candidate: "
            + detail
        )
    archived_at = timestamp()
    state["schemaVersion"] = SCHEMA_VERSION
    state["phase"] = "archived"
    state["nextAction"] = follow_up
    state["archivedAt"] = archived_at
    state["archiveDate"] = today()
    state.pop("resultCommit", None)
    state["resultIdentity"] = {"kind": RESULT_IDENTITY_KIND}
    state["archiveSummary"] = args.summary
    state["archiveFollowUp"] = follow_up
    state["history"].append(
        {
            "at": archived_at,
            "type": "archived",
            "phase": "archived",
            "evidence": (
                f"{args.summary}; result identity: {RESULT_IDENTITY_KIND}; "
                f"follow-up: {follow_up}"
            ),
        }
    )
    save_state(state)
    if ARCHIVE.exists() and ARCHIVE.stat().st_size and not ARCHIVE.read_bytes().endswith(b"\n"):
        with ARCHIVE.open("a", encoding="utf-8") as handle:
            handle.write("\n")
    with ARCHIVE.open("a", encoding="utf-8") as handle:
        handle.write(
            f"| {today()} | {slug} | {RESULT_IDENTITY_KIND} | {args.summary} | "
            f"{follow_up} |\n"
        )
    write_active_data(archived_active_projection(state))
    print(f"archived: {slug}")


def add_creation_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--intensity", choices=INTENSITIES, required=True)
    parser.add_argument("--risk-required", action="store_true")
    parser.add_argument("--decisions-required", action="store_true")


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser()
    commands = result.add_subparsers(dest="command", required=True)
    commands.add_parser("init-project").set_defaults(func=init_project)

    create_parser = commands.add_parser("create")
    create_parser.add_argument("slug")
    create_parser.add_argument("--parent", action="store_true")
    add_creation_options(create_parser)
    create_parser.set_defaults(func=create)

    activate_parser = commands.add_parser("activate")
    activate_parser.add_argument("slug")
    activate_parser.set_defaults(func=activate)
    commands.add_parser("active").set_defaults(func=show_active)

    status_parser = commands.add_parser("status")
    status_parser.add_argument("slug", nargs="?", default="active")
    status_parser.set_defaults(func=status)

    ready_parser = commands.add_parser("ready")
    ready_parser.add_argument("slug", nargs="?", default="active")
    ready_parser.add_argument("phase", choices=ACTIVE_PHASES)
    ready_parser.set_defaults(func=ready)

    transition_parser = commands.add_parser("transition")
    transition_parser.add_argument("slug")
    transition_parser.add_argument("phase", choices=ACTIVE_PHASES)
    transition_parser.add_argument("next_action", nargs="?", default="")
    transition_parser.set_defaults(func=transition)

    replan_parser = commands.add_parser("replan")
    replan_parser.add_argument("slug")
    replan_parser.add_argument("--reason", required=True)
    replan_parser.add_argument("--next-action", required=True)
    replan_parser.set_defaults(func=replan)

    gate_parser = commands.add_parser("gate")
    gate_parser.add_argument("slug")
    gate_parser.add_argument("name", choices=GATE_NAMES)
    gate_parser.add_argument("status", choices=GATE_STATUSES)
    gate_parser.add_argument("--evidence", required=True)
    gate_parser.set_defaults(func=record_gate)

    check_receipt_parser = commands.add_parser("check-receipt")
    check_receipt_parser.add_argument("slug")
    check_receipt_parser.add_argument(
        "status", choices=("passed", "accepted_gaps", "blocked")
    )
    check_receipt_parser.add_argument("--run-id", required=True)
    check_receipt_parser.add_argument(
        "--accepted-command-index", action="append", type=int, default=[]
    )
    check_receipt_parser.add_argument("--approval", default="")
    check_receipt_parser.add_argument("--evidence", required=True)
    check_receipt_parser.set_defaults(func=record_check_receipt)

    parallel_parser = commands.add_parser("parallel-assessment")
    parallel_parser.add_argument("slug", nargs="?", default="active")
    parallel_parser.add_argument("decision", choices=("batch-plan",))
    parallel_parser.add_argument("--ready-units", type=int, required=True)
    parallel_parser.add_argument("--reason", required=True)
    parallel_parser.set_defaults(func=record_parallel_assessment)

    reassess_parser = commands.add_parser("parallel-reassess")
    reassess_parser.add_argument("slug", nargs="?", default="active")
    reassess_parser.add_argument("decision", choices=("serial", "batch-plan"))
    reassess_parser.add_argument("--ready-units", type=int, required=True)
    reassess_parser.add_argument("--trigger", required=True)
    reassess_parser.add_argument("--reason", required=True)
    reassess_parser.set_defaults(func=record_parallel_reassessment)

    review_conclusion_parser = commands.add_parser("review-conclusion")
    review_conclusion_parser.add_argument("slug", nargs="?", default="active")
    review_conclusion_parser.add_argument("--axis", required=True, choices=REVIEW_AXES)
    review_conclusion_parser.add_argument(
        "--status", required=True,
        choices=("accepted", "accepted_gaps", "blocked")
    )
    review_conclusion_parser.add_argument("--evidence", required=True)
    review_conclusion_parser.set_defaults(func=record_review_conclusion)

    right_sizing_parser = commands.add_parser("right-sizing")
    right_sizing_parser.add_argument("slug", nargs="?", default="active")
    right_sizing_parser.add_argument(
        "stage", choices=tuple(RIGHT_SIZING_ROUTES)
    )
    right_sizing_parser.add_argument("--route", required=True)
    right_sizing_parser.add_argument("--outcome", required=True)
    right_sizing_parser.add_argument("--acceptance-seam", required=True)
    right_sizing_parser.add_argument("--dependencies", required=True)
    right_sizing_parser.add_argument("--review-boundary", required=True)
    right_sizing_parser.add_argument("--rollback-boundary", required=True)
    right_sizing_parser.add_argument("--context-boundary", required=True)
    right_sizing_parser.add_argument("--consequence", required=True)
    right_sizing_parser.add_argument("--evidence", required=True)
    right_sizing_parser.add_argument(
        "--trigger", choices=tuple(sorted({
            trigger for triggers in RIGHT_SIZING_CONTINUATION_TRIGGERS.values()
            for trigger in triggers
        })),
    )
    right_sizing_parser.add_argument("--remainder-slices")
    right_sizing_parser.add_argument("--dependency-interfaces")
    right_sizing_parser.add_argument("--safe-stop")
    right_sizing_parser.set_defaults(func=record_right_sizing)

    note_parser = commands.add_parser("note")
    note_parser.add_argument("slug")
    note_parser.add_argument("message")
    note_parser.set_defaults(func=note)

    source_parser = commands.add_parser("source")
    source_parser.add_argument("slug")
    source_parser.add_argument("kind", choices=("tracker", "local-only"))
    source_parser.add_argument("--url")
    source_parser.add_argument("--reason")
    source_parser.add_argument("--approval")
    source_parser.set_defaults(func=record_source)

    session_parser = commands.add_parser("session")
    session_parser.add_argument("slug")
    session_parser.add_argument("scope", nargs="?", default="session")
    session_parser.set_defaults(func=create_session)

    validate_parser = commands.add_parser("validate")
    validate_parser.add_argument("slug", nargs="?", default="active")
    validate_parser.set_defaults(func=validate)

    archive_parser = commands.add_parser("archive")
    archive_parser.add_argument("slug")
    archive_parser.add_argument("--summary", required=True)
    archive_parser.add_argument("--follow-up")
    archive_parser.set_defaults(func=archive)

    return result


if __name__ == "__main__":
    arguments = parser().parse_args()
    arguments.func(arguments)
