// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback = null } = props
  const auth = useAuth()
  const router = useRouter()
  const loginDisabled = process.env.NEXT_PUBLIC_DISABLE_ADMIN_LOGIN === 'true' && process.env.NODE_ENV !== 'production'

  useEffect(
    () => {
      if (!router.isReady || loginDisabled || auth.loading) {
        return
      }

      if (auth.user === null) {
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, loginDisabled, auth.loading, auth.user]
  )

  if (loginDisabled) {
    return <>{children}</>
  }

  if (auth.loading || auth.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
