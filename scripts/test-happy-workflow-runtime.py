#!/usr/bin/env python3
"""Focused tests for Happy's workflow-2026.09.3 command and submission seams."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
import unittest
from unittest import mock
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, relative: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {relative}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


workflow_check = load_module("happy_workflow_check", "scripts/workflow-check.py")
workflow_ci = load_module("happy_workflow_ci", "scripts/workflow-ci.py")
workflow_validator = load_module(
    "happy_workflow_validator", "scripts/validate-happy-workflow.py"
)


class WorkflowCheckTests(unittest.TestCase):
    def test_configured_groups_are_explicit_and_complete(self) -> None:
        commands = workflow_check.load_commands()
        self.assertEqual(
            list(commands),
            ["setup", "format", "lint", "typecheck", "test", "build", "workflow", "check"],
        )
        self.assertEqual(commands["workflow"], commands["check"])
        self.assertNotIn("workflow-targeted", commands)
        self.assertNotIn("docs-check", commands)

    def test_python_placeholder_uses_active_interpreter(self) -> None:
        argv = workflow_check.command_argv("{python} scripts/validate-happy-workflow.py")
        self.assertEqual(argv[0], sys.executable)
        self.assertEqual(argv[1], "scripts/validate-happy-workflow.py")

    def test_list_reports_only_named_groups(self) -> None:
        completed = subprocess.run(
            [sys.executable, "scripts/workflow-check.py", "--list"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertEqual(
            completed.stdout.splitlines(),
            ["setup", "format", "lint", "typecheck", "test", "build", "workflow", "check"],
        )

    def test_unknown_group_fails_closed(self) -> None:
        completed = subprocess.run(
            [sys.executable, "scripts/workflow-check.py", "not-a-group"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertNotEqual(completed.returncode, 0)
        self.assertIn("unknown command group", completed.stderr)


class WorkflowCiTests(unittest.TestCase):
    def test_happy_validator_is_first_candidate(self) -> None:
        source = (ROOT / "scripts/workflow-ci.py").read_text(encoding="utf-8")
        happy = source.index('root / "scripts" / "validate-happy-workflow.py"')
        generic = source.index('root / "scripts" / "validate-template.py"')
        self.assertLess(happy, generic)

    def test_protected_paths_match_native_and_secret_surfaces(self) -> None:
        patterns = [
            ".env.*",
            "**/credentials/**",
            "packages/happy-app/android/**",
        ]
        self.assertTrue(workflow_ci.protected(".env.local", patterns))
        self.assertTrue(workflow_ci.protected("service/credentials/key.json", patterns))
        self.assertTrue(
            workflow_ci.protected("packages/happy-app/android/app/build.gradle", patterns)
        )
        self.assertFalse(workflow_ci.protected("packages/happy-app/src/index.ts", patterns))

    def test_passive_workspace_changes_fail_closed(self) -> None:
        error = workflow_ci.workspace_path_error(
            ["docs/workspace/historical-task/context.md"], staged=True
        )
        self.assertEqual(
            error,
            "passive historical Workspace changed: "
            "docs/workspace/historical-task/context.md",
        )

    def test_retired_workspace_scaffold_may_only_be_deleted(self) -> None:
        with mock.patch.object(workflow_ci, "candidate_blob", return_value=None):
            self.assertIsNone(
                workflow_ci.workspace_path_error(
                    ["docs/workspace/template/README.md"], staged=True
                )
            )

    def test_historical_workspace_indexes_cannot_be_deleted(self) -> None:
        with mock.patch.object(workflow_ci, "candidate_blob", return_value=None):
            self.assertEqual(
                workflow_ci.workspace_path_error(
                    ["docs/workspace/ACTIVE.md"], staged=True
                ),
                "passive historical Workspace changed: docs/workspace/ACTIVE.md",
            )

    def test_secret_patterns_cover_supported_token_classes(self) -> None:
        samples = {
            "private key": b"-----BEGIN " + b"PRIVATE KEY-----",
            "GitHub token": b"gh" + b"p_abcdefghijklmnopqrstuvwxyz123456",
            "AWS access key": b"AK" + b"IAABCDEFGHIJKLMNOP",
        }
        for label, sample in samples.items():
            pattern = dict(workflow_ci.SECRET_PATTERNS)[label]
            self.assertIsNotNone(pattern.search(sample), label)


class CutoverTests(unittest.TestCase):
    def test_retired_runtime_is_absent(self) -> None:
        self.assertEqual(
            [
                path
                for path in workflow_validator.RETIRED
                if (ROOT / path).exists()
            ],
            [],
        )

    def test_historical_workspace_indexes_remain_unchanged_surfaces(self) -> None:
        self.assertTrue((ROOT / "docs/workspace/ACTIVE.md").is_file())
        self.assertTrue((ROOT / "docs/workspace/archive.md").is_file())

    def test_compatibility_audit_validates_without_workspace_runtime(self) -> None:
        completed = subprocess.run(
            [sys.executable, "scripts/workflow-audit.py", "--all", "--strict"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertIn("Workspaces remain passive", completed.stdout)


if __name__ == "__main__":
    unittest.main()
