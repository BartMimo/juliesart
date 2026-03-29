import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Heart } from 'lucide-react'
import { INSTAGRAM_URL, FACEBOOK_URL } from '@/lib/constants'

const footerLinks = {
  winkel: [
    { href: '/winkel', label: 'Alle producten' },
  ],
  info: [
    { href: '/contact', label: 'Contact' },
    { href: '/privacybeleid', label: 'Privacybeleid' },
    { href: '/algemene-voorwaarden', label: 'Algemene voorwaarden' },
  ],
  account: [
    { href: '/account', label: 'Mijn account' },
    { href: '/account/bestellingen', label: 'Mijn bestellingen' },
    { href: '/inloggen', label: 'Inloggen' },
    { href: '/registreren', label: 'Registreren' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 mt-auto">
      {/* Main footer */}
      <div className="container-brand py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo2.png"
                alt="Julies Art logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <Image
                src="/naam.png"
                alt="Julies Art"
                width={115}
                height={35}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed mb-5">
              Gepersonaliseerde kindercadeaus, met liefde gemaakt. Elk stuk is uniek, net als jouw kind.
            </p>
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-100 hover:bg-brand-200 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-brand-600" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-100 hover:bg-brand-200 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-brand-600" />
              </a>
            </div>
          </div>

          {/* Winkel */}
          <div>
            <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wide mb-4">
              Winkel
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.winkel.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-brand-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wide mb-4">
              Informatie
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-brand-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wide mb-4">
              Mijn account
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-brand-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-100">
        <div className="container-brand py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-400">
            <p>
              © {new Date().getFullYear()} Julies Art. Alle rechten voorbehouden.
            </p>
            <p className="flex items-center gap-1.5">
              Gemaakt met <Heart className="h-3.5 w-3.5 text-brand-400 fill-brand-400" /> in Nederland
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
