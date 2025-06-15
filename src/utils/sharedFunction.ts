import { CRYPTO_JS_IV, CRYPTO_JS_KEY } from 'src/AppConfig'
import { ORDER_PAGINATION_INITIAL_VALUE, PAGINATION_INITIAL_VALUE } from 'src/AppConstants'
import { ICommonOrderPagination, ICommonPagination} from 'src/data/interface'
import CryptoJS from 'crypto-js'

// const CryptoJS = require('crypto-js')

export const getQueryUrlFormPagiantion = (payload: ICommonPagination) => {
  let query = ''
  query += payload.current_page ? `current_page=${payload.current_page}&` : ''
  query += payload.per_page_rows ? `per_page_rows=${payload.per_page_rows}&` : ''
  query += payload.order_by ? `order_by=${payload.order_by}&` : ''
  query += payload.sort_by ? `sort_by=${payload.sort_by}&` : ''
  query += payload.search_text ? `search_text=${payload.search_text}&` : '&'

  return query.length > 0 ? query.slice(0, -1) : query
}

export const getQueryUrlOrderPagiantion = (payload: ICommonOrderPagination) => {
  let query = ''
  query += payload.current_page ? `current_page=${payload.current_page}&` : ''
  query += payload.per_page_rows ? `per_page_rows=${payload.per_page_rows}&` : ''
  query += payload.order_by ? `order_by=${payload.order_by}&` : ''
  query += payload.sort_by ? `sort_by=${payload.sort_by}&` : ''
  query += payload.order_status ? `order_status=${payload.order_status}&` : '&'
  query += payload.start_date ? `start_date=${payload.start_date}&` : null
  query += payload.end_date ? `end_date=${payload.end_date}&` : null

  return query.length > 0 ? query.slice(0, -1) : query
}

export const createPagination = (payload?: ICommonPagination) => {
  return {
    current_page: payload?.current_page || PAGINATION_INITIAL_VALUE.current_page,
    per_page_rows: payload?.per_page_rows || PAGINATION_INITIAL_VALUE.per_page_rows,
    order_by: payload?.order_by || PAGINATION_INITIAL_VALUE.order_by,
    sort_by: payload?.sort_by || PAGINATION_INITIAL_VALUE.sort_by,
    total_pages: payload?.total_pages || PAGINATION_INITIAL_VALUE.total_pages,
    total_items: payload?.total_items || PAGINATION_INITIAL_VALUE.total_items
  }
}

export const createOrderPagination = (payload?: ICommonOrderPagination) => {
  return {
    current_page: payload?.current_page || ORDER_PAGINATION_INITIAL_VALUE.current_page,
    per_page_rows: payload?.per_page_rows || ORDER_PAGINATION_INITIAL_VALUE.per_page_rows,
    order_by: payload?.order_by || ORDER_PAGINATION_INITIAL_VALUE.order_by,
    sort_by: payload?.sort_by || ORDER_PAGINATION_INITIAL_VALUE.sort_by,
    total_pages: payload?.total_pages || ORDER_PAGINATION_INITIAL_VALUE.total_pages,
    total_items: payload?.total_items || ORDER_PAGINATION_INITIAL_VALUE.total_items
  }
}

export const getEncryptedText = (text: string) => {
  const encryptedData = CryptoJS.AES.encrypt(text, CRYPTO_JS_KEY, {
    iv: CryptoJS.enc.Utf8.parse(CRYPTO_JS_IV),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString()

  return encryptedData
}

export const getDecryptedText = (text: string) => {
  const descryptedText = CryptoJS.AES.decrypt(text, CRYPTO_JS_KEY, {
    iv: CryptoJS.enc.Utf8.parse(CRYPTO_JS_IV),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString(CryptoJS.enc.Utf8)

  return descryptedText
}

export const getPriceFormat = (price: any) => {

  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}