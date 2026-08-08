#!/usr/bin/env python3
"""Behavior tests for commit-bound workflow CI enforcement."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "completed-fixture"
ACTIVE_SLUG = "unrelated-active"
EMPTY_ACTIVE = (
    "# Active Workflow\n\n**Feature**:\n**Phase**:\n**Updated**:\n"
    "**Next**:\n**Branch / Worktree**:\n"
)
EMPTY_ARCHIVE = (
    "# Workflow Archive\n\n"
    "| Date | Feature | Commit | Summary | Follow-up |\n"
    "| --- | --- | --- | --- | --- |\n"
)


class WorkflowCiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="workflow-ci-")
        self.project = Path(self.temp.name) / "project"
        (self.project / "scripts").mkdir(parents=True)
        (self.project / ".ai").mkdir()
        (self.project / "docs" / "workspace").mkdir(parents=True)
        (self.project / "CONTEXT.md").write_text("# Context\n", encoding="utf-8")
        (self.project / "docs" / "ARCHITECTURE.md").write_text(
            "# Architecture\n", encoding="utf-8"
        )
        (self.project / ".ai" / "project.json").write_text(
            '{"schemaVersion":1,"commands":{"check":[]}}\n', encoding="utf-8"
        )
        for name in ("workflow-ci.py", "workflow-state.py", "workflow-audit.py"):
            shutil.copy2(ROOT / "scripts" / name, self.project / "scripts" / name)
        shutil.copytree(
            ROOT / "docs" / "workspace" / "template",
            self.project / "docs" / "workspace" / "template",
        )
        (self.project / "docs" / "workspace" / "ACTIVE.md").write_text(
            EMPTY_ACTIVE, encoding="utf-8"
        )
        (self.project / "docs" / "workspace" / "archive.md").write_text(
            EMPTY_ARCHIVE, encoding="utf-8"
        )
        self.git("init")
        self.git("config", "user.email", "workflow@example.test")
        self.git("config", "user.name", "Workflow Test")
        self.git("add", ".")
        self.git("commit", "-m", "baseline")

    def tearDown(self) -> None:
        self.temp.cleanup()

    def git(self, *args: str) -> subprocess.CompletedProcess[str]:
        completed = subprocess.run(
            ["git", *args], cwd=self.project, text=True,
            capture_output=True, check=False,
        )
        if completed.returncode:
            self.fail(
                f"git {' '.join(args)} failed:\n"
                f"stdout={completed.stdout}\nstderr={completed.stderr}"
            )
        return completed

    def run_ci(self, *args: str, ok: bool = True) -> subprocess.CompletedProcess[str]:
        completed = subprocess.run(
            [sys.executable, "scripts/workflow-ci.py", *args],
            cwd=self.project, text=True, capture_output=True, check=False,
        )
        if ok and completed.returncode:
            self.fail(f"workflow CI failed:\n{completed.stdout}\n{completed.stderr}")
        if not ok and completed.returncode == 0:
            self.fail("workflow CI unexpectedly passed")
        return completed

    def state(self, *args: str) -> None:
        completed = subprocess.run(
            [sys.executable, "scripts/workflow-state.py", *args],
            cwd=self.project, text=True, capture_output=True, check=False,
        )
        if completed.returncode:
            self.fail(
                f"workflow-state {' '.join(args)} failed:\n"
                f"stdout={completed.stdout}\nstderr={completed.stderr}"
            )

    def write(self, relative: str, content: str) -> None:
        target = self.project / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")

    def stage_completed_fixture(self, finish_status: str = "passed") -> None:
        self.state(
            "create", SLUG, "--intensity", "high-risk",
            "--decisions-required", "--risk-required",
        )
        workspace = f"docs/workspace/{SLUG}"
        self.write(
            f"{workspace}/context.md",
            f"# Context: `{SLUG}`\n\n- `scripts/workflow-ci.py` — fixture target\n",
        )
        self.write(
            f"{workspace}/decisions.md",
            f"# Decisions: `{SLUG}`\n\n- All fixture decisions are resolved.\n",
        )
        self.write("docs/specs/completed-fixture.md", "# Completed Fixture Spec\n")
        self.write("docs/tasks/completed-fixture.md", "# Completed Fixture Task\n")
        self.write(
            f"{workspace}/spec-links.md",
            f"# Specification Links: `{SLUG}`\n\n"
            "- Feature spec: `docs/specs/completed-fixture.md`\n",
        )
        self.write(
            f"{workspace}/task-links.md",
            f"# Task Links: `{SLUG}`\n\n"
            "- Task list: `docs/tasks/completed-fixture.md`\n"
            "- Tracker item: local test fixture\n"
            "- Pull request: none\n"
            "- Branch/worktree: isolated temporary repository\n",
        )
        self.state(
            "gate", SLUG, "acceptance", "passed",
            "--evidence", "docs/specs/completed-fixture.md",
        )
        self.state(
            "gate", SLUG, "decisions", "passed",
            "--evidence", "fixture decisions resolved",
        )
        self.state(
            "gate", SLUG, "risk", "passed",
            "--evidence", "isolated temporary repository",
        )
        self.state(
            "gate", SLUG, "scoping", "passed",
            "--evidence", "fixture files only",
        )
        self.state("transition", SLUG, "implementation", "Build fixture")
        self.state(
            "gate", SLUG, "implementation", "passed",
            "--evidence", "fixture implemented",
        )
        self.state("transition", SLUG, "verification", "Verify fixture")
        self.state(
            "gate", SLUG, "check", "passed",
            "--evidence", "fixture checks passed",
        )
        self.state(
            "gate", SLUG, "review", "passed",
            "--evidence", "fixture review passed",
        )
        self.write(
            f"{workspace}/validation.md",
            f"# Validation: `{SLUG}`\n\n"
            "| Command | Result |\n| --- | --- |\n| fixture | passed |\n\n"
            "## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n| --- | --- | --- |\n"
            "| Complete fixture | verified | state-machine receipts |\n\n"
            "## Remaining gaps\n\n- None.\n",
        )
        self.write(
            f"{workspace}/finish.md",
            f"# Finish Review: `{SLUG}`\n\n"
            "## Summary\n\nFixture completed.\n\n"
            "## Verification\n\nFixture checks passed.\n\n"
            "## Whole-diff review\n\nFixture scope reviewed.\n\n"
            "## Rollback or mitigation\n\nDelete the temporary repository.\n\n"
            "## Lessons promoted\n\nNo promotion required.\n\n"
            "## Follow-up\n\nNone.\n",
        )
        self.state("transition", SLUG, "finish", "Finish fixture")
        self.state(
            "gate", SLUG, "finish", finish_status,
            "--evidence", "fixture completion evidence",
        )
        self.state(
            "archive", SLUG, "--summary", "Completed workflow fixture",
            "--commit", "pending",
        )
        self.git("add", ".")

    def commit_unrelated_active_fixture(self) -> None:
        self.state("create", ACTIVE_SLUG, "--intensity", "low-risk")
        workspace = f"docs/workspace/{ACTIVE_SLUG}"
        self.write(
            f"{workspace}/context.md",
            f"# Context: `{ACTIVE_SLUG}`\n\nActive integration fixture.\n",
        )
        self.write(
            f"{workspace}/decisions.md",
            f"# Decisions: `{ACTIVE_SLUG}`\n\nNo open decisions.\n",
        )
        self.write("docs/specs/unrelated-active.md", "# Unrelated Active Spec\n")
        self.write("docs/tasks/unrelated-active.md", "# Unrelated Active Task\n")
        self.write(
            f"{workspace}/spec-links.md",
            f"# Specification Links: `{ACTIVE_SLUG}`\n\n"
            "- Feature spec: `docs/specs/unrelated-active.md`\n",
        )
        self.write(
            f"{workspace}/task-links.md",
            f"# Task Links: `{ACTIVE_SLUG}`\n\n"
            "- Task list: `docs/tasks/unrelated-active.md`\n"
            "- Tracker item: local test fixture\n"
            "- Pull request: none\n"
            "- Branch/worktree: main fixture\n",
        )
        self.git("add", ".")
        self.git("commit", "-m", "active workflow baseline")

    def test_completed_staged_archive_passes(self) -> None:
        self.stage_completed_fixture()
        self.run_ci("--staged")

    def test_accepted_finish_gaps_staged_archive_passes(self) -> None:
        self.stage_completed_fixture("accepted_gaps")
        self.run_ci("--staged")

    def test_completed_committed_diff_passes(self) -> None:
        self.stage_completed_fixture()
        self.git("commit", "-m", "completed workflow")
        self.run_ci("--base", "HEAD^")

    def test_absent_base_falls_back_to_parent_commit(self) -> None:
        self.stage_completed_fixture()
        self.git("commit", "-m", "completed workflow")
        self.run_ci()

    def test_zero_push_base_checks_from_empty_tree(self) -> None:
        self.stage_completed_fixture()
        self.git("commit", "-m", "completed workflow")
        self.run_ci("--base", "0" * 40)

    def test_invalid_supplied_base_fails_closed(self) -> None:
        result = self.run_ci("--base", "deadbeef" * 5, ok=False)
        self.assertIn("base revision does not exist", result.stdout)

    def test_missing_archive_fails(self) -> None:
        (self.project / "README.md").write_text("change\n", encoding="utf-8")
        self.git("add", "README.md")
        result = self.run_ci("--staged", ok=False)
        self.assertIn("archive has no completed workflow row", result.stdout)

    def test_stale_archive_fails_for_later_commit(self) -> None:
        self.stage_completed_fixture()
        self.git("commit", "-m", "completed workflow")
        (self.project / "README.md").write_text("later\n", encoding="utf-8")
        self.git("add", "README.md")
        result = self.run_ci("--staged", ok=False)
        self.assertIn("latest archive row was not added", result.stdout)

    def test_active_workflow_fails(self) -> None:
        self.stage_completed_fixture()
        active = self.project / "docs" / "workspace" / "ACTIVE.md"
        active.write_text(EMPTY_ACTIVE.replace("**Feature**:", f"**Feature**: {SLUG}"), encoding="utf-8")
        self.git("add", str(active.relative_to(self.project)))
        result = self.run_ci("--staged", ok=False)
        self.assertIn("active workflow must be finished", result.stdout)

    def test_unchanged_unrelated_active_workflow_passes(self) -> None:
        self.commit_unrelated_active_fixture()
        self.stage_completed_fixture()
        active = (
            self.project / "docs" / "workspace" / "ACTIVE.md"
        ).read_text(encoding="utf-8")
        self.assertIn(f"**Feature**: {ACTIVE_SLUG}", active)
        self.run_ci("--staged")

    def test_invalid_unrelated_active_workflow_fails(self) -> None:
        self.commit_unrelated_active_fixture()
        self.stage_completed_fixture()
        invalid_context = (
            self.project / "docs" / "workspace" / ACTIVE_SLUG / "context.md"
        )
        invalid_context.unlink()
        self.git("add", "-u")
        result = self.run_ci("--staged", ok=False)
        self.assertIn("unrelated active workflow is invalid", result.stdout)

    def test_unstaged_active_clear_cannot_rescue_staged_active_workflow(self) -> None:
        self.stage_completed_fixture()
        active = self.project / "docs" / "workspace" / "ACTIVE.md"
        active.write_text(
            EMPTY_ACTIVE.replace("**Feature**:", f"**Feature**: {SLUG}"),
            encoding="utf-8",
        )
        self.git("add", str(active.relative_to(self.project)))
        active.write_text(EMPTY_ACTIVE, encoding="utf-8")
        result = self.run_ci("--staged", ok=False)
        self.assertIn("active workflow must be finished", result.stdout)

    def test_unstaged_active_workflow_does_not_poison_valid_index(self) -> None:
        self.stage_completed_fixture()
        active = self.project / "docs" / "workspace" / "ACTIVE.md"
        active.write_text(
            EMPTY_ACTIVE.replace("**Feature**:", f"**Feature**: {SLUG}"),
            encoding="utf-8",
        )
        self.run_ci("--staged")

    def test_incomplete_evidence_fails(self) -> None:
        self.stage_completed_fixture()
        validation = self.project / "docs" / "workspace" / SLUG / "validation.md"
        validation.unlink()
        self.git("add", "-u")
        result = self.run_ci("--staged", ok=False)
        self.assertIn("missing workflow file: validation.md", result.stdout)


if __name__ == "__main__":
    unittest.main()
