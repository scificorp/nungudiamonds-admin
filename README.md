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

Use `docs/HANDOVER_ENVIRONMENT_AND_VERIFICATION.md` for the current handover and deployment verification commands.
API-backed smokes must run only against local or QA data, never against production customer records.

## Handover Docs

- Admin audit and roadmap: `docs/ADMIN_PORTAL_HANDOVER_AUDIT_ROADMAP.md`
- Admin user guide: `docs/ADMIN_PORTAL_USER_GUIDE.md`
- Environment and verification: `docs/HANDOVER_ENVIRONMENT_AND_VERIFICATION.md`
