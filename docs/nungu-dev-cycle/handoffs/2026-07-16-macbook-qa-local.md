# MacBook Handoff: Provision VPS-Style Local QA

Date: 2026-07-16
Issue: `https://github.com/scificorp/nungudiamonds-api/issues/12`

## Objective

Provision a local non-production QA environment on the MacBook for Nungu write-path proof. This environment must be isolated from production and must not use the production database.

## Context

The VPS task wired the API repo for QA-local, but actual DB startup is blocked on the VPS because native PostgreSQL tools are missing and `sudo` is unavailable there.

API repo changes already prepared:

- `.gitignore` ignores `environment/env.qa-local`.
- `environment/env.qa-local.example` defines the QA-local env shape.
- `scripts/qa-local-db.sh` starts/stops/resets a local Postgres cluster.
- `package.json` includes:
  - `npm run db:qa-local:start`
  - `npm run db:qa-local:stop`
  - `npm run db:qa-local:reset`
  - `npm run db:qa-local:bootstrap`
  - `npm run dev:qa-local`

Target QA-local values:

- API port: `2512`
- DB host: `127.0.0.1`
- DB port: `55433`
- DB name: `nungu_diamond_qa`
- DB user: `postgres`
- DB password: `postgres`

## Stop Conditions

- Do not point any admin/web/API QA config at the production database.
- Do not copy production credentials into proof receipts.
- Do not run production data writes.
- Do not send live email, SMS, payment, or customer notifications from QA.
- If a command asks for production credentials, stop and report the blocker.

## MacBook Setup Steps

1. Go to the API release repo:

   ```bash
   cd /path/to/tcctechapi-nungudiamonds-release
   ```

2. Ensure Postgres command-line tools exist:

   ```bash
   command -v initdb
   command -v pg_ctl
   command -v psql
   command -v createdb
   ```

3. If missing, install PostgreSQL with Homebrew:

   ```bash
   brew install postgresql@16
   ```

   If Homebrew does not add the tools to `PATH`, add the package bin path for the current shell. Example:

   ```bash
   export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
   ```

4. Create the runtime QA env from the example if it does not already exist:

   ```bash
   cp environment/env.qa-local.example environment/env.qa-local
   ```

5. Start the QA-local database:

   ```bash
   npm run db:qa-local:start
   ```

6. Bootstrap available local schema/data:

   ```bash
   npm run db:qa-local:bootstrap
   ```

7. Build the API:

   ```bash
   npm run build
   ```

8. Start the QA-local API:

   ```bash
   npm run dev:qa-local
   ```

9. In a second terminal, prove the API is reachable. Use the actual health or safe read route available in the repo. If no health endpoint exists, prove that the server binds to port `2512` and document the route gap.

10. Capture proof:

   - DB start output.
   - Bootstrap output.
   - API build output.
   - API start output.
   - Safe API reachability result.
   - Confirmation that `environment/env.qa-local` points at `127.0.0.1:55433`, not production.

## Expected Success Criteria

- `npm run db:qa-local:start` succeeds.
- `npm run db:qa-local:bootstrap` succeeds or reports only known missing optional migrations.
- `npm run build` succeeds.
- `npm run dev:qa-local` starts API on port `2512`.
- Proof clearly states the QA DB is local/non-production.

## Return To VPS/Tracker

Post a comment on API #12 with:

- Commands run.
- Pass/fail result for each command.
- Any proof file paths.
- Any remaining blockers.

If QA-local starts successfully, Admin #6 and Admin #7 can proceed to integrated browser/API proof against this environment instead of production.
