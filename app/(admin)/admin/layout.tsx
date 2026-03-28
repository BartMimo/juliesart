import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'

export const metadata = { title: { default: 'Admin', template: '%s | Admin — Julies Art' } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  // Double-check admin role (middleware already protects, but belt-and-suspenders)
  if (!profile || profile.role !== 'admin') {
    redirect('/admin/inloggen')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
