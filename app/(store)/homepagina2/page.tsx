import { Metadata } from 'next'
import { FeaturedProducts } from '@/components/store/featured-products'
import {
  HomepageHero2,
  TrustStrip2,
  HowItWorks2,
  Testimonials2,
  BrandStory2,
  InstagramSection2,
  FinalCta2,
} from '@/components/store/homepage2-client'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Gepersonaliseerde Kindercadeaus`,
  description: SITE_DESCRIPTION,
}

export default function HomePagina2() {
  return (
    <>
      {/* 1. Hero — split layout met visuele compositie */}
      <HomepageHero2 />

      {/* 2. Trust strip — directe geruststelling */}
      <TrustStrip2 />

      {/* 3. Hoe werkt het — essentieel voor gepersonaliseerde producten */}
      <HowItWorks2 />

      {/* 4. Uitgelichte producten — vanuit database */}
      <FeaturedProducts />

      {/* 5. Testimonials — social proof */}
      <Testimonials2 />

      {/* 6. Merkverhaal — vertrouwen & verbinding */}
      <BrandStory2 />

      {/* 7. Instagram — community & inspiratie */}
      <InstagramSection2 />

      {/* 8. Sterke eindCTA */}
      <FinalCta2 />
    </>
  )
}
