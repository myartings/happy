#!/usr/bin/env python3
"""Verify the workflow-2026.09.4 adoption leaves Workspaces passive."""

from __future__ import annotations

import subprocess
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def retired_runtime() -> set[str]:
    path = ROOT / "scripts/validate-happy-workflow.py"
    spec = importlib.util.spec_from_file_location("workspace_cutover_validator", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load validate-happy-workflow.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return set(module.RETIRED)


class WorkspaceCutoverTests(unittest.TestCase):
    def test_workspace_mutation_runtime_is_absent(self) -> None:
        self.assertEqual(
            [relative for relative in retired_runtime() if (ROOT / relative).exists()],
            [],
        )

    def test_historical_workspace_indexes_are_unchanged(self) -> None:
        completed = subprocess.run(
            [
                "git",
                "diff",
                "--quiet",
                "HEAD",
                "--",
                "docs/workspace/ACTIVE.md",
                "docs/workspace/archive.md",
            ],
            cwd=ROOT,
            check=False,
        )
        self.assertEqual(completed.returncode, 0)
        self.assertTrue((ROOT / "docs/workspace/ACTIVE.md").is_file())
        self.assertTrue((ROOT / "docs/workspace/archive.md").is_file())


if __name__ == "__main__":
    unittest.main()
