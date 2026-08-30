#!/usr/bin/env python3
"""Behavior tests for Happy's adopted public workflow CLI boundary."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUNTIME_SCRIPTS = (
    "workflow-audit.py",
    "workflow-candidate.py",
    "workflow-check.py",
    "workflow-ci.py",
    "workflow-review.py",
    "workflow-state.py",
)
EMPTY_ACTIVE = (
    "# Active Workflow\n\n**Feature**:\n**Phase**:\n**Updated**:\n"
    "**Next**:\n**Branch / Worktree**:\n"
)
EMPTY_ARCHIVE = (
    "# Workflow Archive\n\n"
    "| Date | Feature | Commit | Summary | Follow-up |\n"
    "| --- | --- | --- | --- | --- |\n"
)


class HappyWorkflowRuntimeTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="happy-workflow-runtime-")
        self.project = Path(self.temp.name) / "project"
        (self.project / "scripts").mkdir(parents=True)
        (self.project / ".ai").mkdir()
        (self.project / "docs" / "workspace").mkdir(parents=True)
        for name in RUNTIME_SCRIPTS:
            shutil.copy2(ROOT / "scripts" / name, self.project / "scripts" / name)
        shutil.copytree(
            ROOT / "docs" / "workspace" / "template",
            self.project / "docs" / "workspace" / "template",
        )
        shutil.copytree(ROOT / ".codex", self.project / ".codex")
        (self.project / "docs" / "workspace" / "ACTIVE.md").write_text(
            EMPTY_ACTIVE, encoding="utf-8"
        )
        (self.project / "docs" / "workspace" / "archive.md").write_text(
            EMPTY_ARCHIVE, encoding="utf-8"
        )
        (self.project / "CONTEXT.md").write_text("# Context\n", encoding="utf-8")
        (self.project / ".gitignore").write_text(
            "__pycache__/\n*.pyc\n", encoding="utf-8"
        )
        (self.project / ".ai" / "project.json").write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "commands": {
                        "format": [],
                        "lint": [],
                        "typecheck": [],
                        "test": [],
                        "build": [],
                        "check": [
                            "{python} -c \"print('fixture check passed')\""
                        ],
                    },
                    "checkProfiles": {
                        "full": [
                            "format", "lint", "typecheck", "test", "build", "check"
                        ]
                    },
                    "checkSelection": {"fallbackProfile": "full", "rules": []},
                    "reviewProfiles": {
                        "low-risk": {"modelTier": "standard", "maxWords": 250},
                        "feature": {"modelTier": "capable", "maxWords": 400},
                        "high-risk": {"modelTier": "capable", "maxWords": 400},
                    },
                }
            )
            + "\n",
            encoding="utf-8",
        )
        self.git("init")
        self.git("config", "user.email", "workflow@example.test")
        self.git("config", "user.name", "Workflow Test")
        self.git("add", ".")
        self.git("commit", "-m", "baseline")
        self.base = self.git("rev-parse", "HEAD").stdout.strip()

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

    def run_script(
        self, name: str, *args: str, ok: bool = True,
        environment: dict[str, str] | None = None,
    ) -> subprocess.CompletedProcess[str]:
        completed = subprocess.run(
            [sys.executable, f"scripts/{name}", *args], cwd=self.project,
            text=True, capture_output=True, check=False, env=environment,
        )
        if ok and completed.returncode:
            self.fail(
                f"{name} {' '.join(args)} failed:\n"
                f"stdout={completed.stdout}\nstderr={completed.stderr}"
            )
        if not ok and completed.returncode == 0:
            self.fail(f"{name} {' '.join(args)} unexpectedly passed")
        return completed

    def state(self, *args: str, ok: bool = True) -> subprocess.CompletedProcess[str]:
        return self.run_script("workflow-state.py", *args, ok=ok)

    def gate(self, slug: str, name: str, status: str = "passed") -> None:
        self.state(
            "gate", slug, name, status,
            "--evidence", f"{name} fixture evidence",
        )

    def complete_contract(self, slug: str) -> None:
        workspace = self.project / "docs" / "workspace" / slug
        (workspace / "contexts").mkdir(exist_ok=True)
        (self.project / "delivery.txt").write_text("planned\n", encoding="utf-8")
        (self.project / "docs" / "specs").mkdir(exist_ok=True)
        (self.project / "docs" / "tasks").mkdir(exist_ok=True)
        (self.project / "docs" / "PRD.md").write_text("# PRD\n", encoding="utf-8")
        (self.project / "docs" / "ARCHITECTURE.md").write_text(
            "# Architecture\n", encoding="utf-8"
        )
        (self.project / "docs" / "specs" / f"{slug}.md").write_text(
            "# Spec\n", encoding="utf-8"
        )
        (self.project / "docs" / "tasks" / f"{slug}-tasks.md").write_text(
            "# Tasks\n", encoding="utf-8"
        )
        (workspace / "context.md").write_text(
            f"# Context: `{slug}`\n\n- `delivery.txt` — fixture delivery\n",
            encoding="utf-8",
        )
        (workspace / "decisions.md").write_text(
            f"# Decisions: `{slug}`\n\nNo open decisions.\n", encoding="utf-8"
        )
        (workspace / "spec-links.md").write_text(
            f"# Specification Links: `{slug}`\n\n"
            "- PRD: `docs/PRD.md`\n"
            f"- Feature spec: `docs/specs/{slug}.md`\n"
            "- Architecture: `docs/ARCHITECTURE.md`\n"
            "- ADRs: none\n",
            encoding="utf-8",
        )
        (workspace / "task-links.md").write_text(
            f"# Task Links: `{slug}`\n\n"
            f"- Task list: `docs/tasks/{slug}-tasks.md`\n"
            "- Tracker item: local fixture\n"
            "- Pull request: none\n"
            "- Branch/worktree: fixture branch\n",
            encoding="utf-8",
        )
        (workspace / "contexts" / "implement.jsonl").write_text(
            json.dumps({"path": "delivery.txt", "reason": "fixture delivery"}) + "\n",
            encoding="utf-8",
        )
        (workspace / "contexts" / "check.jsonl").write_text(
            json.dumps({"path": "delivery.txt", "reason": "fixture verification"}) + "\n",
            encoding="utf-8",
        )

    def create_scoped_low_risk(self, slug: str) -> None:
        self.state("create", slug, "--intensity", "low-risk")
        self.complete_contract(slug)
        self.gate(slug, "decisions", "not_required")
        self.gate(slug, "risk", "not_required")
        self.gate(slug, "acceptance")
        self.gate(slug, "scoping")

    def prepare_verification_candidate(self, slug: str) -> None:
        self.create_scoped_low_risk(slug)
        self.state("transition", slug, "implementation", "Implement fixture")
        (self.project / "delivery.txt").write_text("reviewed\n", encoding="utf-8")
        self.gate(slug, "implementation")
        self.state("transition", slug, "verification", "Verify fixture")
        self.git("add", ".")

    def prepare_checked_candidate(self, slug: str) -> None:
        self.prepare_verification_candidate(slug)
        self.run_script(
            "workflow-check.py", "--applicable", "--record", slug,
            "--staged", "--base", self.base,
        )
        self.git("add", ".")

    def prepare_accepted_gap_candidate(self, slug: str) -> str:
        self.prepare_verification_candidate(slug)
        config_path = self.project / ".ai" / "project.json"
        config = json.loads(config_path.read_text(encoding="utf-8"))
        config["commands"]["check"] = [
            "{python} -c \"raise SystemExit(7)\""
        ]
        config_path.write_text(json.dumps(config) + "\n", encoding="utf-8")
        self.git("add", ".")
        failed = self.run_script(
            "workflow-check.py", "--applicable", "--record", slug,
            "--staged", "--base", self.base, ok=False,
        )
        self.assertIn("commands: 1, failures: 1", failed.stdout)
        records = [
            json.loads(line)
            for line in (
                self.project / "docs" / "workspace" / slug
                / "evidence" / "checks.jsonl"
            ).read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        run_id = str(records[-1]["runId"])
        self.state(
            "check-receipt", slug, "accepted_gaps",
            "--run-id", run_id,
            "--evidence", "operator accepted the named fixture failure",
        )
        self.git("add", ".")
        return run_id

    def write_completion_docs(self, slug: str) -> None:
        workspace = self.project / "docs" / "workspace" / slug
        (workspace / "validation.md").write_text(
            "# Validation\n\n## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n| --- | --- | --- |\n"
            "| Result | verified | fixture |\n\n"
            "## Remaining gaps\n\n- Named fixture gap accepted.\n",
            encoding="utf-8",
        )
        (workspace / "finish.md").write_text(
            "# Finish Review\n\n## Summary\n\nDone.\n\n"
            "## Verification\n\nPass with accepted fixture gap.\n\n"
            "## Whole-diff review\n\nPass.\n\n"
            "## Rollback or mitigation\n\nRevert.\n\n"
            "## Lessons promoted\n\nNone.\n\n"
            "## Follow-up\n\nNone.\n",
            encoding="utf-8",
        )

    def prepare_reviewed_finish(self, slug: str) -> tuple[Path, ...]:
        self.prepare_checked_candidate(slug)
        self.run_script(
            "workflow-review.py", "package", slug,
            "--base", self.base, "--staged",
        )
        for axis in ("spec-review", "standards-review"):
            self.state(
                "review-conclusion", slug, "--axis", axis,
                "--status", "accepted", "--evidence", f"{axis} fixture accepted",
            )
        self.gate(slug, "review")
        workspace = self.project / "docs" / "workspace" / slug
        self.write_completion_docs(slug)
        self.state("transition", slug, "finish", "Finish fixture")
        self.gate(slug, "finish")
        self.git("add", ".")
        return (
            self.project / "docs" / "workspace" / "ACTIVE.md",
            self.project / "docs" / "workspace" / "archive.md",
            workspace / "workflow.json",
            workspace / "state.md",
        )

    def test_state_transitions_require_public_gate_receipts(self) -> None:
        slug = "guarded-state"
        self.state("create", slug, "--intensity", "low-risk")
        self.complete_contract(slug)
        blocked = self.state(
            "transition", slug, "implementation", "must fail", ok=False
        )
        self.assertIn("acceptance", blocked.stderr)
        for gate, status in (
            ("decisions", "not_required"), ("risk", "not_required"),
            ("acceptance", "passed"), ("scoping", "passed"),
        ):
            self.gate(slug, gate, status)
        self.state("transition", slug, "implementation", "Build fixture")
        blocked = self.state(
            "transition", slug, "verification", "must fail", ok=False
        )
        self.assertIn("implementation", blocked.stderr)

    def test_staged_guard_rejects_non_evidence_worktree_divergence(self) -> None:
        slug = "guarded-divergence"
        self.prepare_verification_candidate(slug)
        (self.project / "untracked.txt").write_text("outside candidate\n", encoding="utf-8")
        rejected = self.run_script(
            "workflow-check.py", "--applicable", "--record", slug,
            "--staged", "--base", self.base, ok=False,
        )
        self.assertIn("outside the staged candidate", rejected.stderr)

    def test_staged_guard_allows_only_active_check_evidence_divergence(self) -> None:
        slug = "guarded-evidence"
        self.prepare_verification_candidate(slug)
        state_projection = (
            self.project / "docs" / "workspace" / slug / "state.md"
        )
        state_projection.write_text(
            state_projection.read_text(encoding="utf-8") + "\ncheck evidence drift\n",
            encoding="utf-8",
        )
        allowed = self.run_script(
            "workflow-check.py", "--applicable", "--record", slug,
            "--staged", "--base", self.base,
        )
        self.assertIn("commands: 1, failures: 0", allowed.stdout)

    def test_review_package_rejects_staged_candidate_drift(self) -> None:
        slug = "candidate-binding"
        self.prepare_checked_candidate(slug)
        self.run_script(
            "workflow-review.py", "package", slug,
            "--base", self.base, "--staged",
        )
        (self.project / "delivery.txt").write_text("unreviewed\n", encoding="utf-8")
        self.git("add", "delivery.txt")
        rejected = self.state(
            "review-conclusion", slug, "--axis", "spec-review",
            "--status", "accepted", "--evidence", "must fail", ok=False,
        )
        self.assertIn("candidate changed after the final check", rejected.stderr)

    def test_review_conclusion_accepts_explicitly_accepted_check_gaps(self) -> None:
        slug = "accepted-check-gaps"
        self.prepare_accepted_gap_candidate(slug)
        self.run_script(
            "workflow-review.py", "package", slug,
            "--base", self.base, "--staged",
        )

        for axis in ("spec-review", "standards-review"):
            accepted = self.state(
                "review-conclusion", slug, "--axis", axis,
                "--status", "accepted", "--evidence", f"{axis} fixture accepted",
            )
            self.assertEqual("accepted", json.loads(accepted.stdout)["status"])
        self.gate(slug, "review")

        workflow = json.loads(
            (
                self.project / "docs" / "workspace" / slug / "workflow.json"
            ).read_text(encoding="utf-8")
        )
        self.assertEqual("accepted_gaps", workflow["gates"]["check"]["status"])
        self.assertEqual("passed", workflow["gates"]["review"]["status"])
        self.write_completion_docs(slug)
        self.state("transition", slug, "finish", "Finish accepted-gap fixture")
        self.gate(slug, "finish")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")
        self.state("archive", slug, "--summary", "accepted-gap fixture complete")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")

    def test_review_conclusion_rejects_unapproved_check_states(self) -> None:
        for status in ("pending", "blocked"):
            with self.subTest(status=status):
                slug = f"rejected-check-{status.replace('_', '-')}"
                self.prepare_checked_candidate(slug)
                self.gate(slug, "check", status)

                rejected = self.state(
                    "review-conclusion", slug, "--axis", "spec-review",
                    "--status", "accepted", "--evidence", "must fail",
                    ok=False,
                )

                self.assertIn(
                    "final review requires the applicable final check first",
                    rejected.stderr,
                )

    def test_accepted_gap_receipt_requires_a_failed_bound_run(self) -> None:
        slug = "accepted-gap-binding"
        self.prepare_checked_candidate(slug)
        workflow = json.loads(
            (
                self.project / "docs" / "workspace" / slug / "workflow.json"
            ).read_text(encoding="utf-8")
        )
        run_id = str(workflow["checkRunId"])

        passing_run = self.state(
            "check-receipt", slug, "accepted_gaps",
            "--run-id", run_id, "--evidence", "must fail", ok=False,
        )
        self.assertIn(
            "check=accepted_gaps requires at least one failed command",
            passing_run.stderr,
        )
        evidence_path = (
            self.project / "docs" / "workspace" / slug
            / "evidence" / "checks.jsonl"
        )
        records = [
            json.loads(line)
            for line in evidence_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        records[-1]["result"] = "failed (0)"
        evidence_path.write_text(
            "".join(json.dumps(item) + "\n" for item in records),
            encoding="utf-8",
        )
        relabeled = self.state(
            "check-receipt", slug, "accepted_gaps",
            "--run-id", run_id, "--evidence", "must fail", ok=False,
        )
        self.assertIn(
            "result is inconsistent with exitCode/reuse provenance",
            relabeled.stderr,
        )
        unbound = self.state(
            "gate", slug, "check", "accepted_gaps",
            "--evidence", "must fail", ok=False,
        )
        self.assertIn(
            "check=accepted_gaps requires a bound structured workflow-check run",
            unbound.stderr,
        )

    def test_accepted_gap_evidence_tampering_blocks_finish_and_archive_ci(
        self,
    ) -> None:
        slug = "accepted-gap-tampering"
        run_id = self.prepare_accepted_gap_candidate(slug)
        self.run_script(
            "workflow-review.py", "package", slug,
            "--base", self.base, "--staged",
        )
        for axis in ("spec-review", "standards-review"):
            self.state(
                "review-conclusion", slug, "--axis", axis,
                "--status", "accepted", "--evidence", f"{axis} accepted",
            )
        self.gate(slug, "review")
        self.write_completion_docs(slug)
        self.state("transition", slug, "finish", "Finish tampering fixture")

        evidence_path = (
            self.project / "docs" / "workspace" / slug
            / "evidence" / "checks.jsonl"
        )
        original_evidence = evidence_path.read_bytes()

        def write_relabeled_zero_exit() -> None:
            records = [
                json.loads(line)
                for line in original_evidence.decode().splitlines()
                if line.strip()
            ]
            failed = next(
                item
                for item in records
                if item.get("runId") == run_id and item.get("exitCode") != 0
            )
            failed["exitCode"] = 0
            failed["result"] = "failed (0)"
            evidence_path.write_text(
                "".join(json.dumps(item) + "\n" for item in records),
                encoding="utf-8",
            )

        write_relabeled_zero_exit()
        rejected_finish = self.state(
            "gate", slug, "finish", "passed",
            "--evidence", "must reject tampered check evidence", ok=False,
        )
        self.assertIn(
            "result is inconsistent with exitCode/reuse provenance",
            rejected_finish.stderr,
        )

        evidence_path.write_bytes(original_evidence)
        self.gate(slug, "finish")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")
        self.state("archive", slug, "--summary", "tampering fixture complete")
        self.git("add", ".")

        write_relabeled_zero_exit()
        self.git("add", str(evidence_path.relative_to(self.project)))
        rejected_archive = self.run_script(
            "workflow-ci.py", "--staged", ok=False,
        )
        self.assertIn(
            "result is inconsistent with exitCode/reuse provenance",
            rejected_archive.stderr + rejected_archive.stdout,
        )

    def test_archive_rejects_post_review_drift_without_mutation(self) -> None:
        slug = "archive-rollback"
        watched = self.prepare_reviewed_finish(slug)
        before = {item: item.read_bytes() for item in watched}
        (self.project / "delivery.txt").write_text("drifted\n", encoding="utf-8")
        self.git("add", "delivery.txt")
        rejected = self.state(
            "archive", slug, "--summary", "must not archive drift", ok=False
        )
        self.assertIn("exact staged checked/reviewed candidate", rejected.stderr)
        self.assertEqual(before, {item: item.read_bytes() for item in watched})

    def test_archived_delivery_passes_staged_and_committed_ci(self) -> None:
        slug = "archive-success"
        self.prepare_reviewed_finish(slug)
        self.state("archive", slug, "--summary", "completed fixture")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")
        self.git("commit", "-m", "archived fixture")
        self.run_script("workflow-ci.py", "--base", self.base)


if __name__ == "__main__":
    unittest.main()
