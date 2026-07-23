# Release Entry

Release ID: GH-7-operations-crud-qa-ready
Date: 2026-07-17
Environment: release branch candidate
Issues: GH-7
Repos: `scificorp/nungudiamonds-admin`, `scificorp/nungudiamonds-api`
Status: qa-ready

## Summary

Operations workflow checks have local proof and QA-local integrated proof for enquiry follow-up, product enquiry action/comments, currency CRUD/status/delete, tax CRUD/status/delete, and clarity CRUD/status/delete.

## Proof Refs

- `docs/nungu-dev-cycle/proof/local/2026-07-16/admin-operations-crud-local.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-7-vps-qa-operations-api.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-7-vps-qa-admin-build.json`

## Review Refs

- `docs/nungu-dev-cycle/reviews/2026-07-16-admin-7-review-round-1.md`
- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-7-review-round-2.md`

## Rollback Reference

- `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-7-operations-crud-rollback.md`

## Deploy Notes

- Merge to release branch before main.
- Keep destructive mutation proof isolated to QA-local.
- Run post-deploy smoke on enquiry list/detail and settings list pages before production handover.

## Known Gaps

- Roles/users and order status proof remain follow-up slices once safe fixtures are available.
