## Scope

Build the API foundation for pricing and rates so admin rates work can move beyond read-only copy.

## Repos

- Primary: `scificorp/nungudiamonds-api`
- Consumers: `scificorp/nungudiamonds-admin`, `scificorp/nungudiamonds-web`

## Deliverables

- Define persisted pricing configuration records for FX rate, thresholds, cadence, and audit metadata.
- Add read/write endpoints for supported rates.
- Add audit logging for rate changes.
- Add compatibility behavior for existing products and rates data.
- Document which pricing fields affect storefront product display today.

## Gates

- `npm run build`
- API route smoke for new read/write endpoints
- Migration/backfill proof if schema changes are required
- Admin consumer proof once UI wiring starts

## Current Proof Status

Status: `release-branch-ready-supported-slice`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/api-11-pricing-api-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/api-11-vps-qa-pricing-rates-api.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-api-11-pricing-review-round-1.md`

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-11-pricing-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-11-pricing-rollback.md`
- Release-branch promotion gate: passed on 2026-07-17.

## Acceptance

- API exposes stable contracts for rate reads and writes.
- Rate changes can be audited.
- Existing product pages do not regress when pricing config is absent or partially populated.
- Deploy notes include migration order and rollback notes.
