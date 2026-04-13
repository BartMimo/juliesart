# Gravure Configurator

Een meerstappen gravure-configurator waarmee klanten een eigen tekening kunnen uploaden, een product kiezen, de graveerlocatie bepalen en direct kunnen betalen via Stripe.

---

## Nieuwe pagina's

| Route | Omschrijving |
|---|---|
| `/configurator` | 4-stappen configurator voor klanten |
| `/configurator/succes` | Bevestigingspagina na geslaagde betaling |

---

## Stappen in de configurator

1. **Upload tekening** — Klant sleept of bladert naar een afbeelding (JPG, PNG, SVG, WebP, max 10 MB). De afbeelding wordt opgeslagen in Supabase Storage (`uploads/tekeningen/`).
2. **Kies product** — Toont alle actieve producten waarop een `engraving_area` is ingesteld.
3. **Selecteer graveerlocatie** — Interactieve overlay op de productafbeelding. Klant sleept en schaalt een selectievak binnen het toegestane graveergebied. Positie wordt opgeslagen als percentages (resolutie-onafhankelijk).
4. **Bestelling plaatsen** — Overzicht + formulier met naam, e-mailadres en optionele opmerking. Bij bevestiging → Stripe Checkout. Na betaling wordt de bestelling opgeslagen en een bevestigingsmail verstuurd.

---

## Benodigde omgevingsvariabelen

Voeg het volgende toe aan `.env.local` (al aanwezig in het project, check of ze kloppen):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Julies Art <info@juliesart.nl>

NEXT_PUBLIC_SITE_URL=https://juliesart.nl
```

---

## Database-migratie uitvoeren

Voer het migratiebestand uit in de Supabase SQL Editor of via de CLI:

```bash
# Via Supabase CLI
supabase db push

# Of kopieer de inhoud van onderstaand bestand en plak die in de SQL Editor:
supabase/migrations/add_engraving_configurator.sql
```

**Wat de migratie doet:**
- Voegt kolom `engraving_area` (JSONB) toe aan de `products`-tabel
- Voegt kolommen `upload_url`, `engraving_position` en `order_type` toe aan de `orders`-tabel
- Maakt de Supabase Storage bucket `uploads` aan (publiek leesbaar, max 10 MB, alleen afbeeldingen)
- Voegt RLS-policies toe voor de `uploads`-bucket

---

## Een product graveerbaar maken

1. Ga naar **Admin → Producten** en open een product.
2. Scrol in de rechterzijbalk naar het blok **Graveerzone**.
3. Zet het vinkje **Gravure inschakelen** aan.
4. Vul de vier velden in:
   - **Links (%)** — x-positie van het graveergebied (0 = linker rand)
   - **Boven (%)** — y-positie (0 = bovenrand)
   - **Breedte (%)** — breedte van het graveergebied
   - **Hoogte (%)** — hoogte van het graveergebied
5. Klik **Opslaan**.

Het product verschijnt nu automatisch in stap 2 van de configurator.

**Voorbeeld:** een gebied van 80% breed en 60% hoog, gecentreerd (x=10, y=20):
```json
{ "x": 10, "y": 20, "width": 80, "height": 60 }
```

---

## Gravure-bestellingen bekijken

Ga naar **Admin → Bestellingen** en open een bestelling. Als de bestelling via de configurator geplaatst is, zie je onderaan de rechterzijbalk een oranje blok **Gravure-informatie** met:
- Een preview van het geüploade ontwerp
- De exacte graveerlocatie (x, y, breedte, hoogte in procenten)

---

## Bevestigingsmail

Na geslaagde betaling ontvangt de klant automatisch een bevestigingsmail via Resend met:
- Bestelnummer
- Productnaam en prijs
- Preview van het geüploade ontwerp
- Graveerlocatie
- Eventuele opmerking
- Uitleg over de vervolgstappen

De template staat in `components/email/configurator-confirmation.tsx`.

---

## Nieuwe bestanden

```
app/(store)/configurator/page.tsx           — 4-stappen configurator
app/(store)/configurator/succes/page.tsx    — Succespagina
app/api/configurator/upload/route.ts        — Upload-API (→ Supabase Storage)
app/api/configurator/checkout/route.ts      — Stripe Checkout sessie aanmaken
components/email/configurator-confirmation.tsx — E-mailtemplate
supabase/migrations/add_engraving_configurator.sql — DB-migratie
```

**Gewijzigde bestanden:**
```
types/index.ts                              — EngravingPosition type + Product/Order uitbreid
app/api/stripe/webhook/route.ts             — Afhandeling van configurator-orders
lib/email/resend.ts                         — sendConfiguratorConfirmationEmail functie
app/(admin)/admin/producten/[id]/page.tsx   — Graveerzone-veld in product-editor
app/(admin)/admin/bestellingen/[id]/page.tsx— Gravure-info in bestellingsdetail
components/admin/sidebar.tsx                — Link naar configurator in sidebar
```
