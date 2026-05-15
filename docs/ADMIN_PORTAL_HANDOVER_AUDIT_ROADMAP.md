# Admin Portal Handover Audit And Roadmap

Date: 2026-05-02

Scope: `tcctechadmin-nungudiamonds` admin portal and its local API dependency in `tcctechapi-nungudiamonds`.

## Executive Summary

The admin portal is now checkpointed in a materially better state than the starting point for catalog operations. The latest checkpoint reframes the admin information architecture around operations, catalog operations, merchandising/content, and configuration. It also promotes the newer quick-add product workflow while keeping the legacy product workspace available.

The portal is not yet handover-grade. The most important remaining work is not adding more features; it is closing stabilization gaps that are currently hidden by permissive build settings. The production build passes while TypeScript and ESLint failures are explicitly ignored. There are also visible navigation routes that return 404, broken parser-level source files, historical Git object corruption, and a large amount of legacy page UX that still feels inconsistent.

The next phase should therefore be stabilization first, then workflow polish.

## Progress Update

Updated on 2026-05-02 after the stabilization and first workflow-polish passes:

- Phase 1 stabilization gate is complete for build-blocking issues: parser errors, hook-rule errors, JSX key errors, broken rates nav routes, route smoke coverage, typecheck, production build validation, TLS bypass removal, and local login bypass guard.
- Phase 2 core catalog flow is covered by `npm run smoke:catalog`, which creates a temporary product, uploads an image, toggles active/featured/trending state, checks optional collection assignment/removal when collections exist, and deletes the smoke product.
- Phase 3 has started: product and giftset order list pages now use clearer operational headers, responsive status filters, stable date filtering, and fewer legacy dead states.
- Phase 4 has started: visible debug/novelty copy was removed from company setup and testimonials; hero-content diagnostics remain opt-in through `NEXT_PUBLIC_DEBUG_HERO_CONTENT`.
- Phase 5 has started: roles and company setup use handover-oriented admin headers and clearer staff-facing copy.
- Phase 6 handover package has started: README setup, environment verification, admin user guide, and smoke-test documentation are in place.

Remaining non-blocking quality debt:

- ESLint still reports legacy `react-hooks/exhaustive-deps` warnings. Current count after the shared form/upload warning pass is 107 warnings, 0 errors.
- Historical Git object corruption still requires a clean handover repository or planned history repair before final client delivery.

## Checkpoint Baseline

### Admin Checkpoint

- Commit: `5d56e15 feat(admin): checkpoint portal stabilization`
- Scope: admin IA, dashboard reframing, catalog quick-add workflow, collection assignment, bulk-upload recovery copy, shared admin page header, and local runtime safeguards.
- Note: the admin repository has historical Git object corruption. A duplicate recovery commit exists immediately below the current checkpoint because normal `git commit` tripped over missing historical blobs. Do not rewrite this history casually; repair or reclone the repository as a planned hygiene task.

### API Checkpoint

- Commit: `4aa6a96 feat(api): checkpoint catalog platform backend`
- Scope: backend baseline used by the admin checkpoint, including v2 catalog, collections, product workflow, bulk upload, and compatibility updates.

## Verification Evidence

### Passing Checks

- `tcctechadmin-nungudiamonds`: `npm run build` passed before checkpoint.
- `tcctechapi-nungudiamonds`: `npm run build` passed before checkpoint.
- Targeted admin ESLint on recently touched files passed before checkpoint.
- API live smoke checks passed with `Authorization: PUBLIC_AUTHORIZATION_TOKEN`:
  - `GET /api/v2/dashboard` returned `code: 200`.
  - `GET /api/v2/product?current_page=1&per_page_rows=5&group_variants=true` returned `code: 200` and `total_items: 72`.
- Local admin HTTP smoke:
  - `GET http://localhost:3000/dashboard/` returned `200`.

### Browser Verification

The Browser Use plugin is installed, but the required Node REPL execution tool was not exposed in this session after tool discovery, so a full Browser Use route automation pass could not be executed from the plugin surface. Prior smoke verification in the active local browser had already confirmed the main flows: dashboard, all products, quick add product, collections list, assign products, bulk upload, and attribute color page loaded and the removed `Needs collections` flag did not reappear.

For this audit pass, live fallback route checks were run against the running admin server. They confirmed that 63 of 65 navigation routes returned `200`, and 2 navigation routes returned `404`.

## Critical Findings

### 1. Build Success Is Not A Quality Gate

`next.config.js` currently contains:

- `eslint.ignoreDuringBuilds: true`
- `typescript.ignoreBuildErrors: true`

