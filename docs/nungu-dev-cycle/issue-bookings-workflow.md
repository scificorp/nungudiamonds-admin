## Scope

Build the bookings workflow around calendar visibility, appointment status, and customer/admin communications.

## Repos

- Primary admin UI: `scificorp/nungudiamonds-admin`
- Primary API/email/calendar work: `scificorp/nungudiamonds-api`
- Storefront consumer if booking form changes: `scificorp/nungudiamonds-web`

## Deliverables

- Calendar view for bookings.
- Booking list/status workflow: new, confirmed, completed, no-show, cancelled where supported.
- Notes field or documented API gap.
- Booking email template fixes with correct placeholders.
- Calendar links: ICS and Outlook/Google links where supported.
- Outlook Graph integration only after credentials and tenant approval are confirmed.

## Gates

- Admin `npm run typecheck`
- API `npm run build`
- Email template smoke with safe test values or dry-run output
- Browser proof for booking calendar/list routes
- External calendar proof only when safe credentials are available

## Current Proof Status

Status: `release-branch-ready`

Proof refs:

- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-5-bookings-admin-typecheck.json`
- `docs/nungu-dev-cycle/proof/local/2026-07-17/admin-5-bookings-api-build.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-5-vps-qa-bookings-api.json`
- `docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-5-vps-qa-admin-build.json`

Review refs:

- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-5-review-round-1.md`
- `docs/nungu-dev-cycle/reviews/2026-07-17-admin-5-review-round-2.md`

QA-local integrated proof is complete:

- QA environment proof ref: `docs/nungu-dev-cycle/proof/qa/2026-07-16/api-qa-local-vps-provisioned.json`
- API base URL: `http://127.0.0.1:2512`
- DB: `nungu_diamond_qa` on `127.0.0.1:55433`
- Mail sending: suppressed through `MAIL_SUPPRESS_SEND=true`

The QA API workflow proof used disposable booking data in `nungu_diamond_qa` and verified:

- Public booking creation through `POST /user/general/enquiries`.
- Booking appointment date, time, occasion, budget, source, and enquiry type persisted.
- Admin general enquiry list returned the booking with appointment and lead follow-up fields.
- Admin follow-up update persisted status and notes through `POST /enquiries/general/update`.
- No production database or production credentials were used.

Implementation notes:

- The public booking path now allows unauthenticated booking creation without requiring `session_res.id_app_user`.
- Appointment email formatting now handles Sequelize Date values as well as string dates.
- External Outlook/Google calendar sync remains blocked until safe credentials and tenant approval are available.

QA promotion gate:

```bash
python3 tools/nungu-dev-cycle/check-promotion-gate.py \
  --issue GH-5 \
  --stage qa \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-17/admin-5-bookings-admin-typecheck.json \
  --proof-ref docs/nungu-dev-cycle/proof/local/2026-07-17/admin-5-bookings-api-build.json \
  --qa-proof-ref docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-5-vps-qa-bookings-api.json \
  --qa-proof-ref docs/nungu-dev-cycle/proof/qa/2026-07-17/admin-5-vps-qa-admin-build.json \
  --review-ref docs/nungu-dev-cycle/reviews/2026-07-17-admin-5-review-round-1.md
```

Result: `passed`.

Release readiness:

- Release entry: `docs/nungu-dev-cycle/releases/2026-07-17-gh-5-bookings-release-entry.md`
- Rollback note: `docs/nungu-dev-cycle/rollbacks/2026-07-17-gh-5-bookings-rollback.md`
- Release-branch promotion gate: `passed`.

## Acceptance

- Staff can see upcoming bookings and their state.
- Customers/admins receive correct booking information in email output.
- Unsupported calendar sync capabilities are clearly marked as blocked, not half-wired.
