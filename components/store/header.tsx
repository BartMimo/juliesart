'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/cart/store'
import { CartSidebar } from '@/components/store/cart-sidebar'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/winkel', label: 'Winkel' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const pathname = usePathname()
  const { items } = useCartStore()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-brand-100'
            : 'bg-white/80 backdrop-blur-sm'
        )}
      >
        <div className="container-brand">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="Julies Art logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <span className="text-lg font-extrabold text-neutral-800 tracking-tight">
                Julies <span className="text-brand-500">Art</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-neutral-600 hover:text-brand-600 hover:bg-brand-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search — links to shop */}
              <Link
                href="/winkel"
                className="hidden md:flex p-2.5 rounded-full hover:bg-brand-50 text-neutral-500 hover:text-brand-600 transition-colors"
                aria-label="Zoeken"
              >
                <Search className="h-5 w-5" />
              </Link>

              {/* Account */}
              <Link
                href="/account"
                className="hidden md:flex p-2.5 rounded-full hover:bg-brand-50 text-neutral-500 hover:text-brand-600 transition-colors"
                aria-label="Mijn account"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <motion.button
                onClick={() => setCartOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-full font-semibold text-sm transition-colors"
                aria-label="Winkelwagen"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Winkelwagen</span>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-2 -right-2 bg-peach-400 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-brand-50 text-neutral-500 transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-neutral-100 bg-white"
            >
              <nav className="container-brand py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      pathname === link.href
                        ? 'bg-brand-100 text-brand-700'
                        : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-600'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-neutral-100 mt-2 pt-2">
                  <Link
                    href="/account"
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-brand-50 hover:text-brand-600 transition-colors flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Mijn account
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
