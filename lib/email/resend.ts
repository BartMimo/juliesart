import { Resend } from 'resend'
import { EngravingPosition, Order } from '@/types'
import { OrderConfirmationEmail } from '@/components/email/order-confirmation'
import { ConfiguratorConfirmationEmail } from '@/components/email/configurator-confirmation'

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

interface ConfiguratorEmailPayload {
  order: Order
  productName: string
  uploadUrl: string
  engravingPosition: EngravingPosition | null
  note?: string
}

export async function sendConfiguratorConfirmationEmail(payload: ConfiguratorEmailPayload): Promise<void> {
  if (!payload.order.email) {
    console.error('Cannot send configurator confirmation: no email address')
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Julies Art <bestellingen@juliesart.nl>'

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [payload.order.email],
    subject: `Bevestiging bestelling ${payload.order.order_number} — Julies Art`,
    react: ConfiguratorConfirmationEmail(payload),
  })

  if (error) {
    console.error('Failed to send configurator confirmation email:', error)
    throw new Error(`Email send failed: ${error.message}`)
  }

  console.log(`Configurator confirmation sent to ${payload.order.email} for order ${payload.order.order_number}`)
}
