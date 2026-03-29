import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, ShoppingBag, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) {
    redirect('/inloggen?next=/account')
  }
  const profile = await getProfile()

  const navItems = [
    { href: '/account', label: 'Mijn gegevens', icon: User },
    { href: '/account/bestellingen', label: 'Mijn bestellingen', icon: ShoppingBag },
  ]

  return (
    <div className="py-12">
      <div className="container-brand">
        <div className="mb-8">
          <h1 className="heading-section text-3xl text-neutral-800">
            Hallo, {profile?.full_name?.split(' ')[0] ?? 'welkom'}!
          </h1>
          <p className="text-neutral-500 mt-1">Beheer je account en bekijk je bestellingen.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">
              <nav className="p-3 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-neutral-100 p-3">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Uitloggen
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
