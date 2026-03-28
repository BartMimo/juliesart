import { createClient } from '@supabase/supabase-js'

// Admin/service-role Supabase client — bypasses RLS
// Use ONLY in server-side API routes (e.g. Stripe webhook)
// NEVER expose to client
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