This means `npm run build` can pass while parser errors, hook violations, missing keys, and type errors remain. This is acceptable only as a temporary recovery bridge. It is not acceptable for client handover.

Acceptance gate:

- Full ESLint must pass without `--fix`.
- TypeScript validation must run independently and pass.
- Build should no longer hide lint/type failures.

### 2. Full ESLint Currently Fails

Command:

```sh
npm exec eslint "src/**/*.{js,jsx,ts,tsx}"
```

Result:

- `154 problems`
- `31 errors`
- `123 warnings`

Highest-impact errors:

- `src/components/product/EnhancedVariantManagement.tsx`: parser error.
- `src/data/api-types.ts`: parser error.
- `src/pages/orders/giftset-orders-list/index.tsx`: lower-case component name triggers hook rule errors.
- `src/pages/product/show-image-upload/index.tsx`: lower-case component name triggers hook rule errors.
- Invoice and image upload pages have missing React `key` props in iterators.

Acceptance gate:

- Parser errors fixed first.
- Hook-rule errors fixed second.
- JSX key/a11y errors fixed third.
- Hook dependency warnings triaged by risk, not blanket-disabled.

### 3. Navigation Contains Broken Routes

Live route sweep found two menu routes returning `404`:

- `/rates/metal-rates/`
- `/rates/configuration/`

The existing rates pages are:

- `/rates/fx-rate/`
- `/rates/diamond-rates/`

Acceptance gate:

- Either implement the missing pages or remove/disable the nav items until they exist.
- Add a route smoke test that parses the navigation config and checks every visible route.

### 4. Repository Integrity Is Damaged

`git fsck --no-reflogs` reports many missing historical blobs/trees. The current working tree can be committed through recovered current index objects, but the repository history is not healthy.

Acceptance gate:

- Create a clean handover clone/repository from the current checkpoint tree.
- Preserve this damaged repository only as a recovery/reference artifact.
- Do not rely on this repo for long-term client handover without repair.

### 5. API Security And Environment Hygiene Need Review

`src/services/ServiceWarpper.ts` sets:

```ts
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
```

This disables TLS verification in Node contexts and should not exist in client/admin application code. The local admin login bypass is useful for development:

```ts
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true
```

But it must be impossible to ship accidentally in production.

Acceptance gate:

- Remove TLS bypass or constrain it to an explicit local-only server-side script if still needed.
- Add environment validation that fails production startup/build if admin login bypass is enabled.
- Document required local `.env` values for admin and API.

## UX And Workflow Findings

### Catalog

Current strength:

- Quick Add is now clearly the preferred path.
- Legacy Add Products remains available as a fallback workspace.
- Collections are now framed correctly as optional merchandising groups rather than required product setup.
- Bulk upload copy is more recovery-oriented.

Remaining gaps:

- Quick Add needs end-to-end validation with real product creation, image association, and edit-after-create.
- Legacy product workspace still has debug `console.log` noise and a very large form surface.
- Product image upload pages have lint/runtime quality issues.
- Variant management source has a parser error and should not be considered reliable until fixed.

Handover target:

- Admin can create a made-to-order product, add images, assign optional collections, publish/unpublish, and verify it appears correctly in catalog data.

### Operations

Current strength:

- Dashboard is now more operationally framed.
- Orders, customers, enquiries, carts, wishlists, and reviews are grouped more coherently.

Remaining gaps:

- Orders pages still use older card headers and table patterns.
- Giftset orders page has hook-rule lint failures due component naming.
- Invoice pages have missing key errors and a11y warnings.
- Dashboard metrics need client-facing labels that map to real business decisions.

Handover target:

- Staff can identify new orders, open order details, update statuses, inspect enquiries, and understand the next action without developer interpretation.

### Merchandising And Content

Current strength:

- Content tools are grouped under a clearer merchandising/content area.

Remaining gaps:

- Hero/content preview components still contain debug logs.
- Many content pages retain inconsistent old shells.
- Image upload and bulk image workflows need clear file requirements and recovery messaging.

Handover target:

- Staff can safely update homepage, banners, stories, testimonials, blogs, and static pages with previews and clear save states.

### Configuration

Current strength:

- Attribute, category, rates, roles, settings, country/currency, and web configuration are easier to find after navigation cleanup.

Remaining gaps:

- Two rates nav entries are broken.
- Many master-data pages repeat the same legacy table/drawer pattern with inconsistent labels and weak empty/error states.
- Roles page contains a visible typo: `Rols`.

Handover target:

- Configuration pages should feel like controlled master data, with predictable CRUD patterns, confirmation modals, search, empty states, and consistent labels.

