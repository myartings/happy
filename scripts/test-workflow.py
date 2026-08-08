#!/usr/bin/env python3
"""Behavior tests for machine-enforced workflow state and evidence."""

from __future__ import annotations

import json
import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class WorkflowTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="workflow-enforcement-")
        self.project = Path(self.temp.name) / "project"
        (self.project / "scripts").mkdir(parents=True)
        (self.project / ".ai").mkdir()
        (self.project / "docs" / "workspace").mkdir(parents=True)
        shutil.copytree(
            ROOT / "docs" / "workspace" / "template",
            self.project / "docs" / "workspace" / "template",
        )
        for name in ("workflow-state.py", "workflow-check.py", "workflow-audit.py"):
            source = ROOT / "scripts" / name
            if source.exists():
                shutil.copy2(source, self.project / "scripts" / name)
        (self.project / "docs" / "workspace" / "ACTIVE.md").write_text(
            "# Active Workflow\n\n"
            "**Feature**:\n**Phase**:\n**Updated**:\n**Next**:\n"
            "**Branch / Worktree**:\n",
            encoding="utf-8",
        )
        shutil.copy2(
            ROOT / "docs" / "workspace" / "archive.md",
            self.project / "docs" / "workspace" / "archive.md",
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
                        "check": [f"{sys.executable} -c \"print('ok')\""],
                    },
                }
            ),
            encoding="utf-8",
        )
        (self.project / "CONTEXT.md").write_text(
            "# Project Context\n", encoding="utf-8"
        )

    def tearDown(self) -> None:
        self.temp.cleanup()

    def run_state(self, *args: str, ok: bool = True) -> subprocess.CompletedProcess[str]:
        return self.run_script("workflow-state.py", *args, ok=ok)

    def run_script(
        self, name: str, *args: str, ok: bool = True
    ) -> subprocess.CompletedProcess[str]:
        completed = subprocess.run(
            [sys.executable, f"scripts/{name}", *args],
            cwd=self.project,
            text=True,
            capture_output=True,
            check=False,
        )
        if ok and completed.returncode:
            self.fail(
                f"{name} {' '.join(args)} failed:\n"
                f"stdout={completed.stdout}\nstderr={completed.stderr}"
            )
        if not ok and completed.returncode == 0:
            self.fail(f"{name} {' '.join(args)} unexpectedly passed")
        return completed

    def gate(self, slug: str, name: str, status: str = "passed") -> None:
        self.run_state(
            "gate", slug, name, status, "--evidence", f"{name} test evidence"
        )

    def assess_no_decisions_or_risk(self, slug: str) -> None:
        self.gate(slug, "decisions", "not_required")
        self.gate(slug, "risk", "not_required")

    def complete_contract_files(self, slug: str) -> None:
        workflow = self.project / "docs" / "workspace" / slug
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
        (workflow / "decisions.md").write_text(
            f"# Decisions: `{slug}`\n\nNo open decisions.\n", encoding="utf-8"
        )
        (workflow / "spec-links.md").write_text(
            f"# Specification Links: `{slug}`\n\n"
            "- PRD: `docs/PRD.md`\n"
            f"- Feature spec: `docs/specs/{slug}.md`\n"
            "- Architecture: `docs/ARCHITECTURE.md`\n"
            "- ADRs: none\n",
            encoding="utf-8",
        )
        (workflow / "task-links.md").write_text(
            f"# Task Links: `{slug}`\n\n"
            f"- Task list: `docs/tasks/{slug}-tasks.md`\n"
            "- Issue: none\n- Pull request: none\n- Branch/worktree: none\n",
            encoding="utf-8",
        )

    def test_feature_transitions_require_gate_receipts(self) -> None:
        slug = "guarded-feature"
        self.run_state(
            "create", slug, "--intensity", "feature", "--risk-required",
            "--decisions-required",
        )
        self.complete_contract_files(slug)
        state = json.loads(
            (self.project / "docs" / "workspace" / slug / "workflow.json").read_text()
        )
        self.assertEqual("planning", state["phase"])
        self.assertEqual("feature", state["intensity"])

        blocked = self.run_state(
            "transition", slug, "implementation", "Build the slice", ok=False
        )
        self.assertIn("acceptance", blocked.stderr)

        for gate in ("acceptance", "decisions", "scoping", "risk"):
            self.gate(slug, gate)
        self.run_state("transition", slug, "implementation", "Build the slice")

        self.run_state(
            "transition", slug, "verification", "Verify the slice", ok=False
        )
        self.gate(slug, "implementation")
        self.run_state("transition", slug, "verification", "Verify the slice")

        self.run_state("transition", slug, "finish", "Finish review", ok=False)
        self.run_script("workflow-check.py", "--record", slug)
        self.gate(slug, "review")
        self.run_state("transition", slug, "finish", "Finish review")

        history = json.loads(
            (self.project / "docs" / "workspace" / slug / "workflow.json").read_text()
        )["history"]
        self.assertEqual(
            ["created", "gate", "gate", "gate", "gate", "transition", "gate",
             "transition", "gate", "gate", "transition"],
            [event["type"] for event in history],
        )

    def test_migration_preserves_phase_without_fabricating_gates(self) -> None:
        slug = "legacy-feature"
        destination = self.project / "docs" / "workspace" / slug
        shutil.copytree(self.project / "docs" / "workspace" / "template", destination)
        workflow_json = destination / "workflow.json"
        workflow_json.unlink(missing_ok=True)
        state_md = destination / "state.md"
        state_md.write_text(
            state_md.read_text().replace("<feature>", slug).replace(
                "**Phase**: planning", "**Phase**: implementation"
            ),
            encoding="utf-8",
        )

        self.run_state(
            "migrate", slug, "--intensity", "feature", "--risk-required"
        )
        state = json.loads(workflow_json.read_text())
        self.assertEqual("implementation", state["phase"])
        self.assertEqual("pending", state["gates"]["acceptance"]["status"])
        self.assertEqual("pending", state["gates"]["scoping"]["status"])
        self.assertTrue(state["legacyImport"])

        audit = self.run_script("workflow-audit.py", "--strict", slug, ok=False)
        self.assertIn("implementation requires", audit.stdout)

    def test_policy_upgrade_preserves_legacy_receipts_and_reopens_planning(self) -> None:
        slug = "legacy-low-risk"
        self.run_state("create", slug, "--intensity", "low-risk")
        self.complete_contract_files(slug)
        workflow_json = self.project / "docs" / "workspace" / slug / "workflow.json"
        state = json.loads(workflow_json.read_text(encoding="utf-8"))
        state["phase"] = "implementation"
        state["gates"]["acceptance"] = {
            "status": "passed", "evidence": "legacy acceptance", "updated": "old"
        }
        for name in ("decisions", "scoping", "risk", "review"):
            state["gates"][name] = {
                "status": "not_required",
                "evidence": "Not required for low-risk workflow",
                "updated": "old",
            }
        workflow_json.write_text(json.dumps(state), encoding="utf-8")

        audit = self.run_script("workflow-audit.py", "--strict", slug, ok=False)
        self.assertIn("scoping cannot be not_required", audit.stdout)
        self.run_state("upgrade-policy", slug)
        upgraded = json.loads(workflow_json.read_text(encoding="utf-8"))
        self.assertEqual("planning", upgraded["phase"])
        self.assertEqual("passed", upgraded["gates"]["acceptance"]["status"])
        for name in ("decisions", "scoping", "risk", "review"):
            self.assertEqual("pending", upgraded["gates"][name]["status"])
        event = upgraded["history"][-1]
        self.assertEqual("policy_upgrade", event["type"])
        self.assertEqual("implementation", event["previousPhase"])
        self.assertEqual(
            "not_required", event["previousReceipts"]["scoping"]["status"]
        )

    def test_required_decision_and_risk_waivers_fail_strict_audit(self) -> None:
        slug = "damaged-required-gates"
        self.run_state(
            "create", slug, "--intensity", "high-risk",
            "--decisions-required", "--risk-required",
        )
        self.complete_contract_files(slug)
        workflow_json = self.project / "docs" / "workspace" / slug / "workflow.json"
        state = json.loads(workflow_json.read_text(encoding="utf-8"))
        for name in ("decisions", "risk"):
            state["gates"][name] = {
                "status": "not_required", "evidence": "damaged", "updated": "old"
            }
        workflow_json.write_text(json.dumps(state), encoding="utf-8")
        audit = self.run_script("workflow-audit.py", "--strict", slug, ok=False)
        self.assertIn("decisions cannot be not_required", audit.stdout)
        self.assertIn("risk cannot be not_required", audit.stdout)

    def test_low_risk_requires_complete_core_lifecycle(self) -> None:
        slug = "complete-low-risk"
        self.run_state("create", slug, "--intensity", "low-risk")
        self.complete_contract_files(slug)
        state = json.loads(
            (self.project / "docs" / "workspace" / slug / "workflow.json").read_text()
        )
        for name in ("decisions", "scoping", "risk", "review"):
            self.assertEqual("pending", state["gates"][name]["status"])

        self.gate(slug, "acceptance")
        cannot_waive = self.run_state(
            "gate", slug, "scoping", "not_required", "--evidence",
            "attempted waiver", ok=False,
        )
        self.assertIn("scoping is required", cannot_waive.stderr)
        self.gate(slug, "scoping")
        blocked = self.run_state(
            "transition", slug, "implementation", "Implement", ok=False
        )
        self.assertIn("decisions", blocked.stderr)
        self.assertIn("risk", blocked.stderr)
        self.assess_no_decisions_or_risk(slug)
        self.run_state("transition", slug, "implementation", "Implement")
        self.gate(slug, "implementation")
        self.run_state("transition", slug, "verification", "Verify")
        self.gate(slug, "check")
        blocked = self.run_state(
            "transition", slug, "finish", "Finish", ok=False
        )
        self.assertIn("review", blocked.stderr)
        self.gate(slug, "review")
        self.run_state("transition", slug, "finish", "Finish")

    def test_strict_audit_can_require_active_workflow(self) -> None:
        audit = self.run_script(
            "workflow-audit.py", "--strict", "--require-active", ok=False
        )
        self.assertIn("fail: no active workflow", audit.stdout)

    def test_template_policy_check_rejects_lightweight_language(self) -> None:
        spec = importlib.util.spec_from_file_location(
            "validate_template", ROOT / "scripts" / "validate-template.py"
        )
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader if spec else None)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        policy_root = Path(self.temp.name) / "policy"
        for relative in sorted(
            set(module.POLICY_REQUIRED) | set(module.POLICY_FORBIDDEN)
        ):
            path = policy_root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(
                "\n".join(module.POLICY_REQUIRED.get(relative, ())) + "\n",
                encoding="utf-8",
            )
        self.assertEqual([], module.mandatory_policy_errors(policy_root))
        agents = policy_root / "AGENTS.md"
        agents.write_text(
            agents.read_text(encoding="utf-8")
            + "\nLow-risk: local, reversible, low-risk; use the closest validation signal.\n",
            encoding="utf-8",
        )
        errors = module.mandatory_policy_errors(policy_root)
        self.assertTrue(
            any("legacy lightweight workflow policy" in error for error in errors)
        )

    def test_tdd_policy_requires_behavior_first_vertical_slices(self) -> None:
        spec = importlib.util.spec_from_file_location(
            "validate_template", ROOT / "scripts" / "validate-template.py"
        )
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader if spec else None)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        self.assertEqual([], module.tdd_policy_errors(ROOT))

        policy_root = Path(self.temp.name) / "tdd-policy"
        skill = policy_root / ".agents" / "skills" / "tdd" / "SKILL.md"
        reference = skill.parent / "references" / "testing-guidelines.md"
        reference.parent.mkdir(parents=True)
        skill.write_text(
            "---\nname: tdd\ndescription: Focused red-green-refactor.\n---\n\n"
            "# Test-Driven Development\n\n"
            "Select one behavior, write a failing test, implement the minimum, "
            "run the nearest suite, and record evidence.\n",
            encoding="utf-8",
        )
        reference.write_text(
            (
                ROOT / ".agents" / "skills" / "tdd" / "references"
                / "testing-guidelines.md"
            ).read_text(encoding="utf-8"),
            encoding="utf-8",
        )
        errors = module.tdd_policy_errors(policy_root)
        for phrase in (
            "public interface", "tracer bullet", "system boundaries",
            "another deterministic feedback signal",
        ):
            self.assertTrue(any(phrase in error for error in errors), phrase)

        canonical = (
            ROOT / ".agents" / "skills" / "tdd" / "SKILL.md"
        ).read_text(encoding="utf-8")
        for source, opposite in (
            (
                "Test behavior through the narrowest public interface that matters to a caller.",
                "Test private implementation through any convenient interface.",
            ),
            (
                "**RED** — Write one focused behavior test",
                "Write production code before observing a failing behavior test",
            ),
            (
                "Run the targeted test, then the nearest relevant suite.",
                "Run whichever test command is most convenient.",
            ),
            ("one test at a time", "all tests at once"),
            ("Mock only at system boundaries", "Mock internal modules and system boundaries"),
        ):
            self.assertIn(source, canonical)
            skill.write_text(canonical.replace(source, opposite), encoding="utf-8")
            mutation_errors = module.tdd_policy_errors(policy_root)
            self.assertTrue(
                any(source in error for error in mutation_errors), opposite
            )

    def test_archive_rejects_empty_finish_and_incomplete_acceptance(self) -> None:
        slug = "finish-feature"
        self.run_state("create", slug, "--intensity", "feature")
        self.complete_contract_files(slug)
        self.assess_no_decisions_or_risk(slug)
        for gate in ("acceptance", "scoping"):
            self.gate(slug, gate)
        self.run_state("transition", slug, "implementation", "Implement")
        self.gate(slug, "implementation")
        self.run_state("transition", slug, "verification", "Verify")
        self.gate(slug, "check")
        self.gate(slug, "review")
        self.run_state("transition", slug, "finish", "Finish")

        self.run_state(
            "gate", slug, "finish", "passed", "--evidence", "finish review",
            ok=False,
        )

        workflow = self.project / "docs" / "workspace" / slug
        (workflow / "finish.md").write_text(
            "# Finish Review\n\n"
            "## Summary\n\nImplemented guarded workflow transitions.\n\n"
            "## Verification\n\nAll configured checks passed.\n\n"
            "## Whole-diff review\n\nNo unresolved findings.\n\n"
            "## Rollback or mitigation\n\nRevert the workflow tooling changes.\n\n"
            "## Lessons promoted\n\nMachine-readable gates prevent phase drift.\n\n"
            "## Follow-up\n\nNone.\n",
            encoding="utf-8",
        )
        (workflow / "validation.md").write_text(
            "# Validation\n\n"
            "| Date | Command | Result | Notes |\n"
            "| --- | --- | --- | --- |\n"
            "| 2026-07-30 | `test` | passed | workflow tests |\n\n"
            "## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n"
            "| --- | --- | --- |\n"
            "| Guarded transitions | verified | workflow tests |\n\n"
            "## Remaining gaps\n\n- None.\n",
            encoding="utf-8",
        )
        self.run_state(
            "gate", slug, "finish", "accepted_gaps", "--evidence",
            "finish review accepts a documented non-blocking gap",
        )
        self.run_state(
            "archive", slug, "--summary", "Guarded workflow complete",
            "--commit", "abc1234", "--follow-up", "None"
        )
        state = json.loads(
            (workflow / "workflow.json").read_text(encoding="utf-8")
        )
        self.assertEqual("archived", state["phase"])
        self.assertEqual("accepted_gaps", state["gates"]["finish"]["status"])
        self.assertEqual("abc1234", state["resultCommit"])
        self.assertEqual("Guarded workflow complete", state["archiveSummary"])
        self.assertEqual("None", state["archiveFollowUp"])
        self.assertTrue(state["archivedAt"])
        self.assertEqual(
            "archived",
            state["history"][-1]["type"],
        )
        rendered = (workflow / "state.md").read_text(encoding="utf-8")
        self.assertIn("**Phase**: archived", rendered)
        self.run_state(
            "transition", slug, "implementation", "Reopen archived work", ok=False
        )
        self.run_state(
            "gate", slug, "check", "passed", "--evidence", "late mutation",
            ok=False,
        )
        self.run_state("upgrade-policy", slug, ok=False)
        self.run_state("activate", slug, ok=False)
        active = (
            self.project / "docs" / "workspace" / "ACTIVE.md"
        ).read_text(encoding="utf-8")
        self.assertFalse(any(line.endswith(" ") for line in active.splitlines()))

    def test_archive_restores_previous_active_workflow(self) -> None:
        previous = "previous-feature"
        completed = "completed-feature"
        self.run_state("create", previous, "--intensity", "low-risk")
        active_path = self.project / "docs" / "workspace" / "ACTIVE.md"
        previous_active = active_path.read_text(encoding="utf-8")

        self.run_state("create", completed, "--intensity", "feature")
        self.complete_contract_files(completed)
        self.assess_no_decisions_or_risk(completed)
        for gate in ("acceptance", "scoping"):
            self.gate(completed, gate)
        self.run_state("transition", completed, "implementation", "Implement")
        self.gate(completed, "implementation")
        self.run_state("transition", completed, "verification", "Verify")
        self.gate(completed, "check")
        self.gate(completed, "review")
        workflow = self.project / "docs" / "workspace" / completed
        (workflow / "validation.md").write_text(
            "# Validation\n\n## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n| --- | --- | --- |\n"
            "| Preserve active workflow | verified | workflow test |\n\n"
            "## Remaining gaps\n\n- None.\n",
            encoding="utf-8",
        )
        (workflow / "finish.md").write_text(
            "# Finish Review\n\n## Summary\n\nCompleted fixture.\n\n"
            "## Verification\n\nWorkflow test passed.\n\n"
            "## Whole-diff review\n\nFixture reviewed.\n\n"
            "## Rollback or mitigation\n\nDelete fixture.\n\n"
            "## Lessons promoted\n\nNo promotion.\n\n"
            "## Follow-up\n\nNone.\n",
            encoding="utf-8",
        )
        self.run_state("transition", completed, "finish", "Finish")
        self.gate(completed, "finish")
        self.run_state(
            "archive", completed, "--summary", "Completed fixture",
            "--commit", "pending",
        )

        self.assertEqual(previous_active, active_path.read_text(encoding="utf-8"))

    def test_context_manifests_are_role_scoped_and_validated(self) -> None:
        slug = "context-feature"
        self.run_state("create", slug, "--intensity", "feature")
        workflow = self.project / "docs" / "workspace" / slug
        implement = workflow / "contexts" / "implement.jsonl"
        check = workflow / "contexts" / "check.jsonl"
        self.assertTrue(implement.exists())
        self.assertTrue(check.exists())
        self.assertIn("contexts/implement.jsonl", (workflow / "context.md").read_text())
        self.complete_contract_files(slug)
        self.run_state("validate", slug)

        implement.write_text(
            '{"path":"../outside","reason":"unsafe traversal"}\n',
            encoding="utf-8",
        )
        rejected = self.run_state("validate", slug, ok=False)
        self.assertIn("repository-relative", rejected.stderr)

        implement.write_text(
            '{"path":"missing.file","reason":"missing input"}\n',
            encoding="utf-8",
        )
        rejected = self.run_state("validate", slug, ok=False)
        self.assertIn("links missing path", rejected.stderr)

        implement.write_text(
            '{"path":"CONTEXT.md","reason":""}\n',
            encoding="utf-8",
        )
        rejected = self.run_state("validate", slug, ok=False)
        self.assertIn("non-empty reason", rejected.stderr)

    def test_session_command_creates_summary_and_index_entry(self) -> None:
        slug = "session-feature"
        self.run_state("create", slug, "--intensity", "feature")
        self.complete_contract_files(slug)
        shutil.rmtree(self.project / "docs" / "workspace" / slug / "sessions")
        rejected = self.run_state("validate", slug, ok=False)
        self.assertIn("missing workflow directory: sessions", rejected.stderr)
        created = self.run_state("session", slug, "implementation")
        self.run_state("validate", slug)
        relative = created.stdout.strip().removeprefix("created session: ")
        session = self.project / relative
        self.assertTrue(session.exists())
        self.assertIn("**Agent / Scope**: implementation", session.read_text())
        index = (
            self.project / "docs" / "workspace" / slug / "session-index.md"
        ).read_text(encoding="utf-8")
        self.assertIn(f"](sessions/{session.name})", index)

    def test_archive_rejects_pending_acceptance_row(self) -> None:
        slug = "pending-acceptance"
        self.run_state("create", slug, "--intensity", "low-risk")
        self.complete_contract_files(slug)
        self.assess_no_decisions_or_risk(slug)
        self.gate(slug, "acceptance")
        self.gate(slug, "scoping")
        self.run_state("transition", slug, "implementation", "Implement")
        self.gate(slug, "implementation")
        self.run_state("transition", slug, "verification", "Verify")
        self.gate(slug, "check")
        self.gate(slug, "review")
        self.run_state("transition", slug, "finish", "Finish")
        workflow = self.project / "docs" / "workspace" / slug
        (workflow / "finish.md").write_text(
            "# Finish Review\n\n"
            "## Summary\n\nDone.\n\n"
            "## Verification\n\nChecks passed.\n\n"
            "## Whole-diff review\n\nReviewed.\n\n"
            "## Rollback or mitigation\n\nRevert.\n\n"
            "## Lessons promoted\n\nNone.\n\n"
            "## Follow-up\n\nNone.\n",
            encoding="utf-8",
        )
        (workflow / "validation.md").write_text(
            "# Validation\n\n## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n"
            "| --- | --- | --- |\n"
            "| App sync | pending | post-sync inspection required |\n\n"
            "## Remaining gaps\n\n- App sync.\n",
            encoding="utf-8",
        )

        blocked = self.run_state(
            "gate", slug, "finish", "passed", "--evidence", "finish review",
            ok=False,
        )
        self.assertIn("acceptance coverage is incomplete", blocked.stderr)

    def test_check_records_inside_table_and_marks_gate(self) -> None:
        slug = "check-feature"
        self.run_state("create", slug, "--intensity", "feature")
        self.complete_contract_files(slug)
        self.assess_no_decisions_or_risk(slug)
        for gate in ("acceptance", "scoping"):
            self.gate(slug, gate)
        self.run_state("transition", slug, "implementation", "Implement")
        self.gate(slug, "implementation")
        self.run_state("transition", slug, "verification", "Verify")

        self.run_script("workflow-check.py", "--record", slug)
        validation = (
            self.project / "docs" / "workspace" / slug / "validation.md"
        ).read_text()
        command_position = validation.index(f"`{sys.executable} -c")
        coverage_position = validation.index("## Acceptance coverage")
        self.assertLess(command_position, coverage_position)

        state = json.loads(
            (
                self.project / "docs" / "workspace" / slug / "workflow.json"
            ).read_text()
        )
        self.assertEqual("passed", state["gates"]["check"]["status"])

    def test_audit_reports_slug_path_mismatch_without_crashing(self) -> None:
        slug = "damaged-feature"
        self.run_state("create", slug, "--intensity", "feature")
        workflow_json = (
            self.project / "docs" / "workspace" / slug / "workflow.json"
        )
        state = json.loads(workflow_json.read_text(encoding="utf-8"))
        state["slug"] = "../invalid"
        workflow_json.write_text(json.dumps(state), encoding="utf-8")

        audit = self.run_script("workflow-audit.py", "--strict", slug, ok=False)
        self.assertIn("state slug/path mismatch", audit.stdout)

    def test_audit_reports_missing_gate_without_crashing(self) -> None:
        slug = "missing-gate"
        self.run_state("create", slug, "--intensity", "feature")
        workflow_json = (
            self.project / "docs" / "workspace" / slug / "workflow.json"
        )
        state = json.loads(workflow_json.read_text(encoding="utf-8"))
        del state["gates"]["acceptance"]
        workflow_json.write_text(json.dumps(state), encoding="utf-8")

        audit = self.run_script("workflow-audit.py", "--strict", slug, ok=False)
        self.assertIn("missing gate receipt: acceptance", audit.stdout)


if __name__ == "__main__":
    unittest.main()
