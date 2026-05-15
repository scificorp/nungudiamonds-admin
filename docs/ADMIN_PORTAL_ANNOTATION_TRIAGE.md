# Admin Portal Annotation Triage

Date: 2026-05-03

Scope: browser-review annotations for `tcctechadmin-nungudiamonds`, with API and storefront wiring checks where admin behavior depends on them.

This document is the active source of truth for the current admin portal improvement pass. Work through P0 first, then P1, then P2/P3. Do not add new feature-looking UI unless it is wired, testable, and useful for handover.

## Operating Rules

- Stability comes before feature expansion.
- Browser-visible claims must match implemented behavior.
- If a page implies a capability that is not wired, either implement it, rename it, or hide it.
- Every completed item needs at least one verification step: build/type/lint where relevant, API contract check, or Browser Use route validation.
- Prefer small, shippable fixes that improve handover confidence over broad redesigns.

## Status Legend

- `Closed`: implementation or truthful demotion is complete and at least one non-browser quality gate passed.
- `Browser pending`: code path is fixed, but final Browser Use validation still needs to be rerun.
- `Implementation open`: code or data-model work is still required.
- `Deferred`: deliberately not built in this pass because it needs backend/schema/client approval or would be a misleading feature.

## Status Ledger

| ID | Status | Current state | Remaining gate |
| --- | --- | --- | --- |
| A00 | Closed | Runtime route crashes found during review have been fixed at source; route smoke passes, and Browser Use loaded all 61 sidebar routes without runtime overlays, 404 pages, or captured console errors. | Continue with deeper workflow/CRUD checks by section. |
| A01 | Closed | Dashboard no longer renders missing revenue as `NaN`. | Recheck in Browser Use during final sweep. |
| A02 | Closed | Custom chip tolerates missing/default colors. | Recheck orders route in Browser Use during final sweep. |
| A03 | Closed | Order transactions now separates empty state from load failure. | Optional live data/API confirmation if production credentials are available. |
| A04 | Closed | Wishlist records are grouped by customer with customer/product actions. | Browser Use interaction check. |
| A05 | Closed | Cart records are grouped by customer and view no longer routes to the broken public URL. | Browser Use interaction check. |
| A05b | Closed | Cart/wishlist drawers expose customer profile and product links where `customer_id` is available. | Continue consolidating related activity into the customer profile. |
| A06 | Closed | Browser Use verified the Payment page loads and explains Yoco as the real backend integration while marking PayPal/Stripe forms as legacy placeholders. | None unless checkout configuration editing is requested. |
| A07 | Closed | Product enquiries are framed as a sales lead queue with follow-up status/actions. | Browser Use interaction check. |
| A08 | Closed | General enquiry detail drawer is renamed and exposes contact actions. | None. |
| A09 | Closed | General enquiries now have persisted CRM-lite status, notes, handled-by, and handled-at tracking through the existing API/configuration layer. | Continue deeper workflow checks during final Browser Use sweep. |
| A10 | Closed | Trending is confirmed as consumed by storefront/API, so the admin control remains. | None. |
| A11 | Closed | Quick Add no longer mixes the one-off display font into the form. | Browser Use visual check. |
| A12 | Closed | Quick Add no longer shows unwired purchase-mode switches; it truthfully explains the current storefront CTA behavior. | Add backend-backed purchase modes only if requested. |
| A13 | Closed | Quick Add tips are dismissible with `localStorage` persistence. | Browser Use persistence check. |
| A14 | Closed | Final Quick Add action row stacks responsively. | Browser Use desktop/mobile check. |
| A15 | Closed | Bulk upload template is generated from parser order, frontend/API validation accepts real browser CSV/Excel MIME variants, and the generated sample validates through the API. | None. |
| A16 | Closed | Gift product back navigation and list fetch loop were simplified. | Browser Use navigation check. |
| A17 | Closed | Gift Set was demoted to Legacy Gift Products because it is not a bundle builder. | None unless real bundling is requested. |
| A18 | Closed | Category page received a layout/clarity pass and form behavior fixes. | Browser Use visual check. |
| A19 | Closed | Collections sidebar is now one direct entry. | Browser Use nav check. |
| A20 | Closed | Collection API/admin routes were traced and Browser Use verified list, add, and assign workspace routes load without runtime overlays. | Avoid destructive create/delete smoke unless the client provides safe test data. |
| A21 | Closed | Collections list uses session cache while refreshing API data. | Browser Use revisit timing check. |
| A22 | Closed | Collection actions now explain Assign/Review Products vs Edit Details. | Browser Use action check. |
| A23 | Closed | FX Rate page no longer calls missing routes or claims live pricing. | Browser Use page check. |
| A24 | Closed | Unsupported approval wording was removed. | None. |
| A25 | Closed | FX information cards were reduced to accurate handover wording. | None. |
| A26 | Closed | Diamond Rates page no longer calls missing matrix/multiplier endpoints or claims unsupported live pricing. | Browser Use page check. |
| A27 | Closed | Hero Content mobile preview uses a phone-frame crop preview. | Browser Use visual check. |
| A28 | Deferred | Bulk Image Upload is explicitly documented as a utility, not a media gallery. | Build a gallery only if client needs asset management. |
| A29 | Closed | Banner page describes a real storefront surface consumed through `user/banner`. | Browser visual check when Browser Use is available. |
| A30 | Closed | Marketing Banner page describes a real homepage surface consumed through `user/marketing/banner`. | Browser visual check when Browser Use is available. |
| A31 | Closed | Home About Section maps to the storefront `user/homeAndAbout/section` content hook. | Browser visual check when Browser Use is available. |
| A32 | Closed | Active testimonials have a public API route and the storefront homepage carousel fetches admin-managed testimonials with static fallback. | None. |
| A33 | Closed | Marketing Popup maps to the storefront modal via `user/marketing/popup`. | None. |
| A34 | Closed | Blog list/detail rendering has safer external links, image fallbacks, and more readable HTML content styling; Browser Use verified external-link posts render as outbound links instead of broken internal detail routes. | Add an internal-content sample only if the client wants hosted article pages instead of external press links. |
| A35 | Closed | Source-level and API-served static page content now normalize the old dashed domain/email to `nungudiamonds.co.za` / `info@nungudiamonds.co.za`. | None. |
| A36 | Closed | Browser Use verified User Management loads and states what adding a backend user actually does. | Do not create test users unless safe credentials/cleanup are explicitly approved. |
| A37 | Closed | Browser Use verified Email Setup loads the real API-backed form and no longer displays the placeholder warning. Save-flow mutation is intentionally not run without approved safe SMTP/test values. | None unless safe SMTP/test values are provided. |
| A38 | Closed | Instagram ID is removed from sidebar and legacy page points to Company Info/social-link source. | None. |

