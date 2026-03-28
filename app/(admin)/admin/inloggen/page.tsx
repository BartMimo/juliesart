'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { error: toastError } = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toastError('Inloggen mislukt', 'Controleer je gegevens.')
      setLoading(false)
      return
    }

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      toastError('Geen toegang', 'Dit account heeft geen beheerdersrechten.')
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-black">JA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Admin inloggen</h1>
          <p className="text-neutral-500 text-sm mt-1">Uitsluitend voor beheerders</p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="E-mailadres" type="email" required error={errors.email?.message} {...register('email')} />
            <div>
              <Input label="Wachtwoord" type="password" required error={errors.password?.message} {...register('password')} />
              <div className="mt-1.5 text-right">
                <Link href="/wachtwoord-vergeten" className="text-xs text-brand-500 hover:text-brand-600">
                  Wachtwoord vergeten?
                </Link>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Inloggen
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
