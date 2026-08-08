#!/usr/bin/env python3
"""Run portable workflow tests while excluding template-maintenance policy tests."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "test-workflow.py"
TEMPLATE_ONLY_TESTS = (
    "test_template_policy_check_rejects_lightweight_language",
    "test_tdd_policy_requires_behavior_first_vertical_slices",
)


def main() -> int:
    spec = importlib.util.spec_from_file_location("workflow_tests", SOURCE)
    if spec is None or spec.loader is None:
        raise SystemExit("cannot load scripts/test-workflow.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    for name in TEMPLATE_ONLY_TESTS:
        if not hasattr(module.WorkflowTest, name):
            raise SystemExit(f"expected template-only workflow test is missing: {name}")
        delattr(module.WorkflowTest, name)

    suite = unittest.defaultTestLoader.loadTestsFromModule(module)
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(main())
