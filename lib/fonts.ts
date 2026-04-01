// ─── Centrale fontconfiguratie ───────────────────────────────────────────────
//
// Dit is de ENIGE plek waar je lettertypes hoeft toe te voegen.
// Voeg een nieuw lettertype toe aan FONTS en het werkt automatisch overal:
//   - Google Fonts wordt geladen in layout.tsx
//   - Het verschijnt als keuze in het personalisatieformulier
//   - Het is beschikbaar in de winkelconfigurator
//   - Het wordt meegenomen als standaardoptie in de admin
//
// Hoe een lettertype toevoegen:
//   1. Zoek de naam op fonts.google.com
//   2. Kopieer het vet gedrukte lettertypenaam (bijv. "Amatic SC")
//   3. Voeg een regel toe aan FONTS hieronder
//
// googleParam: de naam zoals in de Google Fonts URL, spaties vervangen door +
//              optioneel met gewichten: 'Caveat:wght@400;600'
//              weglaten als het lettertype niet via Google Fonts wordt geladen

export interface FontConfig {
  value: string        // unieke identifier, lowercase zonder spaties (bijv. 'amaticsc')
  name: string         // weergavenaam (bijv. 'Amatic SC')
  label: string        // Nederlandse omschrijving (bijv. 'Krijt')
  family: string       // CSS font-family waarde (bijv. "'Amatic SC', cursive")
  googleParam?: string // Google Fonts URL-parameter; weglaten als anders geladen
}

export const FONTS: FontConfig[] = [
  {
    value: 'pacifico',
    name: 'Pacifico',
    label: 'Speels',
    family: "'Pacifico', cursive",
    googleParam: 'Pacifico',
  },
  {
    value: 'greatvibes',
    name: 'Great Vibes',
    label: 'Sierlijk',
    family: "'Great Vibes', cursive",
    googleParam: 'Great+Vibes',
  },
  {
    value: 'caveat',
    name: 'Caveat',
    label: 'Handgeschreven',
    family: "'Caveat', cursive",
    googleParam: 'Caveat:wght@400;600',
  },
  {
    value: 'quicksand',
    name: 'Quicksand',
    label: 'Zacht',
    family: "'Quicksand', sans-serif",
    googleParam: 'Quicksand:wght@400;600',
  },
  {
    value: 'nunito',
    name: 'Nunito',
    label: 'Modern',
    family: "'Nunito', sans-serif",
    // Geen googleParam: wordt geladen via next/font/google in layout.tsx
  },
  {
    value: 'amaticsc',
    name: 'Amatic SC',
    label: 'Krijt',
    family: "'Amatic SC', cursive",
    googleParam: 'Amatic+SC:wght@400;700',
  },
]

// Bouwt de Google Fonts URL op basis van FONTS
export function buildGoogleFontsUrl(): string {
  const params = FONTS
    .filter(f => f.googleParam)
    .map(f => `family=${f.googleParam}`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
