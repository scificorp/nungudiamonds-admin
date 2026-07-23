# Release Entry

Release ID: GH-4-rates-supported-slice-qa-ready
Date: 2026-07-17
Environment: release branch candidate
Issues: GH-4
Repos: `scificorp/nungudiamonds-admin`, `scificorp/nungudiamonds-api`
Status: qa-ready

## Summary

Supported rates behavior has local proof and QA-local integrated proof. Currency rate CRUD/default/status and metal rate updates for gold, silver, and platinum persist through API calls against `nungu_diamond_qa`. Unsupported FX and diamond matrix admin controls remain read-only/disabled until dedicated backend endpoints exist.

## Proof Refs

- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-4-rates-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-4-rates-api-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-4-vps-qa-rates-api.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-4-vps-qa-admin-build.json`

## Review Refs

- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-4-rates-review-round-1.md`

## Rollback Reference

- `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-4-rates-rollback.md`

## Deploy Notes

- Merge to release branch before main.
- Do not enable dedicated FX or diamond matrix controls in production from this slice.
- Run post-deploy smoke on settings currency and metal-rate pages before production handover.

## Known Gaps

- Dedicated FX route contract remains pending.
- Dedicated diamond quality matrix route contract remains pending.