## P0 - Stability And Truthfulness

These block reliable use of the admin portal and browser verification.

| ID | Area | Annotation | Decision | Verification |
| --- | --- | --- | --- | --- |
| A01 | Dashboard | `NaN` total revenue is shown. | Fix calculations and render safe currency fallback when revenue is missing. | Dashboard loads with no `NaN`; Browser Use screenshot confirms real value or `R0.00`. |
| A02 | Orders | `/orders/orders-list/` crashes with `Cannot convert undefined or null to object` in custom chip. | Fix chip/default-color handling and any unsafe object access. | Orders list loads through client-side navigation and direct refresh with no runtime overlay. |
| A03 | Order Transactions | Page shows no rows; unclear if no data or failed load. | Verify API data source and distinguish empty state from load failure. | Network/API check plus visible empty/error state. |
| A05 | Cart Products | View action leads to error page. | Fix details route/action and ensure cart detail is viewable. | Click view icon from cart list and confirm detail view/panel loads. |
| A23 | FX Rates | Page errors and shows `0.00`; pricing impact unclear. | Fix load error, verify rate source, and clarify whether rates affect pricing. | FX route loads without console error; documented pricing dependency. |
| A26 | Diamond Rates | Page errors on load. | Fix load error and remove unsupported claims if pricing engine is not wired. | Diamond rates route loads without console error. |
| A00 | Navigation | Some pages need refresh after menu navigation. | Treat as P0 navigation reliability: fix runtime route crashes and run client-side route sweep. | Browser Use route sweep navigates via sidebar without manual refresh. |

## P1 - Sales Operations Workflow

These have the highest business value because they help the client convert enquiries into sales.

| ID | Area | Annotation | Decision | Verification |
| --- | --- | --- | --- | --- |
| A07 | Product Enquiries | Page is confusing and may not load frontend form enquiries. | Verify data source; redesign as actionable product lead queue. | Frontend/API/admin enquiry path is traced; admin shows actionable records. |
| A08 | General Enquiries | View drawer experience is awkward. | Replace with clear lead detail experience. | Opening an enquiry shows contact, message, status, notes, and actions cleanly. |
| A09 | General Enquiries | No handled/contacted/status tracking. | Implemented migration-free CRM-lite tracking through the existing API/configuration layer. | Staff can mark enquiry status and see who/when handled it. |
| A04 | Wishlist | Wishlist should be grouped per client/user. | Rework list around customers and products. | Wishlist page can answer “what does this customer want?” quickly. |
| A05b | Cart/Wishlist | Quicker access from customer profile makes sense. | Add customer profile links/sections for carts and wishlists where data supports it. | Customer detail exposes related cart/wishlist records or clear empty states. |

