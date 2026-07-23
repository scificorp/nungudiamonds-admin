# Rollback Reference

Issue: GH-12 QA environment
Date: 2026-07-17

## Scope

Rollback covers QA-local scripts, examples, bootstrap support, and admin/API package scripts. It does not affect production data.

## Rollback Steps

1. Stop QA-local if it is running with `npm run db:qa-local:stop` from the API repo.
2. Revert QA-local script/package changes from the API repo.
3. Revert admin QA-local package script and example env changes if included in the release candidate.
4. Rebuild the API with `npm run build` and run admin `npm run typecheck`.

## Data Recovery

QA-local data is disposable. If needed, remove or reset only `.local/qa-postgres` under the workspace after confirming no QA-local process is running.

## Disable Path

If rollback cannot be deployed immediately, do not use QA-local proof for release promotion and leave production deploy gates requiring the previous proof policy.
