#!/usr/bin/env python3
"""Tests for the one-time Happy active Workspace schema upgrade."""

from __future__ import annotations

import importlib.util
import unittest
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
UPGRADER = ROOT / "scripts" / "happy-workflow-state-upgrade.py"


def load_upgrader():
    spec = importlib.util.spec_from_file_location("happy_state_upgrader", UPGRADER)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load Happy state upgrader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class HappyWorkflowStateUpgradeTest(unittest.TestCase):
    def test_upgrade_preserves_evidence_and_adds_only_current_authority(self) -> None:
        upgrader = load_upgrader()
        gates = {
            name: {"status": "passed", "evidence": name, "updated": "before"}
            for name in ("acceptance", "decisions", "scoping", "risk")
        }
        gates.update(
            {
                name: {"status": "pending", "evidence": "", "updated": "before"}
                for name in ("implementation", "check", "review", "finish")
            }
        )
        original = {
            "schemaVersion": 1,
            "slug": "workflow-template-2026-08-2-adoption",
            "intensity": "high-risk",
            "phase": "implementation",
            "nextAction": "Continue migration",
            "riskRequired": True,
            "decisionsRequired": True,
            "legacyImport": False,
            "gates": gates,
            "history": [{"type": "created", "evidence": "real evidence"}],
            "updated": "before",
        }
        source = {
            "kind": "local-only",
            "reason": "Current-session selective Happy workflow migration",
            "approval": "User accepted the recommended migration in this session",
        }
        original_snapshot = deepcopy(original)

        upgraded = upgrader.upgrade_state(original, source, "after")

        self.assertEqual(original_snapshot, original)
        self.assertEqual(3, upgraded["schemaVersion"])
        self.assertNotIn("legacyImport", upgraded)
        self.assertEqual("standard", upgraded["layout"])
        self.assertEqual("standard", upgraded["workspaceKind"])
        self.assertEqual(1, upgraded["deliverySourcePolicy"])
        self.assertEqual(source, upgraded["deliverySource"])
        self.assertEqual(original_snapshot["gates"], upgraded["gates"])
        self.assertEqual(original_snapshot["history"], upgraded["history"][:-1])
        self.assertEqual("downstream_active_schema_upgrade", upgraded["history"][-1]["type"])
        self.assertEqual("after", upgraded["updated"])

    def test_upgrade_rejects_malformed_history_without_mutating_input(self) -> None:
        upgrader = load_upgrader()
        gates = {
            name: {"status": "passed", "evidence": name, "updated": "before"}
            for name in ("acceptance", "decisions", "scoping", "risk")
        }
        gates.update(
            {
                name: {"status": "pending", "evidence": "", "updated": "before"}
                for name in ("implementation", "check", "review", "finish")
            }
        )
        original = {
            "schemaVersion": 1,
            "slug": "workflow-template-2026-08-2-adoption",
            "intensity": "high-risk",
            "phase": "implementation",
            "nextAction": "Continue migration",
            "riskRequired": True,
            "decisionsRequired": True,
            "legacyImport": False,
            "gates": gates,
            "history": None,
            "updated": "before",
        }
        source = {
            "kind": "local-only",
            "reason": "Current-session selective Happy workflow migration",
            "approval": "User accepted the recommended migration in this session",
        }
        original_snapshot = deepcopy(original)

        with self.assertRaisesRegex(ValueError, "structured history"):
            upgrader.upgrade_state(original, source, "after")

        self.assertEqual(original_snapshot, original)


if __name__ == "__main__":
    unittest.main()
