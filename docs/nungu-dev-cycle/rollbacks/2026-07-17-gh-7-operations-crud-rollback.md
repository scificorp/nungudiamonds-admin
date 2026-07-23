# Rollback Reference

Issue: GH-7 operations workflow CRUD gates
Date: 2026-07-17

## Scope

Rollback covers the operations proof harness and admin workflow documentation. No production schema migration is required by this slice.

## Rollback Steps

1. Revert GH-7 admin proof tooling and issue documentation if removing this release candidate.
2. Remove `proof:admin-operations-qa` only if reverting repository tooling.
3. Rebuild admin with `npm run typecheck` and the API with `npm run build`.
4. Confirm enquiry, currency, tax, and clarity pages still load after rollback.

## Data Recovery

No schema rollback is required. QA proof used disposable records in `nungu_diamond_qa`.

## Disable Path

If rollback cannot be deployed immediately, keep release branch promotion blocked and leave production on the previous build.
