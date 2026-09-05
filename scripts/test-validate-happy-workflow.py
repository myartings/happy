#!/usr/bin/env python3
"""Tests for Happy's selective workflow adoption validator."""

from __future__ import annotations

import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[1]


def load_validator() -> ModuleType:
    path = ROOT / "scripts/validate-happy-workflow.py"
    spec = importlib.util.spec_from_file_location("validate_happy_workflow", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load validate-happy-workflow.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = load_validator()


def copy_validation_surface(destination: Path) -> None:
    paths = validator.DISTRIBUTED | validator.HAPPY_PRESERVES
    for relative in sorted(paths):
        source = ROOT / relative
        target = destination / relative
        if source.is_dir():
            if relative in validator.EXPECTED_DIRECTORY_FILES:
                shutil.copytree(source, target)
            else:
                target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    marker_files = (
        ".agents/skills/code-review/SKILL.md",
        "scripts/workflow-ci.py",
    )
    for relative in marker_files:
        source = ROOT / relative
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


class ValidatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory(prefix="happy-workflow-validator-")
        self.root = Path(self.directory.name)
        copy_validation_surface(self.root)

    def tearDown(self) -> None:
        self.directory.cleanup()

    def read_json(self, relative: str) -> dict:
        return json.loads((self.root / relative).read_text(encoding="utf-8"))

    def write_json(self, relative: str, value: dict) -> None:
        (self.root / relative).write_text(
            json.dumps(value, indent=2) + "\n", encoding="utf-8"
        )

    def test_current_adoption_surface_is_valid(self) -> None:
        self.assertEqual(validator.validate(self.root), [])

    def test_source_pin_drift_fails(self) -> None:
        manifest = self.read_json(".ai/template-adoption.json")
        manifest["sourceCommit"] = "0" * 40
        self.write_json(".ai/template-adoption.json", manifest)
        self.assertTrue(
            any("must pin" in error for error in validator.validate(self.root))
        )

    def test_frozen_claude_surface_cannot_enter_projection(self) -> None:
        manifest = self.read_json(".ai/template-adoption.json")
        manifest["include"].append(".claude")
        self.write_json(".ai/template-adoption.json", manifest)
        errors = validator.validate(self.root)
        self.assertTrue(any("frozen Claude" in error for error in errors))

    def test_retired_runtime_reintroduction_fails(self) -> None:
        path = self.root / "scripts/workflow-state.py"
        path.write_text("# retired\n", encoding="utf-8")
        self.assertTrue(
            any("retired workflow path" in error for error in validator.validate(self.root))
        )

    def test_hollow_distributed_skill_fails(self) -> None:
        (self.root / ".agents/skills/start/SKILL.md").unlink()
        self.assertTrue(
            any(
                "distributed directory tree drifted: .agents/skills/start" in error
                for error in validator.validate(self.root)
            )
        )

    def test_retired_project_schema_key_fails(self) -> None:
        project = self.read_json(".ai/project.json")
        project["checkProfiles"] = {}
        self.write_json(".ai/project.json", project)
        self.assertTrue(
            any("retired key: checkProfiles" in error for error in validator.validate(self.root))
        )

    def test_missing_happy_preserve_fails(self) -> None:
        manifest = self.read_json(".ai/template-adoption.json")
        manifest["preserve"].remove("devtools")
        self.write_json(".ai/template-adoption.json", manifest)
        self.assertTrue(
            any("omits Happy preserves" in error for error in validator.validate(self.root))
        )

    def test_project_protection_weakening_fails(self) -> None:
        project = self.read_json(".ai/project.json")
        project["protectedPaths"].remove(".env")
        self.write_json(".ai/project.json", project)
        self.assertTrue(
            any("protectedPaths drifted" in error for error in validator.validate(self.root))
        )


if __name__ == "__main__":
    unittest.main()
