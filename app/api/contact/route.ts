import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
  }

  const { name, email, subject, message } = parsed.data
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Julies Art <info@juliesart.nl>'

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: ['info@juliesart.nl'],
    replyTo: email,
    subject: `Contactformulier: ${subject}`,
    text: `Naam: ${name}\nE-mail: ${email}\n\n${message}`,
  })

  if (error) {
    console.error('Contact email failed:', error)
    return NextResponse.json({ error: 'Verzenden mislukt' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
