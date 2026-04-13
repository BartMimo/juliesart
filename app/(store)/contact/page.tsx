import { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ContactClient from './contact-client'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Neem contact op met Julies Art. Heb je een vraag over een product, bestelling of speciale wens? We reageren binnen 1 werkdag.',
  openGraph: {
    title: `Contact | ${SITE_NAME}`,
    description:
      'Neem contact op met Julies Art. Heb je een vraag over een product, bestelling of speciale wens? We reageren binnen 1 werkdag.',
    url: `${SITE_URL}/contact`,
  },
}

export default function ContactPage() {
  return <ContactClient />
}
