import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingBag, XCircle } from 'lucide-react'

export default function BetalingGeannuleerdPage() {
  return (
    <div className="py-20 min-h-[70vh]">
      <div className="container-brand max-w-lg mx-auto text-center">
        <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-neutral-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-800 mb-3">
          Betaling geannuleerd
        </h1>
        <p className="text-neutral-500 text-lg mb-8">
          Je betaling is geannuleerd. Je winkelwagen is bewaard — je kunt gewoon opnieuw afrekenen
          wanneer je klaar bent.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/winkelwagen">
              <ShoppingBag className="h-5 w-5" />
              Terug naar winkelwagen
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/collecties">
              <ArrowLeft className="h-5 w-5" />
              Verder winkelen
            </Link>
          </Button>
        </div>
        <p className="text-sm text-neutral-400 mt-8">
          Heb je vragen? Stuur ons een bericht via{' '}
          <a href="mailto:info@juliesart.nl" className="text-brand-500 hover:underline">
            info@juliesart.nl
          </a>
        </p>
      </div>
    </div>
  )
}
