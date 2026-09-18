# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- The app declares Node `22.x`; run `npm ci` before local gates so `npm run typecheck` uses the repo-installed TypeScript instead of any global `tsc`.
- The current handover gate list lives in `docs/HANDOVER_ENVIRONMENT_AND_VERIFICATION.md`; API-backed smokes default to `localhost:2511` and must run only against local/QA data because catalog/CMS smokes create synthetic records and clean them up.
- `https://admin.nungudiamonds.co.za/dashboard/` should redirect unauthenticated browsers to `/login/?returnUrl=%2Fdashboard%2F`; deeper deployed walkthroughs require approved admin credentials.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
