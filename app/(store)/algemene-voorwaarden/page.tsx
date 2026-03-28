import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'De algemene voorwaarden van Julies Art.',
}

export default function AlgemeneVoorwaardenPage() {
  return (
    <div className="py-16">
      <div className="container-brand max-w-3xl mx-auto">
        <h1 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-2">
          Algemene Voorwaarden
        </h1>
        <p className="text-neutral-400 text-sm mb-10">Laatste update: januari 2025</p>

        <div className="prose-product space-y-8">
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 1 — Definities</h2>
            <p>
              In deze voorwaarden wordt verstaan onder: <strong>Julies Art</strong>, de aanbieder van gepersonaliseerde
              kindercadeaus via juliesart.nl; <strong>Klant</strong>, iedere persoon die een bestelling plaatst;
              <strong>Product</strong>, elk artikel dat via de webshop wordt aangeboden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 2 — Toepasselijkheid</h2>
            <p>
              Deze algemene voorwaarden zijn van toepassing op alle bestellingen die via juliesart.nl worden geplaatst.
              Door een bestelling te plaatsen, accepteert u deze voorwaarden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 3 — Gepersonaliseerde producten</h2>
            <p>
              Onze producten worden op bestelling en naar persoonlijke specificaties vervaardigd. Dit betekent dat:
            </p>
            <ul>
              <li>Gepersonaliseerde producten <strong>niet kunnen worden geretourneerd</strong> tenzij er sprake is van een fabricagefout.</li>
              <li>Wij niet aansprakelijk zijn voor typefouten die door de klant zijn gemaakt bij het invullen van personalisatiegegevens.</li>
              <li>Wij u altijd vragen de ingevoerde gegevens te controleren vóór het plaatsen van de bestelling.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 4 — Prijzen en betaling</h2>
            <p>
              Alle prijzen zijn inclusief BTW. Betaling geschiedt via onze beveiligde betaalomgeving (Stripe).
              Wij accepteren iDEAL, creditcard (Visa/Mastercard) en Bancontact.
              Na betaling ontvangt u een bevestigingsmail met de bestellingsdetails.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 5 — Levering</h2>
            <p>
              Wij streven naar levering binnen 3–5 werkdagen na bevestiging van de betaling.
              Bij drukte of bijzondere omstandigheden kan de levertijd langer zijn; wij informeren u dan zo snel mogelijk.
              Verzending is gratis bij bestellingen vanaf €50.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 6 — Herroepingsrecht</h2>
            <p>
              Conform de Europese richtlijn geldt een herroepingsrecht van 14 dagen voor standaardproducten.
              Voor gepersonaliseerde producten is het herroepingsrecht uitgesloten, tenzij het product defect is of
              niet overeenkomt met de door u opgegeven specificaties. In geval van een klacht neem direct contact
              op via info@juliesart.nl.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 7 — Klachten</h2>
            <p>
              Klachten over producten of leveringen kunt u melden via info@juliesart.nl.
              Wij streven ernaar uw klacht binnen 5 werkdagen te beantwoorden.
              Als we er samen niet uitkomen, kunt u terecht bij het ODR-platform van de Europese Commissie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">Artikel 8 — Toepasselijk recht</h2>
            <p>
              Op alle overeenkomsten is het Nederlands recht van toepassing.
              Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
