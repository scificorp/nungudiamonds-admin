## Scope

Provision a proper Nungu QA environment so feature work that performs writes can be verified without touching the production database or production services.

## Repos

- Primary: `scificorp/nungudiamonds-api`
- Related: `scificorp/nungudiamonds-admin`
- Related: `scificorp/nungudiamonds-web`

## Problem

Nungu currently has local proof and production infrastructure, but no safe integrated QA environment for write-path testing. Product variants, bookings, rates, payment/sandbox wiring, CMS edits, and operations workflows must not be tested against production data before they have passed QA.

## Deliverables

- Create or identify a non-production database for QA.
- Define the QA API environment file shape without secrets in git.
- Add a VPS-local QA database start/stop/reset script.
- Define deploy/config path for QA API.
- Define deploy/config path for QA admin.
- Define deploy/config path for QA storefront when public page proof is needed.
- Seed or sanitize enough data for product, category, tag, rates, bookings, and CMS smoke tests.
- Add a QA smoke checklist for read and write paths.
- Add rollback/reset guidance for QA test data.
- Document which production integrations must be disabled or sandboxed in QA, including email, payment, S3/media writes, and customer notifications.

## Gates

- No feature issue that performs writes may move to QA proof using the production database.
- QA database connection proof exists and is linked.
- VPS-local QA database runs on `127.0.0.1:55433` or a documented replacement.
- QA API health/smoke proof exists and is linked.
- QA admin browser proof exists for at least one authenticated write-path smoke.
- QA reset/rollback path is documented.
- Secrets are stored outside git and not copied into proof receipts.

## Acceptance

- Admin #6 can run variant add/edit/status proof against QA without production writes.
- API write endpoints can be smoke-tested against QA data.
- Storefront and admin can point to QA API without code changes.
- QA proof receipts can be attached to GitHub issues before production promotion.
- Production deploy gate refuses promotion when QA proof is missing.

## Stop Conditions

- Do not point QA clients at the production database.
- Do not send live customer email/SMS/payment actions from QA.
- Do not use unsanitized production customer data in proof artifacts.
- Do not promote write-path features to production without a QA proof receipt.

## VPS-Local QA Plan

Primary path: native PostgreSQL on the VPS.

API repo additions:

- `environment/env.qa-local.example`
- ignored runtime file: `environment/env.qa-local`
- `scripts/qa-local-db.sh`
- `npm run db:qa-local:start`
- `npm run db:qa-local:stop`
- `npm run db:qa-local:reset`
- `npm run db:qa-local:bootstrap`
- `npm run dev:qa-local`

Current QA-local status:

Status: `release-branch-ready`

Passing proof ref:

- `docs/nungu-dev-cycle/proof/qa/2026-07-16/api-qa-local-vps-provisioned.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/api-12-qa-environment-api-build.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/api-12-qa-environment-admin-typecheck.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-api-12-qa-environment-review-round-1.md`

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-12-qa-environment-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-12-qa-environment-rollback.md`
- Release-branch promotion gate: `passed`.

The VPS task provisioned QA-local successfully:

- DB started on `127.0.0.1:55433`.
- Database identity check returned `nungu_diamond_qa|127.0.0.1/32|55433`.
- Bootstrap completed and rerun skipped all 16 registered migrations idempotently.
- API started with `NODE_ENV=qa-local` on port `2512`.
- `GET http://127.0.0.1:2512/api/v2/hero-content/config` returned HTTP `200`.
- Mail sending is suppressed.
- No production DB or production credentials were used.

Durable commands:

```bash
npm run db:qa-local:start
npm run db:qa-local:serve
npm run db:qa-local:bootstrap
npm run dev:qa-local
npm run db:qa-local:stop
```

Superseded blocker:

```bash
npm run db:qa-local:start
```

Result: previously failed because `initdb` was not installed on this VPS. This is now resolved by extracting PostgreSQL 18.4 under `/home/workbench/repos/nungu/.local/pgsql18`; `scripts/qa-local-db.sh` auto-detects that local toolchain.

Proof ref:

- `docs/nungu-dev-cycle/proof/local/2026-07-16/api-qa-local-provisioning-blocked.json`

Optional native install path for a future clean VPS image:

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-client
```

After installation, rerun:

```bash
npm run db:qa-local:start
npm run db:qa-local:bootstrap
npm run dev:qa-local
```

## Initial Proof Required

- `local_tests`
- `build`
- `api_smoke`
- `runtime_browser`
- `qa_proof`
- `rollback_or_recovery`
