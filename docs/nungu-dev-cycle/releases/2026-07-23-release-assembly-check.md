# Release Assembly Check

Date: 2026-07-23

Scope: final release-branch assembly for the proved Nungu slices tracked in `docs/nungu-dev-cycle`.

## Environment

- QA database: `nungu_diamond_qa@127.0.0.1:55433`
- QA API: `NODE_ENV=qa-local`, `http://127.0.0.1:2512/api/v2`
- Mail sending: suppressed through QA-local configuration
- Production database and production credentials: not used

## Final Checks

- Admin `npm run typecheck`: passed
- Admin `npm run smoke:routes`: passed for 61 routes
- Admin `npm run build`: passed
- API `npm run build`: passed
- Storefront `NEXT_PUBLIC_REST_API_ENDPOINT=http://127.0.0.1:2512/api/v2/ npm run build`: passed
- API `npm run db:qa-local:bootstrap`: passed idempotently
- API `npm run proof:admin-variant-qa`: passed
- API `npm run proof:admin-operations-qa`: passed
- API `npm run proof:bookings-qa`: passed
- API `npm run proof:rates-qa`: passed
- API `npm run proof:cms-qa`: passed
- API `npm run proof:diamond-multitone-qa`: passed
- API `npm run proof:ecommerce-yoco-qa`: passed

## Notes

- In this Codex sandbox, detached `pg_ctl start` does not keep the QA database alive across command boundaries. The attached `npm run db:qa-local:serve` mode was used for final proof.
- Storefront `yarn.lock` verification drift was restored before assembly. The storefront release checkout is clean.
- WEB-12 remains a safety slice until QA Yoco sandbox credentials are provided for a live sandbox charge.