## P2 - Catalog Workflow

These improve product management once the portal is stable.

| ID | Area | Annotation | Decision | Verification |
| --- | --- | --- | --- | --- |
| A10 | All Products | Trending column may not be meaningful. | Audit storefront usage; hide if unused. | Frontend usage documented; admin column kept only if consumed. |
| A11 | Simplified Add | Mixed fonts and inconsistent visual language. | Align admin typography with brand/frontend direction. | Quick Add page has one coherent font treatment. |
| A12 | Simplified Add | Purchase toggles may not be wired on frontend. | Verify storefront consumes `Purchasable Online`, `Price on Request`, and `Consult to Purchase`. | Storefront behavior documented or toggles relabeled/hidden. |
| A13 | Simplified Add | Tips should be dismissible and optionally hidden permanently. | Add dismissible persistent tips. | Dismiss survives reload/session according to chosen persistence. |
| A14 | Simplified Add | Final action area is cramped. | Rework final pricing/action layout for desktop and mobile. | Browser Use screenshot at desktop/mobile confirms no cramped controls. |
| A15 | Bulk Upload | Template/experience may not match parser. | Verify template columns against parser and test sample upload. | Template validates successfully; bad data returns clear row errors. |
| A16 | Gift Set | Back navigation from gift set edit is slow. | Profile route behavior and remove avoidable blocking fetch/render. | Back action returns promptly without reload-like lag. |
| A17 | Gift Set | Gift set feature does not model bundled products. | Either implement real product bundling or hide/demote feature. | Gift set can attach products and explain storefront output, or no longer appears as active feature. |
| A18 | Category | Category layout needs review. | Standardize layout after P0/P1. | Category management is usable on desktop and mobile. |
| A19 | Collections Nav | Collections accordion feels redundant. | Simplify sidebar if list page already handles add/list. | Collections nav has one obvious entry. |
| A20 | Collections | Functionality may not be wired. | Verify create/edit/assign/toggle/delete paths. | Collection smoke flow passes. |
| A21 | Collections | Page reloads slowly each revisit. | Add loading clarity and cache where safe. | Revisits feel responsive; stale data risk documented. |
| A22 | Collections | View vs edit action model is confusing. | Rename actions: `Edit Details`, `Assign Products`, `View Storefront Context` as applicable. | Staff can find product assignment without guessing. |

## P3 - Merchandising And Content

These need a wiring audit before implementation so we do not polish unused pages.

| ID | Area | Annotation | Decision | Verification |
| --- | --- | --- | --- | --- |
| A27 | Hero Content | Mobile preview should look like a real mobile preview. | Replace simple image block with phone-frame preview. | Mobile preview communicates crop/responsive behavior. |
| A28 | Bulk Image Upload | Need gallery/recent uploads if not too big. | Prefer recent uploads list if API exists; avoid full gallery unless necessary. | Uploaded assets are easier to find, or feature is documented as utility-only. |
| A29 | Banner | May duplicate Hero Content. | Map to storefront usage; merge/hide if duplicate. | Admin page has a clear frontend surface. |
| A30 | Marketing Banner | Purpose unclear. | Map to storefront usage; rename, merge, or hide. | Page purpose is obvious or removed from navigation. |
| A31 | Home About Section | Content management is scattered and may not be wired. | Create content-surface map; wire only retained sections. | Frontend consumes admin-managed content or page is hidden. |
| A32 | Testimonials | Should render on frontend. | Verify and wire testimonials to storefront if retained. | Active testimonial appears on frontend. |
| A33 | Trending/Marketing Popup | Purpose unclear. | Map usage; hide if not used. | No confusing unsupported popup admin remains. |
| A34 | Blog | External links and full content need beautiful rendering. | Support clean internal article rendering and external-link behavior. | Blog detail renders correctly on storefront. |
| A35 | Static Pages | Old dashed domain/email appears. | Replace with current `nungudiamonds.co.za` information. | Static page content no longer references outdated dashed domain/email. |

## P4 - Configuration And Integrations

These are important, but should not interrupt P0/P1 unless directly blocking handover.

