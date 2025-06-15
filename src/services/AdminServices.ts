import { config } from 'process'
import { apiEndPoints } from 'src/AppConstants'
import { IBusinessUser, ICommonOrderPagination, ICommonPagination, IRoleConfiguration } from 'src/data/interface'
import { getEncryptedText, getQueryUrlFormPagiantion, getQueryUrlOrderPagiantion } from 'src/utils/sharedFunction'
import { httpMethods, serviceMaker } from './ServiceWarpper'

export const ADMIN_LOGIN = (payload: any) => serviceMaker(`${apiEndPoints.ADMIN_LOGIN}`, httpMethods.POST, payload)

export const GET_ALL_ROLES = () => serviceMaker(`${apiEndPoints.GET_ALL_ROLES}?no_pagination=1`, httpMethods.GET)

export const GET_ALL_MENU_ITEMS = () =>
  serviceMaker(`${apiEndPoints.GET_ALL_MENU_ITEMS}?no_pagination=1`, httpMethods.GET)

export const GET_ALL_ACTIONS = () => serviceMaker(`${apiEndPoints.GET_ALL_ACTIONS}?no_pagination=1`, httpMethods.GET)

export const ADD_ROLE_CONFIGURATION = (payload: IRoleConfiguration) =>
  serviceMaker(`${apiEndPoints.ADD_ROLE_CONFIGURATION}`, httpMethods.POST, payload)

export const GET_ROLE_CONFIGURATION = (id: number) =>
  serviceMaker(`${apiEndPoints.GET_ROLE_CONFIGURATION}/${id}`, httpMethods.GET)

export const UPDATE_ROLE_CONFIGRATION = (payload: IRoleConfiguration, id: number) =>
  serviceMaker(`${apiEndPoints.UPDATE_ROLE_CONFIGRATION}/${id}`, httpMethods.PUT, payload)

export const GET_ALL_BUSINESS_USER = (payload: ICommonPagination) =>
  serviceMaker(`${apiEndPoints.GET_ALL_BUSINESS_USER}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET)

export const GET_BUSINESS_USER_BY_ID = (id: number) =>
  serviceMaker(`${apiEndPoints.GET_BUSINESS_USER_BY_ID}/${id}`, httpMethods.GET)

export const ADD_BUSINESS_USER = (payload: FormData) =>
  serviceMaker(`${apiEndPoints.ADD_BUSINESS_USER}`, httpMethods.POST_CONFIG, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const UPDATE_BUSINESS_USER = (payload: FormData, id: number) =>
  serviceMaker(
    `${apiEndPoints.UPDATE_BUSINESS_USER}/${encodeURIComponent(getEncryptedText(id.toString()))}`,
    httpMethods.PUT_CONFIG,
    payload,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )

export const DELETE_BUSINESS_USER = (id: number) =>
  serviceMaker(
    `${apiEndPoints.DELETE_BUSINESS_USER}/${encodeURIComponent(getEncryptedText(id.toString()))}`,
    httpMethods.DELETE
  )

export const GET_ACCESS_MENU_ITEMS = () => serviceMaker(`${apiEndPoints.GET_ACCESS_MENU_ITEMS}`, httpMethods.GET)

export const BANNER_ADD = (payload: any) => serviceMaker(`${apiEndPoints.BANNER_ADD}`, httpMethods.POST_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const BANNER_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.BANNER_EDIT}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const BANNER_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.BANNER_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const BANNER_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.BANNER_DELETE}`, httpMethods.POST, payload);
export const BANNER_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.BANNER_STATUS}`, httpMethods.PUT, payload);

export const ADD_MARKETING_BANNER = (payload: any) => serviceMaker(`${apiEndPoints.ADD_MARKETING_BANNER}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const EDIT_MARKETING_BANNER = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_MARKETING_BANNER}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const GET_ALL_MARKETING_BANNER = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_MARKETING_BANNER}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_MARKETING_BANNER = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_MARKETING_BANNER}`, httpMethods.POST, payload);
export const STATUS_UPDATE_MARKETING_BANNER = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_MARKETING_BANNER}`, httpMethods.PUT, payload);

