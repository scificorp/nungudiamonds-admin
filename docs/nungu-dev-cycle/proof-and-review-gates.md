# Nungu Proof And Review Gates

Date: 2026-07-15

Nungu changes are not promotable on implementation alone. Every feature issue must carry proof, review, and release evidence appropriate to the risk of the change.

## Status Model

- `Intake`: GitHub issue exists and the scope is understood.
- `Ready`: acceptance criteria, proof requirements, and approval boundary are explicit.
- `In progress`: implementation is active and tied to the issue.
- `Local proof`: local command/browser/API evidence exists for the changed repo.
- `Ready for review`: local proof exists and the author has listed changed files, risk areas, and known gaps.
- `QA proof`: integrated environment proof exists for the same feature/commit.
- `Release ready`: review, QA proof, release notes, and rollback notes exist.
- `Closed`: production or handover evidence is linked, or the issue is explicitly closed as parked/out of scope.

## Required Proof By Work Type

| Work type | Local proof | QA proof | Production/handover proof |
| --- | --- | --- | --- |
| Admin UI | `npm run typecheck`, targeted lint, `npm run build`, route/browser proof when page behavior changes | Browser proof against QA/staging or documented blocker | Release note and post-deploy smoke |
| Admin mutation flow | Admin UI proof plus API mutation proof against safe data | Browser proof showing save/edit outcome | Rollback or disable path |
| API/service | `npm run build`, focused endpoint/service smoke, contract notes | API smoke against QA/staging | Post-deploy API smoke and rollback notes |
| Storefront | build, route/page browser proof | Browser proof for public pages | Public route smoke and cache/deploy notes |
| Pricing/rates/payment | Build plus sandbox or dry-run proof only | QA sandbox proof and reviewer signoff | Explicit approval, rollback notes, no live payment mutation without approval |
| Data model/migration | Static migration review, dry-run/backfill plan, rollback plan | QA migration rehearsal or documented blocker | Migration receipt, rollback reference, post-migration checks |
| Handover/tooling | Lint/build where relevant and documentation proof | Reviewer confirms operator can follow it | Handover receipt |

## Review Rules

- Low-risk UI/documentation work requires one passing review.
- Product mutation, pricing, bookings, payments, migrations, deploy, and handover work require two passing reviews.
- A review must include changed files, behavioral risk, missing proof, rollback concerns, and follow-up issues.
- An issue cannot move to `Closed` while any review finding is unresolved or marked as a release blocker.

## QA Environment Rule

- Write-path QA proof must run against a non-production database.
- Production may be read for investigation only when approved, but it must not be used for feature mutation proof.
- If only production infrastructure exists, write-path issues remain at `Local proof` or `Ready for review`; they cannot move to `QA proof`, `Release ready`, or `Closed`.
- QA proof receipts must name the environment, database class, API base URL, and reset/rollback path without exposing secrets.
- The current QA environment blocker is tracked in `https://github.com/scificorp/nungudiamonds-api/issues/12`.
- VPS QA-local proof is available at `docs/nungu-dev-cycle/proof/qa/2026-07-16/api-qa-local-vps-provisioned.json`.

## Promotion Gate

Use `tools/nungu-dev-cycle/check-promotion-gate.py` before moving issue state:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-6 \
  --stage local \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json
```

Stages:

- `local`: requires at least one local proof receipt.
- `qa`: requires local proof plus at least one review ref.
- `prod`: requires local proof, QA proof, review ref, release entry, and rollback ref.

If a QA proof ref is supplied for the `qa` stage, it must pass. A blocked QA receipt blocks QA proof promotion.

The tool is intentionally read-only. It checks evidence references and exits non-zero when promotion requirements are missing.

## Proof Capture

Use `tools/nungu-dev-cycle/capture-proof.py` to write JSON proof receipts:

```bash
python3 tools/nungu-dev-cycle/capture-proof.py \
  --issue GH-6 \
  --repo . \
  --component admin \
  --stage local \
  --command "npm run typecheck" \
  --command "npm exec eslint src/components/product/VariantManagement.tsx" \
  --command "npm run build" \
  --artifact .next/BUILD_ID \
  --output docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json
```

For API proof, run the same command from this admin repository and point `--repo` at the API checkout:

```bash
python3 tools/nungu-dev-cycle/capture-proof.py \
  --issue GH-6 \
  --repo ../tcctechapi-nungudiamonds-release \
  --component api \
  --stage local \
  --command "npm run build" \
  --output docs/nungu-dev-cycle/proof/local/2026-07-15/api-variant-model-local.json
```

Do not put secrets, customer data dumps, tokens, or production payloads in proof receipts. Use command tails, hashes, issue refs, and blocker notes instead.

## Current Admin #6 State

Admin issue #6 has passing local proof:

- Admin typecheck passed in `docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json`.
- Targeted ESLint for `src/components/product/VariantManagement.tsx` passed.
- Admin build artifact hash was captured from `.next/build-manifest.json`.
- API build passed in `docs/nungu-dev-cycle/proof/local/2026-07-15/api-variant-model-local.json`.
- API service-boundary mutation proof passed via `npm run proof:variant-service`.
- Local promotion gate passed with both proof refs.

It is not promotable to QA or production yet. QA promotion still requires integrated browser/API proof against a safe non-production API/database environment.
