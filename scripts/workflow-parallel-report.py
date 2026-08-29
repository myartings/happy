#!/usr/bin/env python3
"""Report recorded current parallel topology without mutating repository state."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT / "docs" / "workspace"
REPORT_SCHEMA = 2
TOPOLOGY_POLICY = 2
LIMITATIONS = [
    (
        "This diagnostic does not measure opportunity adoption or utilization. "
        "Unrecorded serial work is outside this sample and is not a denominator."
    ),
    (
        "This diagnostic does not measure time saved, integration success, "
        "conflict, or rework."
    ),
]


class EvidenceError(ValueError):
    pass


def parse_date(raw: str) -> dt.date:
    try:
        return dt.date.fromisoformat(raw)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("date must use YYYY-MM-DD") from exc


def positive_int(raw: str) -> int:
    try:
        value = int(raw)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("value must be an integer") from exc
    if value <= 0:
        raise argparse.ArgumentTypeError("value must be positive")
    return value


def parse_timestamp(raw: Any, label: str, field: str) -> dt.datetime:
    if not isinstance(raw, str) or not raw.strip():
        raise EvidenceError(f"{label} requires {field}")
    try:
        parsed = dt.datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError as exc:
        raise EvidenceError(f"{label} has invalid {field}") from exc
    if parsed.tzinfo is None:
        raise EvidenceError(f"{label} {field} requires timezone")
    return parsed


def validated_initial(raw: Any, label: str) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise EvidenceError(f"{label} initial topology must be an object")
    if raw.get("decision") != "batch-plan":
        raise EvidenceError(f"{label} initial topology must select batch-plan")
    ready_units = raw.get("readyUnits")
    if type(ready_units) is not int or ready_units < 2:
        raise EvidenceError(
            f"{label} initial batch-plan requires at least two ready units"
        )
    reason = raw.get("reason")
    if not isinstance(reason, str) or not reason.strip():
        raise EvidenceError(f"{label} initial topology requires reason")
    return {
        "decision": "batch-plan",
        "readyUnits": ready_units,
        "reason": reason.strip(),
    }


def validated_reassessment(raw: Any, label: str, index: int) -> dict[str, Any]:
    item_label = f"{label} reassessment {index}"
    if not isinstance(raw, dict):
        raise EvidenceError(f"{item_label} must be an object")
    decision = raw.get("decision")
    if decision not in ("serial", "batch-plan"):
        raise EvidenceError(f"{item_label} has invalid decision")
    ready_units = raw.get("readyUnits")
    if type(ready_units) is not int or ready_units < 0:
        raise EvidenceError(f"{item_label} has invalid readyUnits")
    if decision == "batch-plan" and ready_units < 2:
        raise EvidenceError(f"{item_label} batch-plan requires two ready units")
    result: dict[str, Any] = {
        "decision": decision,
        "readyUnits": ready_units,
    }
    for field in ("trigger", "reason"):
        value = raw.get(field)
        if not isinstance(value, str) or not value.strip():
            raise EvidenceError(f"{item_label} requires {field}")
        result[field] = value.strip()
    timestamp = raw.get("at")
    parse_timestamp(timestamp, item_label, "at")
    result["at"] = timestamp.strip()
    return result


def validated_entry(state: dict[str, Any], state_path: Path) -> dict[str, Any]:
    label = state_path.parent.name
    if state.get("slug") != label:
        raise EvidenceError(f"{label} current topology has mismatched slug")
    archived_at = parse_timestamp(state.get("archivedAt"), label, "archivedAt")
    initial = validated_initial(state.get("parallelAssessment"), label)
    raw_reassessments = state.get("parallelReassessments")
    if not isinstance(raw_reassessments, list):
        raise EvidenceError(f"{label} parallelReassessments must be a list")
    reassessments = [
        validated_reassessment(item, label, index)
        for index, item in enumerate(raw_reassessments, 1)
    ]
    history = state.get("history")
    if not isinstance(history, list):
        raise EvidenceError(f"{label} current topology requires history")
    projected = [
        {
            key: item.get(key)
            for key in ("decision", "readyUnits", "trigger", "reason", "at")
        }
        for item in history
        if isinstance(item, dict) and item.get("type") == "parallel_reassessment"
    ]
    if projected != reassessments:
        raise EvidenceError(f"{label} reassessments do not match workflow history")
    return {
        "slug": label,
        "archivedAt": archived_at,
        "initial": initial,
        "reassessments": reassessments,
    }


def load_recorded_topologies() -> list[dict[str, Any]]:
    if not WORKSPACE.is_dir():
        raise EvidenceError("missing docs/workspace")
    entries: list[dict[str, Any]] = []
    for state_path in sorted(WORKSPACE.glob("*/workflow.json")):
        if state_path.parent.name == "template":
            continue
        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(state, dict) or state.get("phase") != "archived":
            continue
        if state.get("parallelAssessmentPolicy") != TOPOLOGY_POLICY:
            continue
        entries.append(validated_entry(state, state_path))
    return sorted(entries, key=lambda item: (item["archivedAt"], item["slug"]))


def head_revision() -> str:
    completed = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True,
        capture_output=True, check=False,
    )
    return completed.stdout.strip() if completed.returncode == 0 else "unborn"


def build_report(selected: list[dict[str, Any]]) -> dict[str, Any]:
    current_routes: Counter[str] = Counter()
    reassessment_events: Counter[str] = Counter()
    reassessed_workflows = 0
    total_events = 0
    for entry in selected:
        changes = entry["reassessments"]
        current = changes[-1] if changes else entry["initial"]
        current_routes[current["decision"]] += 1
        if changes:
            reassessed_workflows += 1
        total_events += len(changes)
        reassessment_events.update(item["decision"] for item in changes)
    return {
        "schemaVersion": REPORT_SCHEMA,
        "headRevision": head_revision(),
        "sample": {
            "recordedTopologies": len(selected),
            "slugs": [entry["slug"] for entry in selected],
        },
        "initialRoutes": {"batch-plan": len(selected)},
        "currentRoutes": {
            "batch-plan": current_routes["batch-plan"],
            "serial": current_routes["serial"],
        },
        "reassessments": {
            "workflows": reassessed_workflows,
            "events": total_events,
            "toBatchPlan": reassessment_events["batch-plan"],
            "toSerial": reassessment_events["serial"],
        },
        "limitations": LIMITATIONS,
    }


def render_markdown(report: dict[str, Any]) -> str:
    sample = report["sample"]
    current = report["currentRoutes"]
    reassessments = report["reassessments"]
    lines = [
        "# On-Demand Parallel Evidence Report",
        "",
        f"Revision: `{report['headRevision']}`",
        "",
        "| Metric | Result |",
        "| --- | --- |",
        f"| Recorded topologies | {sample['recordedTopologies']} |",
        f"| Initial batch-plan routes | {report['initialRoutes']['batch-plan']} |",
        f"| Current batch-plan routes | {current['batch-plan']} |",
        f"| Current serial routes | {current['serial']} |",
        f"| Reassessed workflows | {reassessments['workflows']} |",
        f"| Reassessment events | {reassessments['events']} |",
        f"| Reassessments to batch-plan | {reassessments['toBatchPlan']} |",
        f"| Reassessments to serial | {reassessments['toSerial']} |",
        "",
        "## Selected Workspaces",
        "",
    ]
    if sample["slugs"]:
        lines.extend(f"- {slug}" for slug in sample["slugs"])
    else:
        lines.append("- None.")
    lines.extend([
        "",
        "## Evidence limitations",
        "",
        *(f"- {item}" for item in report["limitations"]),
    ])
    return "\n".join(lines) + "\n"


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser()
    result.add_argument("--last", type=positive_int, default=20)
    result.add_argument("--since", type=parse_date)
    result.add_argument("--format", choices=("markdown", "json"), default="markdown")
    return result


def main() -> int:
    args = parser().parse_args()
    try:
        selected = load_recorded_topologies()
        if args.since is not None:
            selected = [
                item for item in selected
                if item["archivedAt"].date() >= args.since
            ]
        selected = selected[-args.last:]
        report = build_report(selected)
        output = (
            json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
            if args.format == "json"
            else render_markdown(report)
        )
        sys.stdout.write(output)
        return 0
    except EvidenceError as exc:
        print(f"parallel report failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
