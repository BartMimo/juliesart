import type { CSSProperties } from 'react'

// ─── Centrale fontconfiguratie ───────────────────────────────────────────────
//
// Dit is de ENIGE plek waar je lettertypes hoeft toe te voegen.
// Voeg een nieuw lettertype toe aan FONTS en het werkt automatisch overal:
//   - Google Fonts wordt automatisch geladen in layout.tsx
//   - Het verschijnt als keuze in het personalisatieformulier
//   - Het is beschikbaar in de winkelconfigurator
//   - Het wordt meegenomen als standaardoptie in de admin
//
// Hoe een lettertype toevoegen:
//   1. Zoek de exacte naam op fonts.google.com (bijv. "Amatic SC")
//   2. Voeg onderaan de lijst toe:
//
//      {
//        value: 'amaticsc',          ← lowercase, geen spaties, uniek
//        name: 'Amatic SC',          ← exacte naam zoals op Google Fonts
//        label: 'Krijt',             ← Nederlandse omschrijving
//        family: "'Amatic SC', cursive",  ← CSS-waarde (cursive / sans-serif / serif)
//      },
//
//   Klaar. De Google Fonts URL wordt automatisch opgebouwd uit de naam.
//
// Uitzondering: 'skipGoogleLoad: true' voor lettertypes die al anders geladen worden.

export interface FontConfig {
  value: string             // unieke identifier, lowercase zonder spaties
  name: string              // exacte naam op Google Fonts
  label: string             // Nederlandse omschrijving
  family: string            // CSS font-family waarde
  weights?: string          // optioneel: gewichten, bijv. '400;700' (standaard: alleen regulier)
  skipGoogleLoad?: boolean  // true als het lettertype al op een andere manier geladen wordt
  isSingleLine?: boolean    // true voor single-line fonts (plotter/laser) — voegt stroke toe in preview
}

export const FONTS: FontConfig[] = [
  {
    value: 'pacifico',
    name: 'Pacifico',
    label: 'Speels',
    family: "'Pacifico', cursive",
  },
  {
    value: 'greatvibes',
    name: 'Great Vibes',
    label: 'Sierlijk',
    family: "'Great Vibes', cursive",
  },
  {
    value: 'caveat',
    name: 'Caveat',
    label: 'Handgeschreven',
    family: "'Caveat', cursive",
    weights: '400;600',
  },
  {
    value: 'quicksand',
    name: 'Quicksand',
    label: 'Zacht',
    family: "'Quicksand', sans-serif",
    weights: '400;600',
  },
  {
    value: 'nunito',
    name: 'Nunito',
    label: 'Modern',
    family: "'Nunito', sans-serif",
    skipGoogleLoad: true, // geladen via next/font/google in layout.tsx
  },
  {
    value: 'amaticsc',
    name: 'Amatic SC',
    label: 'Krijt',
    family: "'Amatic SC', cursive",
    weights: '400;700',
  },
  {
    value: 'dancingscript',
    name: 'Dancing Script',
    label: 'Klassiek',
    family: "'Dancing Script', cursive",
  },
  {
    value: 'craftygirls',
    name: 'Crafty Girls',
    label: 'Lief',
    family: "'Crafty Girls', cursive",
  },
  {
    value: 'hoarselysingleline',
    name: 'Hoarsely Single Line',
    label: 'Lijn',
    family: "'Hoarsely Single Line', cursive",
    skipGoogleLoad: true,
    isSingleLine: true,
  },
]

// Geeft de juiste inline style terug voor een font preview.
// Single-line fonts krijgen automatisch een stroke zodat ze zichtbaar zijn.
export function getFontPreviewStyle(fontFamily: string | null | undefined): CSSProperties {
  const family = fontFamily ?? 'inherit'
  const font = FONTS.find(f => f.family === fontFamily)
  if (font?.isSingleLine) {
    return { fontFamily: family, WebkitTextStroke: '1px currentColor' }
  }
  return { fontFamily: family }
}

// Bouwt de Google Fonts URL automatisch op uit de fontnamen
export function buildGoogleFontsUrl(): string {
  const params = FONTS
    .filter(f => !f.skipGoogleLoad)
    .map(f => {
      const urlName = f.name.replace(/ /g, '+')
      return f.weights ? `family=${urlName}:wght@${f.weights}` : `family=${urlName}`
    })
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
