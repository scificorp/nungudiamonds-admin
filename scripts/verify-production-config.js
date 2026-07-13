const isProductionBuild =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production' ||
  process.env.AWS_BRANCH === 'main' ||
  process.env.AWS_BRANCH === 'master'

if (!isProductionBuild) {
  console.log('Production config check skipped outside a production build.')
  process.exit(0)
}

const localLoginBypassEnabled = process.env.NEXT_PUBLIC_DISABLE_ADMIN_LOGIN === 'true'
const localAdminTokenPresent = Boolean(process.env.NEXT_PUBLIC_LOCAL_ADMIN_AUTHORIZATION_TOKEN)

if (localLoginBypassEnabled || localAdminTokenPresent) {
  console.error(
    'Production config rejected: local admin login bypass settings must not be enabled or supplied in production.'
  )
  process.exit(1)
}

console.log('Production config check passed.')
