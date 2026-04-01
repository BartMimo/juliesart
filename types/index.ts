// ============================================================
// JULIES ART — Shared TypeScript Types
// ============================================================

// ----------------------------------------
// DATABASE TYPES (match Supabase schema)
// ----------------------------------------

export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  marketing_consent: boolean
  marketing_consent_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  is_sold_out: boolean
  stock_quantity: number | null
  track_inventory: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category | null
  images?: ProductImage[]
  personalization_fields?: PersonalizationField[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export type PersonalizationFieldType = 'text' | 'select' | 'radio' | 'color' | 'font' | 'icon' | 'size'

export interface PersonalizationField {
  id: string
  product_id: string
  type: PersonalizationFieldType
  key: string
  label: string
  placeholder: string | null
  help_text: string | null
  is_required: boolean
  max_length: number | null
  sort_order: number
  is_active: boolean
  created_at: string
  // Joined
  options?: PersonalizationOption[]
}

export interface PersonalizationOption {
  id: string
  field_id: string
  value: string
  label: string
  image_url: string | null
  color_hex: string | null
  font_preview: string | null
  price_modifier: number
  sort_order: number
  is_active: boolean
}

export type DiscountType = 'percentage' | 'fixed'

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  value: number
  min_order_amount: number | null
  max_uses: number | null
  current_uses: number
  is_active: boolean
  valid_from: string
  valid_until: string | null
  description: string | null
  stripe_coupon_id: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  email: string
  customer_name: string | null
  phone: string | null
  status: OrderStatus
  subtotal: number
  discount_amount: number
  discount_code: string | null
  discount_code_id: string | null
  shipping_amount: number
  tax_amount: number
  total: number
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  shipping_name: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
  customer_notes: string | null
  admin_notes: string | null
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  // Joined
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_slug: string
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  // Joined
  personalizations?: OrderItemPersonalization[]
}

export interface OrderItemPersonalization {
  id: string
  order_item_id: string
  field_key: string
  field_label: string
  field_type: string
  value: string
  display_value: string | null
}

export interface PageView {
  id: string
  path: string
  product_id: string | null
  session_id: string | null
  user_id: string | null
  referrer: string | null
  user_agent: string | null
  country: string | null
  created_at: string
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  product_id: string
  user_id: string | null
  author_name: string
  rating: number
  body: string | null
  status: ReviewStatus
  created_at: string
  updated_at: string
  // Joined
  product?: Pick<Product, 'id' | 'name' | 'slug'> | null
}

export interface SiteSetting {
  key: string
  value: unknown
  label: string | null
  updated_at: string
}

// ----------------------------------------
// CART TYPES (client-side state)
// ----------------------------------------

export interface CartPersonalizationValue {
  fieldKey: string
  fieldLabel: string
  fieldType: PersonalizationFieldType
  value: string
  displayValue: string // human-readable
}

export interface CartItem {
  id: string                          // client-side unique ID
  productId: string
  productName: string
  productSlug: string
  productImage: string | null
  quantity: number
  unitPrice: number                   // base price + any option modifiers
  basePrice: number
  personalizations: CartPersonalizationValue[]
}

export interface Cart {
  items: CartItem[]
  discountCode: string | null
  discountType: DiscountType | null
  discountValue: number | null
  discountAmount: number
}

// ----------------------------------------
// CHECKOUT / STRIPE TYPES
// ----------------------------------------

export interface CheckoutPayload {
  items: CartItem[]
  discountCodeId?: string
  discountCode?: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}

export interface DiscountValidationResult {
  valid: boolean
  code?: DiscountCode
  discountAmount?: number
  message?: string
}

// ----------------------------------------
// FORM TYPES
// ----------------------------------------

export interface PersonalizationValues {
  [fieldKey: string]: string
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface RegisterFormData {
  full_name: string
  email: string
  password: string
  marketing_consent: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

// ----------------------------------------
// ADMIN FORM TYPES
// ----------------------------------------

export interface ProductFormData {
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  compare_at_price: number | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  track_inventory: boolean
  stock_quantity: number | null
  meta_title: string
  meta_description: string
}

export interface CategoryFormData {
  name: string
  slug: string
  description: string
  sort_order: number
  is_active: boolean
}

export interface PersonalizationFieldFormData {
  type: PersonalizationFieldType
  key: string
  label: string
  placeholder: string
  help_text: string
  is_required: boolean
  max_length: number | null
  sort_order: number
}

export interface PersonalizationOptionFormData {
  value: string
  label: string
  image_url: string
  color_hex: string
  font_preview: string
  price_modifier: number
  sort_order: number
}

export interface DiscountCodeFormData {
  code: string
  type: DiscountType
  value: number
  min_order_amount: number | null
  max_uses: number | null
  is_active: boolean
  valid_from: string
  valid_until: string | null
  description: string
}

// ----------------------------------------
// ANALYTICS TYPES
// ----------------------------------------

export interface AnalyticsOverview {
  totalPageViews: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: { product_name: string; total_sold: number; revenue: number }[]
  ordersByDay: { date: string; orders: number; revenue: number }[]
}

// ----------------------------------------
// API RESPONSE TYPES
// ----------------------------------------

export interface ApiResponse<T = void> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
