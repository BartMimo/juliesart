import { Resend } from 'resend'
import { Order } from '@/types'
import { OrderConfirmationEmail } from '@/components/email/order-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!order.email) {
    console.error('Cannot send order confirmation: no email address')
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Julies Art <bestellingen@juliesart.nl>'

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [order.email],
    subject: `Bevestiging bestelling ${order.order_number} — Julies Art`,
    react: OrderConfirmationEmail({ order }),
  })

  if (error) {
    console.error('Failed to send order confirmation email:', error)
    throw new Error(`Email send failed: ${error.message}`)
  }

  console.log(`Order confirmation sent to ${order.email} for order ${order.order_number}`)
}
