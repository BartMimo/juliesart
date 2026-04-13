'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Clock, Send, Gift } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SectionReveal } from '@/components/store/section-reveal'
import { useToast } from '@/components/ui/toaster'

const contactSchema = z.object({
  name: z.string().min(2, 'Vul je naam in'),
  email: z.string().email('Voer een geldig e-mailadres in'),
  subject: z.string().min(3, 'Vul een onderwerp in'),
  message: z.string().min(10, 'Schrijf een bericht van minimaal 10 tekens'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactClient() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Verzenden mislukt')
      setSent(true)
      reset()
      toast.success('Bericht verzonden!', 'We reageren zo snel mogelijk.')
    } catch {
      toast.error('Er ging iets mis', 'Probeer het later opnieuw of mail ons direct.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-16">
      <div className="container-brand">
        <SectionReveal className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-2">Contact</p>
          <h1 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-3">
            We helpen je graag!
          </h1>
          <p className="text-neutral-500 text-lg">
            Heb je een vraag over een product, een bestelling of iets anders?
            Stuur ons een bericht — we reageren binnen 1 werkdag.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Contact info */}
          <SectionReveal direction="left">
            <div className="space-y-6">
              {[
                { icon: Mail, title: 'E-mail', value: 'info@juliesart.nl', href: 'mailto:info@juliesart.nl' },
                { icon: Clock, title: 'Bereikbaarheid', value: 'Ma–Vr, 9:00–17:00', href: null },
              ].map(({ icon: Icon, title, value, href }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">{title}</p>
                    {href ? (
                      <a href={href} className="font-semibold text-neutral-800 hover:text-brand-600 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="font-semibold text-neutral-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Gift className="h-3.5 w-3.5 text-brand-600" />
                  </div>
                  <p className="text-sm font-semibold text-brand-700">Speciale wens?</p>
                </div>
                <p className="text-sm text-brand-600 leading-relaxed">
                  Wil je een product op maat voor een bijzondere gelegenheid?
                  Stuur ons een bericht en we denken graag met je mee!
                </p>
              </div>
            </div>
          </SectionReveal>

          {/* Contact form */}
          <SectionReveal direction="right" className="lg:col-span-2">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-neutral-100 shadow-card p-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Bericht ontvangen!</h2>
                <p className="text-neutral-500">
                  Bedankt voor je bericht. We reageren zo snel mogelijk, uiterlijk binnen 3 werkdagen.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-brand-500 hover:text-brand-600 text-sm font-semibold"
                >
                  Nog een bericht sturen
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-card p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Naam"
                      placeholder="Marie de Vries"
                      required
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="E-mailadres"
                      type="email"
                      placeholder="jij@email.nl"
                      required
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                  <Input
                    label="Onderwerp"
                    placeholder="Vraag over mijn bestelling"
                    required
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                  <Textarea
                    label="Bericht"
                    placeholder="Schrijf hier je vraag of bericht…"
                    required
                    rows={5}
                    error={errors.message?.message}
                    {...register('message')}
                  />
                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    <Send className="h-4 w-4" />
                    Verstuur bericht
                  </Button>
                </form>
              </div>
            )}
          </SectionReveal>
        </div>
      </div>
    </div>
  )
}
