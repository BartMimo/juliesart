'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

const loginSchema = z.object({
  email: z.string().email('Voer een geldig e-mailadres in'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function InloggenPage() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') ?? '/account'
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast({
        type: 'error',
        title: 'Inloggen mislukt',
        description: 'Controleer je e-mailadres en wachtwoord.',
      })
      setLoading(false)
      return
    }

    window.location.href = nextUrl
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
            Welkom terug!
          </h1>
          <p className="mt-1 text-neutral-500">
            Log in om je bestellingen te bekijken.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-100 bg-white p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="E-mailadres"
              type="email"
              placeholder="jij@email.nl"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Wachtwoord"
                type="password"
                placeholder="••••••••"
                required
                error={errors.password?.message}
                {...register('password')}
              />

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

          <p className="mt-6 text-center text-sm text-neutral-500">
            Nog geen account?{' '}
            <Link
              href="/registreren"
              className="font-semibold text-brand-500 hover:text-brand-600"
            >
              Registreer je hier
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}