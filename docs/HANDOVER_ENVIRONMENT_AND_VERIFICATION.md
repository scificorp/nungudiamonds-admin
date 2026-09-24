# Handover Environment And Verification

## Repositories

- Admin: `tcctechadmin-nungudiamonds`
- API: `tcctechapi-nungudiamonds`

The API must be running for the admin to load live catalog, order, collection, and dashboard data.

## Local Commands

API:

```sh
cd ../tcctechapi-nungudiamonds
npm run dev
```

Admin:

```sh
cd ../tcctechadmin-nungudiamonds
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true npm run dev
```

Use polling locally because this Next.js version can otherwise produce stale chunk errors after builds on this machine.

## Environment Variables

Admin local `.env.local`:

```sh
NEXT_PUBLIC_API_ENDPOINT=http://localhost:2511/api/v2/
NEXT_PUBLIC_IMG_ENDPOINT=https://d2yhu6nvl7lle6.cloudfront.net
NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true
```

Production:

```sh
NEXT_PUBLIC_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2/
NEXT_PUBLIC_IMG_ENDPOINT=https://d2yhu6nvl7lle6.cloudfront.net
NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN
```

Do not set `NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true` in production. The app guards this bypass so it only applies outside production.

## Verification Commands

Admin:

```sh
npm run lint:check
npm run typecheck
npm run test:permission-resilience
npm run smoke:routes
npm run smoke:auth
npm run smoke:catalog
npm run smoke:cms
npm run build
```

This section owns the current verification command list. Keep summaries in other docs as pointers to this section.

The build runs `verify:production-config` first. For a production release, run
the guard explicitly with `NODE_ENV=production`; it rejects the local login
bypass and local admin token before the Next.js build starts:

```sh
NODE_ENV=production npm run verify:production-config
```

The local bypass is enabled only when all three conditions hold: the build is
not production, `NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true`, and an explicit
`NEXT_PUBLIC_LOCAL_ADMIN_AUTHORIZATION_TOKEN` is present.

API:

```sh
npm run build
```

Live API smoke examples:

```sh
curl -iL -H 'Authorization: PUBLIC_AUTHORIZATION_TOKEN' 'http://localhost:2511/api/v2/dashboard'
curl -iL -H 'Authorization: PUBLIC_AUTHORIZATION_TOKEN' 'http://localhost:2511/api/v2/product?current_page=1&per_page_rows=1'
```

## Historical Verification Evidence

Full local baseline last verified on 2026-05-15. See `docs/MEETING_READINESS_2026-09-17.md` for the September 2026 release-candidate status.

- Admin `npm run typecheck`: passed.
- Admin `npm run lint:check`: passed with 79 legacy hook dependency warnings and 0 errors.
- Admin `npm run smoke:routes`: passed for 61 navigation routes.
- Admin `npm run build`: passed.
- API `npm run build`: passed.
- API dashboard smoke returned `code: 200` from `GET /api/v2/dashboard`.
- API product-list smoke returned `code: 200` and `total_items: 72` from `GET /api/v2/product?current_page=1&per_page_rows=1`.
- Admin runtime smoke returned HTTP `200` for `/dashboard/`.
- Admin `npm run smoke:catalog`: passed; created product `294`, checked image/status/featured/trending/collection operations, and deleted it.

## Known Follow-Up

- The admin repository has historical Git object corruption. For final client handover, create a clean repository from the current tree or repair history in a planned migration.
- ESLint still reports hook dependency warnings. They are not build-blocking errors, but should be triaged page by page when touching those legacy screens.
