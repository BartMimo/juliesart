'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Tag,
  BarChart2,
  Settings,
  ChevronRight,
  LogOut,
  ClipboardList,
  Star,
  Pen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/todo', label: 'To do', icon: ClipboardList },
  { href: '/admin/producten', label: 'Producten', icon: Package },
  { href: '/admin/categorieen', label: 'Categorieën', icon: FolderOpen },
  { href: '/admin/bestellingen', label: 'Bestellingen', icon: ShoppingCart },
  { href: '/admin/klanten', label: 'Klanten', icon: Users },
  { href: '/admin/beoordelingen', label: 'Beoordelingen', icon: Star },
  { href: '/admin/kortingscodes', label: 'Kortingscodes', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/configurator', label: 'Configurator', icon: Pen, exact: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/inloggen')
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="admin-sidebar w-64 shrink-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-neutral-100">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <span className="text-white text-sm font-black">JA</span>
          </div>
          <div>
            <p className="font-extrabold text-neutral-800 text-sm leading-none">Julies Art</p>
            <p className="text-xs text-neutral-400 mt-0.5">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
              )}
            >
              {active && (
                <motion.div
                  layoutId="admin-nav-indicator"
                  className="absolute inset-0 bg-brand-500 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('h-4 w-4 shrink-0 relative', active ? 'text-white' : 'text-neutral-500')} />
              <span className="relative">{item.label}</span>
              {active && (
                <ChevronRight className="h-4 w-4 ml-auto relative text-white/70" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-neutral-100 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
        >
          <Settings className="h-4 w-4 text-neutral-500" />
          Bekijk winkel
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4 text-neutral-500" />
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
