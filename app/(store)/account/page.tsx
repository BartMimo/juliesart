import { getUser, getProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { User, Mail, Calendar, Shield, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Mijn account' }

export default async function AccountPage() {
  const user = await getUser()
  if (!user) redirect('/inloggen')
  const profile = await getProfile()

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h2 className="font-bold text-neutral-800 text-lg mb-5">Mijn gegevens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: User, label: 'Naam', value: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? '—' },
            { icon: Mail, label: 'E-mailadres', value: profile?.email ?? user.email ?? '—' },
            { icon: Calendar, label: 'Lid sinds', value: profile?.created_at ? formatDate(profile.created_at) : formatDate(user.created_at) },
            { icon: Shield, label: 'Account type', value: profile?.role === 'admin' ? 'Beheerder' : 'Klant' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-neutral-800 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin dashboard link */}
      {profile?.role === 'admin' && (
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 shadow-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Admin Dashboard</p>
                <p className="text-xs text-neutral-400 mt-0.5">Beheer producten, bestellingen en klanten.</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              Naar dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Marketing consent */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h2 className="font-bold text-neutral-800 text-lg mb-3">E-mailvoorkeuren</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-700">Nieuwsbrief & aanbiedingen</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Ontvang nieuws over nieuwe producten en seizoensaanbiedingen.
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            profile?.marketing_consent
              ? 'bg-green-100 text-green-700'
              : 'bg-neutral-100 text-neutral-500'
          }`}>
            {profile?.marketing_consent ? 'Ingeschreven' : 'Niet ingeschreven'}
          </div>
        </div>
      </div>
    </div>
  )
}
