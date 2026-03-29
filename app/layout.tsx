import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
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
    'gepersonaliseerde kindercadeaus',
    'tandendoosje met naam',
    'houten koffertje kind',
    'siliconen slabber naam',
    'kraamcadeau gepersonaliseerd',
    'julies art',
  ],
  authors: [{ name: 'Julies Art' }],
  creator: 'Julies Art',
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
    description: SITE_DESCRIPTION,
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
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=Great+Vibes&family=Caveat:wght@400;600&family=Quicksand:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-[family-name:var(--font-nunito)] antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
