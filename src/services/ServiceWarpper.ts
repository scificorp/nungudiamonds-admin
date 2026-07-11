import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { localStorageUtils } from '../utils/localStorageUtils'
import { API_ENDPOINT, LOCAL_ADMIN_AUTHORIZATION_TOKEN, PUBLIC_AUTHORIZATION_TOKEN } from '../AppConfig'
import { isLocalAdminLoginDisabled } from '../configs/local-auth'
import { appConstant } from '../AppConstants'
import Router from 'next/router'

const publicReadPatterns = [
  '/hero-content/config',
  '/collections/active',
  '/collection/slug/',
  '/product/search/list',
  '/product/search/suggestions',
  '/product/list/user',
  '/product/featured/list',
  '/product/trending/list'
]

const isPublicReadRequest = (config: AxiosRequestConfig) => {
  const method = (config.method || 'get').toLowerCase()
  const url = config.url || ''

  if (method !== 'get') return false

  return publicReadPatterns.some(pattern => url.includes(pattern))
}

export function isValidResponse(resp: AxiosResponse): boolean {
  if (!resp || resp.status !== 200) return false
  const status = resp.data?.status
  const code = resp.data?.code

  return status === 1 || status === 'success' || code === 200 || code === '200'
}

const baseURL = API_ENDPOINT
const apiPrefix = '/api/'

export const CONFIG = Axios.create({
  baseURL: baseURL
})

CONFIG.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    let token = await localStorageUtils.getAccessToken()
    if (!token) {
      if (isLocalAdminLoginDisabled && LOCAL_ADMIN_AUTHORIZATION_TOKEN) {
        token = LOCAL_ADMIN_AUTHORIZATION_TOKEN
      } else if (isPublicReadRequest(config)) {
        token = PUBLIC_AUTHORIZATION_TOKEN
      }
    }

    const headers = (config.headers || {}) as Record<string, string>
    if (token) {
      headers.Authorization = `${token}`
    }
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    headers.Accept = '*/*'
    config.headers = headers

    return config
  } catch (e) {}

  return config
})

export const httpMethods = {
  GET: 'GET',
  POST: 'POST',
  POST_CONFIG: 'POST_CONFIG',
  PUT: 'PUT',
  PUT_CONFIG: 'PUT_CONFIG',
  DELETE: 'DELETE',
  GET_IMAGE: 'GET_IMAGE'
}

interface ServiceParams {
  url: string
  method: string
  data?: unknown
  config?: AxiosRequestConfig
}

export const serviceMaker = async <T = any>(
  paramsOrUrl: ServiceParams | string,
  method?: string,
  data: unknown = {},
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const params: ServiceParams =
    typeof paramsOrUrl === 'string'
      ? { url: paramsOrUrl, method: method || '', data, config }
      : paramsOrUrl

  const { url, method: resolvedMethod, data: resolvedData = {}, config: resolvedConfig = {} } = params

  try {
    let result: AxiosResponse
    const APIInstance = CONFIG
    switch (resolvedMethod) {
      case httpMethods.GET: {
        result = await APIInstance.get(url, resolvedData as AxiosRequestConfig)
        break
      }
      case httpMethods.POST: {
        result = await APIInstance.post(url, resolvedData)
        break
      }
      case httpMethods.POST_CONFIG: {
        result = await APIInstance.post(url, resolvedData as FormData, resolvedConfig as AxiosRequestConfig)
        break
      }
      case httpMethods.PUT: {
        result = await APIInstance.put(url, resolvedData)
        break
      }
      case httpMethods.PUT_CONFIG: {
        result = await APIInstance.put(url, resolvedData as FormData, resolvedConfig as AxiosRequestConfig)
        break
      }
      case httpMethods.DELETE: {
        result = await APIInstance.delete(url, resolvedData as AxiosRequestConfig)
        break
      }
      case httpMethods.GET_IMAGE: {
        result = await APIInstance.get(`${baseURL}${url}`, {
          responseType: 'arraybuffer'
        })
        break
      }
      default: {
        throw appConstant.INVALID_METHOD
      }
    }

    if (!isValidResponse(result)) {
      throw appConstant.INVALID_RESPONSE
    }

    return result.data
  } catch (err: unknown) {
    const error = err as { response?: { data?: { code?: number | string; message?: string }; status?: number }; message?: string }
    const errorCode = err instanceof Error && err.message === 'Network Error' ? 'Network Error' :
                      error?.response?.data?.code ?? error?.response?.status

    if (errorCode == 401 || errorCode == '401') {
      if (isLocalAdminLoginDisabled) {
        console.warn('Unauthorized response ignored while admin login disabled.')
      } else {
        localStorageUtils.removeAcessToken()
        localStorageUtils.removeUserInfo()
        Router.push('/login')
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }
    }
    throw new APIError({
      data: error.response?.data || {
        status: 'error',
        code: 500,
        message: 'Something went wrong',
        data: null
      }
    })
  }
}

export class APIError extends Error {
  data: { code?: number | string; message?: string; status?: string; data?: null }
  constructor(msg: { data: { code?: number | string; message?: string; status?: string; data?: null } }) {
    super(msg.data?.message || 'API Error')
    this.data = msg.data
  }
}
