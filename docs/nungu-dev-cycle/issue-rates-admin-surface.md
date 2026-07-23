## Scope

Turn rates pages from truthful read-only placeholders into controlled admin surfaces where supported. This includes FX rate, diamond rates, metal rates, rate configuration, and change history UX.

## Repos

- Primary: `scificorp/nungudiamonds-admin`
- Depends on API endpoints from `scificorp/nungudiamonds-api`

## Deliverables

- Split unsupported placeholders from real editable fields.
- FX rate management UI with validation and large-change confirmation.
- Diamond quality matrix UI once API support exists.
- Metal rate enhancement UI using existing settings/metal-rate behavior where possible.
- Rate configuration UI for update cadence and pricing thresholds.
- Read-only audit/history table if write endpoints exist; otherwise document the API gap.

## Gates

- `npm run typecheck`
- Targeted ESLint on edited admin files
- `npm run smoke:routes`
- Browser proof for all rates routes
- API contract proof for every save/load route used by the UI

## Current Proof Status

Status: `release-branch-ready-supported-slice`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-4-rates-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-4-rates-api-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-4-vps-qa-rates-api.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-4-vps-qa-admin-build.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-4-rates-review-round-1.md`

QA-local integrated proof is complete for the supported rates slice:

- API base URL: `http://127.0.0.1:2512`
- DB: `nungu_diamond_qa` on `127.0.0.1:55433`
- Currency add, edit, default selection, and inactive status persisted.
- Gold, silver, and platinum metal rate updates persisted through `/rate/*/edit`.
- Metal master dropdown returned the updated rates.
- No production database or production credentials were used.

Unsupported surfaces:

- Dedicated FX route contracts remain pending; the admin FX page is intentionally read-only/disabled.
- Dedicated diamond quality matrix route contracts remain pending; the admin diamond rates page is intentionally read-only/disabled.

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-4-rates-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-4-rates-rollback.md`
- Release-branch promotion gate: `passed`.

## Acceptance

- No rates page claims a calculation or approval workflow that is not wired.
- Editable rates persist through the API and reload correctly.
- High-risk rate changes require confirmation.
- The issue links API blockers or follow-up issues for anything not implemented.
