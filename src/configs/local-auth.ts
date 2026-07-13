import { LOCAL_ADMIN_AUTHORIZATION_TOKEN } from 'src/AppConfig'

/**
 * The login bypass is a local development convenience only.
 * It must require an explicit local token as well as a non-production build.
 */
export const isLocalAdminLoginDisabled =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_DISABLE_ADMIN_LOGIN === 'true' &&
  Boolean(LOCAL_ADMIN_AUTHORIZATION_TOKEN)
