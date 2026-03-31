'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Star,
  Heart,
  Truck,
  Package,
  Pencil,
  Sparkles,
  Instagram,
  Check,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionReveal, StaggerReveal, staggerItem } from './section-reveal'
import { INSTAGRAM_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────
// HERO — Split layout
// ─────────────────────────────────────────────────────
export function HomepageHero2() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[88vh] flex items-center">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-peach-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-lavender-100/15 rounded-full blur-3xl" />
      </div>

      <div className="container-brand relative z-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Content ── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full shadow-soft mb-6"
            >
              <Sparkles className="h-4 w-4 text-brand-500" />
              Gratis verzending v/a €50
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="heading-display text-4xl sm:text-5xl lg:text-[3.5rem] text-neutral-800 mb-5 leading-[1.1]"
            >
              Een cadeau{' '}
              <span className="text-gradient-brand">zo uniek</span>
              {' '}als jouw kind
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-neutral-500 mb-8 leading-relaxed max-w-lg"
            >
              Gemaakt van hout, op naam van jouw kind.
              Een blijvend aandenken dat jaar na jaar vertelt hoe geliefd het is.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Button asChild size="xl">
                <Link href="/winkel">
                  <ShoppingBag className="h-5 w-5" />
                  Bekijk de collectie
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <a href="#hoe-werkt-het">
                  Hoe werkt het?
                </a>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center gap-4"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {[
                  { letter: 'L', bg: '#fbbf24', fg: '#78350f' },
                  { letter: 'S', bg: '#f87171', fg: '#7f1d1d' },
                  { letter: 'M', bg: '#a78bfa', fg: '#3b0764' },
                  { letter: 'A', bg: '#34d399', fg: '#064e3b' },
                  { letter: 'J', bg: '#fb923c', fg: '#431407' },
                ].map(({ letter, bg, fg }) => (
                  <div
                    key={letter}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-extrabold shrink-0"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-peach-400 text-peach-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-neutral-600">
                  100+ blije ouders & opa's en oma's
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden sm:flex items-center justify-center py-8"
          >
            {/* Background circle */}
            <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] bg-gradient-to-br from-brand-100 via-peach-50 to-lavender-100 rounded-full" />

            {/* Inner glow */}
            <div className="absolute w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] bg-white/50 rounded-full blur-xl" />

            {/* Logo */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <Image
                src="/logo2.png"
                alt="Julies Art"
                width={200}
                height={200}
                className="drop-shadow-2xl"
                priority
              />
              <Image
                src="/naam.png"
                alt="Julies Art"
                width={190}
                height={58}
                className="drop-shadow-sm"
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {['Met liefde', 'Gepersonaliseerd', 'Uniek', 'Duurzaam'].map((tag) => (
                  <span
                    key={tag}
                    className="bg-white text-brand-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-soft border border-brand-100"
                  >
                    ✦ {tag}
                  </span>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────
// TRUST STRIP — Contrasterende balk
// ─────────────────────────────────────────────────────
const trustItems = [
  { icon: Heart, label: 'Met zorg gemaakt', sub: 'Persoonlijk voor jou' },
  { icon: Sparkles, label: 'Volledig op maat', sub: 'Jouw naam, jouw keuze' },
  { icon: Truck, label: 'Snel geleverd', sub: '3–5 werkdagen' },
  { icon: Package, label: 'Gratis verzending', sub: 'Vanaf €50' },
]

export function TrustStrip2() {
  return (
    <section className="bg-brand-700">
      <div className="container-brand py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-brand-600">
          {trustItems.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">{label}</p>
                <p className="text-xs text-brand-300">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────
// HOW IT WORKS — 3 stappen
// ─────────────────────────────────────────────────────
const steps = [
  {
    num: 1,
    icon: ShoppingBag,
    title: 'Kies je product',
    desc: 'Bekijk onze collectie en kies het product dat bij jouw kind past.',
    bgColor: 'bg-brand-100',
    iconColor: 'text-brand-600',
    numColor: 'bg-brand-500',
  },
  {
    num: 2,
    icon: Pencil,
    title: 'Personaliseer',
    desc: 'Vul de naam in, kies de kleur en het lettertype wat bij jou past.',
    bgColor: 'bg-peach-100',
    iconColor: 'text-peach-500',
    numColor: 'bg-peach-400',
  },
  {
    num: 3,
    icon: Heart,
    title: 'Ontvang met liefde',
    desc: 'Wij maken het naar jouw wens en bezorgen binnen 3 - 5 werkdagen bij je thuis.',
    bgColor: 'bg-lavender-100',
    iconColor: 'text-lavender-500',
    numColor: 'bg-lavender-400',
  },
]

export function HowItWorks2() {
  return (
    <section id="hoe-werkt-het" className="py-14 bg-white">
      <div className="container-brand">
        <SectionReveal className="text-center mb-10">
          <p className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-3">
            Zo eenvoudig
          </p>
          <h2 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-4">
            In 3 stappen jouw cadeau
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto leading-relaxed">
            Van idee tot uniek cadeau — snel, persoonlijk en met aandacht voor elk detail.
          </p>
        </SectionReveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ num, icon: Icon, title, desc, bgColor, iconColor, numColor }) => (
            <motion.div key={num} variants={staggerItem}>
              <div className="text-center px-4">
                {/* Icon circle */}
                <div className="relative inline-block mb-6">
                  <div className={cn('w-24 h-24 rounded-3xl flex items-center justify-center', bgColor)}>
                    <Icon className={cn('h-10 w-10', iconColor)} />
                  </div>
                  <div className={cn(
                    'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shadow-soft',
                    numColor
                  )}>
                    {num}
                  </div>
                </div>

                <h3 className="font-bold text-neutral-800 text-xl mb-3">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            </motion.div>
          ))}
        </StaggerReveal>

        {/* Arrow connectors desktop — decorative */}
        <SectionReveal className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/winkel">
              Begin nu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </SectionReveal>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────
// TESTIMONIALS — Social proof
// ─────────────────────────────────────────────────────
const testimonials = [
  {
    avatar: 'L',
    avatarBg: '#fbbf24',
    avatarFg: '#78350f',
    name: 'Lisa V.',
    city: 'Amsterdam',
    text: 'Het tandendoosje met de naam van mijn dochter was zo schattig! Ze was dolblij. Prachtige afwerking en supersnel geleverd.',
    product: 'Gepersonaliseerd tandendoosje',
  },
  {
    avatar: 'S',
    avatarBg: '#f87171',
    avatarFg: '#7f1d1d',
    name: 'Sandra M.',
    city: 'Utrecht',
    text: 'Het houten koffertje was het perfecte kraamcadeau. Iedereen vroeg waar ik het vandaan had. Zeker voor herhaling vatbaar!',
    product: 'Gepersonaliseerd houten koffertje',
  },
  {
    avatar: 'M',
    avatarBg: '#a78bfa',
    avatarFg: '#3b0764',
    name: 'Marieke D.',
    city: 'Groningen',
    text: 'Voor de tweede keer besteld en weer super tevreden. Geweldige kwaliteit, snel geleverd en zo persoonlijk. Aanrader!',
    product: 'Gepersonaliseerd cadeau',
  },
]

export function Testimonials2() {
  return (
    <section className="py-14 bg-brand-50">
      <div className="container-brand">
        <SectionReveal className="text-center mb-10">
          <p className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-3">
            Wat anderen zeggen
          </p>
          <h2 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-4">
            Geliefd door ouders & opa's en oma's
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-peach-400 text-peach-400" />
            ))}
            <span className="ml-2 text-neutral-500 text-sm font-semibold">
              4.6 gemiddeld · 100+ beoordelingen
            </span>
          </div>
        </SectionReveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={staggerItem} className="h-full">
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-peach-400 text-peach-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Product tag */}
                <p className="text-xs font-semibold text-brand-500 mb-4">
                  ✦ {t.product}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0"
                    style={{ backgroundColor: t.avatarBg, color: t.avatarFg }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800">{t.name}</p>
                    <p className="text-xs text-neutral-400">{t.city}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-full">
                      ✓ Geverifieerd
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────
// BRAND STORY — Over Julies Art
// ─────────────────────────────────────────────────────
export function BrandStory2() {
  return (
    <section className="py-14 bg-white">
      <div className="container-brand">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Visual */}
          <SectionReveal direction="right">
            <div className="relative">
              {/* Dot pattern decoration */}
              <div
                className="absolute -bottom-6 -right-6 w-32 h-32 opacity-20 z-0"
                style={{
                  backgroundImage: 'radial-gradient(circle, #a87048 1.5px, transparent 1.5px)',
                  backgroundSize: '10px 10px',
                }}
              />
              <div
                className="absolute -top-6 -left-6 w-24 h-24 opacity-15 z-0"
                style={{
                  backgroundImage: 'radial-gradient(circle, #d4a43c 1.5px, transparent 1.5px)',
                  backgroundSize: '10px 10px',
                }}
              />

              {/* Card */}
              <div className="relative z-10 bg-gradient-to-br from-brand-50 via-cream to-peach-50 rounded-3xl p-10 border border-brand-100 shadow-soft">
                <div className="flex flex-col items-center gap-5">
                  <Image
                    src="/logo2.png"
                    alt="Julies Art"
                    width={160}
                    height={160}
                    className="drop-shadow-lg"
                  />
                  <Image
                    src="/naam.png"
                    alt="Julies Art"
                    width={180}
                    height={55}
                  />
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Text */}
          <SectionReveal direction="left">
            <p className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-4">
              Ons verhaal
            </p>
            <h2 className="heading-section text-3xl sm:text-4xl text-neutral-800 mb-5">
              Elk cadeau begint met een verhaal
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-5">
              Bij Julies Art geloven we dat een cadeau meer is dan een object. Het is een herinnering,
              een glimlach, een gevoel van &ldquo;dit is speciaal voor mij gemaakt&rdquo;.
            </p>
            <p className="text-neutral-500 leading-relaxed mb-8">
              Elk product wordt voorzien van de naam of het lievelingsicoon van
              jouw kind. Met echte aandacht voor elk detail, van begin tot eind.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                '100% gepersonaliseerd in Nederland',
                'Duurzame, kwalitatieve materialen',
                'Elk stuk uniek voor jouw kind',
                'Al honderden blije gezinnen geholpen',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-neutral-700">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-brand-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" variant="outline">
              <Link href="/winkel">
                Ontdek de collectie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────
// INSTAGRAM CTA
// ─────────────────────────────────────────────────────
export function InstagramSection2() {
  return (
    <SectionReveal>
      <section className="py-12 bg-gradient-to-r from-brand-50 via-cream to-peach-50">
        <div className="container-brand">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-soft border border-brand-100 flex items-center justify-center mx-auto mb-5">
              <Instagram className="h-7 w-7 text-brand-500" />
            </div>
            <p className="text-sm font-bold text-brand-500 uppercase tracking-wider mb-3">
              Instagram
            </p>
            <h2 className="heading-section text-2xl sm:text-3xl text-neutral-800 mb-3">
              Volg ons voor dagelijkse inspiratie
            </h2>
            <p className="text-neutral-500 mb-6 leading-relaxed">
              Kijk achter de schermen, ontdek nieuwe producten en laat je inspireren
              door de mooiste gepersonaliseerde cadeaus.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-soft hover:shadow-hover"
            >
              <Instagram className="h-4 w-4" />
              Volg @julies.art7
            </a>
          </div>
        </div>
      </section>
    </SectionReveal>
  )
}

// ─────────────────────────────────────────────────────
// FINAL CTA — Sterke afsluiter
// ─────────────────────────────────────────────────────
export function FinalCta2() {
  return (
    <SectionReveal>
      <section className="relative overflow-hidden bg-brand-700 py-14">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-600/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-800/50 rounded-full blur-3xl" />
        </div>

        <div className="container-brand relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <Image
              src="/logo2.png"
              alt="Julies Art"
              width={80}
              height={80}
              className="mx-auto mb-6 opacity-90 drop-shadow-lg"
            />
            <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl text-white mb-5">
              Klaar om jouw cadeau te maken?
            </h2>
            <p className="text-brand-200 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
              Kies uit onze collectie, personaliseer naar wens en ontvang een uniek cadeau —
              met liefde gemaakt, speciaal voor jouw kind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="xl"
                className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg"
              >
                <Link href="/winkel">
                  <ShoppingBag className="h-5 w-5" />
                  Bekijk de collectie
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/contact">
                  Stel een vraag
                </Link>
              </Button>
            </div>

            {/* Mini trust */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-brand-300 text-sm">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-400" /> Gepersonaliseerd
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-400" /> 3–5 werkdagen
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-400" /> Gratis v/a €50
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-400" /> 100+ tevreden klanten
              </span>
            </div>
          </div>
        </div>
      </section>
    </SectionReveal>
  )
}
