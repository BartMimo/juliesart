'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Vul je naam in'),
  email: z.string().email('Voer een geldig e-mailadres in'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
  marketing_consent: z.boolean().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegistrerenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          marketing_consent: data.marketing_consent ?? false,
        },
      },
    })

    if (error) {
      toast.error('Registratie mislukt', error.message)
      setLoading(false)
      return
    }

    toast.success('Account aangemaakt!', 'Controleer je e-mail voor een bevestigingslink.')
    router.push('/inloggen')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-black">JA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Account aanmaken</h1>
          <p className="text-neutral-500 mt-1">Bewaar je bestellingen en bestel eenvoudig opnieuw.</p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Jouw naam"
              placeholder="Marie de Vries"
              required
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="E-mailadres"
              type="email"
              placeholder="jij@email.nl"
              required
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Wachtwoord"
              type="password"
              placeholder="Minimaal 8 tekens"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Marketing consent (GDPR) */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-brand-500 rounded shrink-0"
                {...register('marketing_consent')}
              />
              <span className="text-sm text-neutral-600 leading-relaxed">
                Ja, ik wil graag de nieuwsbrief ontvangen met aanbiedingen en nieuwtjes van Julies Art.
                <span className="text-neutral-400"> (Optioneel — je kunt je altijd afmelden.)</span>
              </span>
            </label>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Account aanmaken
            </Button>
          </form>

          <p className="text-xs text-neutral-400 text-center mt-4">
            Door je te registreren ga je akkoord met onze{' '}
            <Link href="/algemene-voorwaarden" className="underline hover:text-brand-500">
              algemene voorwaarden
            </Link>{' '}
            en{' '}
            <Link href="/privacybeleid" className="underline hover:text-brand-500">
              privacybeleid
            </Link>
            .
          </p>

          <p className="text-center text-sm text-neutral-500 mt-4">
            Al een account?{' '}
            <Link href="/inloggen" className="text-brand-500 font-semibold hover:text-brand-600">
              Inloggen
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
