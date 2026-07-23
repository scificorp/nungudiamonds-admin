## Scope

Prepare final handover readiness across repositories, docs, environment handling, and release proof.

## Repos

- Admin: `scificorp/nungudiamonds-admin`
- API: `scificorp/nungudiamonds-api`
- Storefront: `scificorp/nungudiamonds-web`

## Deliverables

- Confirm clean handover repository state or repair/replace damaged history where relevant.
- Update local setup instructions for admin, API, and storefront.
- Update environment variable documentation and production guardrails.
- Record final build/type/smoke/browser proof.
- Ensure no local-only login bypass or TLS bypass can ship accidentally.
- Add release notes and rollback notes for the final handover package.

## Gates

- Admin `npm run typecheck`, `npm run smoke:routes`, `npm run build`
- API `npm run build`
- Storefront Node 20 `npm run build`
- Browser proof for core public and admin flows
- Clean working tree proof for every release repo

## Current Proof Status

Status: `release-branch-ready-with-clean-tree-follow-up`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-8-handover-admin-local.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-8-handover-api-build.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-8-handover-web-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-8-vps-qa-api-health.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-8-vps-qa-admin-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-8-vps-qa-web-build.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-8-handover-review-round-1.md`

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-8-handover-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-8-handover-rollback.md`
- Release-branch promotion gate: passed on 2026-07-17.

## Acceptance

- A clean clone can install, configure, build, and run the core flows.
- Handover docs explain technical setup and staff workflows.
- Final release evidence is linked in this issue.
- Known limitations are explicit and client-facing where needed.
