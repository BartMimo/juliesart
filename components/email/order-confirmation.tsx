import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
  Tailwind,
  Hr,
} from '@react-email/components'
import { Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { SITE_URL, SITE_NAME } from '@/lib/constants'

interface OrderConfirmationEmailProps {
  order: Order
}

export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  const items = order.items ?? []

  return (
    <Html lang="nl">
      <Head />
      <Preview>
        Bedankt voor je bestelling {order.order_number}! We gaan er meteen mee aan de slag.
      </Preview>
      <Tailwind>
        <Body className="bg-[#fdf8f2] font-sans">
          <Container className="max-w-[600px] mx-auto">
            {/* Header */}
            <Section className="bg-[#fdf0e0] rounded-t-2xl px-8 py-8 text-center">
              <Row>
                <Column className="text-right pr-2">
                  <Img
                    src={`${SITE_URL}/logo2.png`}
                    width="80"
                    height="80"
                    alt="Julies Art logo"
                    style={{ display: 'inline-block' }}
                  />
                </Column>
                <Column className="text-left pl-2" style={{ verticalAlign: 'middle' }}>
                  <Img
                    src={`${SITE_URL}/naam.png`}
                    width="180"
                    alt="Julies Art"
                    style={{ display: 'inline-block' }}
                  />
                </Column>
              </Row>
              <Text className="text-[#a87048] text-sm mt-3 m-0 font-medium">
                Gepersonaliseerde kindercadeaus met liefde gemaakt
              </Text>
            </Section>

            {/* Main card */}
            <Section className="bg-white px-8 py-10 rounded-b-2xl border border-[#e4d0b8]">
              {/* Greeting */}
              <Heading as="h1" className="text-[#262626] text-2xl font-bold m-0 mb-3">
                Bedankt voor je bestelling!
              </Heading>
              <Text className="text-[#737373] text-base leading-relaxed m-0 mb-6">
                Lieve {order.customer_name ?? order.email.split('@')[0]}, je bestelling is in goede orde ontvangen en
                betaald. We gaan er meteen mee aan de slag! Je kunt hieronder een samenvatting
                van je bestelling bekijken.
              </Text>

              {/* Order info box */}
              <Section className="bg-[#faf6f0] border border-[#e4d0b8] rounded-2xl px-6 py-5 mb-6">
                <Row>
                  <Column>
                    <Text className="text-xs font-bold text-[#a87048] uppercase tracking-wide m-0 mb-1">
                      Bestelnummer
                    </Text>
                    <Text className="text-[#262626] font-bold text-base m-0">
                      {order.order_number}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-xs font-bold text-[#a87048] uppercase tracking-wide m-0 mb-1">
                      Datum
                    </Text>
                    <Text className="text-[#262626] font-bold text-base m-0">
                      {formatDate(order.created_at)}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-xs font-bold text-[#a87048] uppercase tracking-wide m-0 mb-1">
                      Totaal
                    </Text>
                    <Text className="text-[#262626] font-bold text-base m-0">
                      {formatPrice(order.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Items */}
              <Heading as="h2" className="text-[#262626] text-lg font-bold m-0 mb-4">
                Jouw bestelling
              </Heading>

              {items.map((item) => (
                <Section key={item.id} className="mb-4 pb-4 border-b border-[#f5f5f5] last:border-b-0 last:mb-0 last:pb-0">
                  <Row>
                    <Column className="w-[80%]">
                      <Text className="text-[#262626] font-semibold text-sm m-0">
                        {item.quantity}× {item.product_name}
                      </Text>
                      {/* Personalizations */}
                      {(item.personalizations ?? []).map((p) => (
                        <Text key={p.field_key} className="text-[#737373] text-xs m-0 mt-0.5">
                          {p.field_label}: <span className="font-medium text-[#525252]">{p.display_value ?? p.value}</span>
                        </Text>
                      ))}
                    </Column>
                    <Column className="w-[20%] text-right">
                      <Text className="text-[#262626] font-bold text-sm m-0">
                        {formatPrice(item.total_price)}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}

              <Hr className="border-[#e5e5e5] my-6" />

              {/* Totals */}
              <Section className="mb-6">
                <Row className="mb-2">
                  <Column><Text className="text-[#737373] text-sm m-0">Subtotaal</Text></Column>
                  <Column className="text-right"><Text className="text-[#737373] text-sm m-0">{formatPrice(order.subtotal)}</Text></Column>
                </Row>
                {order.discount_amount > 0 && (
                  <Row className="mb-2">
                    <Column>
                      <Text className="text-[#16a34a] text-sm font-semibold m-0">
                        Korting {order.discount_code && `(${order.discount_code})`}
                      </Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-[#16a34a] text-sm font-semibold m-0">
                        -{formatPrice(order.discount_amount)}
                      </Text>
                    </Column>
                  </Row>
                )}
                <Row className="mb-2">
                  <Column><Text className="text-[#737373] text-sm m-0">Verzending</Text></Column>
                  <Column className="text-right">
                    <Text className="text-[#737373] text-sm m-0">
                      {order.shipping_amount === 0 ? 'Gratis' : formatPrice(order.shipping_amount)}
                    </Text>
                  </Column>
                </Row>
                <Hr className="border-[#e5e5e5] my-3" />
                <Row>
                  <Column><Text className="text-[#262626] font-bold text-base m-0">Totaal betaald</Text></Column>
                  <Column className="text-right">
                    <Text className="text-[#a87048] font-black text-xl m-0">{formatPrice(order.total)}</Text>
                  </Column>
                </Row>
              </Section>

              {/* Delivery address */}
              {order.shipping_address_line1 && (
                <Section className="bg-[#fafafa] rounded-2xl px-5 py-4 mb-6">
                  <Text className="text-xs font-bold text-[#737373] uppercase tracking-wide m-0 mb-2">
                    Bezorgadres
                  </Text>
                  <Text className="text-[#525252] text-sm m-0">
                    {order.shipping_name}
                    <br />{order.shipping_address_line1}
                    {order.shipping_address_line2 && <><br />{order.shipping_address_line2}</>}
                    <br />{order.shipping_postal_code} {order.shipping_city}
                    <br />Nederland
                  </Text>
                </Section>
              )}

              {/* Message */}
              <Section className="bg-[#faf6f0] border border-[#e4d0b8] rounded-2xl px-6 py-5 mb-6">
                <Text className="text-[#6b3e25] font-semibold text-sm m-0 mb-2">
                  Wat kun je verwachten?
                </Text>
                <Text className="text-[#737373] text-sm leading-relaxed m-0">
                  We verwerken je bestelling zo snel mogelijk. Gepersonaliseerde producten worden
                  op maat gemaakt en zijn over het algemeen <strong>binnen 3–5 werkdagen</strong>{' '}
                  bij je bezorgd. Je ontvangt een e-mail zodra je pakketje onderweg is.
                </Text>
              </Section>

              {/* CTA */}
              <Section className="text-center mb-6">
                <Link
                  href={`${SITE_URL}/account/bestellingen/${order.id}`}
                  className="bg-[#a87048] text-white font-bold text-base px-8 py-4 rounded-full no-underline inline-block"
                >
                  Bekijk je bestelling →
                </Link>
              </Section>

              {/* Footer message */}
              <Text className="text-[#a3a3a3] text-xs text-center leading-relaxed m-0">
                Heb je vragen? Stuur een e-mail naar{' '}
                <Link href="mailto:info@juliesart.nl" className="text-[#a87048]">
                  info@juliesart.nl
                </Link>
                . We helpen je graag!
              </Text>
            </Section>

            {/* Email footer */}
            <Section className="py-6 text-center">
              <Text className="text-[#a3a3a3] text-xs m-0">
                © {new Date().getFullYear()} {SITE_NAME} · Gepersonaliseerde kindercadeaus · Nederland
              </Text>
              <Text className="text-[#a3a3a3] text-xs m-0 mt-1">
                Je ontvangt dit bericht omdat je een bestelling hebt geplaatst bij Julies Art.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
