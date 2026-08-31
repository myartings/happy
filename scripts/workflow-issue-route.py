#!/usr/bin/env python3
"""Plan deterministic Issue branch/worktree preparation from current Git facts."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

ISSUE_PATH = re.compile(r"^/([^/]+)/([^/]+)/issues/([1-9][0-9]*)/?$")


def run_git(root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(
            ["git", *args], cwd=root, text=True, capture_output=True, check=False
        )
    except OSError as exc:
        raise ValueError("cannot inspect Git repository") from exc


def issue_identity(url: str) -> tuple[str, str, int]:
    parsed = urlparse(url)
    match = ISSUE_PATH.fullmatch(parsed.path)
    if (
        parsed.scheme != "https"
        or parsed.netloc.lower() != "github.com"
        or parsed.query
        or parsed.fragment
        or not match
    ):
        raise ValueError(
            "issue URL must be https://github.com/OWNER/REPOSITORY/issues/NUMBER"
        )
    return match.group(1).lower(), match.group(2).lower(), int(match.group(3))


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.casefold()).strip("-")
    return slug[:48].rstrip("-") or "work"


def repository_root(raw: str) -> Path:
    candidate = Path(raw).resolve()
    completed = run_git(candidate, "rev-parse", "--show-toplevel")
    if completed.returncode:
        raise ValueError("repo root must belong to a Git worktree")
    resolved = Path(completed.stdout.strip()).resolve()
    if resolved != candidate:
        raise ValueError("repo root must be the exact Git worktree root")
    return resolved


def git_common_dir(root: Path) -> Path:
    completed = run_git(root, "rev-parse", "--git-common-dir")
    if completed.returncode:
        raise ValueError("cannot resolve shared Git directory")
    common = Path(completed.stdout.strip())
    if not common.is_absolute():
        common = (root / common).resolve()
    return common.resolve()


def normalized_github_repository(raw: str) -> str | None:
    value = raw.removesuffix(".git")
    scp = re.fullmatch(r"git@([^:]+):(.+)", value)
    if scp:
        host, repository = scp.groups()
    else:
        parsed = urlparse(value)
        if parsed.scheme == "https" and parsed.netloc.lower() == "github.com":
            host, repository = parsed.netloc, parsed.path.lstrip("/")
        elif parsed.scheme == "ssh" and parsed.hostname:
            host, repository = parsed.hostname, parsed.path.lstrip("/")
        else:
            return None
    if host.casefold() != "github.com":
        return None
    return repository


def require_matching_remote(root: Path, owner: str, repository: str) -> None:
    fetch = run_git(root, "remote", "get-url", "--all", "origin")
    push = run_git(root, "remote", "get-url", "--push", "--all", "origin")
    if fetch.returncode or push.returncode:
        raise ValueError("origin remote must identify the Issue repository")
    expected = f"{owner}/{repository}".lower()
    repositories = [
        value.lower() if (value := normalized_github_repository(raw)) else None
        for raw in fetch.stdout.splitlines() + push.stdout.splitlines()
    ]
    if not repositories or any(value != expected for value in repositories):
        raise ValueError("every origin URL must match the named Issue repository")


def is_full_object_id(root: Path, value: str) -> bool:
    completed = run_git(root, "rev-parse", "--show-object-format")
    if completed.returncode:
        raise ValueError("cannot resolve Git repository object format")
    lengths = {"sha1": 40, "sha256": 64}
    length = lengths.get(completed.stdout.strip())
    if length is None:
        raise ValueError("unsupported Git repository object format")
    return re.fullmatch(
        rf"[0-9a-f]{{{length}}}", value, flags=re.IGNORECASE
    ) is not None


def verified_base(root: Path, raw_ref: str, kind: str) -> str:
    if kind == "target" and not raw_ref.startswith("refs/remotes/origin/"):
        raise ValueError("target base must be an exact refs/remotes/origin/... ref")
    if kind == "dependency" and not (
        raw_ref.startswith("refs/") or is_full_object_id(root, raw_ref)
    ):
        raise ValueError("dependency base must be an exact ref or full commit")
    if raw_ref.startswith("refs/"):
        valid = run_git(root, "check-ref-format", raw_ref)
        if valid.returncode:
            raise ValueError("base must name one exact ref without revision syntax")
        literal = run_git(root, "show-ref", "--verify", "--hash", raw_ref)
        if literal.returncode:
            raise ValueError("base ref must resolve to an existing full Git commit")
        raw_object = literal.stdout.strip()
    else:
        raw_object = raw_ref
    completed = run_git(root, "rev-parse", "--verify", f"{raw_object}^{{commit}}")
    commit = completed.stdout.strip()
    if completed.returncode or not is_full_object_id(root, commit):
        raise ValueError("base ref must resolve to an existing full Git commit")
    return commit


def worktrees(root: Path) -> list[dict[str, str]]:
    completed = run_git(root, "worktree", "list", "--porcelain", "-z")
    if completed.returncode:
        raise ValueError("cannot inspect Git worktrees")
    rows: list[dict[str, str]] = []
    current: dict[str, str] = {}
    for field in completed.stdout.split("\0"):
        if not field:
            if current:
                rows.append(current)
                current = {}
            continue
        key, _, value = field.partition(" ")
        current[key] = value
    return rows


def ref_commit(root: Path, ref: str) -> str | None:
    listing = run_git(root, "show-ref")
    if listing.returncode == 1 and not listing.stdout:
        return None
    if listing.returncode:
        raise ValueError(f"cannot inspect Git ref {ref}")
    matches = [
        line.split(" ", 1)[0]
        for line in listing.stdout.splitlines()
        if line.partition(" ")[2] == ref
    ]
    if not matches:
        return None
    if len(matches) != 1:
        raise ValueError(f"Git ref {ref} is ambiguous")
    completed = run_git(
        root, "rev-parse", "--verify", f"{matches[0]}^{{commit}}"
    )
    value = completed.stdout.strip()
    if completed.returncode or not is_full_object_id(root, value):
        raise ValueError(f"Git ref {ref} does not resolve to a full commit")
    return value


def is_descendant(root: Path, base: str, commit: str) -> bool:
    return not run_git(root, "merge-base", "--is-ancestor", base, commit).returncode


def blocked(result: dict[str, object], reason: str) -> dict[str, object]:
    result.pop("launchCapsule", None)
    result.update(
        status="blocked",
        preparation="stop-on-identity-collision",
        implementation="blocked",
        gitAction=None,
        failureReason=reason,
    )
    return result


def observed_git_state(root: Path) -> dict[str, object]:
    head = run_git(root, "rev-parse", "--verify", "HEAD^{commit}")
    branch = run_git(root, "symbolic-ref", "--quiet", "--short", "HEAD")
    status = run_git(root, "status", "--porcelain", "-uall")
    if branch.returncode not in {0, 1}:
        raise ValueError("cannot inspect Git branch for launch capsule")
    if status.returncode:
        raise ValueError("cannot inspect Git status for launch capsule")
    head_value: str | None = head.stdout.strip() if head.returncode == 0 else None
    if head_value is None:
        refs = run_git(root, "show-ref")
        observable_without_head = (
            branch.returncode == 0 and refs.returncode == 1 and not refs.stdout
        )
        if not observable_without_head:
            raise ValueError("cannot inspect Git HEAD for launch capsule")
    return {
        "head": head_value,
        "branch": branch.stdout.strip() if branch.returncode == 0 else None,
        "dirty": bool(status.stdout),
    }


def launch_capsule(
    result: dict[str, object], instruction: str, observed_root: Path,
    git_state: dict[str, object] | None = None,
) -> dict[str, object]:
    issue = str(result["issue"])
    return {
        "schemaVersion": 1,
        "kind": "issue-session-launch",
        "issue": issue,
        "repository": result["repository"],
        "branch": result["branch"],
        "worktree": result["worktree"],
        "durableResumeSource": issue,
        "acceptedIntent": result["acceptedIntent"],
        "localAcceptance": "pending",
        "gitState": git_state or observed_git_state(observed_root),
        "instruction": instruction,
        "initialPrompt": (
            f"Resume {issue} in {result['worktree']}; re-read the live Issue "
            "and repository, confirm user acceptance, then create or accept "
            "the local Workspace and own its complete lifecycle. Stop before "
            "local lifecycle mutation if binding or authorization is unconfirmed."
        ),
        "launchOccurred": False,
        "credentialsIncluded": False,
    }


def confirmed_binding_source(
    raw: str | None,
    *,
    issue: str,
    repository: str,
    branch: str,
    worktree: Path,
    session_root: Path,
) -> str | None:
    if raw is None:
        return None
    try:
        evidence = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return None
    if not isinstance(evidence, dict) or set(evidence) != {
        "source", "confirmed", "issue", "repository", "branch", "worktree",
    }:
        return None
    source = evidence.get("source")
    if source not in {"native-handoff", "fresh-session"}:
        return None
    if evidence.get("confirmed") is not True:
        return None
    if (
        evidence.get("issue") != issue
        or evidence.get("repository") != repository
        or evidence.get("branch") != branch
        or not isinstance(evidence.get("worktree"), str)
    ):
        return None
    try:
        evidence_worktree = Path(evidence["worktree"]).resolve()
    except (OSError, RuntimeError, ValueError):
        return None
    if evidence_worktree != worktree.resolve() or session_root != worktree.resolve():
        return None
    return source


def plan(args: argparse.Namespace) -> dict[str, object]:
    owner, repository, number = issue_identity(args.issue_url)
    root = repository_root(args.repo_root)
    session_root = Path(args.session_root).resolve()
    if session_root != repository_root(str(session_root)):
        raise ValueError("session root must be the exact current Git worktree root")
    common_dir = git_common_dir(root)
    if git_common_dir(session_root) != common_dir:
        raise ValueError("session root must belong to the selected repository")
    require_matching_remote(root, owner, repository)
    base = verified_base(root, args.base_ref, args.base_kind)
    branch = f"issue/{number}-{slugify(args.issue_title)}"
    branch_ref = f"refs/heads/{branch}"
    rows = worktrees(root)
    if not rows or not rows[0].get("worktree"):
        raise ValueError("cannot identify the primary Git worktree")
    primary = Path(rows[0]["worktree"]).resolve()
    planned_worktree = Path(os.path.abspath(
        primary.parent / ".worktrees" / f"{repository}-issue-{number}"
    ))
    result: dict[str, object] = {
        "schemaVersion": 1,
        "issue": args.issue_url,
        "acceptedIntent": args.accepted_intent or args.issue_title,
        "repository": f"{owner}/{repository}",
        "baseKind": args.base_kind,
        "baseRef": args.base_ref,
        "verifiedBase": base,
        "branch": branch,
        "worktree": str(planned_worktree),
        "consistency": "point-in-time-observation",
        "revalidationRequiredBeforeExecution": True,
        "mutationPerformed": False,
        "implementation": "manual-start-required",
        "sessionBinding": {"status": "unproven", "source": None},
    }
    result["launchCapsule"] = launch_capsule(
        result, "manual-start-required", session_root
    )
    if args.isolation == "opt-out":
        git_state = observed_git_state(session_root)
        result.update(
            status="ready",
            preparation="current-checkout-explicit-opt-out",
            worktree=str(session_root),
            implementation="current-root",
            sessionBinding={"status": "explicit-opt-out", "source": "user"},
            gitAction=None,
            failureReason=None,
        )
        result["launchCapsule"] = launch_capsule(
            result, "current-checkout-explicit-opt-out", session_root, git_state
        )
        return result

    identity_rows = [
        row for row in rows
        if Path(row.get("worktree", "")).resolve() == planned_worktree.resolve()
        or row.get("branch") == branch_ref
    ]
    local_commit = ref_commit(root, branch_ref)
    remote_listing = run_git(
        root, "for-each-ref", "--format=%(refname)", "refs/remotes"
    )
    if remote_listing.returncode:
        raise ValueError("cannot inspect remote Git refs")
    remote_refs = [
        ref for ref in remote_listing.stdout.splitlines()
        if ref.startswith("refs/remotes/")
        and ref.removeprefix("refs/remotes/").partition("/")[2] == branch
    ]
    expected_remote = f"refs/remotes/origin/{branch}"
    remote_commit = ref_commit(root, expected_remote)
    path_exists = planned_worktree.exists() or planned_worktree.is_symlink()

    fully_absent = not identity_rows and local_commit is None and not remote_refs
    if fully_absent and not path_exists:
        result.update(
            status="ready",
            preparation="create-from-verified-base",
            gitAction=[
                "git", "worktree", "add", "-b", branch,
                str(planned_worktree), base,
            ],
            failureReason=None,
        )
        return result
    if path_exists and not any(
        Path(row.get("worktree", "")).resolve() == planned_worktree.resolve()
        for row in rows
    ):
        return blocked(result, "unregistered-residual-worktree-path")

    exact_rows = [
        row for row in rows
        if Path(row.get("worktree", "")).resolve() == planned_worktree.resolve()
        and row.get("branch") == branch_ref
    ]
    if len(exact_rows) != 1 or len(identity_rows) != 1 or local_commit is None:
        return blocked(result, "branch-or-worktree-identity-collision")
    exact_row = exact_rows[0]
    if (
        "prunable" in exact_row
        or not planned_worktree.is_dir()
        or planned_worktree.is_symlink()
    ):
        return blocked(
            result, "registered-worktree-path-missing-prunable-or-unusable"
        )
    checkout = run_git(planned_worktree, "rev-parse", "--show-toplevel")
    if (
        checkout.returncode
        or Path(checkout.stdout.strip()).resolve() != planned_worktree.resolve()
    ):
        return blocked(
            result, "registered-worktree-path-missing-prunable-or-unusable"
        )
    checkout_branch = run_git(
        planned_worktree, "symbolic-ref", "--quiet", "HEAD"
    )
    checkout_head = run_git(
        planned_worktree, "rev-parse", "--verify", "HEAD^{commit}"
    )
    try:
        checkout_common_dir = git_common_dir(planned_worktree)
    except ValueError:
        checkout_common_dir = None
    if (
        checkout_common_dir != common_dir
        or checkout_branch.returncode
        or checkout_branch.stdout.strip() != branch_ref
        or checkout_head.returncode
        or checkout_head.stdout.strip() != local_commit
        or exact_row.get("HEAD") != local_commit
    ):
        return blocked(result, "registered-worktree-checkout-identity-mismatch")
    if not is_descendant(root, base, local_commit):
        return blocked(result, "local-issue-branch-does-not-descend-from-base")
    if remote_refs:
        if remote_refs != [expected_remote] or remote_commit != local_commit:
            return blocked(result, "remote-issue-branch-collision-or-divergence")
    result.update(
        status="ready",
        preparation="reuse-identity-matched-worktree",
        gitAction=None,
        failureReason=None,
    )
    binding_source = confirmed_binding_source(
        args.session_binding_json,
        issue=args.issue_url,
        repository=f"{owner}/{repository}",
        branch=branch,
        worktree=planned_worktree,
        session_root=session_root,
    )
    if binding_source is not None:
        result.update(
            implementation="current-root",
            sessionBinding={"status": "confirmed", "source": binding_source},
        )
        result["launchCapsule"] = launch_capsule(
            result, f"{binding_source}-confirmed", planned_worktree
        )
    return result


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(
        description=(
            "Observe current Git facts and return a point-in-time preparation plan. "
            "A cooperating executor must rerun this planner immediately before using "
            "gitAction; this command never executes Git mutations or repairs state."
        )
    )
    result.add_argument("--repo-root", required=True)
    result.add_argument("--session-root", required=True)
    result.add_argument("--issue-url", required=True)
    result.add_argument("--issue-title", required=True)
    result.add_argument(
        "--accepted-intent",
        help=(
            "Accepted human-visible Issue intent to carry in the inert capsule; "
            "defaults to the Issue title and never marks local acceptance passed."
        ),
    )
    result.add_argument("--base-ref", required=True)
    result.add_argument("--base-kind", choices=("target", "dependency"), required=True)
    result.add_argument("--isolation", choices=("default", "opt-out"), default="default")
    result.add_argument("--session-binding-json")
    return result


def main() -> int:
    args = parser().parse_args()
    try:
        output = plan(args)
    except (OSError, RuntimeError, ValueError) as exc:
        output = {
            "schemaVersion": 1,
            "issue": args.issue_url,
            "baseKind": args.base_kind,
            "baseRef": args.base_ref,
            "status": "blocked",
            "preparation": "observation-failed",
            "implementation": "blocked",
            "gitAction": None,
            "failureReason": str(exc),
            "consistency": "point-in-time-observation",
            "revalidationRequiredBeforeExecution": True,
            "mutationPerformed": False,
        }
    print(json.dumps(output, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
