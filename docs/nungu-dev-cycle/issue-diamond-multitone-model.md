## Scope

Implement the atomic diamond and multi-tone metal model needed for made-to-order jewellery pricing.

## Repos

- Primary: `scificorp/nungudiamonds-api`
- Admin consumer: `scificorp/nungudiamonds-admin`
- Storefront consumer if product display changes: `scificorp/nungudiamonds-web`

## Deliverables

- Model diamond fields atomically: shape, color, clarity, cut, and carat weight.
- Preserve backward compatibility for existing diamond-group data.
- Add multi-tone metal components with per-component weight.
- Add pricing calculator service or documented calculation boundary.
- Expose API contracts needed by admin product/variant forms.

## Gates

- `npm run build`
- Migration/backfill proof for existing product data
- API smoke for create/read/update of diamond and metal component payloads
- Admin typecheck and workflow proof when UI consumes the API

## Current Proof Status

Status: `release-branch-ready-supported-slice`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/api-10-diamond-api-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/api-10-vps-qa-diamond-multitone-db.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-api-10-diamond-review-round-1.md`

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-10-diamond-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-10-diamond-rollback.md`
- Release-branch promotion gate: passed on 2026-07-17.

## Acceptance

- Existing products continue to load.
- New product payloads can store atomic diamond fields and multiple metal components.
- Pricing inputs are inspectable and explainable to staff.
- Storefront impact is documented and tested if display changes are included.
