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
MANUAL_LAUNCH_REQUIRED_KEYS = {
    "schemaVersion", "specified", "rightSizing", "consequence", "risk",
    "capability",
}
MANUAL_LAUNCH_OPTIONAL_KEYS = {
    "solReasoningEffort", "solEffortJustification",
}


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
        if parsed.query or parsed.fragment:
            return None
        if parsed.scheme == "https" and parsed.netloc.lower() == "github.com":
            host, repository = parsed.netloc, parsed.path.lstrip("/")
        elif parsed.scheme == "ssh" and parsed.hostname:
            host, repository = parsed.hostname, parsed.path.lstrip("/")
        else:
            return None
    if host.casefold() != "github.com":
        return None
    if re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository) is None:
        return None
    return repository


def validated_remote_name(root: Path, raw: str, role: str) -> str:
    if not raw or raw.startswith("-"):
        raise ValueError(f"{role} remote name is invalid")
    completed = run_git(root, "check-ref-format", f"refs/remotes/{raw}/probe")
    if completed.returncode:
        raise ValueError(f"{role} remote name is invalid")
    return raw


def remote_urls(root: Path, remote: str, *, role: str, push: bool) -> list[str]:
    args = ["remote", "get-url"]
    if push:
        args.append("--push")
    args.extend(("--all", remote))
    completed = run_git(root, *args)
    if completed.returncode:
        raise ValueError(f"{role} remote URLs must identify one GitHub repository")
    return [line for line in completed.stdout.splitlines() if line]


def github_remote_repository(
    root: Path,
    remote: str,
    *,
    role: str,
    include_push: bool,
) -> str:
    urls = remote_urls(root, remote, role=role, push=False)
    if include_push:
        urls.extend(remote_urls(root, remote, role=role, push=True))
    repositories = [normalized_github_repository(raw) for raw in urls]
    if not repositories or any(value is None for value in repositories):
        raise ValueError(f"{role} remote URLs must identify one GitHub repository")
    normalized = {str(value).casefold() for value in repositories}
    if len(normalized) != 1:
        raise ValueError(f"{role} remote URLs must identify one GitHub repository")
    return normalized.pop()


def require_issue_remote(
    root: Path, remote: str, owner: str, repository: str,
) -> None:
    actual = github_remote_repository(
        root, remote, role="Issue", include_push=False
    )
    if actual != f"{owner}/{repository}".casefold():
        raise ValueError(
            "every Issue remote fetch URL must match the named Issue repository"
        )


def configured_remote_names(root: Path) -> list[str]:
    completed = run_git(root, "remote")
    if completed.returncode:
        raise ValueError("cannot inspect configured Git remotes")
    return [line for line in completed.stdout.splitlines() if line]


def remote_ref_attributions(root: Path, ref: str) -> list[tuple[str, str]]:
    if not ref.startswith("refs/remotes/"):
        return []
    relative = ref.removeprefix("refs/remotes/")
    matches: list[tuple[str, str]] = []
    for remote in configured_remote_names(root):
        prefix = f"{remote}/"
        if relative.startswith(prefix):
            branch = relative.removeprefix(prefix)
            if branch:
                matches.append((remote, branch))
    return matches


def uniquely_attributed_to_remote(root: Path, ref: str, remote: str) -> bool:
    matches = remote_ref_attributions(root, ref)
    return len(matches) == 1 and matches[0][0] == remote


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


def verified_base(root: Path, raw_ref: str, kind: str, issue_remote: str) -> str:
    target_prefix = f"refs/remotes/{issue_remote}/"
    if kind == "target" and not raw_ref.startswith(target_prefix):
        raise ValueError(
            f"target base must be an exact {target_prefix}... ref"
        )
    if kind == "target" and not uniquely_attributed_to_remote(
        root, raw_ref, issue_remote
    ):
        raise ValueError(
            "target base must be uniquely attributable to the Issue remote"
        )
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


def remote_branch_refs(root: Path, branch: str) -> list[str]:
    listing = run_git(
        root, "for-each-ref", "--format=%(refname)", "refs/remotes"
    )
    if listing.returncode:
        raise ValueError("cannot inspect remote Git refs")
    matches: list[str] = []
    for ref in listing.stdout.splitlines():
        if not ref.startswith("refs/remotes/"):
            continue
        relative = ref.removeprefix("refs/remotes/")
        if relative.endswith(f"/{branch}"):
            # Remote names and branch names may both contain slashes, and stale
            # remote-tracking refs outlive remote configuration. Treat every
            # canonical suffix as an identity claim; ambiguity must fail closed.
            matches.append(ref)
    return matches


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
    result.pop("manualIssueLaunchContract", None)
    result.update(
        status="blocked",
        preparation="stop-on-identity-collision",
        implementation="blocked",
        gitAction=None,
        failureReason=reason,
    )
    return result


