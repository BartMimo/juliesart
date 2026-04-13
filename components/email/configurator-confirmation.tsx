import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Img,
  Preview,
} from '@react-email/components'
import { EngravingPosition, Order } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ConfiguratorConfirmationEmailProps {
  order: Order
  productName: string
  uploadUrl: string
  engravingPosition: EngravingPosition | null
  note?: string
}

export function ConfiguratorConfirmationEmail({
  order,
  productName,
  uploadUrl,
  engravingPosition,
  note,
}: ConfiguratorConfirmationEmailProps) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>Bedankt voor je bestelling bij Julies Art!</Preview>
      <Body style={{ backgroundColor: '#f9f5f0', fontFamily: 'Georgia, serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#d4a76a', padding: '32px 40px', textAlign: 'center' }}>
            <Heading style={{ color: '#ffffff', fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              Julies Art
            </Heading>
            <Text style={{ color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', fontSize: 14 }}>
              Handgemaakt met liefde
            </Text>
          </Section>

          {/* Intro */}
          <Section style={{ padding: '32px 40px 0' }}>
            <Heading as="h2" style={{ color: '#2d2d2d', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              Bedankt voor je bestelling, {order.customer_name ?? 'lieve klant'}!
            </Heading>
            <Text style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              We hebben je bestelling goed ontvangen. Zodra je betaling is verwerkt, gaan we
              direct aan de slag met jouw eigen ontwerp.
            </Text>
          </Section>

          {/* Order number */}
          <Section style={{ padding: '24px 40px 0' }}>
            <div style={{ backgroundColor: '#fdf8f3', borderRadius: 10, padding: '16px 20px', display: 'inline-block', width: '100%' }}>
              <Text style={{ color: '#888', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bestelnummer
              </Text>
              <Text style={{ color: '#2d2d2d', fontSize: 18, fontWeight: 700, margin: 0 }}>
                {order.order_number}
              </Text>
            </div>
          </Section>

          <Hr style={{ borderColor: '#f0e8dc', margin: '28px 40px' }} />

          {/* Order details */}
          <Section style={{ padding: '0 40px' }}>
            <Heading as="h3" style={{ color: '#2d2d2d', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
              Besteldetails
            </Heading>

            <Row style={{ marginBottom: 12 }}>
              <Column style={{ width: '40%' }}>
                <Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Product</Text>
              </Column>
              <Column>
                <Text style={{ color: '#2d2d2d', fontSize: 14, fontWeight: 600, margin: 0 }}>
                  {productName}
                </Text>
              </Column>
            </Row>

            <Row style={{ marginBottom: 12 }}>
              <Column style={{ width: '40%' }}>
                <Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Totaalbedrag</Text>
              </Column>
              <Column>
                <Text style={{ color: '#d4a76a', fontSize: 14, fontWeight: 700, margin: 0 }}>
                  {formatPrice(order.total)}
                </Text>
              </Column>
            </Row>

            {engravingPosition && (
              <Row style={{ marginBottom: 12 }}>
                <Column style={{ width: '40%' }}>
                  <Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Plaatsing op product</Text>
                </Column>
                <Column>
                  <Text style={{ color: '#2d2d2d', fontSize: 13, margin: 0 }}>
                    X: {Math.round(engravingPosition.x)}% &middot; Y: {Math.round(engravingPosition.y)}%
                    &mdash; {Math.round(engravingPosition.width)}% &times; {Math.round(engravingPosition.height)}%
                    {(engravingPosition.rotation ?? 0) > 0 ? ` — ${Math.round(engravingPosition.rotation)}°` : ''}
                  </Text>
                </Column>
              </Row>
            )}

            {note && (
              <Row>
                <Column style={{ width: '40%' }}>
                  <Text style={{ color: '#888', fontSize: 13, margin: 0 }}>Opmerking</Text>
                </Column>
                <Column>
                  <Text style={{ color: '#2d2d2d', fontSize: 13, margin: 0 }}>{note}</Text>
                </Column>
              </Row>
            )}
          </Section>

          {/* Uploaded drawing */}
          <Section style={{ padding: '24px 40px 0' }}>
            <Heading as="h3" style={{ color: '#2d2d2d', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>
              Jouw ontwerp
            </Heading>
            <Img
              src={uploadUrl}
              alt="Geüploade tekening"
              style={{ maxWidth: '100%', borderRadius: 10, border: '1px solid #f0e8dc' }}
            />
          </Section>

          <Hr style={{ borderColor: '#f0e8dc', margin: '28px 40px' }} />

          {/* What's next */}
          <Section style={{ padding: '0 40px 32px' }}>
            <Heading as="h3" style={{ color: '#2d2d2d', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>
              Wat gebeurt er nu?
            </Heading>
            <Text style={{ color: '#555', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>
              1. We controleren je ontwerp en verwerken je betaling.
            </Text>
            <Text style={{ color: '#555', fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>
              2. We zetten jouw eigen ontwerp op het gekozen product.
            </Text>
            <Text style={{ color: '#555', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              3. We sturen je product naar je toe — je ontvangt een track & trace zodra het verstuurd is.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#fdf8f3', padding: '24px 40px', textAlign: 'center', borderTop: '1px solid #f0e8dc' }}>
            <Text style={{ color: '#888', fontSize: 13, margin: '0 0 8px' }}>
              Vragen? Mail naar{' '}
              <a href="mailto:info@juliesart.nl" style={{ color: '#d4a76a', textDecoration: 'none' }}>
                info@juliesart.nl
              </a>
            </Text>
            <Text style={{ color: '#bbb', fontSize: 12, margin: 0 }}>
              © {new Date().getFullYear()} Julies Art · Met liefde gemaakt
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