export const MAIN_CONTENT_HOME_ABOUT_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.MAIN_CONTENT_HOME_ABOUT_EDIT}`, httpMethods.PUT, payload)
export const GET_MAIN_HOME_ABOUT_SECTION = () => serviceMaker(`${apiEndPoints.GET_MAIN_HOME_ABOUT_SECTION}`, httpMethods.GET)
export const ADD_HOME_ABOUT_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.ADD_HOME_ABOUT_SECTION}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const EDIT_HOME_ABOUT_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_HOME_ABOUT_SECTION}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const GET_ALL_HOME_ABOUT_SECTION = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_HOME_ABOUT_SECTION}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_HOME_ABOUT_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_HOME_ABOUT_SECTION}`, httpMethods.POST, payload);
export const STATUS_UPDATE_HOME_ABOUT_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_HOME_ABOUT_SECTION}`, httpMethods.PUT, payload);

export const ADD_FEATURES_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.ADD_FEATURES_SECTION}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const EDIT_FEATURES_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_FEATURES_SECTION}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const GET_ALL_FEATURES_SECTION = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_FEATURES_SECTION}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_FEATURES_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_FEATURES_SECTION}`, httpMethods.POST, payload);
export const STATUS_UPDATE_FEATURES_SECTION = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_FEATURES_SECTION}`, httpMethods.PUT, payload);

export const ADD_COLOR = (payload: any) => serviceMaker(`${apiEndPoints.ADD_COLOR}`, httpMethods.POST, payload)
export const EDIT_COLOR = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_COLOR}`, httpMethods.PUT, payload);
export const GET_ALL_COLOR = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_COLOR}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_COLOR = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_COLOR}`, httpMethods.POST, payload);
export const STATUS_UPDATE_COLOR = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_COLOR}`, httpMethods.PUT, payload);

export const ADD_STATIC_PAGE = (payload: any) => serviceMaker(`${apiEndPoints.ADD_STATIC_PAGE}`, httpMethods.POST, payload)
export const EDIT_STATIC_PAGE = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_STATIC_PAGE}`, httpMethods.PUT, payload);
export const GET_ALL_STATIC_PAGE = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_STATIC_PAGE}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_STATIC_PAGE = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_STATIC_PAGE}`, httpMethods.POST, payload);

export const STATUS_UPDATE_STATIC_PAGE = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_STATIC_PAGE}`, httpMethods.PUT, payload);

export const CARAT_SIZE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.CARAT_SIZE_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const CARAT_SIZE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.CARAT_SIZE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const CARAT_SIZE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.CARAT_SIZE_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const CARAT_SIZE_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.CARAT_SIZE_DELETE}`, httpMethods.POST, payload);
export const CARAT_SIZE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.CARAT_SIZE_STATUS}`, httpMethods.PUT, payload);

export const METAL_TONE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.METAL_TONE_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const METAL_TONE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.METAL_TONE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const METAL_TONE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.METAL_TONE_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const METAL_TONE_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.METAL_TONE_DELETE}`, httpMethods.POST,payload);
export const METAL_TONE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.METAL_TONE_STATUS}`, httpMethods.PUT, payload);
export const METAL_TONE_MASTER = () => serviceMaker(`${apiEndPoints.METAL_TONE_MASTER}`, httpMethods.GET);

export const CURRENCY_ADD = (payload: any) => serviceMaker(`${apiEndPoints.CURRENCY_ADD}`, httpMethods.POST, payload);
export const CURRENCY_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.CURRENCY_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const CURRENCY_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.CURRENCY_EDIT}`, httpMethods.PUT,payload);
export const CURRENCY_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.CURRENCY_DELETE}`, httpMethods.POST,payload);
export const CURRENCY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.CURRENCY_STATUS}`, httpMethods.PUT, payload);
export const DEFAULT_CURRENCY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.DEFAULT_CURRENCY_STATUS}`, httpMethods.PUT, payload);

export const GOLD_KT_ADD = (payload: any) => serviceMaker(`${apiEndPoints.GOLD_KT_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const GOLD_KT_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GOLD_KT_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const GOLD_KT_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.GOLD_KT_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const GOLD_KT_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.GOLD_KT_DELETE}`, httpMethods.POST,payload);
export const GOLD_KT_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.GOLD_KT_STATUS}`, httpMethods.PUT, payload);
export const GOLD_KT_MASTER = () => serviceMaker(`${apiEndPoints.GOLD_KT_MASTER}`, httpMethods.GET);