| ID | Area | Annotation | Decision | Verification |
| --- | --- | --- | --- | --- |
| A06 | Payments | Client uses Yoco. | Add Yoco only after verifying checkout integration path. | Yoco config is consumed by checkout or documented as future work. |
| A24 | FX Rates | Approval wording may be false. | Remove approval language unless workflow exists. | Page no longer advertises unsupported approval process. |
| A25 | FX Rates | Info cards may not be necessary. | Keep only information that matches real behavior. | Rates page copy is accurate and lean. |
| A36 | User Management | Adding user may not grant admin access. | Verify auth flow and relabel/fix accordingly. | New user access behavior is proven or page copy corrected. |
| A37 | Email Setup | Mail config usefulness unclear. | Verify backend usage and whether it can support enquiry replies. | Mail config either powers workflow or is hidden/documented. |
| A38 | Instagram ID | Purpose unclear. | Verify usage; hide if not consumed. | No unsupported config page remains visible. |

## Current Execution Plan

1. Document this triage and keep it updated as items close.
2. Fix P0 route/runtime failures: A02, A01, A05, A23, A26, A00.
3. Verify data loading truth: A03, A07, A20.
4. Implement sales lead workflow: A07, A08, A09, then dashboard shortcut. Complete; dashboard now surfaces recent open general enquiries from the live enquiry API.
5. Implement customer-centered cart/wishlist improvements: A04, A05b.
6. Complete catalog workflow polish: A10-A22.
7. Audit and rationalize merchandising/content pages: A27-A35.
8. Audit configuration/integration pages: A06, A24, A25, A36-A38.
9. Run final quality gates: typecheck, build, route smoke, catalog smoke, Browser Use route sweep.

## Verification Blockers

- Browser Use is installed and the `iab` runtime is usable for the active Codex browser pane. Earlier pane-attachment failures are no longer current as of the cart-route verification pass.
- Storefront dependency installation/build is blocked by runtime compatibility. The storefront depends on Next 12 and `canvas@2.11.2`; dependency install failed under Node 25, and the bundled Codex Node runtime is Node 24.14.0. Use Node 18/20 before rerunning storefront build/browser verification.
- Local generated artifacts from the failed storefront install/typecheck attempt are intentionally not deleted in this pass because local deletion requires action-time confirmation. Review `tcctechweb-nungu-main/install.log` and `tcctechweb-nungu-main/tsconfig.tsbuildinfo` before cleanup.

## Completion Log

- 2026-05-03: Created annotation triage source of truth from browser review comments.
- 2026-05-03: P0 stability pass started.
  - A01 dashboard revenue no longer formats missing values as `NaN`; missing totals render as `0`/`0.00`.
  - A02 custom chip now tolerates MUI `default` and unknown colors, removing the orders runtime overlay source.
  - A05 cart and wishlist view actions now route to the existing admin product view instead of the old public Vercel product URL.
  - A23 FX Rate page no longer calls missing `/fx-rate` API routes and now states that the feature is not wired to the current API.
  - A24/A25 unsupported approval/live-pricing copy was replaced with accurate handover-gap wording.
  - A26 Diamond Rates page no longer calls missing `/diamond/quality-matrix` or `/diamond/shape-multipliers` API routes and now states that backend support is missing.
  - `attribute/goldKT/list` dropdown service was corrected from GET to POST for the actual API contract.
  - Verification: targeted ESLint passed on edited files, `npm run typecheck` passed, `npm run smoke:routes` passed for 63 routes, and `npm run build` passed.
  - Browser Use check confirmed `/dashboard/`, `/orders/orders-list/`, `/business-section/cart-product/`, `/rates/fx-rate/`, and `/rates/diamond-rates/` no longer showed runtime overlays or `NaN` before the browser pane became unavailable for the final recheck.
- 2026-05-03: Sales operations pass started.
  - A03 Order Transactions now exposes explicit load errors and a truthful empty state, instead of leaving `No rows` ambiguous.
  - A07 Product Enquiries now presents itself as a sales-lead queue, adds a visible follow-up status column, and relabels the existing `admin_action`/`admin_comments` update drawer as `Needs follow-up` / `Handled`.
  - A08 General Enquiries drawer was renamed from `View Review` to `Enquiry Details` and now surfaces customer identity, email/call actions, and the full message in a clearer layout.
  - A09 General Enquiries now truthfully warns that handled/contacted/owner tracking is not backed by the current API, keeping the gap visible instead of implying a feature exists.
  - Shared data table empty states can now use page-specific messages.
  - Verification: targeted ESLint on the edited table/enquiry/transaction files passed with no warnings; `npm run typecheck` passed.
  - A04/A05b Cart Products and Wishlist Products now group records by customer and open a customer-interest drawer instead of showing a flat product list.
  - A05b Cart/Wishlist drawers now include direct `Open Customer Profile` and `View Product` actions.
  - API cart/wishlist list responses now include `customer_id` so admin pages can link to the real customer profile.
  - Verification: admin targeted ESLint passed, admin `npm run typecheck` passed, and API `npm run build` passed.
