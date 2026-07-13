# Nungu Crabbox Harness

This harness starts the Nungu release candidate admin and API worktrees in a remote Linux box without syncing production secrets.

## Scope

- Admin worktree and Crabbox root: `tcctechadmin-nungudiamonds-release`
- API sibling synced separately: `tcctechapi-nungudiamonds-release`
- Local API: `http://127.0.0.1:2511/api/v2`
- Local admin: `http://127.0.0.1:3000/dashboard/`

It does not deploy, contact clients, send mail, copy production data, or mutate production systems.

## Commands

```bash
./cbx.sh doctor
./cbx.sh sync-plan
./cbx.sh up nungu-admin
./cbx.sh status nungu-admin
./cbx.sh smoke nungu-admin
./cbx.sh screenshot nungu-admin
./cbx.sh tunnel nungu-admin
./cbx.sh down nungu-admin
```

## Proof Contract

Minimum proof for a useful worker handoff:

- `./cbx.sh doctor` passes locally.
- `./cbx.sh sync-plan` confirms admin secret env files are excluded.
- `./cbx.sh up nungu-admin` reaches `NUNGU STACK READY`.
- `./cbx.sh smoke nungu-admin` passes:
  - API bespoke enquiry test with `MAIL_SUPPRESS_SEND=true`.
  - Admin navigation route smoke.
  - Admin catalog create/image/publish/cleanup smoke against localhero.
- `./cbx.sh screenshot nungu-admin` writes `output/crabbox/nungu-admin-admin-dashboard.png`.

## Secret Boundary

The admin sync excludes `.env*`. The API sibling sync excludes non-example API env files and `.env*`. In a fresh box, `setup.sh` creates:

- `tcctechapi-nungudiamonds-release/environment/env.localhero` from `environment/env.localhero.example`.
- `tcctechadmin-nungudiamonds-release/.env.local` pointing at the localhero API.

If those files already exist, setup leaves them untouched.
