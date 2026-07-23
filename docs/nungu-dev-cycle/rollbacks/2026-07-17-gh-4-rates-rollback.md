# Rollback Reference

Issue: GH-4 rates admin surfaces
Date: 2026-07-17

## Scope

Rollback covers the supported rates proof harness and release documentation. The proof harness does not introduce a production schema migration.

## Rollback Steps

1. Remove `scripts/proof-rates-qa-http.js` and the `proof:rates-qa` package script if reverting proof tooling.
2. Rebuild the API with `npm run build`.
3. Rebuild or typecheck admin with `npm run typecheck`.
4. Confirm currency and metal-rate admin pages still load.

## Data Recovery

No production data changes are required by this proof slice. QA proof uses disposable currency rows and updates seeded QA-local metal rates only.

## Disable Path

If rollback cannot be deployed immediately, keep dedicated FX and diamond matrix controls disabled and leave production on the previous rates behavior.
