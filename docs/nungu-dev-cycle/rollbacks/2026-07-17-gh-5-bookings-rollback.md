# Rollback Reference

Issue: GH-5 bookings workflow
Date: 2026-07-17

## Scope

Rollback covers the API booking hardening and proof harness added for GH-5. No database migration is required by this slice.

## Rollback Steps

1. Revert the API changes in `src/version-2/services/frontend/enquiries.service.ts`.
2. Remove the proof-only script `scripts/proof-bookings-qa-http.js` and the `proof:bookings-qa` package script if rolling back repository tooling as well.
3. Rebuild the API with `npm run build`.
4. Rebuild or typecheck admin with `npm run typecheck` if release packaging includes admin docs/tooling changes.
5. Confirm public booking creation and admin enquiry listing behavior on the target environment after rollback.

## Data Recovery

No schema or migration changes were introduced. Existing enquiry rows do not require rollback. If a failed deploy created test bookings, remove only those known test rows from the affected non-production environment.

## Disable Path

If rollback cannot be deployed immediately, disable promotion of the affected release candidate and keep production on the previous API build.
