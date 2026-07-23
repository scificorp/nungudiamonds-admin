## Scope

Build the admin variant manager UI as the next product-management feature slice. The first usable version should let staff see and maintain variants for a product without dropping into the legacy product workspace.

## Repos

- Primary: `scificorp/nungudiamonds-admin`
- Depends on current product/variant API behavior in `scificorp/nungudiamonds-api`
- QA environment dependency: `https://github.com/scificorp/nungudiamonds-api/issues/12`

## Deliverables

- Audit existing `VariantManagement.tsx` and `EnhancedVariantManagement.tsx`.
- Decide whether the first integration point is Quick Add, legacy edit, product details, or All Products.
- Implement a usable variant list and add/edit workflow.
- Validate metal, tone, carat, and weight fields before save.
- Show truthful empty/error/loading states when variants are unavailable.
- Document any API gaps found while wiring.

## Gates

- `npm run typecheck`
- Targeted ESLint on edited admin files
- Route smoke if navigation or product routes change: `npm run smoke:routes`
- Browser/manual proof: open product with variants, add/edit a safe variant, confirm persisted response or documented API block
- QA proof must use a non-production database from `https://github.com/scificorp/nungudiamonds-api/issues/12`

## Current Proof Status

Status: `release-branch-ready`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-15/api-variant-model-local.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-15-admin-6-review-round-1.md`
- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-6-review-round-2.md`

Gate result:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-6 \
  --stage local \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-15/api-variant-model-local.json
```

Result: `passed`.

The API receipt includes service-boundary mutation proof for child variant creation, parent promotion, variant field persistence, category linkage, and transaction commit.

QA-local integrated proof is complete:

- QA environment proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/api-qa-local-vps-provisioned.json`
- QA API workflow proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-vps-qa-variant-api-passed.json`
- QA admin build proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-vps-qa-admin-build.json`
- API base URL: `http://127.0.0.1:2512`
- DB: `nungu_diamond_qa` on `127.0.0.1:55433`

Result: `passed`.

The API workflow proof created disposable QA category/tag/product fixture data, created a parent product through `POST /product-basic-details`, created a child variant through the same endpoint, confirmed `GET /product/:id` returned the child variant under the parent, toggled the child inactive through `POST /active-inactive-product`, and verified persisted parent/child state directly in `nungu_diamond_qa`.

QA promotion gate:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-6 \
  --stage qa \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-15/api-variant-model-local.json \
  --qa-proof-ref docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-vps-qa-variant-api-passed.json \
  --qa-proof-ref docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-vps-qa-admin-build.json \
  --review-ref docs/nungu-dev-cycle/reviews/2026-07-15-admin-6-review-round-1.md
```

Result: `passed`.

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-6-variant-manager-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-6-variant-manager-rollback.md`
- Release-branch promotion gate: `passed`.

Superseded QA proof handoff:

- `docs/nungu-dev-cycle/handoffs/2026-07-16-macbook-admin-6-qa-proof.md`

Superseded VPS-side QA proof attempt:

- `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-qa-proof-handoff-blocked-vps.json`

Result: superseded. QA-local now runs on this VPS and API reachability proof passes.

## Acceptance

- Staff can understand whether a product has variants.
- Staff can add or edit variant metadata without misleading UI.
- Failed saves show actionable recovery text.
- Any unsupported API behavior is documented in the issue before closure.
