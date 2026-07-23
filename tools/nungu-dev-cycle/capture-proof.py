#!/usr/bin/env python3
"""Capture command and artifact proof for a Nungu issue.

This tool is local-safe: it runs only the commands supplied by the caller,
writes a JSON receipt, and does not push, deploy, or contact external services.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]


def run(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, cwd=str(cwd), text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def run_shell(command: str, cwd: Path, timeout: int) -> dict[str, Any]:
    started = dt.datetime.now(dt.UTC)
    try:
        proc = subprocess.run(
            command,
            cwd=str(cwd),
            shell=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=timeout,
        )
        output = proc.stdout or ""
        return {
            "command": command,
            "returncode": proc.returncode,
            "duration_seconds": round((dt.datetime.now(dt.UTC) - started).total_seconds(), 3),
            "output_tail": output[-8000:],
        }
    except subprocess.TimeoutExpired as exc:
        output = exc.stdout if isinstance(exc.stdout, str) else ""
        return {
            "command": command,
            "returncode": 124,
            "duration_seconds": timeout,
            "output_tail": output[-8000:],
            "timed_out": True,
        }


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git_value(repo: Path, args: list[str]) -> str:
    proc = run(["git", *args], repo)
    if proc.returncode != 0:
        return ""
    return proc.stdout.strip()


def resolve_path(value: str, base: Path) -> Path:
    path = Path(value).expanduser()
    if path.is_absolute():
        return path.resolve()
    return (base / path).resolve()


def portable_path(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return str(path)


def artifact_record(value: str, repo: Path) -> dict[str, Any]:
    path = resolve_path(value, repo)
    record: dict[str, Any] = {"path": portable_path(path), "exists": path.exists()}
    if path.is_file():
        record["size_bytes"] = path.stat().st_size
        record["sha256"] = sha256_file(path)
    return record


def main() -> int:
    parser = argparse.ArgumentParser(description="Capture local proof receipt for a Nungu issue")
    parser.add_argument("--issue", required=True, help="Issue ref, e.g. GH-6 or admin#6")
    parser.add_argument("--repo", required=True, help="Repo path. Relative paths resolve from this admin checkout.")
    parser.add_argument("--component", required=True, help="admin, api, web, data, payment, handover, etc.")
    parser.add_argument("--stage", required=True, choices=["local", "qa", "prod", "handover"])
    parser.add_argument("--command", action="append", default=[], help="Command to run in --repo. Can be repeated.")
    parser.add_argument("--artifact", action="append", default=[], help="Artifact path to hash. Can be repeated.")
    parser.add_argument("--blocker", action="append", default=[], help="Known blocker to record without failing the receipt.")
    parser.add_argument("--timeout", type=int, default=900)
    parser.add_argument("--allow-dirty", action="store_true")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    repo = resolve_path(args.repo, ROOT)
    if not repo.exists() or not (repo / ".git").exists():
        print(f"FAIL not a git repo: {repo}", file=sys.stderr)
        return 2

    branch = git_value(repo, ["branch", "--show-current"])
    commit = git_value(repo, ["rev-parse", "HEAD"])
    status = git_value(repo, ["status", "--porcelain"])
    dirty = bool(status.strip())

    checks: list[dict[str, Any]] = [
        {"name": "repo_exists", "passed": True, "detail": portable_path(repo)},
        {"name": "worktree_clean", "passed": not dirty or args.allow_dirty, "detail": "dirty" if dirty else "clean"},
    ]

    command_results: list[dict[str, Any]] = []
    for command in args.command:
        result = run_shell(command, repo, args.timeout)
        command_results.append(result)
        checks.append({"name": f"command:{command}", "passed": result["returncode"] == 0, "detail": command})

    artifacts = [artifact_record(path, repo) for path in args.artifact]
    for artifact in artifacts:
        checks.append({"name": f"artifact:{artifact['path']}", "passed": bool(artifact.get("exists")), "detail": artifact["path"]})

    passed = all(item["passed"] for item in checks)
    receipt = {
        "schema_version": 1,
        "tool": "tools/nungu-dev-cycle/capture-proof.py",
        "generated_at": dt.datetime.now(dt.UTC).isoformat(),
        "issue": args.issue,
        "stage": args.stage,
        "component": args.component,
        "repo": {
            "name": repo.name,
            "path": portable_path(repo),
            "branch": branch,
            "commit": commit,
            "dirty": dirty,
        },
        "checks": checks,
        "commands": command_results,
        "artifacts": artifacts,
        "blockers": args.blocker,
        "verdict": "passed" if passed and not args.blocker else "blocked" if args.blocker else "failed",
    }

    output = resolve_path(args.output, ROOT)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Wrote proof receipt: {portable_path(output)}")
    print(f"Verdict: {receipt['verdict']}")
    return 0 if receipt["verdict"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