- 2026-05-06: General enquiry workflow upgraded from documented gap to persisted CRM-lite tracking.
  - A09 General Enquiries now persists lead status, follow-up notes, handled-by, and handled-at values through `enquiries/general/update`.
  - The admin General Enquiries page now exposes lead status in the table, shows follow-up metadata in the detail drawer, and includes an `Update Follow-Up` drawer for status/notes updates.
  - The API merges persisted tracking fields into `GET /enquiries/general` responses in both route versions without requiring an enquiry-table migration.
  - Verification: API `npm run build` passed, admin `npm run typecheck` passed, live API GET/POST persistence was checked against `http://localhost:2511/api/v2/enquiries/general`, and Browser Use verified the admin route plus update drawer on `http://127.0.0.1:3000/enquiries/general-enquiries/`.
- 2026-05-06: Dashboard lead shortcut completed.
  - The dashboard now includes a `Lead Follow-Up Queue` card backed by `GET /enquiries/general`, showing recent open general enquiries and a direct route to the General Enquiries workflow.
  - Verification: admin `npm run typecheck` passed; Browser Use verified `/dashboard/` contains the lead card with no runtime overlay and no `NaN`; live API GET confirmed lead tracking fields are present in the response.
- 2026-05-06: Final admin quality-gate pass for roadmap pages.
  - Verification: `npm run smoke:routes` passed for 61 sidebar routes; admin `npm run build` passed; Browser Use verified dashboard, enquiries, cart/wishlist, collections, product, bulk upload, rates, payment, and email setup pages render expected content with no runtime overlays or captured page errors.
  - Remaining non-blocking code quality note: `next build` still reports pre-existing `react-hooks/exhaustive-deps` warnings across older attribute/settings/content pages. These should be cleaned up in a separate warning-reduction pass because they are broad legacy patterns rather than a single roadmap feature.
- 2026-05-03: Catalog workflow pass started.
  - A10 Trending was audited against the storefront and API. It is consumed by `product/trending/list`, so the admin control is real and should remain.
  - A11 Quick Add typography no longer uses a one-off `Canela Text Trial` heading inside the form; it now follows the admin typography system.
  - A13 Quick Add purchase, metal, and diamond guidance alerts are dismissible and persist dismissal in `localStorage`.
  - A14 Quick Add final pricing actions now stack responsively instead of squeezing `Back`, `Reset`, publish state, and create action into one cramped row.
  - Verification: targeted ESLint on `SimplifiedProductForm` and All Products passed with no warnings; `npm run typecheck` passed.
  - A15 Bulk Upload now generates the template from the backend parser column order instead of downloading a stale S3 sample.
  - A15 Bulk Upload instructions now state that `name` and `category` are required, optional fields can be blank, and Excel imports must preserve column order because the parser reads cells by position.
  - Verification: targeted ESLint on `EnhancedBulkUpload` passed with no warnings; `npm run typecheck` passed.
  - A16 Gift Set back navigation now routes explicitly to the list page instead of depending on browser history.
  - A16 Gift Set list no longer re-fetches repeatedly through a pagination state loop.
  - A17 Gift Set has been demoted to `Legacy Gift Products` in navigation and page copy because the API stores standalone `gift_set_products`, not bundles of existing catalog products.
  - A17 Gift Product list/form now warn that this is not a product bundle builder, preventing handover confusion.
  - Verification: targeted ESLint on gift-product pages and navigation passed with no warnings; `npm run typecheck` passed.
  - A19 Collections navigation is now a single direct `Collections` entry because the list page already exposes add and assign actions.
  - A20 Collections wiring was verified against admin/API routes: create, edit, status, delete, assign, remove, and product-by-collection routes exist.
  - A21 Collections list now hydrates from a session cache while refreshing API data, reducing the blank revisit experience without hiding stale-data risk.
  - A22 Collection actions now use explicit tooltips: eye means `Assign / Review Products`, pencil means `Edit Collection Details`, and the page explains this above the table.
  - A22 Collection product assignment pages now navigate explicitly back to the collections list instead of depending on browser history.
  - Verification: targeted ESLint on collection pages, shared table, and navigation passed with no warnings; `npm run typecheck` passed.