export const SETTING_STYLE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_STYLE_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const SETTING_STYLE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.SETTING_STYLE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const SETTING_STYLE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_STYLE_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const SETTING_STYLE_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.SETTING_STYLE_DELETE}`, httpMethods.POST,payload);
export const SETTING_STYLE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_STYLE_STATUS}`, httpMethods.PUT, payload);

export const SHANKS_ADD = (payload: any) => serviceMaker(`${apiEndPoints.SHANKS_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const SHANKS_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.SHANKS_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const SHANKS_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.SHANKS_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const SHANKS_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.SHANKS_DELETE}`, httpMethods.POST,payload);
export const SHANKS_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.SHANKS_STATUS}`, httpMethods.PUT, payload);

export const HEADS_ADD = (payload: any) => serviceMaker(`${apiEndPoints.HEADS_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const HEADS_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.HEADS_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const HEADS_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.HEADS_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const HEADS_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.HEADS_DELETE}`, httpMethods.POST,payload);
export const HEADS_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.HEADS_STATUS}`, httpMethods.PUT, payload);

export const GEMSTONES_ADD = (payload: any) => serviceMaker(`${apiEndPoints.GEMSTONES_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const GEMSTONES_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GEMSTONES_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const GEMSTONES_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.GEMSTONES_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const GEMSTONES_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.GEMSTONES_DELETE}`, httpMethods.POST,payload);
export const GEMSTONES_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.GEMSTONES_STATUS}`, httpMethods.PUT, payload);

export const DIAMOND_SHAPE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.DIAMOND_SHAPE_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const DIAMOND_SHAPE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.DIAMOND_SHAPE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DIAMOND_SHAPE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.DIAMOND_SHAPE_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const DIAMOND_SHAPE_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.DIAMOND_SHAPE_DELETE}`, httpMethods.POST, payload);
export const DIAMOND_SHAPE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.DIAMOND_SHAPE_STATUS}`, httpMethods.PUT, payload);

export const CLARITY_ADD = (payload: any) => serviceMaker(`${apiEndPoints.CLARITY_ADD}`, httpMethods.POST,payload);
export const CLARITY_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.CLARITY_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const CLARITY_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.CLARITY_EDIT}`, httpMethods.PUT,payload);
export const CLARITY_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.CLARITY_DELETE}`, httpMethods.POST,payload);
export const CLARITY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.CLARITY_STATUS}`, httpMethods.PUT, payload);

export const CUT_ADD = (payload: any) => serviceMaker(`${apiEndPoints.CUT_ADD}`, httpMethods.POST,payload);
export const CUT_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.CUT_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const CUT_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.CUT_EDIT}`, httpMethods.PUT,payload);
export const CUT_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.CUT_DELETE}`, httpMethods.POST,payload);
export const CUT_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.CUT_STATUS}`, httpMethods.PUT, payload);

export const SETTING_WEIGHT_ADD = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_WEIGHT_ADD}`, httpMethods.POST,payload);
export const SETTING_WEIGHT_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.SETTING_WEIGHT_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const SETTING_WEIGHT_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_WEIGHT_EDIT}`, httpMethods.PUT,payload);
export const SETTING_WEIGHT_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_WEIGHT_DELETE}`, httpMethods.POST,payload);
export const SETTING_WEIGHT_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.SETTING_WEIGHT_STATUS}`, httpMethods.PUT, payload);

export const ITEM_SIZE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_SIZE_ADD}`, httpMethods.POST,payload);
export const ITEM_SIZE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.ITEM_SIZE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const ITEM_SIZE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_SIZE_EDIT}`, httpMethods.PUT,payload);
export const ITEM_SIZE_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_SIZE_DELETE}`, httpMethods.POST,payload);
export const ITEM_SIZE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_SIZE_STATUS}`, httpMethods.PUT, payload);
export const ITEM_SIZE_CATEGORY = () => serviceMaker(`${apiEndPoints.ITEM_SIZE_CATEGORY}`, httpMethods.GET);

export const ITEM_LENGTH_ADD = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_LENGTH_ADD}`, httpMethods.POST,payload);
export const ITEM_LENGTH_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.ITEM_LENGTH_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const ITEM_LENGTH_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_LENGTH_EDIT}`, httpMethods.PUT,payload);
export const ITEM_LENGTH_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_LENGTH_DELETE}`, httpMethods.POST,payload);
export const ITEM_LENGTH_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.ITEM_LENGTH_STATUS}`, httpMethods.PUT, payload);
export const ITEM_LENGTH_CATEGORY = () => serviceMaker(`${apiEndPoints.ITEM_LENGTH_CATEGORY}`, httpMethods.GET);

export const METAL_MASTER_ADD = (payload: any) => serviceMaker(`${apiEndPoints.METAL_MASTER_ADD}`, httpMethods.POST,payload);
export const METAL_MASTER_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.METAL_MASTER_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const METAL_MASTER_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.METAL_MASTER_EDIT}`, httpMethods.PUT,payload);
export const METAL_MASTER_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.METAL_MASTER_DELETE}`, httpMethods.POST,payload);
export const METAL_MASTER_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.METAL_MASTER_STATUS}`, httpMethods.PUT, payload);

