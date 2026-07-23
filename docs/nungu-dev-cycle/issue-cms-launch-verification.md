## Scope

Close out the recent CMS/static/blog work with production-grade verification across migrations, admin editing, API publishing, and storefront rendering.

## Repos

- API: `scificorp/nungudiamonds-api`
- Admin: `scificorp/nungudiamonds-admin`
- Storefront: `scificorp/nungudiamonds-web`

## Deliverables

- Confirm blog CMS migrations run in deploy and are idempotent.
- Confirm existing blogs have default CMS fields after backfill.
- Verify static page enrichment editor saves sections through API.
- Verify admin-authored content renders correctly on storefront.
- Verify bespoke lead/story controls and related admin flows.
- Record production or QA content examples used for proof.

## Gates

- API `npm run build`
- Admin `npm run typecheck`
- Storefront Node 20 `npm run build`
- API migration/backfill receipt
- Browser proof for admin edit and storefront render

## Current Proof Status

Status: `release-branch-ready`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/web-11-cms-api-build.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/web-11-cms-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/web-11-cms-web-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/web-11-vps-qa-cms-api.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-web-11-cms-review-round-1.md`

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-web-11-cms-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-web-11-cms-rollback.md`
- Release-branch promotion gate: passed on 2026-07-17.

## Acceptance

- Content edited in admin appears on the correct public surface.
- Existing content is not lost or blanked by migrations.
- External-link and internal-story blog behavior remains correct.
- Deploy notes include migration order and rollback strategy.
