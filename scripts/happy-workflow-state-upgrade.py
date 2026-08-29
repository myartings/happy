#!/usr/bin/env python3
"""Upgrade one active pre-release Happy Workspace without inventing receipts."""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import tempfile
from copy import deepcopy
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
STATE_RUNTIME = ROOT / "scripts" / "workflow-state.py"
TARGET_SCHEMA_VERSION = 3
DELIVERY_SOURCE_POLICY_VERSION = 1
RETIRED_FIELDS = {
    "legacyImport",
    "policyUpgraded",
    "agentTelemetryPolicy",
    "agentEvents",
    "reviewAdmissions",
    "reviewConclusions",
    "reviewGates",
    "reviewLedgerPolicy",
    "reviewLedgerStartRevision",
    "reviewConvergencePolicy",
    "reviewConvergenceV1PrefixLength",
}


def load_runtime():
    spec = importlib.util.spec_from_file_location("happy_workflow_state_runtime", STATE_RUNTIME)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load scripts/workflow-state.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def non_empty(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.strip() or "\n" in value or "\r" in value:
        raise ValueError(f"{label} must be a non-empty single line")
    return value.strip()


def upgrade_state(
    original: dict[str, Any], source: dict[str, str], updated: str
) -> dict[str, Any]:
    if original.get("schemaVersion") != 1:
        raise ValueError("active upgrade requires schemaVersion 1")
    if original.get("phase") == "archived":
        raise ValueError("historical archived Workspaces are passive and cannot be upgraded")
    if original.get("legacyImport") is not False:
        raise ValueError("active upgrade requires an ordinary non-imported Happy Workspace")
    unexpected_retired = sorted((set(original) & RETIRED_FIELDS) - {"legacyImport"})
    if unexpected_retired:
        raise ValueError("unsupported retired fields: " + ", ".join(unexpected_retired))
    if original.get("intensity") not in {"feature", "high-risk"}:
        raise ValueError("active upgrade is only needed for Feature or High-risk state")
    gates = original.get("gates")
    if not isinstance(gates, dict):
        raise ValueError("active upgrade requires structured gates")
    if not isinstance(original.get("history"), list):
        raise ValueError("active upgrade requires structured history")
    for name in ("acceptance", "decisions", "scoping", "risk"):
        receipt = gates.get(name)
        if not isinstance(receipt, dict) or receipt.get("status") not in {
            "passed",
            "accepted_gaps",
            "not_required",
        }:
            raise ValueError(f"active upgrade requires existing {name} evidence")
    if source.get("kind") != "local-only":
        raise ValueError("Happy active upgrade accepts only an approved local-only source")
    normalized_source = {
        "kind": "local-only",
        "reason": non_empty(source.get("reason"), "local-only reason"),
        "approval": non_empty(source.get("approval"), "local-only approval"),
    }
    stamp = non_empty(updated, "upgrade timestamp")

    upgraded = deepcopy(original)
    upgraded.pop("legacyImport")
    upgraded["schemaVersion"] = TARGET_SCHEMA_VERSION
    upgraded["layout"] = "standard"
    upgraded["workspaceKind"] = "standard"
    upgraded["deliverySourcePolicy"] = DELIVERY_SOURCE_POLICY_VERSION
    upgraded["deliverySource"] = normalized_source
    upgraded["updated"] = stamp
    upgraded["history"].append(
        {
            "at": stamp,
            "type": "downstream_active_schema_upgrade",
            "phase": upgraded["phase"],
            "evidence": (
                "Preserved schema-1 gates/history; removed legacyImport; added "
                "schema-3 standard layout and approved local-only delivery source"
            ),
        }
    )
    return upgraded


def atomic_replace_texts(replacements: dict[Path, str]) -> None:
    originals = {path: path.read_bytes() for path in replacements}
    temporary: dict[Path, Path] = {}
    try:
        for path, text in replacements.items():
            descriptor, raw = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
            temporary[path] = Path(raw)
            with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
                handle.write(text)
                handle.flush()
                os.fsync(handle.fileno())
        for path, staged in temporary.items():
            os.replace(staged, path)
    except BaseException:
        for path, data in originals.items():
            path.write_bytes(data)
        raise
    finally:
        for staged in temporary.values():
            staged.unlink(missing_ok=True)


def run(slug: str, reason: str, approval: str) -> None:
    runtime = load_runtime()
    if (
        runtime.SCHEMA_VERSION != TARGET_SCHEMA_VERSION
        or runtime.DELIVERY_SOURCE_POLICY_VERSION != DELIVERY_SOURCE_POLICY_VERSION
    ):
        raise SystemExit("active upgrade runtime version does not match the accepted release")
    active = runtime.active_data()
    if active.get("feature") != slug:
        raise SystemExit(f"active Workspace mismatch: {active.get('feature', '')} != {slug}")
    path = runtime.workflow_dir(slug)
    workflow_path = path / "workflow.json"
    state_md_path = path / "state.md"
    task_links_path = path / "task-links.md"
    for required in (workflow_path, state_md_path, task_links_path, runtime.ACTIVE):
        if not required.is_file():
            raise SystemExit(f"active upgrade requires {required.relative_to(ROOT).as_posix()}")
    try:
        original = json.loads(workflow_path.read_text(encoding="utf-8"))
        if active.get("phase") != original.get("phase"):
            raise ValueError("ACTIVE phase does not match workflow.json")
        if active.get("next") != original.get("nextAction"):
            raise ValueError("ACTIVE next action does not match workflow.json")
        source = {"kind": "local-only", "reason": reason, "approval": approval}
        upgraded = upgrade_state(original, source, runtime.timestamp())
    except (json.JSONDecodeError, ValueError) as exc:
        raise SystemExit(f"active upgrade preflight failed: {exc}") from exc

    lines = [
        line
        for line in task_links_path.read_text(encoding="utf-8").splitlines()
        if not line.startswith("- Delivery source:")
    ]
    insertion = next(
        (index + 1 for index, line in enumerate(lines) if line.startswith("- Delivery slice:")),
        2,
    )
    lines.insert(insertion, runtime.delivery_source_line(upgraded["deliverySource"]))
    active["phase"] = upgraded["phase"]
    active["updated"] = runtime.today()
    active["next"] = upgraded["nextAction"]

    original_texts = {
        workflow_path: workflow_path.read_text(encoding="utf-8"),
        state_md_path: state_md_path.read_text(encoding="utf-8"),
        task_links_path: task_links_path.read_text(encoding="utf-8"),
        runtime.ACTIVE: runtime.ACTIVE.read_text(encoding="utf-8"),
    }
    replacements = {
        workflow_path: runtime.render_workflow_json(upgraded),
        state_md_path: runtime.render_state(upgraded),
        task_links_path: "\n".join(lines) + "\n",
        runtime.ACTIVE: runtime.render_active_data(active),
    }
    atomic_replace_texts(replacements)
    errors = runtime.workflow_errors(slug)
    if errors:
        atomic_replace_texts(original_texts)
        raise SystemExit("active upgrade validation failed: " + "; ".join(errors))
    print(f"upgraded active Workspace: {slug} schema 1 -> 3")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("slug")
    parser.add_argument("--reason", required=True)
    parser.add_argument("--approval", required=True)
    args = parser.parse_args()
    run(args.slug, args.reason, args.approval)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