export const METAL_MASTER_DROPDOWN = () => serviceMaker(`${apiEndPoints.METAL_MASTER_DROPDOWN}`, httpMethods.GET);
export const CARAT_MASTER_DROPDOWN = (payload: any) => serviceMaker(`${apiEndPoints.CARAT_MASTER_DROPDOWN}`, httpMethods.POST, payload);
export const METAL_TONE_DROPDOWN = (payload: any) => serviceMaker(`${apiEndPoints.METAL_TONE_DROPDOWN}`, httpMethods.POST, payload);

export const METAL_GROUP_MASTER_ADD = (payload: any) => serviceMaker(`${apiEndPoints.METAL_GROUP_MASTER_ADD}`, httpMethods.POST,payload);
export const METAL_GROUP_MASTER_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.METAL_GROUP_MASTER_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const METAL_GROUP_MASTER_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.METAL_GROUP_MASTER_EDIT}`, httpMethods.PUT,payload);
export const METAL_GROUP_MASTER_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.METAL_GROUP_MASTER_DELETE}`, httpMethods.POST,payload);
export const METAL_GROUP_MASTER_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.METAL_GROUP_MASTER_STATUS}`, httpMethods.PUT, payload);

export const GET_COMPANY_INFO = () => serviceMaker(`${apiEndPoints.GET_COMPANY_INFO}`, httpMethods.GET);
export const EDIT_COMPANY_INFO = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_COMPANY_INFO}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});

export const EDIT_GOLD_RATE = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_GOLD_RATE}`, httpMethods.PUT, payload)
export const EDIT_SILVER_RATE = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_SILVER_RATE}`, httpMethods.PUT, payload)
export const EDIT_PLATINUM_RATE = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_PLATINUM_RATE}`, httpMethods.PUT, payload)