def manual_launch_assessment(raw: str | None) -> dict[str, object]:
    if raw is None:
        return {"executable": False, "routeReason": "input-missing"}
    try:
        value = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {"executable": False, "routeReason": "input-invalid"}
    allowed = MANUAL_LAUNCH_REQUIRED_KEYS | MANUAL_LAUNCH_OPTIONAL_KEYS
    if (
        not isinstance(value, dict)
        or set(value) - allowed
        or not MANUAL_LAUNCH_REQUIRED_KEYS.issubset(value)
        or not isinstance(value.get("schemaVersion"), int)
        or isinstance(value.get("schemaVersion"), bool)
        or value.get("schemaVersion") != 1
        or not isinstance(value.get("specified"), bool)
    ):
        return {"executable": False, "routeReason": "input-invalid"}
    if value["specified"] is False:
        return {"executable": False, "routeReason": "issue-contract-incomplete"}
    if not all(
        isinstance(value[key], str)
        for key in ("rightSizing", "consequence", "risk", "capability")
    ):
        return {"executable": False, "routeReason": "input-invalid"}
    if value["rightSizing"] not in {"one-slice", "split-required", "incomplete"}:
        return {"executable": False, "routeReason": "assessment-unknown"}
    if value["rightSizing"] != "one-slice":
        return {"executable": False, "routeReason": "right-sizing-not-executable"}
    if (
        value["consequence"] not in {"low", "medium", "high", "unknown"}
        or value["risk"] not in {"none", "present", "unknown"}
        or value["capability"] not in {"bounded", "sol-required", "ambiguous"}
    ):
        return {"executable": False, "routeReason": "assessment-unknown"}

    if value["capability"] == "ambiguous":
        route_reason = "capability-ambiguous"
    elif value["risk"] == "unknown":
        route_reason = "risk-unknown"
    elif value["consequence"] == "unknown":
        route_reason = "consequence-unknown"
    elif value["risk"] == "present":
        route_reason = "risk-present"
    elif value["consequence"] in {"medium", "high"}:
        route_reason = f"consequence-{value['consequence']}"
    elif value["capability"] == "sol-required":
        route_reason = "capability-sol-required"
    else:
        route_reason = "bounded-low-consequence"

    route_class = (
        "bounded" if route_reason == "bounded-low-consequence" else "sol-required"
    )
    effort = value.get("solReasoningEffort", "medium")
    justification = value.get("solEffortJustification")
    if not isinstance(effort, str) or effort not in {"medium", "high", "xhigh", "max"}:
        return {"executable": False, "routeReason": "input-invalid"}
    if justification is not None and (
        not isinstance(justification, str) or not justification.strip()
    ):
        return {"executable": False, "routeReason": "input-invalid"}
    if route_class == "sol-required" and effort != "medium" and justification is None:
        return {
            "executable": False,
            "routeReason": "higher-sol-effort-requires-justification",
        }
    return {
        "executable": True,
        "routeClass": route_class,
        "model": "gpt-5.6-luna" if route_class == "bounded" else "gpt-5.6-sol",
        "reasoningEffort": "max" if route_class == "bounded" else effort,
        "routeReason": route_reason,
        "solEffortJustification": (
            justification.strip()
            if route_class == "sol-required" and isinstance(justification, str)
            else None
        ),
    }


def manual_launch_contract(
    result: dict[str, object], raw: str | None,
) -> dict[str, object]:
    assessment = manual_launch_assessment(raw)
    if not assessment["executable"]:
        assessment.update(
            routeClass="none",
            model=None,
            reasoningEffort=None,
            solEffortJustification=None,
        )
    return {
        "schemaVersion": 1,
        "kind": "manual-issue-launch-route",
        **assessment,
        "issue": result["issue"],
        "repository": result["repository"],
        "branch": result["branch"],
        "worktree": result["worktree"],
        "verifiedBase": result["verifiedBase"],
        "launchOccurred": False,
    }


def add_manual_launch_contract(
    result: dict[str, object], raw: str | None,
) -> dict[str, object]:
    result["manualIssueLaunchContract"] = manual_launch_contract(result, raw)
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
        "issueRemote": result["issueRemote"],
        "publicationRemote": result["publicationRemote"],
        "publicationRepository": result["publicationRepository"],
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
    issue_remote = validated_remote_name(root, args.issue_remote, "Issue")
    publication_remote = validated_remote_name(
        root, args.publication_remote, "publication"
    )
    require_issue_remote(root, issue_remote, owner, repository)
    publication_repository = github_remote_repository(
        root, publication_remote, role="publication", include_push=True
    )
    base = verified_base(root, args.base_ref, args.base_kind, issue_remote)
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
        "issueRemote": issue_remote,
        "publicationRemote": publication_remote,
        "publicationRepository": publication_repository,
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
        return add_manual_launch_contract(result, args.manual_launch_json)

    identity_rows = [
        row for row in rows
        if Path(row.get("worktree", "")).resolve() == planned_worktree.resolve()
        or row.get("branch") == branch_ref
    ]
    local_commit = ref_commit(root, branch_ref)
    remote_refs = remote_branch_refs(root, branch)
    expected_remote = f"refs/remotes/{publication_remote}/{branch}"
    remote_commit = ref_commit(root, expected_remote)
    path_exists = planned_worktree.exists() or planned_worktree.is_symlink()

    if (
        expected_remote in remote_refs
        and not uniquely_attributed_to_remote(
            root, expected_remote, publication_remote
        )
    ):
        return blocked(result, "remote-issue-branch-collision-or-divergence")

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
        return add_manual_launch_contract(result, args.manual_launch_json)
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
    return add_manual_launch_contract(result, args.manual_launch_json)


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
    result.add_argument(
        "--issue-remote", default="origin",
        help=(
            "Git remote whose fetch repository owns the Issue and target base; "
            "defaults to origin"
        ),
    )
    result.add_argument(
        "--publication-remote", default="origin",
        help=(
            "Git remote whose repository owns the published Issue branch; "
            "defaults to origin"
        ),
    )
    result.add_argument("--isolation", choices=("default", "opt-out"), default="default")
    result.add_argument("--session-binding-json")
    result.add_argument(
        "--manual-launch-json",
        help=(
            "Versioned live-Issue assessment snapshot for the client-neutral "
            "manual model launch contract; missing or invalid input emits no route."
        ),
    )
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
