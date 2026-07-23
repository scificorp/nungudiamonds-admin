# Release Entry

Release ID: GH-12-qa-environment-qa-ready
Date: 2026-07-17
Environment: release branch candidate
Issues: GH-12
Repos: `scificorp/nungudiamonds-api`, `scificorp/nungudiamonds-admin`
Status: qa-ready

## Summary

VPS-local QA infrastructure is provisioned and documented. The QA DB runs on `127.0.0.1:55433`, API runs on port `2512`, bootstrap is idempotent, mail sending is suppressed, and proof confirms production credentials were not used.

## Proof Refs

- `docs/nungu-dev-cycle/proof/local/2026-07-17/api-12-qa-environment-api-build.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/api-12-qa-environment-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-16/api-qa-local-vps-provisioned.json`

## Review Refs

- `docs/nungu-dev-cycle/reviews/2026-07-17-api-12-qa-environment-review-round-1.md`

## Rollback Reference

- `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-12-qa-environment-rollback.md`

## Deploy Notes

- Merge QA-local tooling to release branch before main.
- Keep runtime `environment/env.qa-local` untracked.
- Do not copy production DB credentials into QA-local.
- Use `npm run db:qa-local:stop` to stop the local DB when needed.

## Known Gaps

- QA-local is a VPS-local integrated environment, not a shared hosted QA deployment.
