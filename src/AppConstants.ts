import { number } from "yup"


export const apiEndPoints = {
  ADMIN_LOGIN: 'admin/login',
  GET_ALL_ROLES: 'roles',
  GET_ALL_MENU_ITEMS: 'menu-items',
  GET_ALL_ACTIONS: 'actions',
  ADD_ROLE_CONFIGURATION: 'role-configuration',
  GET_ROLE_CONFIGURATION: 'role-configuration',
  UPDATE_ROLE_CONFIGRATION: 'role-configuration',
  GET_ALL_BUSINESS_USER: 'business-user',
  GET_BUSINESS_USER_BY_ID: 'business-user',
  ADD_BUSINESS_USER: 'business-user',
  UPDATE_BUSINESS_USER: 'business-user',
  DELETE_BUSINESS_USER: 'business-user',
  GET_ACCESS_MENU_ITEMS: 'user-access-menu-items',
  LOGIN: 'login',

  CURRENCY_ADD: "currency/add",
  CURRENCY_GET_ALL: 'currency',
  CURRENCY_EDIT: 'currency/edit',
  CURRENCY_DELETE: 'currency/delete',
  CURRENCY_STATUS: 'currency/status',
  DEFAULT_CURRENCY_STATUS: 'currency/default',

  CARAT_SIZE_ADD:"attribute/caratSize/add",
  CARAT_SIZE_GET_ALL:"attribute/caratSize",
  CARAT_SIZE_EDIT:"attribute/caratSize/edit",
  CARAT_SIZE_DELETE: "attribute/caratSize/delete",
  CARAT_SIZE_STATUS: "attribute/caratSize/status",

  METAL_TONE_ADD: "attribute/metalTone/add",
  METAL_TONE_GET_ALL: "attribute/metalTone",
  METAL_TONE_EDIT: "attribute/metalTone/edit",
  METAL_TONE_DELETE: "attribute/metalTone/delete",
  METAL_TONE_STATUS: "attribute/metalTone/status",
  METAL_TONE_MASTER: "attribute/metalMaster/list",

  GOLD_KT_ADD: "attribute/goldKT/add",
  GOLD_KT_GET_ALL: "attribute/goldKT",
  GOLD_KT_EDIT: "attribute/goldKT/edit",
  GOLD_KT_DELETE: "attribute/goldKT/delete",
  GOLD_KT_STATUS: "attribute/goldKT/status",
  GOLD_KT_MASTER: "attribute/metalMaster/list",

  SETTING_STYLE_ADD: "attribute/settingType/add",
  SETTING_STYLE_GET_ALL: "attribute/settingType",
  SETTING_STYLE_EDIT: "attribute/settingType/edit",
  SETTING_STYLE_DELETE: "attribute/settingType/delete",
  SETTING_STYLE_STATUS: "attribute/settingType/status",

  SHANKS_ADD: "attribute/shanks/add",
  SHANKS_GET_ALL: "attribute/shanks",
  SHANKS_EDIT: "attribute/shanks/edit",
  SHANKS_DELETE: "attribute/shanks/delete",
  SHANKS_STATUS: "attribute/shanks/status",

  HEADS_ADD: "attribute/heads/add",
  HEADS_GET_ALL: "attribute/heads",
  HEADS_EDIT: "attribute/heads/edit",
  HEADS_DELETE: "attribute/heads/delete",
  HEADS_STATUS: "attribute/heads/status",

  GEMSTONES_ADD: "attribute/gemstones/add",
  GEMSTONES_GET_ALL: "attribute/gemstones",
  GEMSTONES_EDIT: "attribute/gemstones/edit",
  GEMSTONES_DELETE: "attribute/gemstones/delete",
  GEMSTONES_STATUS: "attribute/gemstones/status",

  DIAMOND_SHAPE_ADD: "attribute/diamondShapes/add",
  DIAMOND_SHAPE_GET_ALL: "attribute/diamondShapes",
  DIAMOND_SHAPE_EDIT: "attribute/diamondShapes/edit",
  DIAMOND_SHAPE_DELETE: "attribute/diamondShapes/delete",
  DIAMOND_SHAPE_STATUS: "attribute/diamondShapes/status",

  CLARITY_ADD: "attribute/clarity/add",
  CLARITY_GET_ALL: "attribute/clarity",
  CLARITY_EDIT: "attribute/clarity/edit",
  CLARITY_DELETE: "attribute/clarity/delete",
  CLARITY_STATUS: "attribute/clarity/status",

  CUT_ADD: "attribute/cuts/add",
  CUT_GET_ALL: "attribute/cuts",
  CUT_EDIT: "attribute/cuts/edit",
  CUT_DELETE: "attribute/cuts/delete",
  CUT_STATUS: "attribute/cuts/status",

  SETTING_WEIGHT_ADD: "attribute/settingWeight/add",
  SETTING_WEIGHT_GET_ALL: "attribute/settingWeight",
  SETTING_WEIGHT_EDIT: "attribute/settingWeight/edit",
  SETTING_WEIGHT_DELETE: "attribute/settingWeight/delete",
  SETTING_WEIGHT_STATUS: "attribute/settingWeight/status",

  ADD_COLOR: "attribute/colors/add",
  GET_ALL_COLOR: "attribute/colors",
  EDIT_COLOR: "attribute/colors/edit",
  DELETE_COLOR: "attribute/colors/delete",
  STATUS_UPDATE_COLOR: "attribute/colors/status",

  BANNER_ADD: "banners",
  BANNER_GET_ALL: "banners",
  BANNER_EDIT: "banners/edit",
  BANNER_DELETE: "banners/delete",
  BANNER_STATUS: "banners/status",

  ADD_MARKETING_BANNER: "marketingBanner/add",
  GET_ALL_MARKETING_BANNER: "marketingBanner",
  EDIT_MARKETING_BANNER: "marketingBanner/edit",
  DELETE_MARKETING_BANNER: "marketingBanner/delete",
  STATUS_UPDATE_MARKETING_BANNER: "marketingBanner/status",

  GET_MAIN_HOME_ABOUT_SECTION: "about/main",
  MAIN_CONTENT_HOME_ABOUT_EDIT: "about/main/edit",
  ADD_HOME_ABOUT_SECTION: "about/sub/add",
  GET_ALL_HOME_ABOUT_SECTION: "about/sub",
  EDIT_HOME_ABOUT_SECTION: "about/sub/edit",
  DELETE_HOME_ABOUT_SECTION: "about/sub/delete",
  STATUS_UPDATE_HOME_ABOUT_SECTION: "about/sub/status",

  ADD_FEATURES_SECTION: "featureSection/add",
  GET_ALL_FEATURES_SECTION: "featureSection",
  EDIT_FEATURES_SECTION: "featureSection/edit",
  DELETE_FEATURES_SECTION: "featureSection/delete",
  STATUS_UPDATE_FEATURES_SECTION: "featureSection/status",

  ADD_STATIC_PAGE: "staticPage/add",
  GET_ALL_STATIC_PAGE: "staticPage",
  EDIT_STATIC_PAGE: "staticPage/edit",
  DELETE_STATIC_PAGE: "staticPage/delete",
  STATUS_UPDATE_STATIC_PAGE: "staticPage/status",


  ITEM_SIZE_ADD: "attribute/itemSize/add",
  ITEM_SIZE_GET_ALL: "attribute/itemSize",
  ITEM_SIZE_EDIT: "attribute/itemSize/edit",
  ITEM_SIZE_DELETE: "attribute/itemSize/delete",
  ITEM_SIZE_STATUS: "attribute/itemSize/status",
  ITEM_SIZE_CATEGORY: "user/category/list",

  ITEM_LENGTH_ADD: "attribute/itemlength/add",
  ITEM_LENGTH_GET_ALL: "attribute/itemlength",
  ITEM_LENGTH_EDIT: "attribute/itemlength/edit",
  ITEM_LENGTH_DELETE: "attribute/itemlength/delete",
  ITEM_LENGTH_STATUS: "attribute/itemlength/status",
  ITEM_LENGTH_CATEGORY: "user/category/list",

  METAL_MASTER_ADD: "attribute/metalMaster/add",
  METAL_MASTER_GET_ALL: "attribute/metalMaster",
  METAL_MASTER_EDIT: "attribute/metalMaster/edit",
  METAL_MASTER_DELETE: "attribute/metalMaster/delete",
  METAL_MASTER_STATUS: "attribute/metalMaster/status",

  METAL_MASTER_DROPDOWN: "attribute/metalMaster/list",
  CARAT_MASTER_DROPDOWN: "attribute/goldKT/list",
  METAL_TONE_DROPDOWN: "attribute/metalTone/list",

  METAL_GROUP_MASTER_ADD: "attribute/metalGroupMaster/add",
  METAL_GROUP_MASTER_GET_ALL: "attribute/metalGroupMaster",
  METAL_GROUP_MASTER_EDIT: "attribute/metalGroupMaster/edit",
  METAL_GROUP_MASTER_DELETE: "attribute/metalGroupMaster/delete",
  METAL_GROUP_MASTER_STATUS: "attribute/metalGroupMaster/status",
  GET_COMPANY_INFO: "/companyinfo",
  EDIT_COMPANY_INFO: "/companyinfo/edit",

  EDIT_GOLD_RATE: "/rate/gold/edit",
  EDIT_SILVER_RATE: "/rate/silver/edit",
  EDIT_PLATINUM_RATE: "/rate/platinum/edit",


  ADD_PRODUCT_DROPDOWN_LIST: "/add-product/dropDown/list",
  PRODUCT_METAL_TONE_LIST: "/product/metalTone",
  ADD_PRODUCT_BASIC_DETAILS: "/product-basic-details",
  ADD_PRODUCT_DETAILS: "/product/add/data",
  EDIT_PRODUCT_DETAILS: "/product/edit/data",
  ADD_PRODUCT_METAL_DIAMOND_DETAILS: "/product-metal-diamond-details",
  GET_ALL_PRODUCT_LIST: "/product",
  ADD_PRODUCT_IMAGES: "/product-images",
  STATUS_UPDATE_PRODUCT: "/active-inactive-product",
  TRENDING_STATUS_UPDATE_PRODUCT:"/product/trending/status",
  FEATURE_STATUS_UPDATE_PRODUCT: "/product/featured/status",
  DELETE_PRODUCT_API: "/product",
  ADD_PRODUCT_VIDEO: "/product-videos",
  GET_BY_ID_PRODUCTS: "/product",
  ADD_PRODUCT_MRTAL_DATA: "/product/add/metal",
  BULK_UPLOAD_ADD_PRODUCT: "/product-csv",
  ZIPFILE_BULK_UPLOAD_ADD_PRODUCT: "/product-imagezip",
  PRODUCT_IMAGE_DELETE: "/product-images/deleted",

  ADD_MM_SIZE: "/attribute/mmSize/add",
  GET_MM_SIZE: "/attribute/mmSize",
  EDIT_MM_SIZE: "/attribute/mmSize/edit",
  DELETE_MM_SIZE: "/attribute/mmSize/delete",
  STATUS_UPDATE_MM_SIZE: "/attribute/mmSize/status",

  ADD_DIAMOND_GROUP_MASTER: "/attribute/diamondGroupMaster/add",
  GET_DIAMOND_GROUP_MASTER: "/attribute/diamondGroupMaster",
  GET_DIAMOND_GROUP_MASTER_WITH_DETAILS: "/attribute/diamondGroupMaster/with-details",
  EDIT_DIAMOND_GROUP_MASTER: "/attribute/diamondGroupMaster/edit",
  DELETE_DIAMOND_GROUP_MASTER: "/attribute/diamondGroupMaster/delete",
  STATUS_UPDATE_DIAMOND_GROUP_MASTER: "/attribute/diamondGroupMaster/status",
  BULK_UPLOAD_DIAMOND_GROUP_MASTER: "/diamond/group/master/csv",

  COUNTRY_ADD: "country/add",
  COUNTRY_GET_ALL: "country",
  COUNTRY_EDIT: "country/edit",
  COUNTRY_DELETE: "country/delete",
  COUNTRY_STATUS: "country/status",


  STATE_ADD: "state/add",
  STATE_GET_ALL: "state",
  STATE_EDIT: "state/edit",
  STATE_DELETE: "state/delete",
  STATE_STATUS: "state/status",

  CITY_ADD: "city/add",
  CITY_GET_ALL: "city",
  CITY_EDIT: "city/edit",
  CITY_DELETE: "city/delete",
  CITY_STATUS: "city/status",

  CUSTOMER_ADD:"customer/add",
  CUSTOMER_GET_ALL:"customer",
  CUSTOMER_EDIT:"customer/edit",
  CUSTOMER_DELETE: "customer/delete",
  CUSTOMER_STATUS: "customer/status",
  CUSTOMER_COUNTRY: "/user/country/list",
  CUSTOMER_GET_BY_ID: "/customer",


  TESTIMONIAL_ADD: "testimonial/add",
  TESTIMONIAL_GET_ALL: "testimonial",
  TESTIMONIAL_EDIT: "testimonial/edit",
  TESTIMONIAL_DELETE: "testimonial/delete",
  TESTIMONIAL_STATUS: "testimonial/status",

  GET_ALL_CATEGORY: "/category",
  ADD_CATEGORY: "/category/add",
  EDIT_CATEGORY: "/category/edit",
  STATUS_UPDATE_CATEGORY: "/category/status",
  SEARCHABLE_CATEGORY: "/category/searchable",
  DELETE_CATEGORY: "/category/delete",

  TAG_ADD: "attribute/tag",
  TAG_GET_ALL: "attribute/tag",
  TAG_EDIT: "attribute/tag",
  TAG_DELETE: "attribute/tag/delete",
  TAG_STATUS: "attribute/tag/active-inactive",

  ADD_MARKETING_POPUP: "marketingPopup/add",
  EDIT_MARKETING_POPUP: "marketingPopup/edit",
  GET_ALL_MARKETING_POPUP: "marketingPopup",
  DELETE_MARKETING_POPUP: "marketingPopup/delete",
  STATUS_MARKETING_POPUP: "marketingPopup/status",

  ADD_BLOG: "blogs/add",
  EDIT_BLOG: "blog/edit",
  GET_ALL_BLOG: "blog",
  DELETE_BLOG: "blog/delete",
  GET_BY_ID_BLOG: "blog",

  GET_ALL_WISHLIST: "product/wish/list",
  GET_ALL_CART_PRODUCT: "product/cart/list/admin",

  GET_ALL_GENERAL_ENQUIRIES: "enquiries/general",
  GET_ALL_PRODUCT_ENQUIRIES: "/enquiries/product",
  PRODUCT_INQUIRIES_DETAIL: "/enquiries/product/details",
  UPDATE_PRODUCT_INQUIRIES: 'enquiries/product/update',

  GET_ALL_CUSTOMER_REVIEW: "product/review/list/admin",
  STATUS_CUSTOMER_REVIEW: "product/review/status",

  GET_ALL_ORDERS: "order/list/admin",
  ORDERS_DETAIL:"order/details/admin",
  ORDER_STATUS_UPDATE: "order/status/update",
  DELIVERY_STATUS: "order/delivery/status",
  INVOICE_DETAIL: "invoice/details",
  GET_ORDER_TRANSACTION: "/order/transaction/list",

  SIDE_SETTING_STYLE_ADD: "attribute/sideSetting/add",
  SIDE_SETTING_STYLE_GET_ALL: "attribute/sideSetting",
  SIDE_SETTING_STYLE_EDIT: "attribute/sideSetting/edit",
  SIDE_SETTING_STYLE_DELETE: "attribute/sideSetting/delete",
  SIDE_SETTING_STYLE_STATUS: "attribute/sideSetting/status",

  USER_SUBSCRIPTION_LIST: "/admin/subscription/list",
  USER_SUBSCRIPTION_STATUS: "/admin/subsction/satus",

  GET_ALL_DASHBOARD: "dashboard",

  TAX_ADD: "tax/add",
  TAX_GET_ALL: "tax",
  TAX_EDIT: "tax/edit",
  TAX_DELETE: "tax/delete",
  TAX_STATUS: "tax/status",

  // Collections
  COLLECTION_ADD: "collection/add",
  COLLECTION_GET_ALL: "collection",
  COLLECTION_GET_BY_ID: "collection",
  COLLECTION_EDIT: "collection/edit",
  COLLECTION_DELETE: "collection/delete",
  COLLECTION_STATUS: "collection/status",

  CHANGE_PASSWORD: "/change-password",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CONFIG_MASTER_DROPDOWN: "/config/master/drop-down",

  GIFTSET_ADD: "gift-set/product/add",
  GIFTSET_GET_ALL: "gift-set/products/list",
  GIFTSET_EDIT: "gift-set/product/edit",
  GIFTSET_DELETE: "gift-set/products/delete",
  GIFTSET_STATUS: "gift-set/products/status",
  GIFTSET_GET_BY_ID: "gift-set/products",
  GIFTSET_IMAGE_DELETE: "gift-set/products/image/delete",

  GET_ALL_GIFTSET: "order/gift-set/list/admin",
  GIFTSET_ORDERS_DETAIL: "order/gift-set/details/admin",
  GIFTSET_ORDER_STATUS_UPDATE: "order/gift-set/status/update",
  GIFTSET_DELIVERY_STATUS: "order/gift-set/delivery/status",
  GIFTSET_INVOICE_DETAIL: "invoice/gift-set/details",

  GET_ALL_OURSTORIES: "our-story",
  ADD_OURSTORIES: "our-story/add",
  EDIT_OURSTORIES: "our-story/edit",
  DELETE_OURSTORIES: "our-story/delete",
  OURSTORIES_STATUS: "our-story/status",
  GET_BY_ID_OURSTORIES: "our-story",
}


export const appConstant = {
  INVALID_METHOD: 'Invalid Method',
  INVALID_RESPONSE: 'Invalid Response'
}

export const publicRoutePath = {
  login: '/login'
}

export const appErrors = {
  UNKNOWN_ERROR_TRY_AGAIN: 'Unknown Errror Occured...! Try again.'
}

export const DEFAULT_STATUS_CODE_SUCCESS = 200
export const UNAUTHORIZED_ACCESS_CODE_SUCCESS = 401


export const PAGINATION_INITIAL_VALUE = {
  current_page: 1,
  per_page_rows: 10,
  order_by: 'DESC',
  sort_by: 'id',
  total_pages: 0,
  total_items: 0
}

export const ORDER_PAGINATION_INITIAL_VALUE = {
  current_page: 1,
  per_page_rows: 10,
  order_by: 'DESC',
  sort_by: 'id',
  start_date: 0,
  end_date: 0,
  total_pages: 0,
  total_items: 0,
  order_status: number
}

export const STONE_TYPE = {
  center : 1,
  side: 2
}

export const FIELD_REQUIRED = "This Field is required"

export const SEARCH_DELAY_TIME = 1000 // in milisecond
