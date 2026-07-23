# MacBook Handoff: Admin #6 QA Variant Proof

Date: 2026-07-16
Issue: `https://github.com/scificorp/nungudiamonds-admin/issues/6`
Depends on: `https://github.com/scificorp/nungudiamonds-api/issues/12`

## Objective

Run integrated admin browser/API proof for variant add/edit/status against QA-local only.

## QA Target

- Admin URL: `http://127.0.0.1:3000`
- API URL: `http://127.0.0.1:2512/api/v2/`
- DB: `nungu_diamond_qa`
- DB identity: `nungu_diamond_qa|127.0.0.1|55433`
- Mail sending: suppressed

## Stop Conditions

- Do not point admin to production API or production DB.
- Do not use production credentials.
- Do not run proof if the API base URL is not `http://127.0.0.1:2512/api/v2/`.
- Do not send live email, payment, SMS, or customer notifications.
- If QA-local lacks product/category/tag seed data, stop and report the seed blocker rather than using production.

## Setup

1. Confirm API QA-local is running:

   ```bash
   curl -i http://127.0.0.1:2512/api/v2/hero-content/config
   ```

   Expected: HTTP `200`.

2. In the admin release repo, confirm QA env shape:

   ```bash
   cat .env.qa-local.example
   ```

3. Start admin against QA-local:

   ```bash
   PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run dev:qa-local
   ```

4. Open:

   ```text
   http://127.0.0.1:3000/product/add-products/
   ```

## Proof Steps

Use a disposable QA product only.

1. Load a parent product that has enough category/tag data for variant creation.
2. Open Variant Management.
3. Add a child variant with:
   - unique QA SKU
   - size/option label
   - making/finding/other charges
   - optional metal component only if dropdown data exists
4. Confirm the API save succeeds.
5. Reload the parent product and confirm the child variant appears.
6. Edit the child variant metadata and confirm the change reloads.
7. Toggle variant active/inactive and confirm the API call succeeds.
8. Capture screenshots or browser notes for:
   - variant list before
   - add dialog
   - saved variant in list
   - edited variant after reload
   - status toggle result

## Expected Result

- Variant create succeeds against QA DB.
- Parent product remains parent.
- Child variant persists and reloads.
- Edit persists and reloads.
- Status toggle uses `id_product` and succeeds.
- No production systems touched.

## Return Proof

Post back to Admin #6 with:

- Commands run.
- API/admin URLs used.
- Product id/SKU used, only QA disposable data.
- Screenshots or concise browser proof notes.
- Pass/fail for create, reload, edit, status toggle.
- Any seed-data blockers.

If proof passes, add a QA proof receipt under:

```text
docs/nungu-dev-cycle/proof/qa/2026-07-16/admin-6-variant-qa-proof.json
```
