# Release Entry

Release ID: GH-6-variant-manager-qa-ready
Date: 2026-07-17
Environment: release branch candidate
Issues: GH-6
Repos: `scificorp/nungudiamonds-admin`, `scificorp/nungudiamonds-api`
Status: qa-ready

## Summary

Variant manager work has local proof and QA-local integrated API proof. The QA proof creates disposable category, tag, parent product, and child variant records, verifies parent readback includes the child variant, and verifies inactive status persistence.

## Proof Refs

- `docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-15/api-variant-model-local.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-vps-qa-variant-api-passed.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-vps-qa-admin-build.json`

## Review Refs

- `docs/nungu-dev-cycle/reviews/2026-07-15-admin-6-review-round-1.md`
- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-6-review-round-2.md`

## Rollback Reference

- `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-6-variant-manager-rollback.md`

## Deploy Notes

- Merge to release branch before main.
- Do not run variant mutation proof against production data.
- Run post-deploy smoke against one known product with variants before production handover.

## Known Gaps

- Shared QA browser proof can be expanded after stable seeded product fixtures are available.
