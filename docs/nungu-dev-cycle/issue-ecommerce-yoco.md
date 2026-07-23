## Scope

Complete e-commerce eligibility and Yoco verification so product purchase behavior is explicit and testable.

## Repos

- API: `scificorp/nungudiamonds-api`
- Admin: `scificorp/nungudiamonds-admin`
- Storefront: `scificorp/nungudiamonds-web`

## Deliverables

- Define/persist product eligibility flags: purchasable online, price on request, consult to purchase.
- Add price threshold logic if the client confirms the rule.
- Wire admin controls only after API persistence exists.
- Verify storefront product CTA behavior against the persisted flags.
- Verify Yoco checkout path and document required environment variables.

## Gates

- API `npm run build`
- Admin `npm run typecheck`
- Storefront Node 20 `npm run build`
- Browser proof for product detail CTAs
- Payment sandbox proof or documented blocker if credentials are unavailable

## Current Proof Status

Status: `release-branch-ready-safety-slice`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/web-12-ecommerce-api-build.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/web-12-ecommerce-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/web-12-ecommerce-web-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/web-12-vps-qa-ecommerce-yoco-safety.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-web-12-ecommerce-review-round-1.md`

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-web-12-ecommerce-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-web-12-ecommerce-rollback.md`
- Release-branch promotion gate: passed on 2026-07-17.

## Acceptance

- Staff can tell why a product is buyable, enquiry-only, or consult-to-purchase.
- Storefront CTA behavior matches admin state.
- Yoco checkout has sandbox proof or a clearly documented credential blocker.
- No payment-provider placeholder is presented as active.
