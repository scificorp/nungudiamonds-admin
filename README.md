# Nungu Diamonds Admin

Admin portal for Nungu Diamonds catalog, order, merchandising, and configuration workflows.

## Local Setup

1. Start the API from `../tcctechapi-nungudiamonds`:

```sh
npm run dev
```

2. Start the admin portal:

```sh
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true npm run dev
```

3. Open `http://localhost:3000/dashboard/`.

## Required Local Environment

The admin expects these values in `.env.local`:

```sh
NEXT_PUBLIC_API_ENDPOINT=http://localhost:2511/api/v2/
NEXT_PUBLIC_IMG_ENDPOINT=https://d2yhu6nvl7lle6.cloudfront.net
NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true
```

`NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true` is guarded so it is ignored in production builds. Do not set it in production.

## Quality Gates

Run these before handover or deployment:

```sh
npm run lint:check
npm run typecheck
npm run smoke:routes
npm run smoke:auth
npm run smoke:catalog
npm run smoke:cms
npm run smoke:operations
npm run build
```

`smoke:catalog` uses the local API, creates a temporary catalog product, verifies image/status/collection operations, and deletes the smoke product by default. Set `KEEP_SMOKE_PRODUCT=true` only when you intentionally want to inspect the created product afterwards.

`smoke:auth`, `smoke:cms`, and `smoke:operations` are release gates for the admin-auth guard, static-page CMS, featured content, enquiries, status/follow-up, and other operations surfaces. Run the mutating API-backed smokes only against local or QA data, never against production customer records.

## Handover Docs

- Admin audit and roadmap: `docs/ADMIN_PORTAL_HANDOVER_AUDIT_ROADMAP.md`
- Admin user guide: `docs/ADMIN_PORTAL_USER_GUIDE.md`
- Environment and verification: `docs/HANDOVER_ENVIRONMENT_AND_VERIFICATION.md`
