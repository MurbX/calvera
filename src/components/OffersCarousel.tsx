'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Headset, ShieldCheck, Star, Truck } from 'lucide-react'
import { ToolsCrossedIcon } from '@/components/icons/service'
import { formatKes } from '@/lib/utils'

const FALLBACK_IMAGE = '/placeholder-product.svg'

export type OfferIconKey = 'tools' | 'headset' | 'truck' | 'shield'

const ICONS: Record<OfferIconKey, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  tools: ToolsCrossedIcon,
  headset: Headset,
  truck: Truck,
  shield: ShieldCheck,
}

export type OfferPackage = {
  kind: 'package'
  slug: string
  title: string
  price: number
  rating: number
  image: string | null
  href: string
}

export type OfferFeature = {
  kind: 'feature'
  title: string
  description: string
  price: string
  tagline: string
  href: string
  iconKey: OfferIconKey
}

export type Offer = OfferPackage | OfferFeature

export function OffersCarousel({ offers }: { offers: Offer[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-offer-card]') as HTMLElement | null
    const cardWidth = card ? card.offsetWidth + 16 : el.clientWidth
    el.scrollBy({ left: direction * cardWidth, behavior: 'smooth' })
  }

  const scrollToPage = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-offer-card]') as HTMLElement | null
    const cardWidth = card ? card.offsetWidth + 16 : el.clientWidth
    el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const measure = () => {
      const card = el.querySelector('[data-offer-card]') as HTMLElement | null
      const cardWidth = card ? card.offsetWidth + 16 : el.clientWidth
      const pages = Math.max(1, Math.round(el.scrollWidth / cardWidth) - 3)
      setPageCount(pages)
    }
    const onScroll = () => {
      const card = el.querySelector('[data-offer-card]') as HTMLElement | null
      const cardWidth = card ? card.offsetWidth + 16 : el.clientWidth
      setPage(Math.round(el.scrollLeft / cardWidth))
    }
    measure()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  if (offers.length === 0) return null

  return (
    <section className="mx-auto max-w-350 px-4 pt-16 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          Nairobi Solar Offers & Packages
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByPage(-1)}
            aria-label="Previous offers"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-fg/70 transition hover:border-fg/30 hover:text-fg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollByPage(1)}
            aria-label="Next offers"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-fg/70 transition hover:border-fg/30 hover:text-fg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {offers.map((o, i) =>
          o.kind === 'package' ? (
            <Link
              key={i}
              data-offer-card
              href={o.href}
              className="flex snap-start shrink-0 basis-[80%] flex-col rounded-2xl bg-soft p-5 transition hover:bg-brand-50 sm:basis-[48%] lg:basis-[calc(25%-12px)]"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white">
                <Image
                  src={o.image || FALLBACK_IMAGE}
                  alt={o.title}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 80vw"
                  className="object-contain p-4"
                />
              </div>
              <h3 className="mt-4 text-base font-bold text-fg">{o.title}</h3>
              <div className="mt-2 flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: o.rating }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <div className="mt-1 text-lg font-extrabold text-fg">{formatKes(o.price)}</div>
            </Link>
          ) : (
            <Link
              key={i}
              data-offer-card
              href={o.href}
              className="flex snap-start shrink-0 basis-[80%] flex-col rounded-2xl bg-soft p-6 transition hover:bg-brand-50 sm:basis-[48%] lg:basis-[calc(25%-12px)]"
            >
              {(() => {
                const Icon = ICONS[o.iconKey]
                return <Icon className="h-16 w-16 text-brand-800" strokeWidth={1.5} />
              })()}
              <h3 className="mt-5 text-base font-bold leading-tight text-fg">{o.title}</h3>
              <p className="mt-2 line-clamp-5 flex-1 text-sm leading-relaxed text-muted">
                {o.description}
              </p>
              <div className="mt-3 text-lg font-extrabold text-fg">{o.price}</div>
              <div className="mt-1 text-xs text-muted">{o.tagline}</div>
            </Link>
          ),
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToPage(i)}
            aria-label={`Page ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === page ? 'w-6 bg-brand-800' : 'w-1.5 bg-fg/15 hover:bg-fg/30'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
