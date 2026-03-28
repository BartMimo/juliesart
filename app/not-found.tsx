import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌸</div>
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-3">
          Oeps! Pagina niet gevonden
        </h1>
        <p className="text-neutral-500 mb-8 text-lg">
          De pagina die je zoekt bestaat niet (meer). Geen zorgen — ga terug naar de winkel!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-soft hover:shadow-hover"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  )
}
