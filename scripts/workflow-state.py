#!/usr/bin/env python3
"""Manage formal task workflow state with machine-enforced phase gates."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT / "docs" / "workspace"
TEMPLATE = WORKSPACE / "template"
ACTIVE = WORKSPACE / "ACTIVE.md"
ARCHIVE = WORKSPACE / "archive.md"
SCHEMA_VERSION = 1
ACTIVE_PHASES = ("planning", "design", "implementation", "verification", "finish")
PHASES = ACTIVE_PHASES + ("archived",)
INTENSITIES = ("low-risk", "feature", "high-risk")
GATE_NAMES = (
    "acceptance", "decisions", "scoping", "risk", "implementation", "check",
    "review", "finish",
)
CORE_REQUIRED_GATES = (
    "acceptance", "scoping", "implementation", "check", "review", "finish",
)
LEGACY_LOW_RISK_WAIVER = "Not required for low-risk workflow"
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


def write_active_data(data: dict[str, str]) -> None:
    def field(label: str, value: str) -> str:
        return f"**{label}**:{f' {value}' if value else ''}\n"

    ACTIVE.write_text(
        "# Active Workflow\n\n"
        + field("Feature", data.get("feature", ""))
        + field("Phase", data.get("phase", ""))
        + field("Updated", data.get("updated", ""))
        + field("Next", data.get("next", ""))
        + field("Branch / Worktree", data.get("branch / worktree", "")),
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
    phase: str = "planning",
    legacy_import: bool = False,
) -> dict[str, Any]:
    event_type = "migrated" if legacy_import else "created"
    return {
        "schemaVersion": SCHEMA_VERSION,
        "slug": slug,
        "intensity": intensity,
        "phase": phase,
        "nextAction": "Resolve scope and acceptance criteria",
        "riskRequired": risk_required or intensity == "high-risk",
        "decisionsRequired": decisions_required or intensity == "high-risk",
        "legacyImport": legacy_import,
        "gates": initial_gates(intensity, risk_required, decisions_required),
        "history": [
            {
                "at": timestamp(),
                "type": event_type,
                "phase": phase,
                "evidence": (
                    "Imported legacy phase; no historical gates inferred"
                    if legacy_import else "Workflow created"
                ),
            }
        ],
        "updated": timestamp(),
    }


def save_state(state: dict[str, Any]) -> None:
    state["updated"] = timestamp()
    path = state_path(state["slug"])
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (path.parent / "state.md").write_text(render_state(state), encoding="utf-8")


def load_state(slug: str) -> dict[str, Any]:
    path = state_path(slug)
    if not path.exists():
        raise SystemExit(
            f"missing structured state: {path.relative_to(ROOT)}; "
            f"run workflow-state.py migrate {slug} --intensity <intensity>"
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
    ]
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
        lines.extend(
            [
                "",
                "## Archive",
                "",
                f"- Archived at: `{state['archivedAt']}`",
                f"- Result commit: `{state['resultCommit']}`",
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
    return name in ("check", "finish") and status == "accepted_gaps"


def prerequisite_errors(state: dict[str, Any], phase: str) -> list[str]:
    errors = []
    for name in required_for_phase(state, phase):
        status = state["gates"].get(name, {}).get("status", "missing")
        if not receipt_satisfies(name, status):
            errors.append(f"{phase} requires {name}=passed, found {status}")
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
        text = file.read_text(encoding="utf-8")
        for relative in re.findall(r"`((?:docs|scripts|src|tests)/[^`]+)`", text):
            if not (ROOT / relative).exists():
                errors.append(f"{name} links missing path: {relative}")
    return errors


def context_manifest_errors(path: Path) -> list[str]:
    errors = []
    for role in ("implement", "check"):
        manifest = path / "contexts" / f"{role}.jsonl"
        if not manifest.exists():
            errors.append(f"missing context manifest: contexts/{role}.jsonl")
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
    if state.get("schemaVersion") != SCHEMA_VERSION:
        errors.append(f"schemaVersion must be {SCHEMA_VERSION}")
    if state.get("slug") != expected_slug:
        errors.append("state slug/path mismatch")
    if state.get("intensity") not in INTENSITIES:
        errors.append(f"invalid intensity: {state.get('intensity')}")
    if state.get("phase") not in PHASES:
        errors.append(f"invalid phase: {state.get('phase')}")
    if state.get("phase") == "archived":
        for name in (
            "archivedAt", "resultCommit", "archiveSummary", "archiveFollowUp"
        ):
            value = state.get(name)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"archived workflow requires {name}")
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


def workflow_errors(slug: str, require_current_phase: bool = True) -> list[str]:
    path = workflow_dir(slug)
    required = [
        "README.md", "state.md", "workflow.json", "context.md", "decisions.md",
        "spec-links.md", "task-links.md", "validation.md", "journal.md", "finish.md",
        "session-index.md",
    ]
    errors = [
        f"missing workflow file: {name}" for name in required if not (path / name).exists()
    ]
    if errors or not (path / "workflow.json").exists():
        return errors
    try:
        state = load_state(slug)
    except SystemExit as exc:
        return [str(exc)]
    structure = structural_errors(state, slug)
    errors.extend(structure)
    errors.extend(
        f"unresolved placeholder: {name}" for name in unresolved_placeholders(path)
    )
    errors.extend(linked_path_errors(path))
    errors.extend(context_manifest_errors(path))
    if not (path / "sessions").is_dir():
        errors.append("missing workflow directory: sessions")
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


def parse_legacy_phase(path: Path) -> str:
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    match = re.search(r"\*\*Phase\*\*:\s*(\S+)", text)
    phase = match.group(1) if match else "planning"
    return phase if phase in ACTIVE_PHASES else "planning"


def init_project(_: argparse.Namespace) -> None:
    required = [
        "README.md", "state.md", "workflow.json", "context.md", "decisions.md",
        "spec-links.md", "task-links.md", "validation.md", "journal.md", "finish.md",
        "children.md", "children.json", "integration.md",
        "session.md", "session-index.md", "contexts/implement.jsonl",
        "contexts/check.jsonl",
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
        raise SystemExit(f"workflow already exists: {destination.relative_to(ROOT)}")
    shutil.copytree(TEMPLATE, destination)
    replace_placeholders(destination, slug)
    (destination / "session.md").unlink()
    (destination / "sessions").mkdir(exist_ok=True)
    (destination / "research").mkdir()
    if not args.parent:
        for name in ("children.md", "children.json", "integration.md"):
            (destination / name).unlink(missing_ok=True)
    state = new_state(
        slug, args.intensity, args.risk_required, args.decisions_required
    )
    if previous_active.get("feature") and previous_active.get("feature") != slug:
        state["previousActive"] = previous_active
    save_state(state)
    write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(destination.relative_to(ROOT))


def migrate(args: argparse.Namespace) -> None:
    slug = require_slug(args.slug)
    path = workflow_dir(slug)
    if not path.exists():
        raise SystemExit(f"workflow not found: {path.relative_to(ROOT)}")
    if state_path(slug).exists():
        raise SystemExit(f"structured workflow already exists: {state_path(slug).relative_to(ROOT)}")
    phase = parse_legacy_phase(path / "state.md")
    state = new_state(
        slug, args.intensity, args.risk_required, args.decisions_required,
        phase=phase, legacy_import=True,
    )
    state["nextAction"] = "Record evidence for imported pending gates"
    save_state(state)
    if active_data().get("feature") == slug:
        write_active(slug, phase, state["nextAction"], current_branch())
    print(f"migrated: {slug}; historical gates remain pending")


def upgrade_policy(args: argparse.Namespace) -> None:
    """Upgrade legacy auto-waived state without fabricating evidence."""
    slug = require_slug(args.slug)
    state = load_state(slug)
    if state["phase"] == "archived":
        raise SystemExit(
            f"archived workflow is immutable: {slug}; create a new workflow for follow-up"
        )
    gates = state["gates"]
    legacy_waivers = [
        name for name in CORE_REQUIRED_GATES
        if gates.get(name, {}).get("status") == "not_required"
    ]
    legacy_waivers.extend(
        name for name in ("decisions", "risk")
        if gates.get(name, {}).get("status") == "not_required"
        and gates[name].get("evidence") == LEGACY_LOW_RISK_WAIVER
    )
    legacy_waivers = sorted(set(legacy_waivers))
    if not legacy_waivers:
        raise SystemExit("workflow has no legacy auto-waived policy gates to upgrade")

    previous_phase = state["phase"]
    previous_receipts = {name: dict(receipt) for name, receipt in gates.items()}
    for name in legacy_waivers:
        gates[name] = gate()
    for name in ("implementation", "check", "review", "finish"):
        gates[name] = gate()
    state["phase"] = "planning"
    state["nextAction"] = "Reassess decisions, scope, and risk under mandatory lifecycle policy"
    state["policyUpgraded"] = True
    state["history"].append(
        {
            "at": timestamp(),
            "type": "policy_upgrade",
            "phase": "planning",
            "evidence": (
                "Reset legacy auto-waived gates to pending and returned to planning; "
                "previous receipts preserved in this event"
            ),
            "previousPhase": previous_phase,
            "previousReceipts": previous_receipts,
        }
    )
    save_state(state)
    if active_data().get("feature") == slug:
        write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(f"upgraded policy: {slug}; reassessment required")


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


def finish_sections_complete(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8") if path.exists() else ""
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
    validation = path.parent / "validation.md"
    validation_text = validation.read_text(encoding="utf-8") if validation.exists() else ""
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
        if errors:
            raise SystemExit("; ".join(errors))
    state["gates"][args.name] = gate(args.status, evidence)
    state["history"].append(
        {
            "at": timestamp(),
            "type": "gate",
            "gate": args.name,
            "status": args.status,
            "evidence": evidence,
        }
    )
    save_state(state)
    if active_data().get("feature") == slug:
        write_active(slug, state["phase"], state["nextAction"], current_branch())
    print(f"gate: {slug} {args.name}={args.status}")


def note(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    journal = workflow_dir(slug) / "journal.md"
    if not journal.exists():
        raise SystemExit(f"workflow not found: {journal.parent.relative_to(ROOT)}")
    with journal.open("a", encoding="utf-8") as handle:
        handle.write(f"\n- {today()}: {args.message}\n")
    print(f"noted: {slug}")


def create_session(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    path = workflow_dir(slug)
    if not path.exists():
        raise SystemExit(f"workflow not found: {path.relative_to(ROOT)}")
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
    print(f"created session: {destination.relative_to(ROOT)}")


def validate(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    errors = workflow_errors(slug)
    if errors:
        raise SystemExit("\n".join(f"- {error}" for error in errors))
    print(f"valid: {slug}")


def archive(args: argparse.Namespace) -> None:
    slug = resolve_slug(args.slug)
    state = load_state(slug)
    errors = workflow_errors(slug)
    if state["phase"] != "finish":
        errors.append(f"archive requires phase=finish, found {state['phase']}")
    if state["gates"]["finish"]["status"] not in ("passed", "accepted_gaps"):
        errors.append("archive requires finish gate passed")
    errors.extend(finish_sections_complete(workflow_dir(slug) / "finish.md"))
    if errors:
        raise SystemExit("\n".join(f"- {error}" for error in sorted(set(errors))))
    commit = args.commit or "pending"
    archived_at = timestamp()
    follow_up = args.follow_up or "None"
    state["phase"] = "archived"
    state["nextAction"] = follow_up
    state["archivedAt"] = archived_at
    state["resultCommit"] = commit
    state["archiveSummary"] = args.summary
    state["archiveFollowUp"] = follow_up
    state["history"].append(
        {
            "at": archived_at,
            "type": "archived",
            "phase": "archived",
            "evidence": f"{args.summary}; commit: {commit}; follow-up: {follow_up}",
        }
    )
    save_state(state)
    with ARCHIVE.open("a", encoding="utf-8") as handle:
        handle.write(
            f"| {today()} | {slug} | {commit} | {args.summary} | "
            f"{follow_up} |\n"
        )
    previous_active = state.get("previousActive")
    if isinstance(previous_active, dict) and previous_active.get("feature"):
        try:
            previous_state = load_state(previous_active["feature"])
        except SystemExit:
            previous_state = {}
        if previous_state.get("phase") in ACTIVE_PHASES:
            restored_active = dict(previous_active)
            if (
                restored_active.get("phase") != previous_state["phase"]
                or restored_active.get("next") != previous_state["nextAction"]
            ):
                restored_active["phase"] = previous_state["phase"]
                restored_active["next"] = previous_state["nextAction"]
                restored_active["updated"] = today()
            write_active_data(restored_active)
        else:
            write_active("", "", "", "")
    else:
        write_active("", "", "", "")
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

    migrate_parser = commands.add_parser("migrate")
    migrate_parser.add_argument("slug")
    add_creation_options(migrate_parser)
    migrate_parser.set_defaults(func=migrate)

    upgrade_parser = commands.add_parser("upgrade-policy")
    upgrade_parser.add_argument("slug")
    upgrade_parser.set_defaults(func=upgrade_policy)

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

    set_parser = commands.add_parser("set")
    set_parser.add_argument("slug")
    set_parser.add_argument("phase", choices=ACTIVE_PHASES)
    set_parser.add_argument("next_action", nargs="?", default="")
    set_parser.set_defaults(func=transition)

    gate_parser = commands.add_parser("gate")
    gate_parser.add_argument("slug")
    gate_parser.add_argument("name", choices=GATE_NAMES)
    gate_parser.add_argument("status", choices=GATE_STATUSES)
    gate_parser.add_argument("--evidence", required=True)
    gate_parser.set_defaults(func=record_gate)

    note_parser = commands.add_parser("note")
    note_parser.add_argument("slug")
    note_parser.add_argument("message")
    note_parser.set_defaults(func=note)

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
    archive_parser.add_argument("--commit")
    archive_parser.add_argument("--follow-up")
    archive_parser.set_defaults(func=archive)
    return result


if __name__ == "__main__":
    arguments = parser().parse_args()
    arguments.func(arguments)