export const ADD_PRODUCT_DROPDOWN_LIST = () => serviceMaker(`${apiEndPoints.ADD_PRODUCT_DROPDOWN_LIST}`, httpMethods.GET)
export const METAL_TONE_DROPDOWN_LIST = (payload: any) => serviceMaker(`${apiEndPoints.PRODUCT_METAL_TONE_LIST}`, httpMethods.POST, payload)
export const ADD_PRODUCT_BASIC_DETAILS = (payload: any) => serviceMaker(`${apiEndPoints.ADD_PRODUCT_BASIC_DETAILS}`, httpMethods.POST, payload)
export const ADD_PRODUCT_DETAILS = (payload: any) => serviceMaker(`${apiEndPoints.ADD_PRODUCT_DETAILS}`, httpMethods.POST, payload)
export const EDIT_PRODUCT_DETAILS = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_PRODUCT_DETAILS}`, httpMethods.POST, payload)

export const ADD_PRODUCT_METAL_DIAMOND_DETAILS = (payload: any) => serviceMaker(`${apiEndPoints.ADD_PRODUCT_METAL_DIAMOND_DETAILS}`, httpMethods.POST, payload)
export const GET_ALL_PRODUCT_LIST = (payload: ICommonPagination) =>serviceMaker(`${apiEndPoints.GET_ALL_PRODUCT_LIST}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET, payload)
export const STATUS_UPDATE_PRODUCT = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_PRODUCT}`, httpMethods.POST, payload)
export const FEATURE_STATUS_UPDATE_PRODUCT = (payload: any) => serviceMaker(`${apiEndPoints.FEATURE_STATUS_UPDATE_PRODUCT}`, httpMethods.POST, payload)
export const TRENDING_STATUS_UPDATE_PRODUCT = (payload: any) => serviceMaker(`${apiEndPoints.TRENDING_STATUS_UPDATE_PRODUCT}`, httpMethods.POST, payload)
export const DELETE_PRODUCT_API = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_PRODUCT_API}`, httpMethods.POST, payload)
export const ADD_PRODUCT_IMAGES = (payload: any) => serviceMaker(`${apiEndPoints.ADD_PRODUCT_IMAGES}`, httpMethods.POST_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }})
export const ADD_PRODUCT_VIDEO = (payload: any) => serviceMaker(`${apiEndPoints.ADD_PRODUCT_VIDEO}`, httpMethods.POST_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }})
export const GET_BY_ID_PRODUCTS = (id: number) =>serviceMaker(`${apiEndPoints.GET_BY_ID_PRODUCTS}/${id}`,httpMethods.GET)
export const ADD_PRODUCT_MRTAL_DATA = (payload: any) => serviceMaker(`${apiEndPoints.ADD_PRODUCT_MRTAL_DATA}`, httpMethods.POST, payload)
export const BULK_UPLOAD_ADD_PRODUCT = (payload: any) => serviceMaker(`${apiEndPoints.BULK_UPLOAD_ADD_PRODUCT}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const ZIPFILE_BULK_UPLOAD_ADD_PRODUCT = (payload: any) => serviceMaker(`${apiEndPoints.ZIPFILE_BULK_UPLOAD_ADD_PRODUCT}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const PRODUCT_IMAGE_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.PRODUCT_IMAGE_DELETE}`, httpMethods.POST, payload)


export const ADD_MM_SIZE = (payload: any) => serviceMaker(`${apiEndPoints.ADD_MM_SIZE}`, httpMethods.POST, payload)
export const EDIT_MM_SIZE = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_MM_SIZE}`, httpMethods.PUT, payload);
export const GET_MM_SIZE = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_MM_SIZE}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_MM_SIZE = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_MM_SIZE}`, httpMethods.POST, payload);
export const STATUS_UPDATE_MM_SIZE = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_MM_SIZE}`, httpMethods.PUT, payload);

export const ADD_DIAMOND_GROUP_MASTER = (payload: any) => serviceMaker(`${apiEndPoints.ADD_DIAMOND_GROUP_MASTER}`, httpMethods.POST, payload)
export const EDIT_DIAMOND_GROUP_MASTER = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_DIAMOND_GROUP_MASTER}`, httpMethods.PUT, payload);
export const GET_DIAMOND_GROUP_MASTER = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_DIAMOND_GROUP_MASTER}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const GET_DIAMOND_GROUP_MASTER_WITH_DETAILS = () => serviceMaker(`${apiEndPoints.GET_DIAMOND_GROUP_MASTER_WITH_DETAILS}`, httpMethods.GET);
export const DELETE_DIAMOND_GROUP_MASTER = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_DIAMOND_GROUP_MASTER}`, httpMethods.POST, payload);
export const STATUS_UPDATE_DIAMOND_GROUP_MASTER = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_DIAMOND_GROUP_MASTER}`, httpMethods.PUT, payload);
export const BULK_UPLOAD_DIAMOND_GROUP_MASTER = (payload: any) => serviceMaker(`${apiEndPoints.BULK_UPLOAD_DIAMOND_GROUP_MASTER}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});

