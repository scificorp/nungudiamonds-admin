// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'
import { PUBLIC_AUTHORIZATION_TOKEN } from 'src/AppConfig'

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types'
import { localStorageUtils } from 'src/utils/localStorageUtils'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const loginDisabled = process.env.NEXT_PUBLIC_DISABLE_ADMIN_LOGIN === 'true' && process.env.NODE_ENV !== 'production'

const guestStorageUser = {
  id: 0,
  role: 'admin',
  password: 'guest',
  fullName: 'Guest Admin',
  username: 'guest',
  email: 'guest@nungu.app',
  user_type: 'guest'
}

const guestAuthUser: UserDataType = {
  id: guestStorageUser.id,
  role: guestStorageUser.role,
  password: guestStorageUser.password,
  fullName: guestStorageUser.fullName,
  username: guestStorageUser.username,
  email: guestStorageUser.email
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  const applyGuestUser = () => {
    window.localStorage.setItem('userData', JSON.stringify(guestStorageUser))
    localStorageUtils.setAccessToken(PUBLIC_AUTHORIZATION_TOKEN, PUBLIC_AUTHORIZATION_TOKEN)
    localStorageUtils.setUserInfo(guestStorageUser)
    setUser(guestAuthUser)
  }

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setLoading(true)
      if (loginDisabled) {
        applyGuestUser()
        setLoading(false)
        
return
      }

      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        const userInfo = localStorageUtils.getUserInfo()
        if (userInfo) {
          window.localStorage.setItem('userData', JSON.stringify(userInfo))
          setUser({
            id: userInfo.id,
            role: 'admin',
            password: userInfo.pass_hash,
            fullName: userInfo.username,
            username: userInfo.username,
            email: userInfo.username
          })
        } else {
          setUser(null)
        }
      } else {
        localStorageUtils.removeUserInfo()
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    if (loginDisabled) {
      applyGuestUser()
      router.replace('/')
      
return
    }

    const userInfo = localStorageUtils.getUserInfo()
    if (userInfo) {
      window.localStorage.setItem('userData', JSON.stringify(userInfo))
      setUser({
        id: userInfo.id,
        role: 'admin',
        password: userInfo.pass_hash,
        fullName: userInfo.username,
        username: userInfo.username,
        email: userInfo.username
      })
    }
    const returnUrl = router.query.returnUrl;
    if (returnUrl && returnUrl != null) {
      router.replace(returnUrl as string)
    } else {
      router.replace("/" as string)
    }


    return
  }

  const handleLogout = () => {
    if (loginDisabled) {
      applyGuestUser()
      router.replace('/')
      
return
    }

    setUser(null)

    localStorageUtils.removeAcessToken()
    localStorageUtils.removeUserInfo()
    router.push('/login')
  }

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.registerEndpoint, params)
      .then(res => {
        if (res.data.error) {
          if (errorCallback) errorCallback(res.data.error)
        } else {
          handleLogin({ email: params.email, password: params.password })
        }
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null))
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
