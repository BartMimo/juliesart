import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Hoe Julies Art omgaat met jouw persoonsgegevens.',
}

export default function PrivacybeleidPage() {
  return (
    <div className="py-16">
      <div className="container-brand max-w-3xl mx-auto">
        <h1 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-2">Privacybeleid</h1>
        <p className="text-neutral-400 text-sm mb-10">Laatste update: januari 2025</p>

        <div className="prose-product space-y-8">
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">1. Wie zijn wij?</h2>
            <p>
              Julies Art is een webshop voor gepersonaliseerde kindercadeaus. Wij zijn verantwoordelijk
              voor de verwerking van jouw persoonsgegevens zoals beschreven in dit privacybeleid.
              Je kunt contact met ons opnemen via info@juliesart.nl.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">2. Welke gegevens verzamelen wij?</h2>
            <p>Wij verzamelen de volgende persoonsgegevens:</p>
            <ul>
              <li>Naam en e-mailadres (voor account en bestellingen)</li>
              <li>Bezorgadres (voor verzending van bestellingen)</li>
              <li>Betaalgegevens (verwerkt via Stripe — wij slaan geen betaalgegevens op)</li>
              <li>Bestelgeschiedenis en personalisatiegegevens</li>
              <li>Cookie-informatie en surfgedrag (analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">3. Waarvoor gebruiken wij jouw gegevens?</h2>
            <ul>
              <li>Het verwerken en bezorgen van jouw bestellingen</li>
              <li>Het versturen van orderbevestigingen en statusupdates</li>
              <li>Het verlenen van klantenservice</li>
              <li>Het verbeteren van onze webshop en diensten</li>
              <li>Marketingcommunicatie, <strong>uitsluitend</strong> als je daarvoor toestemming hebt gegeven</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">4. Grondslag voor verwerking</h2>
            <p>
              Wij verwerken jouw persoonsgegevens op basis van de uitvoering van de overeenkomst (de bestelling),
              wettelijke verplichtingen, en in geval van marketing: jouw expliciete toestemming.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">5. Bewaartermijn</h2>
            <p>
              Wij bewaren jouw gegevens niet langer dan nodig. Bestelgegevens worden bewaard conform de
              wettelijke bewaarplicht (7 jaar). Accountgegevens worden verwijderd op verzoek.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">6. Delen met derden</h2>
            <p>
              Wij delen jouw gegevens alleen met derden die noodzakelijk zijn voor de uitvoering van
              onze diensten, zoals Stripe (betalingen), Supabase (opslag), en Resend (e-mail).
              Wij verkopen jouw gegevens nooit aan derden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">7. Jouw rechten</h2>
            <p>Je hebt het recht op:</p>
            <ul>
              <li>Inzage in jouw persoonsgegevens</li>
              <li>Correctie van onjuiste gegevens</li>
              <li>Verwijdering van jouw gegevens ("recht op vergetelheid")</li>
              <li>Beperking van verwerking</li>
              <li>Bezwaar tegen verwerking</li>
              <li>Intrekken van toestemming voor marketing</li>
            </ul>
            <p className="mt-3">
              Stuur een verzoek naar info@juliesart.nl. We reageren binnen 30 dagen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">8. Beveiliging</h2>
            <p>
              Wij nemen passende technische en organisatorische maatregelen om jouw gegevens te beschermen
              tegen ongeautoriseerde toegang, verlies of diefstal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-3">9. Klachten</h2>
            <p>
              Heb je een klacht over hoe wij omgaan met jouw gegevens? Neem dan contact op via
              info@juliesart.nl. Je hebt ook het recht om een klacht in te dienen bij de
              Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
