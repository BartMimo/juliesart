'use client'

import { generateSessionId } from '@/lib/utils'

// Get or create a session ID for analytics tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('ja_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('ja_session_id', sessionId)
  }
  return sessionId
}

// Track a page view
export async function trackPageView(path: string, productId?: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        product_id: productId ?? null,
        session_id: getSessionId(),
        referrer: document.referrer || null,
      }),
    })
  } catch {
    // Analytics failures should not break the user experience
  }
}
