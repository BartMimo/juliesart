import { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ConfiguratorClient from './configurator-client'

export const metadata: Metadata = {
  title: 'Eigen Ontwerp',
  description:
    'Zet jouw eigen tekening of ontwerp op een product in vier stappen. Upload je ontwerp, kies een product en bepaal de plaatsing. Het perfecte unieke cadeau voor elk kind.',
  openGraph: {
    title: `Eigen Ontwerp | ${SITE_NAME}`,
    description:
      'Zet jouw eigen tekening of ontwerp op een product in vier stappen. Upload je ontwerp, kies een product en bepaal de plaatsing.',
    url: `${SITE_URL}/configurator`,
  },
  keywords: [
    'eigen ontwerp op product',
    'tekening op cadeau',
    'kindertekening op product zetten',
    'gepersonaliseerd cadeau eigen ontwerp',
    'eigen ontwerp kindercadeau',
  ],
}

export default function ConfiguratorPage() {
  return <ConfiguratorClient />
}
