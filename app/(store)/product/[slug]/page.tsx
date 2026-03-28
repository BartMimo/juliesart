'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, PersonalizationValues, CartPersonalizationValue } from '@/types'
import { ProductImages } from '@/components/store/product-images'
import {
  PersonalizationForm,
  validatePersonalizationForm,
} from '@/components/store/personalization-form'
import { TrustBadges } from '@/components/store/trust-badges'
import { SectionReveal } from '@/components/store/section-reveal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useCartStore } from '@/lib/cart/store'
import { useToast } from '@/components/ui/toaster'
import { formatPrice, stripHtml } from '@/lib/utils'
import { trackPageView } from '@/lib/analytics'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [personalizationValues, setPersonalizationValues] = useState<PersonalizationValues>({})
  const [errors, setErrors] = useState<Partial<PersonalizationValues>>({})
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { addItem } = useCartStore()
  const toast = useToast()

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          personalization_fields(
            *,
            options:personalization_options(*)
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      setProduct(data)
      setLoading(false)

      if (data) {
        trackPageView(`/product/${slug}`, data.id)
      }
    }

    fetchProduct()
  }, [slug])

  const handleAddToCart = useCallback(async () => {
    if (!product) return

    const fields = product.personalization_fields ?? []

    // Validate personalization
    const { valid, errors: validationErrors } = validatePersonalizationForm(fields, personalizationValues)
    if (!valid) {
      setErrors(validationErrors)
      toast.error('Vul alle verplichte velden in', 'Controleer de personalisatievelden.')
      return
    }

    setErrors({})
    setAddingToCart(true)

    // Build personalization data for cart
    const personalizations: CartPersonalizationValue[] = fields
      .filter((f) => f.is_active && personalizationValues[f.key])
      .map((field) => {
        const value = personalizationValues[field.key]
        const option = field.options?.find((o) => o.value === value)

        // Calculate price modifier
        return {
          fieldKey: field.key,
          fieldLabel: field.label,
          fieldType: field.type,
          value,
          displayValue: option?.label ?? value,
        }
      })

    // Calculate price including option modifiers
    const priceModifiers = fields
      .filter((f) => f.is_active && personalizationValues[f.key])
      .reduce((total, field) => {
        const option = field.options?.find((o) => o.value === personalizationValues[field.key])
        return total + (option?.price_modifier ?? 0)
      }, 0)

    const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0]

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage?.url ?? null,
      quantity,
      unitPrice: product.price + priceModifiers,
      basePrice: product.price,
      personalizations,
    })

    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2500)
    setAddingToCart(false)
    toast.success('Toegevoegd aan winkelwagen!', product.name)
  }, [product, personalizationValues, quantity, addItem])

  if (loading) {
    return (
      <div className="py-20 container-brand">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-20 container-brand text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">Product niet gevonden</h1>
        <p className="text-neutral-500">Dit product bestaat niet of is niet meer beschikbaar.</p>
      </div>
    )
  }

  const hasPersonalization = (product.personalization_fields?.filter((f) => f.is_active)?.length ?? 0) > 0
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  return (
    <div className="py-10">
      <div className="container-brand">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-400 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-brand-500 transition-colors">Home</a>
          <span>/</span>
          <a href="/winkel" className="hover:text-brand-500 transition-colors">Winkel</a>
          {product.category && (
            <>
              <span>/</span>
              <a href={`/winkel/${product.category.slug}`} className="hover:text-brand-500 transition-colors">
                {product.category.name}
              </a>
            </>
          )}
          <span>/</span>
          <span className="text-neutral-600 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Images */}
          <SectionReveal direction="left">
            <ProductImages
              images={product.images ?? []}
              productName={product.name}
            />
          </SectionReveal>

          {/* Info + Form */}
          <SectionReveal direction="right">
            <div className="space-y-6">
              {/* Category badge */}
              {product.category && (
                <Badge variant="lavender">{product.category.name}</Badge>
              )}

              {/* Title */}
              <h1 className="heading-section text-3xl sm:text-4xl text-neutral-800">
                {product.name}
              </h1>

              {/* Short description */}
              {product.short_description && (
                <p className="text-neutral-500 text-lg leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-neutral-800">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-neutral-400 line-through">
                    {formatPrice(product.compare_at_price!)}
                  </span>
                )}
                {hasPersonalization && (
                  <span className="text-sm text-neutral-500">
                    (excl. eventuele opties)
                  </span>
                )}
              </div>

              {/* Personalization form */}
              {hasPersonalization && (
                <div className="border border-brand-100 rounded-2xl p-5 bg-brand-50/30">
                  <PersonalizationForm
                    fields={product.personalization_fields ?? []}
                    values={personalizationValues}
                    onChange={setPersonalizationValues}
                    errors={errors}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-neutral-700">Aantal:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:border-brand-400 transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-neutral-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center hover:border-brand-400 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="xl"
                  className="w-full"
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={addedFeedback}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-5 w-5" />
                      Toegevoegd!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      In winkelwagen — {formatPrice(product.price * quantity)}
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Personalisation notice */}
              {hasPersonalization && (
                <div className="flex items-start gap-2 text-sm text-neutral-500 bg-peach-50 border border-peach-200 rounded-xl px-4 py-3">
                  <Heart className="h-4 w-4 text-peach-400 shrink-0 mt-0.5" />
                  <span>
                    Dit is een gepersonaliseerd product. Na het plaatsen van de bestelling
                    wordt het met liefde voor jou gemaakt.
                  </span>
                </div>
              )}

              {/* Trust mini-badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: Truck, text: 'Gratis v.a. €50' },
                  { icon: Shield, text: 'Veilig betalen' },
                  { icon: RotateCcw, text: 'Service & support' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-neutral-500" />
                    </div>
                    <span className="text-xs text-neutral-500 font-medium leading-tight">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* Description */}
        {product.description && (
          <SectionReveal className="mt-16">
            <div className="max-w-3xl">
              <h2 className="heading-section text-2xl text-neutral-800 mb-6">
                Productomschrijving
              </h2>
              <div
                className="prose-product"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </SectionReveal>
        )}
      </div>
    </div>
  )
}
