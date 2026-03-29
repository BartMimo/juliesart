import { Metadata } from 'next'
import { Hero } from '@/components/store/hero'
import { FeaturedProducts } from '@/components/store/featured-products'
import { SectionReveal } from '@/components/store/section-reveal'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
  description: SITE_DESCRIPTION,
}

export default function HomePage() {
  return (
    <>
      <Hero />
<FeaturedProducts />
      {/* USP section */}
      <SectionReveal>
        <section className="py-20 bg-white">
          <div className="container-brand">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-3">
                Waarom Julies Art?
              </p>
              <h2 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-5">
                Een cadeau dat écht iets betekent
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                Bij Julies Art geloven we dat elk kind uniek is. Daarom maken we elk cadeau speciaal
                voor dat ene kind. Met de naam, het lievelingsicoon of de lievelingskleur erbij wordt
                een product iets dat altijd wordt bewaard.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                {[
                  { emoji: '✋', title: 'Handgemaakt', desc: 'Elk product wordt met de hand vervaardigd en met aandacht afgewerkt.' },
                  { emoji: '💌', title: 'Persoonlijk', desc: 'Jouw keuzes worden precies zo verwerkt als jij ze aangeeft.' },
                  { emoji: '🌍', title: 'Duurzaam', desc: 'We werken met kwalitatieve, duurzame materialen die lang meegaan.' },
                ].map((item) => (
                  <div key={item.title} className="p-6 rounded-2xl bg-brand-50 border border-brand-100">
                    <div className="text-4xl mb-3">{item.emoji}</div>
                    <h3 className="font-bold text-neutral-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>
    </>
  )
}
