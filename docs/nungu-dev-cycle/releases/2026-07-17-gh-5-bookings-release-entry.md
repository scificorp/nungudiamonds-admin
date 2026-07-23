# Release Entry

Release ID: GH-5-bookings-qa-ready
Date: 2026-07-17
Environment: release branch candidate
Issues: GH-5
Repos: `scificorp/nungudiamonds-admin`, `scificorp/nungudiamonds-api`
Status: qa-ready

## Summary

Public booking creation and admin follow-up handling have QA proof against the VPS-local QA database. The API now tolerates guest bookings without an admin session and formats appointment dates safely when Sequelize returns Date values.

## Proof Refs

- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-5-bookings-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-5-bookings-api-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-5-vps-qa-bookings-api.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-5-vps-qa-admin-build.json`

## Review Refs

- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-5-review-round-1.md`
- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-5-review-round-2.md`

## Rollback Reference

- `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-5-bookings-rollback.md`

## Deploy Notes

- Merge to release branch before main.
- Do not enable external calendar sync; no calendar provider integration is included.
- Keep QA/prod mail configuration separate. QA proof used `MAIL_SUPPRESS_SEND=true`.
- Run a post-deploy public booking smoke and admin enquiry list smoke before production handover.

## Known Gaps

- Outlook/Google calendar sync remains blocked pending safe credentials and tenant approval.
