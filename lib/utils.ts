import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price as Dutch currency
export function formatPrice(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}

// Format date as Dutch date string
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(new Date(dateString))
}

// Format date short (14 jan 2024)
export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

// Generate a slug from a string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '')
}

// Truncate text to a max length
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

// Calculate discount amount
export function calculateDiscount(
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.min((subtotal * discountValue) / 100, subtotal)
  }
  return Math.min(discountValue, subtotal)
}

// Generate a random session ID for analytics
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

// Get order status label in Dutch
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'In afwachting',
    paid: 'Betaald',
    processing: 'In verwerking',
    shipped: 'Verzonden',
    delivered: 'Afgeleverd',
    cancelled: 'Geannuleerd',
    refunded: 'Terugbetaald',
  }
  return labels[status] ?? status
}

// Get order status color
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    paid: 'text-blue-600 bg-blue-50 border-blue-200',
    processing: 'text-purple-600 bg-purple-50 border-purple-200',
    shipped: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    delivered: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    refunded: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  return colors[status] ?? 'text-gray-600 bg-gray-50 border-gray-200'
}

// Strip HTML tags for plain text
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// Calculate total cart price including personalization modifiers
export function calculateCartTotal(items: Array<{ unitPrice: number; quantity: number }>) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

// Validate Dutch postal code (1234 AB)
export function isValidDutchPostalCode(code: string): boolean {
  return /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(code)
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Format personalization field type label
export function getFieldTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: 'Tekstveld',
    select: 'Dropdown',
    radio: 'Radio knoppen',
    color: 'Kleurkeuze',
    font: 'Letterkeuze',
    icon: 'Icoonkeuze',
    size: 'Maat',
  }
  return labels[type] ?? type
}