- 2026-05-03: Merchandising/content and configuration truthfulness pass started.
  - A27 Hero Content mobile preview now uses a phone-frame crop preview instead of a generic side-by-side block.
  - A28 Bulk Image Upload now explicitly labels itself as a utility uploader, not a media gallery, so handover expectations are accurate.
  - A29/A30/A33 Banner, Marketing Banner, and Marketing Popup pages now explain their storefront surfaces instead of appearing as duplicate/undefined banner tools.
  - A31 Home About Section now states that it manages homepage content blocks and should be verified on the storefront after edits.
  - A32 Testimonials now warns that the current storefront carousel still uses static testimonial data, so admin-managed testimonials need a storefront wiring pass before being promised as live.
  - A35 Source-level hardcoded dashed-domain references were replaced with `nungudiamonds.co.za` and `info@nungudiamonds.co.za` in the main storefront source where found. Database-authored static page content still needs to be corrected through the admin static page editor if stale content is stored in production data.
  - A06 Payments page now surfaces the real Yoco backend integration and marks PayPal/Stripe forms as legacy placeholders that do not affect checkout.
  - A36 User Management now explains that adding a user creates backend admin access when a role/password are provided.
  - A37 Email Setup now warns that transactional email is controlled by API environment/company info, not the placeholder form.
  - A38 Instagram ID is removed from the sidebar and the legacy page now warns that Company Info is the relevant social-link source.
- 2026-05-03: Remaining annotation items converted into implementation ledger.
  - A12 Quick Add purchase-mode switches were replaced with a truthful `Storefront Purchase Flow` note because the current product API/admin payload does not persist those modes.
  - A18 Category Management received a layout pass with a page header, category-tree context, safer parent assignment, a non-submitting cancel action, and clearer `Searchable` wording.
  - A32 Testimonials now exposes active records through `GET /testimonial/list/user` in both API route sets, and the main storefront carousel fetches admin-managed testimonials with static fallback.
  - A34 Storefront blog detail rendering now handles missing titles/images, adds safe external-link attributes, and improves article HTML readability.
  - Verification: admin targeted ESLint passed for the edited Quick Add, Category, and Testimonial admin files; admin `npm run typecheck` passed; API `npm run build` passed.
  - Storefront verification is currently blocked by dependency installation under the available Node runtimes: Node 25 failed against `canvas@2.11.2`, and the bundled Node runtime is Node 24.14.0. Use a project-compatible Node 18/20 runtime before treating storefront build verification as complete.
  - Admin `npm run build` passed after the latest Quick Add, Category, Testimonials, and triage-document updates. The build still reports pre-existing hook-dependency warnings across older admin pages, but it compiles successfully.
  - Admin `npm run smoke:routes` passed for 61 navigation routes after the latest changes.
  - Browser Use verification was blocked at the time of this pass by the current Codex desktop browser-pane attachment state.
  - A29/A30/A31/A33 were code-traced against the storefront: homepage banner uses `user/banner`, marketing banner uses `user/marketing/banner`, marketing popup uses `user/marketing/popup`, and Home About uses `user/homeAndAbout/section`.
- 2026-05-03: Local admin runtime stabilization pass.
  - Default admin `npm run dev` now starts Next with Watchpack/Chokidar polling, preventing the macOS `EMFILE: too many open files, watch` failure that left frontend pages partially loaded.
  - Admin `next.config.js` now explicitly ignores generated and dependency directories from webpack watch processing.
  - Protected routes no longer hang forever on the global spinner when stale `userData` exists without an access token. Missing tokens clear stale user data and redirect to login; local non-production login bypass still works when explicitly enabled.
  - Verification: admin dev server restarted with polling and compiled `/business-section/cart-product/` without EMFILE errors; `npm run typecheck` passed; Browser Use confirmed the cart page renders the `Cart Products` header/table empty state with no runtime overlay or spinner when local login bypass is enabled.
