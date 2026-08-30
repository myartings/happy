#!/usr/bin/env python3
"""Behavior tests for Happy's selective workflow-adoption validator."""

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / "scripts" / "validate-happy-workflow.py"
WORKFLOW_CHECK = ROOT / "scripts" / "workflow-check.py"


def load_validator():
    spec = importlib.util.spec_from_file_location("happy_workflow_validator", VALIDATOR)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load Happy workflow validator")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_workflow_check():
    spec = importlib.util.spec_from_file_location("happy_workflow_check", WORKFLOW_CHECK)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load workflow check runtime")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class HappyWorkflowValidatorTest(unittest.TestCase):
    def setUp(self) -> None:
        self.validator = load_validator()

    def test_repository_adoption_manifest_is_valid(self) -> None:
        self.assertEqual([], self.validator.adoption_errors(ROOT))

    def test_adoption_rejects_relative_source_and_broad_sync_paths(self) -> None:
        with tempfile.TemporaryDirectory(prefix="happy-adoption-invalid-") as raw:
            root = Path(raw)
            (root / ".ai").mkdir()
            (root / ".ai" / "template-adoption.json").write_text(
                json.dumps(
                    {
                        "schemaVersion": 1,
                        "source": "../ai-coding-template",
                        "policy": "selective-workflow-core",
                        "include": ["AGENTS.md", ".agents/skills", ".claude/skills"],
                        "preserve": [],
                        "requiredProjectChecks": [],
                    }
                ),
                encoding="utf-8",
            )

            errors = self.validator.adoption_errors(root)

        self.assertTrue(any("schemaVersion must be 2" in error for error in errors))
        self.assertTrue(any("immutable source" in error for error in errors))
        self.assertTrue(any("forbidden or broad include" in error for error in errors))

    def test_adoption_rejects_mismatched_immutable_source(self) -> None:
        with tempfile.TemporaryDirectory(prefix="happy-adoption-source-") as raw:
            root = Path(raw)
            (root / ".ai").mkdir()
            adoption = json.loads(
                (ROOT / ".ai" / "template-adoption.json").read_text()
            )
            adoption["sourceCommit"] = "0" * 40
            (root / ".ai" / "template-adoption.json").write_text(
                json.dumps(adoption), encoding="utf-8"
            )

            errors = self.validator.adoption_errors(root)

        self.assertTrue(any("immutable source" in error for error in errors))

    def test_repository_project_configuration_is_valid(self) -> None:
        self.assertEqual([], self.validator.project_config_errors(ROOT))

    def test_project_configuration_rejects_nonportable_python_commands(self) -> None:
        with tempfile.TemporaryDirectory(prefix="happy-project-invalid-") as raw:
            root = Path(raw)
            (root / ".ai").mkdir()
            config = json.loads((ROOT / ".ai" / "project.json").read_text())
            config["commands"]["check"] = ["python3 scripts/workflow-audit.py --strict"]
            (root / ".ai" / "project.json").write_text(
                json.dumps(config), encoding="utf-8"
            )

            errors = self.validator.project_config_errors(root)

        self.assertTrue(any("must use {python}" in error for error in errors))

    def test_project_configuration_rejects_malformed_command_groups(self) -> None:
        with tempfile.TemporaryDirectory(prefix="happy-project-malformed-") as raw:
            root = Path(raw)
            (root / ".ai").mkdir()
            config = json.loads((ROOT / ".ai" / "project.json").read_text())
            config["commands"]["check"] = 42
            (root / ".ai" / "project.json").write_text(
                json.dumps(config), encoding="utf-8"
            )

            errors = self.validator.project_config_errors(root)

        self.assertTrue(any("command group check must be a list" in error for error in errors))
        self.assertTrue(any("project check omits required" in error for error in errors))

    def test_project_configuration_rejects_preserved_authority_drift(self) -> None:
        cases = (
            (
                "tracker provider",
                lambda config: config["tracker"].__setitem__("provider", "not-github"),
                "Happy tracker configuration drifted",
            ),
            (
                "tracker target",
                lambda config: config["tracker"].__setitem__("target", "other/repo"),
                "Happy tracker configuration drifted",
            ),
            (
                "tracker categories",
                lambda config: config["tracker"].__setitem__("categories", {}),
                "Happy tracker configuration drifted",
            ),
            (
                "tracker states",
                lambda config: config["tracker"].__setitem__("states", {}),
                "Happy tracker configuration drifted",
            ),
            (
                "protected paths",
                lambda config: config["protectedPaths"].append("unexpected/**"),
                "Happy protected paths drifted",
            ),
            (
                "generated paths",
                lambda config: config.__setitem__("generatedPaths", []),
                "Happy generated paths drifted",
            ),
            (
                "risk triggers",
                lambda config: config.__setitem__("riskTriggers", []),
                "Happy risk triggers drifted",
            ),
        )
        for label, mutate, expected in cases:
            with self.subTest(label=label):
                with tempfile.TemporaryDirectory(
                    prefix="happy-project-authority-"
                ) as raw:
                    root = Path(raw)
                    (root / ".ai").mkdir()
                    config = json.loads(
                        (ROOT / ".ai" / "project.json").read_text()
                    )
                    mutate(config)
                    (root / ".ai" / "project.json").write_text(
                        json.dumps(config), encoding="utf-8"
                    )

                    errors = self.validator.project_config_errors(root)

                self.assertIn(expected, errors)

    def test_authority_rejects_missing_runtime_and_preserved_rules(self) -> None:
        with tempfile.TemporaryDirectory(prefix="happy-authority-missing-") as raw:
            errors = self.validator.authority_errors(Path(raw))

        self.assertIn(
            "missing adopted workflow surface: scripts/workflow-run.py", errors
        )
        self.assertTrue(any("missing Happy workflow authority" in error for error in errors))

    def test_retired_and_happy_runtime_tests_select_the_workflow_profile(self) -> None:
        workflow_check = load_workflow_check()
        config = json.loads((ROOT / ".ai" / "project.json").read_text())

        selected = workflow_check.select_applicable_profiles(
            config,
            [
                ".ai/project.json",
                ".codex/README.md",
                "docs/workflow.md",
                "scripts/test-workflow.py",
                "scripts/test-happy-workflow-runtime.py",
            ],
        )

        self.assertEqual(("workflow",), selected)


if __name__ == "__main__":
    unittest.main()
