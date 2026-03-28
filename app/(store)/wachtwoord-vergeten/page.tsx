'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/wachtwoord-resetten`,
    })

    if (error) {
      setError('Er ging iets mis. Controleer het e-mailadres en probeer opnieuw.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500">
            <span className="text-xl font-black text-white">JA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">
            Wachtwoord vergeten
          </h1>
          <p className="mt-1 text-neutral-500">
            Vul je e-mailadres in en we sturen je een resetlink.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-100 bg-white p-8 shadow-card">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-lg font-extrabold text-neutral-800 mb-2">
                E-mail verstuurd!
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een e-mail met een link om je wachtwoord opnieuw in te stellen.
              </p>
              <p className="mt-3 text-xs text-neutral-400">
                Geen e-mail ontvangen? Controleer je spammap.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="E-mailadres"
                type="email"
                placeholder="jij@email.nl"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Resetlink versturen
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/inloggen"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Terug naar inloggen
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
