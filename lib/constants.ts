// ============================================================
// JULIES ART — App Constants
// ============================================================

export const SITE_NAME = 'Julies Art'
export const SITE_TAGLINE = 'Gepersonaliseerde kindercadeaus met liefde gemaakt'
export const SITE_DESCRIPTION =
  'Ontdek onze collectie gepersonaliseerde kindercadeaus. Van tandendoosjes tot houten koffertjes — elk stuk wordt voorzien van de naam van jouw kind.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://juliesart.nl'

// Shipping
export const FREE_SHIPPING_THRESHOLD = 50 // euros
export const SHIPPING_RATE = 4.95 // euros

// VAT
export const VAT_RATE = 0.21 // 21% BTW

// Pagination
export const PRODUCTS_PER_PAGE = 12
export const ORDERS_PER_PAGE = 20
export const CUSTOMERS_PER_PAGE = 25

// Cart
export const MAX_CART_ITEM_QUANTITY = 10

// Images
export const PRODUCT_IMAGE_ASPECT_RATIO = '4/3'

// Social
export const INSTAGRAM_URL = 'https://www.instagram.com/julies.art7'
export const FACEBOOK_URL = 'https://facebook.com/juliesart'

// Contact
export const CONTACT_EMAIL = 'info@juliesart.nl'
export const CONTACT_PHONE = '+31 6 00 00 00 00'
export const CONTACT_ADDRESS = 'Nederland'

// Trust badges copy
export const TRUST_BADGES = [
  {
    icon: 'heart',
    title: 'Met liefde gemaakt',
    description: 'Elk product wordt met aandacht en zorg voor jou gemaakt.',
  },
  {
    icon: 'truck',
    title: 'Snel verzonden',
    description: 'Besteld voor 14:00 = dezelfde dag verwerkt.',
  },
  {
    icon: 'shield',
    title: 'Veilig betalen',
    description: 'Betaal veilig via iDEAL, creditcard of Bancontact.',
  },
  {
    icon: 'refresh',
    title: 'Klantenservice',
    description: 'Niet tevreden? Neem gerust contact op.',
  },
] as const

// Order statuses (for UI)
export const ORDER_STATUSES = [
  { value: 'pending', label: 'In afwachting' },
  { value: 'paid', label: 'Betaald' },
  { value: 'processing', label: 'In verwerking' },
  { value: 'shipped', label: 'Verzonden' },
  { value: 'delivered', label: 'Afgeleverd' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'refunded', label: 'Terugbetaald' },
] as const

// Personalization field types
export const FIELD_TYPES = [
  { value: 'text', label: 'Tekstveld' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio knoppen' },
  { value: 'color', label: 'Kleurkeuze' },
  { value: 'font', label: 'Letterkeuze' },
  { value: 'icon', label: 'Icoonkeuze' },
  { value: 'size', label: 'Maat' },
] as const

// Google Fonts available for font personalization options
export const AVAILABLE_FONTS = [
  { name: 'Pacifico', label: 'Speels' },
  { name: 'Great Vibes', label: 'Sierlijk' },
  { name: 'Nunito', label: 'Modern' },
  { name: 'Caveat', label: 'Handgeschreven' },
  { name: 'Quicksand', label: 'Zacht' },
] as const

// Analytics event types
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_START: 'checkout_start',
  PURCHASE: 'purchase',
} as const