export const COUNTRY_ADD = (payload: any) => serviceMaker(`${apiEndPoints.COUNTRY_ADD}`, httpMethods.POST,payload);
export const COUNTRY_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.COUNTRY_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const COUNTRY_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.COUNTRY_EDIT}`, httpMethods.PUT,payload);
export const COUNTRY_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.COUNTRY_DELETE}`, httpMethods.POST,payload);
export const COUNTRY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.COUNTRY_STATUS}`, httpMethods.PUT, payload);

export const STATE_DROPDOWN_LIST = () => serviceMaker(`${apiEndPoints.COUNTRY_GET_ALL}?is_active=1&no_pagination=1`, httpMethods.GET);
export const STATE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.STATE_ADD}`, httpMethods.POST,payload);
export const STATE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.STATE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const STATE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.STATE_EDIT}`, httpMethods.PUT,payload);
export const STATE_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.STATE_DELETE}`, httpMethods.POST,payload);
export const STATE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.STATE_STATUS}`, httpMethods.PUT, payload);

export const CITY_DROPDOWN_LIST = () => serviceMaker(`${apiEndPoints.STATE_GET_ALL}?is_active=1&no_pagination=1`, httpMethods.GET);
export const CITY_ADD = (payload: any) => serviceMaker(`${apiEndPoints.CITY_ADD}`, httpMethods.POST,payload);
export const CITY_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.CITY_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const CITY_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.CITY_EDIT}`, httpMethods.PUT,payload);
export const CITY_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.CITY_DELETE}`, httpMethods.POST,payload);
export const CITY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.CITY_STATUS}`, httpMethods.PUT, payload);

export const CUSTOMER_COUNTRY = () => serviceMaker(`${apiEndPoints.CUSTOMER_COUNTRY}?is_active=1&no_pagination=1`, httpMethods.GET);
export const CUSTOMER_ADD = (payload: any) => serviceMaker(`${apiEndPoints.CUSTOMER_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const CUSTOMER_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.CUSTOMER_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const CUSTOMER_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.CUSTOMER_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const CUSTOMER_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.CUSTOMER_DELETE}`, httpMethods.POST, payload);
export const CUSTOMER_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.CUSTOMER_STATUS}`, httpMethods.PUT, payload);
export const CUSTOMER_GET_BY_ID = (id: number) =>serviceMaker(`${apiEndPoints.CUSTOMER_GET_BY_ID}/${id}`,httpMethods.GET)


export const TESTIMONIAL_ADD = (payload: any) => serviceMaker(`${apiEndPoints.TESTIMONIAL_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const TESTIMONIAL_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.TESTIMONIAL_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const TESTIMONIAL_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.TESTIMONIAL_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const TESTIMONIAL_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.TESTIMONIAL_DELETE}`, httpMethods.POST, payload);
export const TESTIMONIAL_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.TESTIMONIAL_STATUS}`, httpMethods.PUT, payload);
export const GET_ALL_CATEGORY = () => serviceMaker(`${apiEndPoints.GET_ALL_CATEGORY}`, httpMethods.GET)

export const ADD_CATEGORY = (payload: any) => serviceMaker(`${apiEndPoints.ADD_CATEGORY}`, httpMethods.POST_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const EDIT_CATEGORY = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_CATEGORY}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const DELETE_CATEGORY = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_CATEGORY}`, httpMethods.POST, payload);
export const STATUS_UPDATE_CATEGORY = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_UPDATE_CATEGORY}`, httpMethods.PUT, payload);
export const SEARCHABLE_CATEGORY = (payload: any) => serviceMaker(`${apiEndPoints.SEARCHABLE_CATEGORY}`, httpMethods.PUT, payload);

export const TAG_ADD = (payload: any) => serviceMaker(`${apiEndPoints.TAG_ADD}`, httpMethods.POST,payload);
export const TAG_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.TAG_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const TAG_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.TAG_EDIT}`, httpMethods.PUT,payload);
export const TAG_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.TAG_DELETE}`, httpMethods.POST,payload);
export const TAG_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.TAG_STATUS}`, httpMethods.PUT, payload);

export const ADD_MARKETING_POPUP = (payload: any) => serviceMaker(`${apiEndPoints.ADD_MARKETING_POPUP}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const EDIT_MARKETING_POPUP = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_MARKETING_POPUP}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const GET_ALL_MARKETING_POPUP = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_MARKETING_POPUP}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_MARKETING_POPUP = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_MARKETING_POPUP}`, httpMethods.POST, payload);
export const STATUS_MARKETING_POPUP = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_MARKETING_POPUP}`, httpMethods.PUT, payload);