## Master Roadmap

### Phase 1: Stabilization Gate

Priority: P0

Goal: stop hidden failures from reaching handover.

Tasks:

- Fix parser errors in `EnhancedVariantManagement.tsx` and `api-types.ts`.
- Fix lower-case React component names causing hook-rule failures.
- Fix missing React keys in invoice and image upload pages.
- Add a non-mutating lint script, for example `lint:check`.
- Add a TypeScript check script, for example `typecheck`.
- Decide whether to remove or implement broken rates routes.
- Remove or guard `NODE_TLS_REJECT_UNAUTHORIZED = '0'`.
- Add production guard for `NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true`.
- Create a route smoke test that derives routes from `src/navigation/vertical/index.ts`.

Exit criteria:

- `npm run build` passes.
- `npm run lint:check` passes.
- `npm run typecheck` passes.
- Route smoke test passes for every visible nav route.
- API dashboard/product smoke tests pass.

### Phase 2: Core Catalog Handover Flow

Priority: P0

Goal: make the sales/admin product workflow dependable for a made-to-order jewellery business.

Tasks:

- Verify Quick Add product creation against the API with real required fields.
- Verify image upload/association after create.
- Verify optional collection assignment and removal.
- Verify active, featured, and trending state changes.
- Make All Products the reliable catalog control surface with clear actions and no misleading inventory assumptions.
- Keep Legacy Product Workspace available but clearly marked as advanced/legacy.

Exit criteria:

- Staff can create, publish, image, categorize, and optionally merchandise a product in under one workflow.
- No product flow depends on hidden developer knowledge.
- Failed saves show actionable recovery messages.

### Phase 3: Operations Workflow Polish

Priority: P1

Goal: make the portal useful for daily order and customer operations.

Tasks:

- Standardize orders/giftset orders list headers, filters, and status language.
- Fix giftset orders lint errors.
- Audit order detail status updates and invoice flows.
- Improve enquiries pages with clearer read/replied/resolved states if supported by API.
- Rework dashboard metrics into actionable cards with links to the relevant queues.

Exit criteria:

- Staff can understand the operational queues from the dashboard.
- Orders and enquiries have clear next actions.
- Invoice pages render without lint errors and with accessible image alt text.

### Phase 4: Merchandising And Content Polish

Priority: P1

Goal: make content management safe and previewable.

Tasks:

- Remove debug logging from content preview components.
- Standardize hero, banners, stories, testimonials, blog, and static page shells.
- Add clear image/file requirements to upload surfaces.
- Add preview/confirm states for homepage-affecting changes.

Exit criteria:

- Staff can update public-facing content without developer help.
- Content pages have consistent save, preview, error, and empty states.

### Phase 5: Configuration Consistency

Priority: P2

Goal: turn master data pages into predictable admin tools.

Tasks:

- Standardize CRUD layout across attributes, categories, countries, settings, roles, and rates.
- Fix labels, casing, and typos.
- Add empty/error/loading state consistency.
- Confirm every delete action has confirmation and recovery messaging.

Exit criteria:

- Master-data pages behave consistently.
- No broken nav routes remain.
- Users can infer how each page works from the UI itself.

### Phase 6: Handover Package

Priority: P0 before final delivery

Goal: leave the client with a clean, understandable, maintainable admin portal.

Tasks:

- Produce a clean handover repository or repaired Git history.
- Write local setup instructions for admin and API.
- Write environment variable documentation.
- Write admin user guide for product, collection, order, content, and configuration workflows.
- Add smoke-test commands to README.
- Record final verification evidence.

Exit criteria:

- Clean clone can install, run admin/API, pass quality gates, and complete core smoke flows.
- Handover docs explain both technical setup and admin usage.
- No local-only bypass can ship accidentally.

## Recommended Immediate Next Sprint

1. Repair quality gates: parser errors, hook-rule errors, missing keys, non-mutating lint/type scripts.
2. Fix the two broken rates routes by implementing pages or removing nav entries.
3. Add route smoke test derived from navigation config.
4. Harden environment handling for login bypass and TLS verification.
5. Run a real Quick Add product creation and image association flow using local API.
6. Convert the result into a handover-ready admin user guide section.

## Handover Readiness Definition

The admin portal should not be considered handover-ready until all of the following are true:

- Full route sweep passes.
- Full lint check passes.
- TypeScript check passes.
- Production build passes without ignoring lint/type failures.
- Core catalog flow is verified end to end.
- Orders and enquiries have verified basic workflows.
- Local setup and production environment notes are documented.
- Repository integrity is repaired or replaced with a clean checkpoint repository.