- 2026-05-03: Customer/activity/email follow-up annotation pass.
  - Customer profile details no longer render seeded demo metrics. The API now returns `total_orders` from the linked app-user order records, and the admin profile displays one consistent order count.
  - Customer profile layout was simplified into a readable profile/header/details view with real status, phone, join date, and sales-context copy.
  - Cart/Wishlist customer-interest tables now hydrate from a short-lived `sessionStorage` cache while refreshing API data, reducing blank revisits for these slow-loading grouped tables.
  - Email Setup is no longer a placeholder-only form. The API exposes authenticated `GET/PUT /email-config` routes in both route sets, persists SMTP/subscription values in `system_configurations`, and transactional mail reads the saved configuration with environment fallback.
  - Email passwords are write-only in the admin UI: the page shows whether a password exists and leaves the saved value unchanged when the field is blank.
  - Verification: admin targeted ESLint passed for customer details, customer-interest tables, and email setup; admin `npm run typecheck` passed; admin `npm run build` passed; API `npm run build` passed; admin `npm run smoke:routes` passed for 61 routes.
  - Browser Use verified `/customer/customers-details/?id=69`, `/business-section/wishlist-product/`, and `/web-config-api/email-setup/` render without runtime overlays. The customer page no longer contains the annotated `568`/`10` contradiction, and the email page no longer contains the old placeholder warning.
- 2026-05-03: Browser route-load audit pass.
  - Browser Use navigated all 61 sidebar navigation routes after the follow-up fixes.
  - Result: 61/61 routes loaded without runtime overlays, 404 pages, or captured browser console errors.
  - Slowest observed routes in this local pass were `/attribute/gender-for-filter`, `/attribute/Metal/Metal-Group-Master`, `/frontend/banner`, `/country-master/Country`, and `/settings/currency-master`.
  - This pass confirms route-load stability only. Functional wiring still needs deeper CRUD/workflow checks by section, especially settings/attributes, content publishing, orders, enquiries, and role/user access.
- 2026-05-03: Operations follow-up browser verification pass.
  - Local admin login bypass now seeds the same public API token used by service fallback, so development browser sessions load real API data instead of appearing authenticated but empty.
  - Shared `TccDataTable` now guards non-array `rows`, assigns safe unique column fields, supports page-specific empty copy, and accepts a loading state.
  - Customer List and General Enquiries now show table loading state during slow API hydration instead of flashing a false `No rows` state.
  - Browser Use verified `/customer/customers-details/?id=69`: the profile now shows one consistent `0 Total orders` value and no longer contradicts itself with the previous `568`/`10` mismatch.
  - Browser Use verified `/business-section/wishlist-product/` and `/business-section/cart-product/`: grouped customer rows load, the row detail drawer opens, and the drawer exposes `Open Customer Profile` plus `View Product` actions.
  - Browser Use verified `/enquiries/general-enquiries/`: live enquiry rows load, the detail drawer opens, and email/call actions are visible.
  - Browser Use verified `/orders/orders-list/`, `/business-section/order-transactions/`, and `/payments/payment/` load without overlays. Orders are currently empty for the default last-month filter; transactions are a true empty state; payments truthfully documents Yoco/backend behavior and PayPal/Stripe legacy placeholders.
  - Verification: targeted ESLint passed for `AuthContext`, `TccDataTable`, Customer List, and General Enquiries; `npm run typecheck` passed; `npm run smoke:routes` passed for 61 routes.
- 2026-05-03: Catalog, attributes, content, settings browser audit pass.
  - Browser Use rechecked `/product/add-products` after removing a legacy React key warning in the mapped category selector block. The route now loads cleanly.
  - Browser Use verified the main catalog routes load: All Products, Quick Add Product, Bulk Upload, Legacy Gift Products, Legacy Product Workspace, Category Management, and Collections.
  - Browser Use verified 20 attribute/metal routes load without runtime overlays or captured application console errors.
  - True-empty attribute/settings tables remain for Head, Shank, Metal Group Master, Setting Carat Weight, and Currency Master. These are not route failures, but they need client/data decisions before promising those admin surfaces as meaningful.
  - Shared table empty copy now says `No records found. Use the add action above if this table should contain data.` instead of the ambiguous `No rows`.
- 2026-05-04: Bulk upload completion pass.
  - A15 Bulk Upload now accepts common browser MIME variants for `.csv`, `.xlsx`, and `.xls` files in both the admin frontend and API validation paths, avoiding the false `too many files` / unsupported-type experience for valid CSV templates.
  - A15 generated template evidence: Browser Use loaded `/product/product-bulk-upload/file-import/`, found the unique `Download Template` action, clicked it, stayed on the Bulk Upload page, and saw no runtime overlay.
  - A15 API evidence: `POST /api/v2/product-csv/validate` accepted `artifacts/bulk-upload-template-smoke.csv` and returned `validation_success` with `total_rows: 1`, `valid_rows: 1`, and `error_rows: 0`.
  - Verification: API `npm run build` passed; admin `npm run lint` passed with only pre-existing hook-dependency warnings; admin `npm run typecheck` passed.
  - Browser Use verified Rates pages now load with accurate read-only/backend-gap copy; content/merchandising pages load with their current explanatory copy; Role/User Management and Email Setup load without overlays.
  - Verification: targeted ESLint passed for `TccDataTable`, Category Management, and Legacy Product Workspace; `npm run typecheck` passed; `npm run smoke:routes` passed for 61 routes; `npm run build` passed. Build still reports pre-existing hook-dependency warnings across legacy pages, but compilation succeeds.