export const ADD_BLOG = (payload: any) => serviceMaker(`${apiEndPoints.ADD_BLOG}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const EDIT_BLOG = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_BLOG}`, httpMethods.PUT_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const GET_ALL_BLOG = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_BLOG}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const DELETE_BLOG = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_BLOG}`, httpMethods.POST, payload);
export const GET_BY_ID_BLOG = (payload: any) => serviceMaker(`${apiEndPoints.GET_BY_ID_BLOG}`, httpMethods.POST, payload);

export const GET_ALL_WISHLIST = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_WISHLIST}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const GET_ALL_CART_PRODUCT = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_CART_PRODUCT}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);

export const GET_ALL_GENERAL_ENQUIRIES = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_GENERAL_ENQUIRIES}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const GET_ALL_PRODUCT_ENQUIRIES = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_PRODUCT_ENQUIRIES}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const PRODUCT_INQUIRIES_DETAIL = (payload: any) => serviceMaker(`${apiEndPoints.PRODUCT_INQUIRIES_DETAIL}`, httpMethods.POST, payload);
export const UPDATE_PRODUCT_INQUIRIES = (payload: any) => serviceMaker(`${apiEndPoints.UPDATE_PRODUCT_INQUIRIES}`, httpMethods.POST, payload);

export const GET_ALL_CUSTOMER_REVIEW = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_CUSTOMER_REVIEW}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const STATUS_CUSTOMER_REVIEW = (payload: any) => serviceMaker(`${apiEndPoints.STATUS_CUSTOMER_REVIEW}`, httpMethods.PUT, payload);

export const GET_ALL_ORDERS= (payload: ICommonOrderPagination) => serviceMaker(`${apiEndPoints.GET_ALL_ORDERS}?${getQueryUrlOrderPagiantion(payload)}`, httpMethods.GET);
export const ORDERS_DETAIL = (payload: any) => serviceMaker(`${apiEndPoints.ORDERS_DETAIL}`, httpMethods.POST, payload);
export const ORDER_STATUS_UPDATE = (payload: any) => serviceMaker(`${apiEndPoints.ORDER_STATUS_UPDATE}`, httpMethods.PUT, payload);
export const DELIVERY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.DELIVERY_STATUS}`, httpMethods.PUT, payload);
export const INVOICE_DETAIL = (payload: any) => serviceMaker(`${apiEndPoints.INVOICE_DETAIL}`, httpMethods.POST, payload);
export const GET_ORDER_TRANSACTION= (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ORDER_TRANSACTION}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);


export const GET_ALL_GIFTSET= (payload: ICommonOrderPagination) => serviceMaker(`${apiEndPoints.GET_ALL_GIFTSET}?${getQueryUrlOrderPagiantion(payload)}`, httpMethods.GET);
export const GIFTSET_ORDERS_DETAIL = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_ORDERS_DETAIL}`, httpMethods.POST, payload);
export const GIFTSET_ORDER_STATUS_UPDATE = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_ORDER_STATUS_UPDATE}`, httpMethods.PUT, payload);
export const GIFTSET_DELIVERY_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_DELIVERY_STATUS}`, httpMethods.PUT, payload);
export const GIFTSET_INVOICE_DETAIL = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_INVOICE_DETAIL}`, httpMethods.POST, payload);

export const GET_ALL_DASHBOARD = () => serviceMaker(`${apiEndPoints.GET_ALL_DASHBOARD}`, httpMethods.GET);

export const SIDE_SETTING_STYLE_ADD = (payload: any) => serviceMaker(`${apiEndPoints.SIDE_SETTING_STYLE_ADD}`, httpMethods.POST_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const SIDE_SETTING_STYLE_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.SIDE_SETTING_STYLE_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const SIDE_SETTING_STYLE_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.SIDE_SETTING_STYLE_EDIT}`, httpMethods.PUT_CONFIG, payload, {headers: { 'Content-Type' : 'multipart/form-data'}});
export const SIDE_SETTING_STYLE_DELETE = (payload : any) => serviceMaker(`${apiEndPoints.SIDE_SETTING_STYLE_DELETE}`, httpMethods.POST,payload);
export const SIDE_SETTING_STYLE_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.SIDE_SETTING_STYLE_STATUS}`, httpMethods.PUT, payload);

