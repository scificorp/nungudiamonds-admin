# Nungu Dev Cycle And Gate Pipeline

Date: 2026-07-15

This folder scopes the remaining Nungu requirements into GitHub-sized feature issues and applies a PRASA-style gate model: every feature has a named scope, owning repository, proof requirements, review requirements, and exit gates before it can move to QA, production, or handover.

The promotion policy is documented in `proof-and-review-gates.md`. The local tools live in `tools/nungu-dev-cycle/`.

## Cycle States

- `Intake`: scope is captured, owner/repo/dependencies are identified, and the GitHub issue exists.
- `Ready`: acceptance gates are clear and no unknown product decision blocks implementation.
- `In progress`: implementation is active on a branch linked to the issue.
- `Local proof`: build, type, lint, smoke, API, or browser checks have been run locally and linked in the issue.
- `QA proof`: QA or browser evidence confirms the workflow in an integrated environment.
- `Release ready`: issue has local proof, QA proof where required, migration/deploy notes, and rollback notes.
- `Closed`: production or handover proof is linked and no follow-up work remains.

## Gate Rules

- Admin UI issues require `npm run typecheck`; use targeted lint on edited files and `npm run smoke:routes` when navigation or pages change.
- Admin product-flow issues require `npm run smoke:catalog` or a documented Browser Use/manual equivalent when mutation safety prevents an automated run.
- API issues require `npm run build` and a route/API contract smoke for changed endpoints.
- Storefront issues require a Node 20-compatible `npm run build` and browser proof for public pages.
- Cross-repo issues must link proof from every touched repository.
- Migrations require a forward migration, backfill/compatibility plan when needed, deploy order, and rollback notes.
- Production deploys require clean working trees, linked issue numbers, local proof, QA proof for user-facing changes, and release notes.
- Write-path QA proof must use a non-production database. If only production data is available, the feature remains blocked at local proof/review and cannot be promoted.

## Promotion Rules

- `Intake` to `Ready`: issue body has scope, acceptance criteria, proof required, and approval boundary.
- `Ready` to `In progress`: implementation plan is recorded in the issue or linked planning note.
- `In progress` to `Local proof`: a proof receipt is attached. Use `python3 tools/nungu-dev-cycle/capture-proof.py`.
- `Local proof` to `QA proof`: at least one review pass is attached. High-risk work requires two review passes.
- `QA proof` to `Release ready`: QA proof matches the commit being promoted and rollback notes exist.
- `Release ready` to `Closed`: production/handover proof and release notes are linked.

Run the gate before moving an issue forward:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-6 \
  --stage local \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-15/admin-variant-manager-local.json
```

## Issue Set

The current issue bodies live in this folder:

| Issue | Repo | Body |
| --- | --- | --- |
| https://github.com/scificorp/nungudiamonds-admin/issues/6 | Admin | `issue-variant-manager-ui.md` |
| https://github.com/scificorp/nungudiamonds-admin/issues/4 | Admin | `issue-rates-admin-surface.md` |
| https://github.com/scificorp/nungudiamonds-api/issues/11 | API | `issue-pricing-api-foundation.md` |
| https://github.com/scificorp/nungudiamonds-api/issues/10 | API | `issue-diamond-multitone-model.md` |
| https://github.com/scificorp/nungudiamonds-admin/issues/5 | Admin | `issue-bookings-workflow.md` |
| https://github.com/scificorp/nungudiamonds-web/issues/12 | Web | `issue-ecommerce-yoco.md` |
| https://github.com/scificorp/nungudiamonds-web/issues/11 | Web | `issue-cms-launch-verification.md` |
| https://github.com/scificorp/nungudiamonds-admin/issues/7 | Admin | `issue-operations-crud-gates.md` |
| https://github.com/scificorp/nungudiamonds-admin/issues/8 | Admin | `issue-handover-hardening.md` |
| https://github.com/scificorp/nungudiamonds-api/issues/12 | API/Admin/Web | `issue-qa-environment.md` |

## Default Repos

- Admin tracker: `scificorp/nungudiamonds-admin`
- API tracker: `scificorp/nungudiamonds-api`
- Storefront tracker: `scificorp/nungudiamonds-web`
