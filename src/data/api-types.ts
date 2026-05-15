// API Response Types for TypeScript Strict Mode
// This file provides comprehensive type definitions for all API responses

// Generic API Response Wrapper
export interface ApiResponse<T = unknown> {
  code: number
  status: number
  message: string
  data: T
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  per_page_rows?: number
  current_page?: number
}

// Auth Types
export interface LoginResponse {
  tokens: {
    token: string
    refreshToken: string
  }
  user_detail: UserDetail
}

export interface UserDetail {
  id: number
  email: string
  name: string
  id_role: number
  role_name?: string
  image_path?: string
  phone_number?: string
}

// Product Types
export interface Product {
  id: number
  name: string
  sku: string
  sort_description: string | null
  long_description: string | null
  price: number | null
  making_charge: number | null
  finding_charge: number | null
  other_charge: number | null
  tag: number[] | null
  gender: number[] | null
  size: number[] | null
  length: number[] | null
  product_categories: ProductCategory[]
  PMO: ProductMetalOption[]
  diamond_options: ProductDiamondOption[]
  stone_options: ProductStoneOption[]
  image_path: string | null
  is_active: boolean
  is_featured: boolean
  is_trending: boolean
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: number
  id_category: number
  id_sub_category: number | null
  id_sub_sub_category: number | null
}

export interface ProductMetalOption {
  id: number
  id_metal: number
  id_karat: number | null
  id_metal_tone: string
  metal_weight: number
  metal_rate: number
}

export interface ProductDiamondOption {
  id: number
  id_diamond_group: number
  id_diamond_quality: number
  id_diamond_shape: number
  id_diamond_clarity: number
  id_diamond_cut: number
  id_diamond_color: number
  carat_weight: number
  stone_count: number
  stone_type?: string
  stone_mm_size: number
  stone_rate: number
  total_stone_amount: number
}

export interface ProductStoneOption {
  id: number
  id_stone: number
  id_stone_shape: number
  id_stone_color: number
  id_stone_clarity: number
  id_stone_cut: number
  carat_weight: number
  stone_mm_size: number
  stone_rate: number
  total_stone_amount: number
}

// Order Types
export interface Order {
  id: number
  order_number: string
  id_customer: number
  customer_name: string
  customer_email: string
  order_status: OrderStatus
  delivery_status: DeliveryStatus
  payment_status: PaymentStatus
  subtotal: number
  tax_amount: number
  shipping_charge: number
  discount_amount: number
  total_amount: number
  items: OrderItem[]
  shipping_address: Address
  billing_address: Address
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  id_product: number
  product_name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
  metal_option: string
  diamond_option: string
  stone_option: string
}

export interface Address {
  id: number
  first_name: string
  last_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  country: string
  postal_code: string
  phone_number: string
}

export type OrderStatus = 
  | 1  // Pending
  | 2  // Confirmed
  | 3  // Processing
  | 4  // Out for Delivery
  | 5  // Delivered
  | 6  // Returned
  | 7  // Failed
  | 8  // Cancelled

export type DeliveryStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'

// Customer Types
export interface Customer {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number: string
  gender: string | null
  date_of_birth: string | null
  image_path: string | null
  is_active: boolean
  is_newsletter_subscriber: boolean
  created_at: string
  last_login_at: string | null
}

// Category Types
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image_path: string | null
  parent_id: number | null
  sort_order: number
  is_active: boolean
  is_searchable: boolean
  created_at: string
  updated_at: string
  children?: Category[]
  sub_categories?: Category[]
}

// Collection Types
export interface Collection {
  id: number
  name: string
  slug: string
  description: string | null
  banner_image_path: string | null
  is_active: boolean
  sort_order: number
  products?: Product[]
  created_at: string
  updated_at: string
}

// Dashboard Types
export interface DashboardData {
  new_order: number
  Confirm_order: number
  In_process_order: number
  out_of_delivery_order: number
  delivery_order: number
  cancel_order: number
  return_order: number
  failed_order: number
  total_order: number
  total_revenue: {
    total: number
  }
  total_items: {
    item: number
  }
  top_selling_product: TopSellingProduct[]
}

export interface TopSellingProduct {
  product_id: number
  name: string
  sku: string
  slug: string
  order_count: number
  image_path: string | null
}

