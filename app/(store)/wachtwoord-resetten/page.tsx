'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function WachtwoordResettenPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn.')
      return
    }
    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Er ging iets mis. De resetlink is mogelijk verlopen — vraag een nieuwe aan.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => {
      router.push('/inloggen')
    }, 3000)
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
            Nieuw wachtwoord instellen
          </h1>
          <p className="mt-1 text-neutral-500">
            Kies een nieuw sterk wachtwoord voor je account.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-100 bg-white p-8 shadow-card">
          {done ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-lg font-extrabold text-neutral-800 mb-2">
                Wachtwoord bijgewerkt!
              </h2>
              <p className="text-sm text-neutral-500">
                Je wordt automatisch doorgestuurd naar de inlogpagina…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nieuw wachtwoord"
                type="password"
                placeholder="Minimaal 8 tekens"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label="Bevestig wachtwoord"
                type="password"
                placeholder="Herhaal je wachtwoord"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Wachtwoord opslaan
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
