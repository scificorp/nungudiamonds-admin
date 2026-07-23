## Scope

Run deeper workflow and CRUD verification beyond route-load stability for operational admin surfaces.

## Repos

- Primary: `scificorp/nungudiamonds-admin`
- API support: `scificorp/nungudiamonds-api`

## Deliverables

- Orders: list filters, detail state, status updates, invoices.
- Enquiries: lead status, notes, handled metadata, contact actions.
- Settings/attributes: safe create/edit/delete checks on non-production data.
- Roles/users: verify access behavior and copy against real auth behavior.
- Document which destructive flows were skipped and why.

## Gates

- Admin `npm run typecheck`
- Admin `npm run smoke:routes`
- Admin `npm run smoke:operations`
- API `npm run build` if endpoints change
- Browser/manual proof for each sampled workflow
- Safe-data approval before destructive mutation tests

## Current Proof Status

Status: `release-branch-ready`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-16/admin-operations-crud-local.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-16-admin-7-review-round-1.md`
- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-7-review-round-2.md`

Gate result:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-7 \
  --stage local \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-16/admin-operations-crud-local.json
```

Result: `passed`.

The operations audit checked orders, giftset orders, general enquiries, product enquiries, settings, attributes, roles, and admin-user management. Destructive create/edit/delete/status mutation proof was skipped for settings and attributes because it requires non-production QA data.

QA-local destructive/safe-data workflow proof is complete:

- QA environment proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/api-qa-local-vps-provisioned.json`
- QA API workflow proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-7-vps-qa-operations-api.json`
- QA admin build proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-7-vps-qa-admin-build.json`
- API base URL: `http://127.0.0.1:2512`
- DB: `nungu_diamond_qa` on `127.0.0.1:55433`

Result: `passed`.

The QA API workflow proof used disposable records in `nungu_diamond_qa` and verified:

- General enquiry lead status and follow-up notes persisted through `POST /enquiries/general/update`.
- Product enquiry action and admin comments persisted through `POST /enquiries/product/update`.
- Currency create, edit, inactive status, and soft delete persisted through `/currency/*`.
- Tax create, edit, inactive status, and soft delete persisted through `/tax/*`.
- Clarity create, edit, inactive status, and soft delete persisted through `/attribute/clarity/*`.

No production database or production credentials were used.

QA promotion gate:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-7 \
  --stage qa \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-16/admin-operations-crud-local.json \
  --qa-proof-ref docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-7-vps-qa-operations-api.json \
  --qa-proof-ref docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-7-vps-qa-admin-build.json \
  --review-ref docs/nungu-dev-cycle/reviews/2026-07-16-admin-7-review-round-1.md
```

Result: `passed`.

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-7-operations-crud-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-7-operations-crud-rollback.md`
- Release-branch promotion gate: `passed`.

## Acceptance

- Route-load stability is backed by workflow-level proof.
- Empty/error/loading states are truthful.
- Dangerous actions have confirmation or are documented as needing one.
- The issue records skipped tests and required safe test data.