// Hero Content Types
export interface HeroContent {
  id: number
  desktop_video_url: string | null
  mobile_video_url: string | null
  desktop_image_url: string | null
  mobile_image_url: string | null
  content_type: 'video' | 'image'
  is_active: boolean
  created_at: string
  updated_at: string
}

// Metal & Diamond Types
export interface Metal {
  id: number
  name: string
  metal_rate: number
  is_active: boolean
}

export interface MetalKarat {
  id: number
  name: string
  id_metal: number
  is_active: boolean
}

export interface MetalTone {
  id: number
  name: string
  id_metal: number
  is_active: boolean
}

export interface DiamondGroup {
  id: number
  name: string
  description: string | null
  is_active: boolean
}

export interface DiamondQuality {
  id: number
  name: string
  description: string | null
  is_active: boolean
}

export interface DiamondShape {
  id: number
  name: string
  is_active: boolean
}

export interface DiamondClarity {
  id: number
  name: string
  is_active: boolean
}

export interface DiamondCut {
  id: number
  name: string
  is_active: boolean
}

export interface DiamondColor {
  id: number
  name: string
  is_active: boolean
}

// Stone Types
export interface Stone {
  id: number
  name: string
  is_active: boolean
}

export interface StoneShape {
  id: number
  name: string
  id_stone: number
  is_active: boolean
}

export interface StoneColor {
  id: number
  name: string
  id_stone: number
  is_active: boolean
}

export interface StoneClarity {
  id: number
  name: string
  id_stone: number
  is_active: boolean
}

export interface StoneCut {
  id: number
  name: string
  id_stone: number
  is_active: boolean
}

// Attribute Types
export interface Attribute {
  id: number
  name: string
  attribute_type: string
  is_active: boolean
  values?: AttributeValue[]
}

export interface AttributeValue {
  id: number
  id_attribute: number
  value: string
  sort_order: number
  is_active: boolean
}

// Review Types
export interface CustomerReview {
  id: number
  id_customer: number
  customer_name: string
  id_product: number
  product_name: string
  rating: number
  title: string | null
  review: string
  is_approved: boolean
  created_at: string
}

// Enquiry Types
export interface ProductEnquiry {
  id: number
  id_customer: number
  customer_name: string
  customer_email: string
  id_product: number
  product_name: string
  message: string
  is_replied: boolean
  reply_message: string | null
  created_at: string
}

export interface GeneralEnquiry {
  id: number
  name: string
  email: string
  phone_number: string | null
  subject: string | null
  message: string
  is_replied: boolean
  reply_message: string | null
  created_at: string
}

// Banner Types
export interface Banner {
  id: number
  title: string
  description: string | null
  image_path: string
  link_url: string | null
  sort_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

// Blog Types
export interface Blog {
  id: number
  title: string
  slug: string
  content: string
  image_path: string | null
  author_name: string | null
  meta_title: string | null
  meta_description: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// Setting Types
export interface TaxRate {
  id: number
  name: string
  rate: number
  is_active: boolean
}

export interface Currency {
  id: number
  name: string
  code: string
  symbol: string
  exchange_rate: number
  is_default: boolean
  is_active: boolean
}

export interface Country {
  id: number
  name: string
  code: string
  is_active: boolean
}

export interface State {
  id: number
  id_country: number
  name: string
  code: string
  is_active: boolean
}

export interface City {
  id: number
  id_state: number
  name: string
  is_active: boolean
}

// Gift Set Types
export interface GiftSet {
  id: number
  name: string
  sku: string
  description: string | null
  price: number
  image_path: string | null
  products: GiftSetProduct[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GiftSetProduct {
  id: number
  id_gift_set: number
  id_product: number
  quantity: number
}

// Subscriber Types
export interface Subscriber {
  id: number
  email: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
}

// Error Types
export interface APIError {
  code: number
  message: string
  data: null
}

// Common utility types
export type TBitFieldValue = 0 | 1 | '0' | '1'

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type AsyncResult<T> = Promise<T> | T

// Form types
export interface ProductFormData {
  name: string
  sku: string
  sort_description: string
  long_description: string
  price: number
  making_charge: number
  finding_charge: number
  other_charge: number
}

export interface CategoryFormData {
  name: string
  description: string
  parent_id: number | null
  image_path: string | null
}

export interface CollectionFormData {
  name: string
  description: string
  banner_image_path: string | null
}
