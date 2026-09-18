# Nungu Diamonds Admin Meeting Readiness — 2026-09-17

## Release-candidate evidence

- Repository: `scificorp/nungudiamonds-admin`
- Base inspected: `origin/main` at `5bd70860ffacf8ddd3cc27650a9dd27375dfdb1a` (`Add GitHub Actions CI (#11)`)
- Release-candidate branch: `fm/nungu-admin-meeting-ready-nungudiamonds` (or the final PR head branch after no-mistakes finishes)
- Release-candidate commit: use the PR head SHA after no-mistakes, because the pipeline may apply follow-up fixes before the PR is ready.
- Expected production admin URL from repository docs/CORS config: `https://admin.nungudiamonds.co.za`
- Browser check: `chrome-devtools-axi` reached the deployed login page at `https://admin.nungudiamonds.co.za/login/`; requesting `/dashboard/` redirected to `/login/?returnUrl=%2Fdashboard%2F`, confirming the deployed auth gate is active.
- Deployed Next.js build id observed from browser assets: `EwEFnknb57iaOAEmNFG_U`.
- Deployment status: this worker did not merge or deploy. Production hosting access/Amplify build evidence was not available in-repo, and this task is constrained not to merge the PR. Treat the PR/hosting build as the deployment gate before claiming production is updated.

## Sources reconstructed

- GitHub `origin/main` already contains the merged CMS/blog featured-story and auth hardening work from PRs 2 and 3.
- GitHub draft PR 9 (`Assemble proved Nungu release gate payload`) was used as evidence only; this RC selectively ports the low-risk variant-manager parts rather than merging that stale release branch wholesale.
- Preserved local admin repository snapshots were inspected read-only. They show the earlier Phase 0/admin usability work, route/auth/catalog/CMS smoke gates, lead/status follow-up operations, and handover docs. No legacy file was edited.

## Improvements present for walkthrough

### Admin shell and usability

- Navigation is grouped into Operations, Catalog Operations, Merchandising & Content, Static Pages Management, Configuration, and Settings.
- Dashboard and high-volume operational pages are framed for staff walkthroughs rather than developer debugging.
- Shared admin headers, clearer empty/error states, safer delete confirmations, and table/responsive polish from the Phase 0/UI pass are represented in the current tree.

### Authentication and release safety

- Local admin-login bypass is guarded behind explicit non-production conditions and a local-only admin token.
- `npm run verify:production-config` is wired into `prebuild`; production builds reject unsafe local auth bypass/token settings.
- Auth smoke coverage remains available through `npm run smoke:auth`.

### Catalog and variants

- Catalog walkthrough covers All Products, Quick Add Product, Collections, image/status/featured/trending toggles, and optional collection assignment.
- `npm run smoke:catalog` creates a synthetic product against a non-production API, verifies image/status/featured/trending/collection operations, and cleans it up by default.
- This RC restores the safer child-variant manager workflow from the proved release payload: parent/child variant context, dropdown loading, create/edit variant dialog, active toggle, inherited parent categories, and metal detail save path.
- Later review fixes in this no-mistakes run keep the metal endpoint payload on numeric size IDs, accept numeric or object product-id responses, keep retries on the already-created child variant after a partial metal save, and preserve existing variant category row IDs during edits.

### CMS and featured content

- Blog CMS includes homepage featured-story controls (`is_featured_home`) with guidance that only one published blog should be featured.
- Static Pages support enriched hero and section fields used by the storefront CMS launch path.
- `npm run smoke:cms` validates authenticated static-page create/read/section/reorder/public-readback paths against a non-production API and cleans up synthetic pages.

### Enquiries, consultations, and operations

- Product and general enquiries expose lead status and staff follow-up/admin-comments fields.
- Orders and giftset order detail pages expose status/delivery status paths needed for a staff demo.

## Validation evidence in this worktree

The first six entries were recorded before the later variant-manager review fixes. Re-run the verification commands before claiming the final PR head is deployment-ready.

- `npm ci` completed (Node 24 warns because the app declares Node 22.x).
- `npm run smoke:routes` passed for 61 routes.
- `npm run typecheck` passed using the repo-installed TypeScript.
- `npm run lint:check` passed with existing hook-dependency warnings and 0 errors.
- `NODE_ENV=production npm run verify:production-config` passed.
- `npm run build` passed.
- `npm run smoke:auth` could not connect because the local API at `localhost:2511` was not running; catalog and CMS smokes were not run to avoid unsafe production mutations.
- Documentation/lint housekeeping on 2026-09-17 formatted `src/components/product/VariantManagement.tsx` and reran changed-file ESLint with no errors.

## Suggested safe demo route

1. Open `https://admin.nungudiamonds.co.za` and log in with approved admin credentials.
2. Dashboard: explain operational queues and navigation grouping.
3. Catalog > All Products: show search, active/featured/trending status, grouped variants, and collection context. Do not change real production products.
4. Catalog > Quick Add Product: show the made-to-order product workflow. Only save if using a clearly synthetic QA/local record.
5. Catalog > Collections: show curated merchandising groups and optional product assignment.
6. Merchandising & Content > Hero Content: show hero media fields and preview/diagnostic posture without replacing live content.
7. Merchandising & Content > Blog: show homepage featured-story control.
8. Static Pages: show enriched hero/section management.
9. Enquiries > Product Enquiries and General Enquiries: show lead status and follow-up/admin-comments workflow without changing real customer records.
10. Roles & Permissions: show staff access-management surface; do not create/delete users in production.

## Known limitations / stop points

- Do not mutate real customer data, send customer communications, trigger payments, create calendar actions, or delete production master data during the meeting demo.
- Production login credentials were not available to this worker, so the deployed walkthrough stopped at the auth gate. Confirm the hosting build/commit after merge before saying the RC is live.
- API/storefront release candidates were not edited by this task. API-backed smokes require a compatible non-production API and safe tokens; the local API on `localhost:2511` was not running in this worktree, so auth/catalog/CMS API smokes were not executed here.
- GitHub Actions CI is configured for pull requests and pushes to `main` with lint, typecheck, production-config, route-smoke, and build jobs. Treat local gates, no-mistakes review, and the PR CI result together as the proof path before merge/deploy.
