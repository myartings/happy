#!/usr/bin/env python3
"""Behavior tests for Happy's adopted public workflow CLI boundary."""

from __future__ import annotations

import json
import os
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
    "workflow-issue-route.py",
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

    def route_issue(
        self,
        *,
        base_ref: str,
        issue_remote: str | None = None,
        publication_remote: str | None = None,
    ) -> dict[str, object]:
        args = [
            "--repo-root", str(self.project),
            "--session-root", str(self.project),
            "--issue-url", "https://github.com/slopus/happy/issues/1654",
            "--issue-title", "Daemon ownership race",
            "--base-ref", base_ref,
            "--base-kind", "target",
        ]
        if issue_remote is not None:
            args.append(f"--issue-remote={issue_remote}")
        if publication_remote is not None:
            args.append(f"--publication-remote={publication_remote}")
        completed = self.run_script("workflow-issue-route.py", *args)
        return json.loads(completed.stdout)

    def add_github_remote(
        self, name: str, repository: str, *, push_repository: str | None = None,
    ) -> None:
        self.git("remote", "add", name, f"https://github.com/{repository}.git")
        if push_repository is not None:
            self.git(
                "remote", "set-url", "--push", name,
                f"https://github.com/{push_repository}.git",
            )

    def configure_github_remote(self, name: str, repository: str) -> None:
        """Create a remote config even when porcelain rejects prefix overlap."""
        self.git(
            "config", f"remote.{name}.url",
            f"https://github.com/{repository}.git",
        )
        self.git(
            "config", f"remote.{name}.fetch",
            f"+refs/heads/*:refs/remotes/{name}/*",
        )

    def set_remote_ref(
        self, remote: str, branch: str, commit: str | None = None,
    ) -> None:
        self.git(
            "update-ref", f"refs/remotes/{remote}/{branch}", commit or self.base,
        )

    def route_git_snapshot(self) -> dict[str, str]:
        return {
            "head": self.git("rev-parse", "HEAD").stdout,
            "branch": self.git("branch", "--show-current").stdout,
            "refs": self.git("show-ref").stdout,
            "worktrees": self.git("worktree", "list", "--porcelain").stdout,
        }

    def test_issue_route_supports_explicit_fork_and_upstream_remotes(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.git("remote", "set-url", "--push", "upstream", "DISABLED")
        self.set_remote_ref("origin", "main")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("ready", result["status"])
        self.assertEqual("create-from-verified-base", result["preparation"])
        self.assertEqual("slopus/happy", result["repository"])
        self.assertEqual("upstream", result["issueRemote"])
        self.assertEqual("origin", result["publicationRemote"])
        self.assertEqual("myartings/happy", result["publicationRepository"])
        self.assertEqual(self.base, result["verifiedBase"])
        self.assertFalse(result["mutationPerformed"])
        self.assertEqual(
            {
                "issueRemote": "upstream",
                "publicationRemote": "origin",
                "publicationRepository": "myartings/happy",
            },
            {
                key: result["launchCapsule"][key]
                for key in (
                    "issueRemote", "publicationRemote", "publicationRepository",
                )
            },
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_defaults_both_remote_roles_to_origin(self) -> None:
        self.add_github_remote("origin", "slopus/happy")
        self.set_remote_ref("origin", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(base_ref="refs/remotes/origin/main")

        self.assertEqual("ready", result["status"])
        self.assertEqual("origin", result["issueRemote"])
        self.assertEqual("origin", result["publicationRemote"])
        self.assertEqual("slopus/happy", result["publicationRepository"])
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_mismatched_issue_remote(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="origin",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertEqual("observation-failed", result["preparation"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "every Issue remote fetch URL must match the named Issue repository",
            result["failureReason"],
        )
        self.assertNotIn("launchCapsule", result)
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_mixed_issue_remote_fetch_urls(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.git(
            "remote", "set-url", "--add", "upstream",
            "https://github.com/someone-else/happy.git",
        )
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "Issue remote URLs must identify one GitHub repository",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_missing_issue_remote(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.set_remote_ref("origin", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/origin/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "Issue remote URLs must identify one GitHub repository",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_invalid_remote_name_before_git_lookup(self) -> None:
        self.add_github_remote("origin", "slopus/happy")
        self.set_remote_ref("origin", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/origin/main",
            issue_remote="-unsafe",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual("Issue remote name is invalid", result["failureReason"])
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_target_base_from_non_issue_remote(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("origin", "main")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/origin/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "target base must be an exact refs/remotes/upstream/... ref",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_ambiguous_slash_remote_target_base(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("personal", "someone-else/happy")
        self.configure_github_remote("personal/fork", "slopus/happy")
        self.set_remote_ref("personal/fork", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/personal/fork/main",
            issue_remote="personal/fork",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "target base must be uniquely attributable to the Issue remote",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_inconsistent_publication_remote(self) -> None:
        self.add_github_remote(
            "origin", "myartings/happy", push_repository="someone-else/happy"
        )
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "publication remote URLs must identify one GitHub repository",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_missing_publication_remote(self) -> None:
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "publication remote URLs must identify one GitHub repository",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_non_github_publication_remote(self) -> None:
        self.git(
            "remote", "add", "origin",
            "https://example.com/myartings/happy.git",
        )
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "publication remote URLs must identify one GitHub repository",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_non_repository_github_publication_path(self) -> None:
        self.git(
            "remote", "add", "origin",
            "https://github.com/myartings/happy/extra.git",
        )
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertIsNone(result["gitAction"])
        self.assertEqual(
            "publication remote URLs must identify one GitHub repository",
            result["failureReason"],
        )
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_reuses_only_publication_remote_branch(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        initial = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )
        self.assertEqual("create-from-verified-base", initial["preparation"])
        action = initial["gitAction"]
        self.assertIsInstance(action, list)
        self.assertEqual("git", action[0])
        self.git(*(str(value) for value in action[1:]))
        branch = str(initial["branch"])
        self.set_remote_ref("origin", branch)
        before_reuse = self.route_git_snapshot()

        reused = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("ready", reused["status"])
        self.assertEqual("reuse-identity-matched-worktree", reused["preparation"])
        self.assertIsNone(reused["gitAction"])
        self.assertEqual(before_reuse, self.route_git_snapshot())

        self.set_remote_ref("upstream", branch)
        before_collision = self.route_git_snapshot()

        collision = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", collision["status"])
        self.assertEqual(
            "remote-issue-branch-collision-or-divergence",
            collision["failureReason"],
        )
        self.assertIsNone(collision["gitAction"])
        self.assertEqual(before_collision, self.route_git_snapshot())

        self.git("update-ref", "-d", f"refs/remotes/upstream/{branch}")
        tree = self.git("rev-parse", f"{self.base}^{{tree}}").stdout.strip()
        divergent = self.git(
            "commit-tree", tree, "-p", self.base, "-m", "divergent publication",
        ).stdout.strip()
        self.set_remote_ref("origin", branch, divergent)
        before_divergence = self.route_git_snapshot()

        divergence = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", divergence["status"])
        self.assertEqual(
            "remote-issue-branch-collision-or-divergence",
            divergence["failureReason"],
        )
        self.assertIsNone(divergence["gitAction"])
        self.assertEqual(before_divergence, self.route_git_snapshot())

    def test_issue_route_detects_divergent_branch_for_slash_named_remote(self) -> None:
        self.add_github_remote("personal/fork", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        initial = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="personal/fork",
        )
        action = initial["gitAction"]
        self.assertIsInstance(action, list)
        self.git(*(str(value) for value in action[1:]))
        branch = str(initial["branch"])
        tree = self.git("rev-parse", f"{self.base}^{{tree}}").stdout.strip()
        divergent = self.git(
            "commit-tree", tree, "-p", self.base, "-m", "divergent slash remote",
        ).stdout.strip()
        self.set_remote_ref("personal/fork", branch, divergent)
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="personal/fork",
        )

        self.assertEqual("blocked", result["status"])
        self.assertEqual(
            "remote-issue-branch-collision-or-divergence",
            result["failureReason"],
        )
        self.assertIsNone(result["gitAction"])
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_ambiguous_slash_publication_ref(self) -> None:
        self.add_github_remote("personal", "someone-else/happy")
        self.configure_github_remote("personal/fork", "myartings/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        initial = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="personal/fork",
        )
        action = initial["gitAction"]
        self.assertIsInstance(action, list)
        self.git(*(str(value) for value in action[1:]))
        branch = str(initial["branch"])
        self.set_remote_ref("personal/fork", branch)
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="personal/fork",
        )

        self.assertEqual("blocked", result["status"])
        self.assertEqual(
            "remote-issue-branch-collision-or-divergence",
            result["failureReason"],
        )
        self.assertIsNone(result["gitAction"])
        self.assertEqual(before, self.route_git_snapshot())

    def test_issue_route_blocks_stale_slash_remote_ref_with_live_prefix(self) -> None:
        self.add_github_remote("origin", "myartings/happy")
        self.add_github_remote("personal", "someone-else/happy")
        self.add_github_remote("upstream", "slopus/happy")
        self.set_remote_ref("upstream", "main")
        initial = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )
        action = initial["gitAction"]
        self.assertIsInstance(action, list)
        self.git(*(str(value) for value in action[1:]))
        branch = str(initial["branch"])
        self.set_remote_ref("origin", branch)
        self.set_remote_ref("personal/fork", branch)
        before = self.route_git_snapshot()

        result = self.route_issue(
            base_ref="refs/remotes/upstream/main",
            issue_remote="upstream",
            publication_remote="origin",
        )

        self.assertEqual("blocked", result["status"])
        self.assertEqual(
            "remote-issue-branch-collision-or-divergence",
            result["failureReason"],
        )
        self.assertIsNone(result["gitAction"])
        self.assertEqual(before, self.route_git_snapshot())

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

    def prepare_failed_check_candidate(
        self, slug: str, *, staged: bool = True,
    ) -> str:
        self.prepare_verification_candidate(slug)
        config_path = self.project / ".ai" / "project.json"
        config = json.loads(config_path.read_text(encoding="utf-8"))
        config["commands"]["check"] = [
            "{python} -c \"print('fixture check passed')\"",
            (
                "{python} -c \"import sys; print('fixture check failed'); "
                "sys.exit(7)\""
            ),
            (
                "{python} -c \"import sys; print('second fixture check failed'); "
                "sys.exit(9)\""
            ),
        ]
        config_path.write_text(json.dumps(config) + "\n", encoding="utf-8")
        self.git("add", ".")
        arguments = ["--applicable", "--record", slug]
        if staged:
            arguments.extend(("--staged", "--base", self.base))
        failed = self.run_script("workflow-check.py", *arguments, ok=False)
        self.assertIn("commands: 3, failures: 2", failed.stdout)
        evidence = (
            self.project / "docs" / "workspace" / slug
            / "evidence" / "checks.jsonl"
        )
        records = [
            json.loads(line)
            for line in evidence.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        self.assertEqual([item["exitCode"] for item in records[-3:]], [0, 7, 9])
        self.assertEqual(
            {item["runId"] for item in records[-3:]}, {records[-1]["runId"]}
        )
        return records[-1]["runId"]

    def accept_failed_check_candidate(self, slug: str, run_id: str) -> None:
        self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "1",
            "--accepted-command-index", "2",
            "--approval", "Fixture owner accepts command indexes 1 and 2",
            "--evidence", "Exact fixture failures are accepted",
        )
        self.git("add", ".")

    def tamper_accepted_gap_approval(self, slug: str) -> bytes:
        workflow = (
            self.project / "docs" / "workspace" / slug / "workflow.json"
        )
        original = workflow.read_bytes()
        state = json.loads(original)
        state["checkAcceptedFailures"]["approval"] = "Tampered approval"
        workflow.write_text(
            json.dumps(state, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        return original

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
        (workspace / "validation.md").write_text(
            "# Validation\n\n## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n| --- | --- | --- |\n"
            "| Result | verified | fixture |\n\n"
            "## Remaining gaps\n\n- None.\n",
            encoding="utf-8",
        )
        (workspace / "finish.md").write_text(
            "# Finish Review\n\n## Summary\n\nDone.\n\n"
            "## Verification\n\nPass.\n\n"
            "## Whole-diff review\n\nPass.\n\n"
            "## Rollback or mitigation\n\nRevert.\n\n"
            "## Lessons promoted\n\nNone.\n\n"
            "## Follow-up\n\nNone.\n",
            encoding="utf-8",
        )
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

    def test_generic_check_gate_cannot_forge_candidate_bound_outcome(self) -> None:
        slug = "accepted-gap-generic-gate"
        self.prepare_verification_candidate(slug)
        rejected = self.state(
            "gate", slug, "check", "accepted_gaps",
            "--evidence", "must not bypass a structured receipt", ok=False,
        )
        self.assertIn(
            "check=accepted_gaps requires a bound structured workflow-check run",
            rejected.stderr,
        )

    def test_accepted_gap_receipt_requires_exact_failed_indexes(self) -> None:
        slug = "accepted-gap-receipt"
        run_id = self.prepare_failed_check_candidate(slug)
        workspace = self.project / "docs" / "workspace" / slug
        before = (workspace / "workflow.json").read_bytes()

        missing_index = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--approval", "Fixture approval",
            "--evidence", "missing index must fail", ok=False,
        )
        self.assertIn(
            "accepted check failures require at least one "
            "--accepted-command-index",
            missing_index.stderr,
        )
        missing_approval = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "1",
            "--evidence", "missing approval must fail", ok=False,
        )
        self.assertIn("--approval", missing_approval.stderr)
        duplicate = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "1",
            "--accepted-command-index", "1",
            "--approval", "Fixture approval",
            "--evidence", "duplicate indexes must fail", ok=False,
        )
        self.assertIn("accepted command indexes must be unique", duplicate.stderr)
        successful_index = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "0",
            "--accepted-command-index", "1",
            "--accepted-command-index", "2",
            "--approval", "Fixture approval",
            "--evidence", "successful index must fail", ok=False,
        )
        self.assertIn(
            "accepted command indexes do not exactly match failed command indexes",
            successful_index.stderr,
        )
        missing_failure = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "1",
            "--approval", "Fixture approval",
            "--evidence", "missing failure must fail", ok=False,
        )
        self.assertIn(
            "accepted command indexes do not exactly match failed command indexes",
            missing_failure.stderr,
        )
        self.assertEqual(before, (workspace / "workflow.json").read_bytes())

        self.accept_failed_check_candidate(slug, run_id)
        state = json.loads((workspace / "workflow.json").read_text(encoding="utf-8"))
        self.assertEqual(state["gates"]["check"]["status"], "accepted_gaps")
        self.assertEqual(state["checkRunId"], run_id)
        self.assertEqual(state["checkedCandidate"]["identityKind"], "staged-candidate-v1")
        self.assertEqual(
            state["checkAcceptedFailures"],
            {
                "policyVersion": 1,
                "commandIndexes": [1, 2],
                "approval": "Fixture owner accepts command indexes 1 and 2",
            },
        )
        self.assertEqual(len(state["checkAcceptedFailuresFingerprint"]), 64)
        accepted_state = (workspace / "workflow.json").read_bytes()
        self.tamper_accepted_gap_approval(slug)
        rejected_approval = self.run_script(
            "workflow-audit.py", slug, "--strict", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed",
            rejected_approval.stdout,
        )
        (workspace / "workflow.json").write_bytes(accepted_state)

        tampered = dict(state)
        tampered["checkAcceptedFailures"] = dict(state["checkAcceptedFailures"])
        tampered["checkAcceptedFailures"]["commandIndexes"] = [0]
        (workspace / "workflow.json").write_text(
            json.dumps(tampered, indent=2) + "\n", encoding="utf-8"
        )
        rejected_tamper = self.run_script(
            "workflow-audit.py", slug, "--strict", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed",
            rejected_tamper.stdout,
        )
        (workspace / "workflow.json").write_bytes(accepted_state)

        self.state(
            "check-receipt", slug, "blocked", "--run-id", run_id,
            "--evidence", "fixture gap acceptance withdrawn",
        )
        blocked = json.loads(
            (workspace / "workflow.json").read_text(encoding="utf-8")
        )
        self.assertEqual(blocked["gates"]["check"]["status"], "blocked")
        for field in (
            "checkEvidencePolicy", "checkRunId", "checkRunFingerprint",
            "checkedCandidate", "checkAcceptedFailures",
            "checkAcceptedFailuresFingerprint", "finalReview",
        ):
            self.assertNotIn(field, blocked)

    def test_accepted_gap_receipt_rejects_worktree_run(self) -> None:
        slug = "accepted-gap-worktree"
        run_id = self.prepare_failed_check_candidate(slug, staged=False)
        rejected = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "1",
            "--accepted-command-index", "2",
            "--approval", "Fixture approval",
            "--evidence", "worktree run must fail", ok=False,
        )
        self.assertIn(
            "check=accepted_gaps requires a staged-candidate-v1 run",
            rejected.stderr,
        )

    def test_accepted_gap_receipt_rejects_non_final_run_without_mutation(self) -> None:
        slug = "accepted-gap-non-final-run"
        old_run_id = self.prepare_failed_check_candidate(slug)
        rerun = self.run_script(
            "workflow-check.py", "--applicable", "--record", slug,
            "--staged", "--base", self.base, ok=False,
        )
        self.assertIn("commands: 3, failures: 2", rerun.stdout)
        workspace = self.project / "docs" / "workspace" / slug
        records = [
            json.loads(line)
            for line in (workspace / "evidence" / "checks.jsonl")
            .read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        self.assertNotEqual(old_run_id, records[-1]["runId"])
        before = (workspace / "workflow.json").read_bytes()
        rejected = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", old_run_id,
            "--accepted-command-index", "1",
            "--accepted-command-index", "2",
            "--approval", "Fixture approval",
            "--evidence", "non-final run must fail", ok=False,
        )
        self.assertIn("final evidence run", rejected.stderr)
        self.assertEqual(before, (workspace / "workflow.json").read_bytes())

    def test_successful_receipt_rejects_completed_review_without_mutation(self) -> None:
        slug = "receipt-after-review"
        self.prepare_checked_candidate(slug)
        workspace = self.project / "docs" / "workspace" / slug
        workflow = workspace / "workflow.json"
        state = json.loads(workflow.read_text(encoding="utf-8"))
        run_id = state["checkRunId"]
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
        before = workflow.read_bytes()
        rejected = self.state(
            "check-receipt", slug, "passed", "--run-id", run_id,
            "--evidence", "repeated receipt must fail", ok=False,
        )
        self.assertIn("requires review=pending", rejected.stderr)
        self.assertEqual(before, workflow.read_bytes())
        self.run_script("workflow-audit.py", slug, "--strict")

    def test_candidate_bound_accepted_gaps_pass_terminal_ci(self) -> None:
        slug = "accepted-gap-terminal"
        run_id = self.prepare_failed_check_candidate(slug)
        self.accept_failed_check_candidate(slug, run_id)
        workspace = self.project / "docs" / "workspace" / slug
        workflow = workspace / "workflow.json"
        accepted_state = self.tamper_accepted_gap_approval(slug)
        rejected_audit = self.run_script(
            "workflow-audit.py", slug, "--strict", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed", rejected_audit.stdout,
        )
        workflow.write_bytes(accepted_state)
        self.git("add", ".")
        self.run_script(
            "workflow-review.py", "package", slug,
            "--base", self.base, "--staged",
        )
        review_state = self.tamper_accepted_gap_approval(slug)
        rejected_review = self.state(
            "review-conclusion", slug, "--axis", "spec-review",
            "--status", "accepted", "--evidence", "must reject drift",
            ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed", rejected_review.stderr,
        )
        workflow.write_bytes(review_state)
        for axis in ("spec-review", "standards-review"):
            self.state(
                "review-conclusion", slug, "--axis", axis,
                "--status", "accepted", "--evidence", f"{axis} fixture accepted",
            )
        review_gate_state = self.tamper_accepted_gap_approval(slug)
        rejected_review_gate = self.state(
            "gate", slug, "review", "passed",
            "--evidence", "must reject drift after both conclusions", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed",
            rejected_review_gate.stderr,
        )
        workflow.write_bytes(review_gate_state)
        self.gate(slug, "review")
        reviewed_state = workflow.read_bytes()
        repeated_receipt = self.state(
            "check-receipt", slug, "accepted_gaps", "--run-id", run_id,
            "--accepted-command-index", "1",
            "--accepted-command-index", "2",
            "--approval", "Fixture owner accepts command indexes 1 and 2",
            "--evidence", "repeated receipt must fail", ok=False,
        )
        self.assertIn("requires review=pending", repeated_receipt.stderr)
        self.assertEqual(reviewed_state, workflow.read_bytes())
        workspace = self.project / "docs" / "workspace" / slug
        (workspace / "validation.md").write_text(
            "# Validation\n\n## Acceptance coverage\n\n"
            "| Criterion | Status | Evidence |\n| --- | --- | --- |\n"
            "| Result | verified | accepted fixture gap |\n\n"
            "## Remaining gaps\n\n- Accepted command indexes 1 and 2.\n",
            encoding="utf-8",
        )
        (workspace / "finish.md").write_text(
            "# Finish Review\n\n## Summary\n\nDone.\n\n"
            "## Verification\n\nExact gap accepted.\n\n"
            "## Whole-diff review\n\nPass.\n\n"
            "## Rollback or mitigation\n\nRevert.\n\n"
            "## Lessons promoted\n\nNone.\n\n"
            "## Follow-up\n\nNone.\n",
            encoding="utf-8",
        )
        self.state("transition", slug, "finish", "Finish accepted-gap fixture")
        finish_state = self.tamper_accepted_gap_approval(slug)
        rejected_finish = self.state(
            "gate", slug, "finish", "passed",
            "--evidence", "must reject approval drift", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed", rejected_finish.stderr,
        )
        workflow.write_bytes(finish_state)
        self.gate(slug, "finish")
        self.git("add", ".")
        prearchive_state = self.tamper_accepted_gap_approval(slug)
        self.git("add", str(workflow.relative_to(self.project)))
        rejected_prearchive = self.run_script(
            "workflow-ci.py", "--staged", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed",
            rejected_prearchive.stdout,
        )
        workflow.write_bytes(prearchive_state)
        self.git("add", str(workflow.relative_to(self.project)))
        self.run_script("workflow-ci.py", "--staged")
        self.state("archive", slug, "--summary", "completed accepted-gap fixture")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")
        archived_state = self.tamper_accepted_gap_approval(slug)
        self.git("add", str(workflow.relative_to(self.project)))
        rejected_archived = self.run_script(
            "workflow-ci.py", "--staged", ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed", rejected_archived.stdout,
        )
        workflow.write_bytes(archived_state)
        self.git("add", str(workflow.relative_to(self.project)))
        self.git("commit", "-m", "archived accepted-gap fixture")
        self.run_script("workflow-ci.py", "--base", self.base)
        self.tamper_accepted_gap_approval(slug)
        self.git("add", str(workflow.relative_to(self.project)))
        self.git("commit", "-m", "tampered accepted-gap approval")
        rejected_committed = self.run_script(
            "workflow-ci.py", "--base", self.base, ok=False,
        )
        self.assertIn(
            "checkAcceptedFailures fingerprint changed",
            rejected_committed.stdout,
        )

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

    def test_committed_merge_auto_detects_second_parent_as_source(self) -> None:
        slug = "merge-source-selection"
        self.git("config", "core.autocrlf", "true")
        self.prepare_reviewed_finish(slug)
        self.state("archive", slug, "--summary", "completed merge fixture")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")
        self.git("commit", "-m", "archived source delivery")
        source = self.git("rev-parse", "HEAD").stdout.strip()

        self.git("switch", "-c", "merge-target", self.base)
        self.git("merge", "--no-ff", source, "-m", "merge source delivery")

        self.run_script("workflow-ci.py")

    def test_committed_merge_preserves_explicit_first_parent_source(self) -> None:
        slug = "merge-source-override"
        self.git("config", "core.autocrlf", "true")
        self.prepare_reviewed_finish(slug)
        self.state("archive", slug, "--summary", "completed local merge fixture")
        self.git("add", ".")
        self.run_script("workflow-ci.py", "--staged")
        self.git("commit", "-m", "archived source delivery")
        source = self.git("rev-parse", "HEAD").stdout.strip()

        self.git("switch", "-c", "advanced-target", self.base)
        (self.project / "target.txt").write_text("advanced\n", encoding="utf-8")
        self.git("add", "target.txt")
        self.git("commit", "-m", "advance target")
        target = self.git("rev-parse", "HEAD").stdout.strip()

        self.git("switch", "--detach", source)
        self.git("merge", "--no-ff", target, "-m", "merge target into source")

        self.run_script(
            "workflow-ci.py",
            environment={**os.environ, "WORKFLOW_SOURCE_PARENT": "1"},
        )


if __name__ == "__main__":
    unittest.main()
