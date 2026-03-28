# Julies Art — Setup

## Vereisten

- Node.js 20+
- Een [Supabase](https://supabase.com) project
- Een [Stripe](https://stripe.com) account
- Een [Resend](https://resend.com) account (voor transactionele e-mails)

---

## 1. Project installeren

```bash
cd julies-art
npm install
```

---

## 2. Environment variables

```bash
cp .env.local.example .env.local
```

Vul alle waarden in `.env.local` in (zie het bestand voor uitleg per variabele).

---

## 3. Supabase database instellen

1. Ga naar [supabase.com/dashboard](https://supabase.com/dashboard) → jouw project → **SQL Editor**
2. Maak een **New Query** aan
3. Plak de volledige inhoud van `supabase/schema.sql` en voer uit
4. Maak een tweede query aan, plak `supabase/seed.sql` en voer uit (vult demo-data in)

### Admin gebruiker aanmaken

Na het aanmaken van je account:

```sql
-- In Supabase SQL Editor
UPDATE public.profiles SET role = 'admin' WHERE email = 'jouw@emailadres.nl';
```

---

## 4. Stripe instellen

### Webhook (lokale ontwikkeling)

```bash
# Installeer Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Kopieer de webhook secret (`whsec_...`) naar `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### Webhook (productie)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://jouwdomein.nl/api/stripe/webhook`
3. Events: `checkout.session.completed`
4. Kopieer de signing secret naar je Vercel environment variables

---

## 5. Lokaal starten

```bash
npm run dev
```

- Winkel: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 6. Deployen naar Vercel

```bash
# Installeer Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Voeg alle environment variables uit `.env.local.example` toe in het Vercel dashboard:
**Project → Settings → Environment Variables**

Stel ook `NEXT_PUBLIC_SITE_URL` in op je productie-URL (bijv. `https://juliesart.nl`).

---

## Projectstructuur

```
julies-art/
├── app/
│   ├── (store)/          # Klantgerichte winkel
│   │   ├── page.tsx      # Homepage
│   │   ├── winkel/       # Productoverzicht + categoriefilter
│   │   ├── product/[slug]/ # Productpagina met personalisatie
│   │   ├── winkelwagen/  # Winkelwagen
│   │   ├── afrekenen/    # Checkout succes/annulatie
│   │   └── account/      # Klantaccount & bestellingen
│   ├── (admin)/admin/    # Beheerderspaneel
│   │   ├── page.tsx      # Dashboard met statistieken
│   │   ├── producten/    # Productbeheer
│   │   ├── bestellingen/ # Bestellingenbeheer
│   │   ├── klanten/      # Klantenoverzicht
│   │   ├── kortingscodes/ # Kortingscode-beheer
│   │   ├── categorieen/  # Categoriebeheer
│   │   └── analytics/    # Bezoekersanalytics
│   └── api/
│       ├── stripe/       # Checkout + webhook
│       ├── kortingscode/ # Validatie kortingscode
│       └── analytics/    # Pageview tracking
├── components/
│   ├── admin/            # Admin-specifieke componenten
│   ├── store/            # Winkel-componenten
│   ├── email/            # React Email templates
│   └── ui/               # Gedeelde UI-primitieven
├── lib/
│   ├── cart/store.ts     # Zustand winkelwagen
│   ├── stripe/           # Stripe helpers
│   ├── supabase/         # Client/server/admin Supabase
│   └── email/            # Resend helper
├── supabase/
│   ├── schema.sql        # Volledige databasestructuur + RLS
│   └── seed.sql          # Demo-categorieën, producten, personalisatie
└── types/index.ts        # Gedeelde TypeScript types
```