export const USER_SUBSCRIPTION_LIST = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.USER_SUBSCRIPTION_LIST}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const USER_SUBSCRIPTION_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.USER_SUBSCRIPTION_STATUS}`, httpMethods.PUT, payload);

export const TAX_ADD = (payload: any) => serviceMaker(`${apiEndPoints.TAX_ADD}`, httpMethods.POST,payload);
export const TAX_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.TAX_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const TAX_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.TAX_EDIT}`, httpMethods.PUT,payload);
export const TAX_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.TAX_DELETE}`, httpMethods.POST,payload);
export const TAX_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.TAX_STATUS}`, httpMethods.PUT, payload);

export const CHANGE_PASSWORD = (payload: any) => serviceMaker(`${apiEndPoints.CHANGE_PASSWORD}`, httpMethods.POST, payload)
export const FORGOT_PASSWORD = (payload: any) => serviceMaker(`${apiEndPoints.FORGOT_PASSWORD}`, httpMethods.POST, payload)
export const RESET_PASSWORD = (payload: any) => serviceMaker(`${apiEndPoints.RESET_PASSWORD}`, httpMethods.POST, payload)
export const CONFIG_MASTER_DROPDOWN = () => serviceMaker(`${apiEndPoints.CONFIG_MASTER_DROPDOWN}`, httpMethods.GET);

export const GIFTSET_ADD = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_ADD}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const GIFTSET_EDIT = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_EDIT}`, httpMethods.POST_CONFIG, payload,  { headers: { 'Content-Type': 'multipart/form-data' }});
export const GIFTSET_GET_ALL = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GIFTSET_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const GIFTSET_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_DELETE}`, httpMethods.POST, payload);
export const GIFTSET_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_STATUS}`, httpMethods.POST, payload);
export const GIFTSET_GET_BY_ID = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_GET_BY_ID}`, httpMethods.POST, payload);
export const GIFTSET_IMAGE_DELETE = (payload: any) => serviceMaker(`${apiEndPoints.GIFTSET_IMAGE_DELETE}`, httpMethods.POST, payload);

export const ADD_OURSTORIES = (payload: any) => serviceMaker(`${apiEndPoints.ADD_OURSTORIES}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const GET_ALL_OURSTORIES = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.GET_ALL_OURSTORIES}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const EDIT_OURSTORIES = (payload: any) => serviceMaker(`${apiEndPoints.EDIT_OURSTORIES}`, httpMethods.PUT_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const DELETE_OURSTORIES = (payload: any) => serviceMaker(`${apiEndPoints.DELETE_OURSTORIES}`, httpMethods.POST,payload);
export const OURSTORIES_STATUS = (payload: any) => serviceMaker(`${apiEndPoints.OURSTORIES_STATUS}`, httpMethods.PUT, payload);
export const GET_BY_ID_OURSTORIES = (id: number) =>serviceMaker(`${apiEndPoints.GET_BY_ID_OURSTORIES}/${id}`,httpMethods.GET)

// Collections
export const ADD_COLLECTION = (payload: any) => serviceMaker(`${apiEndPoints.COLLECTION_ADD}`, httpMethods.POST_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const GET_ALL_COLLECTION = (payload: ICommonPagination) => serviceMaker(`${apiEndPoints.COLLECTION_GET_ALL}?${getQueryUrlFormPagiantion(payload)}`, httpMethods.GET);
export const EDIT_COLLECTION = (payload: any) => serviceMaker(`${apiEndPoints.COLLECTION_EDIT}`, httpMethods.PUT_CONFIG, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
export const DELETE_COLLECTION = (payload: any) => serviceMaker(`${apiEndPoints.COLLECTION_DELETE}`, httpMethods.POST, payload);
export const STATUS_COLLECTION = (payload: any) => serviceMaker(`${apiEndPoints.COLLECTION_STATUS}`, httpMethods.PUT, payload);
export const GET_BY_ID_COLLECTION = (id: number) => serviceMaker(`${apiEndPoints.COLLECTION_GET_BY_ID}/${id}`, httpMethods.GET)