- 2026-05-03: Safe functional workflow sampling pass.
  - Restarted the admin dev server after the production build because the in-app browser had stale/blank asset state. Dev restarted successfully with polling enabled.
  - Browser Use verified the All Products inactive filter visibly returns inactive products, confirming the queue filter is functional at least for that state.
  - Browser Use verified the Collections `Assign Products` action opens the assignment workspace and lists products for assignment.
  - Browser Use verified Email Setup loads the real SMTP/subscription form without the old placeholder warning. The save flow was not submitted because that would write persisted mail configuration.
  - Browser Use verified the shared empty table copy on Currency Master.
- 2026-05-04: Remaining browser-pending closure pass.
  - A20 Collections was closed from Browser Use evidence: `/collections/collections-list/`, `/collections/assign-products/`, and `/collections/add-collection/` loaded without runtime overlays, with the intended list/add/assign affordances visible.
  - A32 Testimonials was closed from API and storefront evidence: `GET /api/v2/testimonial/list/user` returns the active admin testimonial, and Browser Use verified the storefront homepage renders `Client Testimonials` with the admin-managed `aad` record and `asdadadasd asdassad` text.
  - A34 Blog was closed from storefront evidence: Browser Use verified `/our-stories` renders the press/blog list and external press posts link outward instead of creating broken internal detail routes; internal article rendering remains supported by the hardened detail component for future hosted content.
  - A35 Static Pages was closed from API/admin evidence: API static-page reads and writes normalize `info@nungu-diamonds.co.za` and `nungu-diamonds.co.za` to the current `info@nungudiamonds.co.za` / `nungudiamonds.co.za`, and Browser Use verified the Privacy static-page editor no longer shows the dashed domain.
  - A37 Email Setup was closed from Browser Use evidence: the real API-backed SMTP/subscription form loads without the old placeholder warning; save-flow mutation remains intentionally untested without approved SMTP/test credentials.
  - Storefront dev verification now uses Node 20 and `NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:2511/api/v2/`; `next.config.js` ignores dependency/generated folders through the supported webpack watch hook to reduce local watcher pressure.
  - Final quality gates passed: admin `npm run typecheck`, admin `npm run smoke:routes`, admin `npm run build`, API `npm run build`, and storefront `NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:2511/api/v2/ npm run build` under Node 20.
  - Known non-blocking gate output: admin build still reports pre-existing hook-dependency warnings across legacy pages, and storefront build still reports stale Browserslist data. Both builds compile successfully.
- 2026-05-04: Storefront public-content stabilization pass.
  - Storefront media URL handling now has a shared `getMediaUrl` helper with a CDN fallback, so database-authored relative paths render against the live CloudFront media bucket even when `NEXT_PUBLIC_IMG_URL` is not set locally.
  - Storefront HTTP client now uses the local API endpoint in development when `NEXT_PUBLIC_REST_API_ENDPOINT` is missing, preventing an empty shell caused by undefined API base URLs.
  - Homepage bootstrap no longer depends on a render-time `setTimeout`/local variable gate, which could leave the public site stuck on a blank/spinner state after refresh.
  - Company info hydration now guards missing API data and parses the tax-list cookie from the correct key.
  - Footer links now filter missing or `undefined` path/title values, preventing broken `/undefined` navigation from appearing in public content.
  - Product cards now use the first matching image safely, resolve media paths through the shared helper, and avoid nested anchor markup from the previous card/link structure.
  - Verification: storefront `NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:2511/api/v2/ NEXT_PUBLIC_IMG_URL=https://dr2mfr65joexd.cloudfront.net/ npm run build` passed under Node 20; API `npm run build` passed; admin `npm run typecheck` passed; admin `npm run smoke:routes` passed for 61 routes; local `GET http://localhost:3001/` returned HTTP 200 with no `/undefined` or literal `undefined` strings in the rendered HTML.
