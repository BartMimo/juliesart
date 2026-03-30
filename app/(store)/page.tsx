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

export default function HomePage() {
  return (
    <>
      <HomepageHero2 />
      <TrustStrip2 />
      <HowItWorks2 />
      <FeaturedProducts />
      <Testimonials2 />
      <BrandStory2 />
      <InstagramSection2 />
      <FinalCta2 />
    </>
  )
}
