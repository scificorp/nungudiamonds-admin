# Rollback Reference

Issue: GH-6 variant manager UI and product variant workflow
Date: 2026-07-17

## Scope

Rollback covers the admin variant manager changes, API product variant handling changes, and proof harness updates for GH-6. No production data migration is required by this slice.

## Rollback Steps

1. Revert the GH-6 admin component changes in `VariantManagement.tsx` and `EnhancedVariantManagement.tsx`.
2. Revert the GH-6 API product service changes if included in the release candidate.
3. Remove proof-only scripts and package scripts only if reverting repository tooling as well.
4. Rebuild admin with `npm run typecheck` and the API with `npm run build`.
5. Confirm existing products still load and variant products are not mutated by rollback verification.

## Data Recovery

No schema rollback is required. QA proof created disposable records only in `nungu_diamond_qa`.

## Disable Path

If rollback cannot be deployed immediately, keep variant manager UI access disabled from the release branch and leave production on the previous build.
