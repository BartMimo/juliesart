import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { buildGoogleFontsUrl } from '@/lib/fonts'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, INSTAGRAM_URL, FACEBOOK_URL, CONTACT_EMAIL } from '@/lib/constants'
import { Toaster } from '@/components/ui/toaster'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Merk
    'julies art',
    'juliesart',
    'julies art webshop',
    // Generiek
    'gepersonaliseerde kindercadeaus',
    'kindercadeaus met naam',
    'cadeaus op naam',
    'gepersonaliseerde baby cadeaus',
    'unieke kindercadeaus',
    'handgemaakte kindercadeaus nederland',
    // Productgericht
    'tandendoosje met naam',
    'tandendoosje hout gepersonaliseerd',
    'houten koffertje kind',
    'houten koffertje met naam',
    'siliconen slabber naam',
    'gepersonaliseerde slabber',
    'houten speelgoed naam',
    'gepersonaliseerd houten cadeau',
    'eigen ontwerp op cadeau',
    'tekening op product zetten',
    'kindertekening op product',
    // Gelegenheid
    'kraamcadeau gepersonaliseerd',
    'kraamcadeau met naam',
    'verjaardag cadeau kind met naam',
    'babyshower cadeau gepersonaliseerd',
    'geboorte cadeau gepersonaliseerd',
    'eerste verjaardag cadeau',
    'gepersonaliseerd cadeau meisje',
    'gepersonaliseerd cadeau jongen',
    // Long-tail
    'cadeau kind met naam graveren',
    'webshop gepersonaliseerde kindercadeaus nederland',
    'origineel kraamcadeau naam baby',
    'houten cadeau graveren kind',
  ],
  authors: [{ name: 'Julies Art' }],
  creator: 'Julies Art',
  publisher: 'Julies Art',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/logo2.png`,
        alt: 'Julies Art — Gepersonaliseerde Kindercadeaus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/logo2.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'JOUW_GOOGLE_VERIFICATION_CODE', // Voeg toe na Search Console verificatie
  },
}

// ── JSON-LD Structured Data ──────────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 200,
    height: 60,
  },
  description: SITE_DESCRIPTION,
  email: CONTACT_EMAIL,
  sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
  contactPoint: {
    '@type': 'ContactPoint',
    email: CONTACT_EMAIL,
    contactType: 'customer service',
    availableLanguage: 'Dutch',
    areaServed: 'NL',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/collecties?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={nunito.variable}>
      <head>
        {/* Google Fonts for personalization font previews */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={buildGoogleFontsUrl()} rel="stylesheet" />
      </head>
      <body className="font-[family-name:var(--font-nunito)] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
