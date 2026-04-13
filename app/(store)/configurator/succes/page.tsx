import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bestelling geplaatst — Julies Art' }

export default function ConfiguratorSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-800 tracking-tight">
          Bestelling geplaatst!
        </h1>
        <p className="text-neutral-500 text-base leading-relaxed">
          Bedankt voor je bestelling. Je ontvangt een bevestigingsmail met alle details.
          We gaan direct aan de slag met jouw eigen ontwerp!
        </p>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-sm text-amber-800">
          <p className="font-semibold mb-1">Wat nu?</p>
          <p>Zodra je betaling verwerkt is, beginnen we met jouw eigen ontwerp. Je ontvangt een track &amp; trace wanneer je bestelling onderweg is.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Terug naar de winkel
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/configurator">
              Nog een eigen ontwerp maken
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
