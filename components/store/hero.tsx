'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-hero-gradient">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-peach-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lavender-100/20 rounded-full blur-3xl" />
      </div>

      <div className="container-brand relative z-10 py-12 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full shadow-soft mb-4 sm:mb-8"
          >
            <Sparkles className="h-4 w-4 text-brand-500" />
            Elk cadeau uniek, elk kindje bijzonder
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-neutral-800 mb-4 sm:mb-6"
          >
            Gepersonaliseerde{' '}
            <span className="text-gradient-brand">kindercadeaus</span>{' '}
            met liefde gemaakt
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-500 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Van tandendoosjes tot houten koffertjes — elk stuk wordt met zorg gemaakt en voorzien
            van de naam van jouw kleintje. Een cadeau dat een leven lang bijblijft.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="xl">
              <Link href="/winkel">
                Bekijk de collectie
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/winkel">
                Bekijk alle cadeaus
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-12 text-sm text-neutral-500"
          >
            {[
              '✨ Handgemaakt',
              '🚀 Snel verzonden',
              '💝 Uniek cadeau',
              '🔒 Veilig betalen',
            ].map((item) => (
              <span key={item} className="font-medium">{item}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-brand-300 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1.5 h-3 bg-brand-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
