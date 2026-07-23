#!/usr/bin/env python3
"""Check whether a Nungu issue has the evidence required for promotion."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]


def resolve_path(value: str) -> Path:
    path = Path(value).expanduser()
    if path.is_absolute():
        return path.resolve()
    return (ROOT / path).resolve()


def load_receipt(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return {"_load_error": str(exc)}
    return payload if isinstance(payload, dict) else {"_load_error": "receipt is not a JSON object"}


def ref_status(refs: list[str], expected_stage: str | None = None) -> list[dict[str, Any]]:
    statuses: list[dict[str, Any]] = []
    for ref in refs:
        path = resolve_path(ref)
        item: dict[str, Any] = {"ref": ref, "exists": path.exists()}
        if path.exists() and path.suffix == ".json":
            receipt = load_receipt(path)
            item["verdict"] = receipt.get("verdict")
            item["stage"] = receipt.get("stage")
            item["issue"] = receipt.get("issue")
            item["load_error"] = receipt.get("_load_error")
            item["passed"] = receipt.get("verdict") == "passed" and (expected_stage is None or receipt.get("stage") == expected_stage)
        else:
            item["passed"] = path.exists()
        statuses.append(item)
    return statuses


def all_pass(items: list[dict[str, Any]]) -> bool:
    return bool(items) and all(bool(item.get("passed")) for item in items)


def main() -> int:
    parser = argparse.ArgumentParser(description="Check Nungu promotion evidence")
    parser.add_argument("--issue", required=True)
    parser.add_argument("--stage", required=True, choices=["local", "qa", "prod"])
    parser.add_argument("--proof-ref", action="append", default=[], help="Local proof receipt ref. Can be repeated.")
    parser.add_argument("--qa-proof-ref", action="append", default=[], help="QA proof receipt ref. Can be repeated.")
    parser.add_argument("--review-ref", action="append", default=[], help="Review note or receipt. Can be repeated.")
    parser.add_argument("--release-entry", default="")
    parser.add_argument("--rollback-ref", default="")
    args = parser.parse_args()

    local_status = ref_status(args.proof_ref, "local")
    qa_status = ref_status(args.qa_proof_ref, "qa")
    review_status = ref_status(args.review_ref)
    release_entry = resolve_path(args.release_entry) if args.release_entry else None
    rollback_ref = resolve_path(args.rollback_ref) if args.rollback_ref else None

    errors: list[str] = []
    if not local_status:
        errors.append("local stage requires at least one local proof receipt")
    elif not all_pass(local_status):
        errors.append("all supplied local proof receipts must pass before promotion")
    if args.stage in {"qa", "prod"} and not all_pass(review_status):
        errors.append("qa/prod stage requires at least one existing review ref")
    if args.stage == "qa" and qa_status and not all_pass(qa_status):
        errors.append("all supplied QA proof receipts must pass before QA proof promotion")
    if args.stage == "prod":
        if not all_pass(qa_status):
            errors.append("prod stage requires at least one passing QA proof receipt")
        if release_entry is None or not release_entry.exists():
            errors.append("prod stage requires an existing release entry")
        if rollback_ref is None or not rollback_ref.exists():
            errors.append("prod stage requires an existing rollback ref")

    payload = {
        "schema_version": 1,
        "tool": "tools/nungu-dev-cycle/check-promotion-gate.py",
        "issue": args.issue,
        "stage": args.stage,
        "local_proof": local_status,
        "qa_proof": qa_status,
        "review_refs": review_status,
        "release_entry": str(release_entry) if release_entry else "",
        "rollback_ref": str(rollback_ref) if rollback_ref else "",
        "errors": errors,
        "verdict": "passed" if not errors else "failed",
    }
    print(json.dumps(payload, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
