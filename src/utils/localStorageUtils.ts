import Router from 'next/router'
import { publicRoutePath } from '../AppConstants'
import authConfig from 'src/configs/auth'

export const localStorageUtils = {
  setUserInfo: (userInfo: any) => {
    localStorage.setItem(authConfig.userDetails, JSON.stringify(userInfo))
    localStorage.setItem('userData', JSON.stringify(userInfo))
  },
  getUserInfo: () => {
    const userInfoStr = localStorage.getItem(authConfig.userDetails)
    const legacyUserInfoStr = localStorage.getItem('userData')
    const source = userInfoStr || legacyUserInfoStr
    let userInfo
    if (source) {
      userInfo = JSON.parse(source)
    } else {
      userInfo = undefined
    }

    return userInfo
  },
  removeUserInfo: () => {
    window.localStorage.removeItem(authConfig.userDetails)
    window.localStorage.removeItem('userData')
  },
  setAccessToken: (token: string, refreshToken: string) => {
    localStorage.setItem('tcc:accessToken', token)
    localStorage.setItem(authConfig.storageTokenKeyName, token)
    localStorage.setItem(authConfig.onTokenExpiration, refreshToken)
  },

  getAccessToken: () => {
    const token = localStorage.getItem(authConfig.storageTokenKeyName)
    if (token && token != '') {
      return token
    } else {
      return null

      return Router.push('/login')
    }
  },
  removeAcessToken: () => {
    localStorage.removeItem(authConfig.storageTokenKeyName)
  },
  setUserType: (user_type: string) => {
    localStorage.setItem('tcc:userType', JSON.stringify(user_type))
  },
  getUserType: () => {
    const userType = localStorage.getItem('tcc:userType')
    if (userType && userType != '') {
      return userType
    } else return ''
  }
}
