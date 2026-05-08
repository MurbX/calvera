'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatKes } from '@/lib/utils'
import type { ProductRecord } from '@/lib/payload-data'

const AUTO_MS = 7000
const FALLBACK_IMAGE = '/placeholder-product.svg'

export function HeroCarousel({ products }: { products: ProductRecord[] }) {
  const SLIDES = products
  const slideCount = SLIDES.length
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    setIndex((i) => (slideCount > 0 ? (i + 1) % slideCount : 0))
  }, [slideCount])

  useEffect(() => {
    if (slideCount <= 1) return
    timerRef.current = setInterval(tick, AUTO_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [tick, slideCount])

  const pause = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }
  const resume = () => {
    if (slideCount <= 1) return
    pause()
    timerRef.current = setInterval(tick, AUTO_MS)
  }
  const go = (next: number) =>
    setIndex(slideCount > 0 ? (next + slideCount) % slideCount : 0)

  if (slideCount === 0) return null

  return (
    <section
      onMouseEnter={pause}
      onMouseLeave={resume}
      className="relative w-full bg-brand-50"
      aria-roledescription="carousel"
      aria-label="Featured solar products"
    >
      <div className="relative mx-auto max-w-350 px-14 sm:px-20">
        <div className="relative grid min-h-130 grid-cols-1 md:min-h-160 md:grid-cols-12">
          {SLIDES.map((product, i) => (
            <article
              key={String(product.id)}
              aria-hidden={i !== index}
              className={`carousel-slide absolute inset-0 grid grid-cols-1 md:grid-cols-12 ${
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <div className="flex flex-col justify-center gap-5 py-10 pr-4 md:col-span-5 md:py-16 md:pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  {product.badges?.map((b) => (
                    <span
                      key={b.label}
                      className="inline-flex rounded-full bg-brand-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                    >
                      {b.label}
                    </span>
                  ))}
                  {product.category?.name && (
                    <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg/70">
                      {product.category.name}
                    </span>
                  )}
                </div>

                <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-tight text-fg md:text-5xl lg:text-[56px]">
                  {product.name}
                </h1>

                {product.shortDescription && (
                  <p className="max-w-md text-sm text-muted md:text-base">
                    {product.shortDescription}
                  </p>
                )}

                <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
                  {(product.specs ?? []).slice(0, 3).map((s) => (
                    <div key={s.label}>
                      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
                        {s.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-fg">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-2xl font-extrabold tracking-tight text-fg">
                    {formatKes(product.price)}
                  </span>
                </div>
              </div>

              <div className="relative hidden md:col-span-7 md:block">
                <Image
                  src={product.imageUrl || FALLBACK_IMAGE}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 55vw, 60vw"
                  className="object-contain p-4 md:p-6"
                  priority={i === 0}
                />
              </div>
            </article>
          ))}
        </div>

        <button
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="absolute -left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-fg/70 shadow-sm transition hover:text-fg sm:-left-5"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="absolute -right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-fg/70 shadow-sm transition hover:text-fg sm:-right-5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-6 left-14 flex items-center gap-1.5 sm:left-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 rounded-full transition-all ${
                i === index ? 'w-8 bg-brand-800' : 'w-3 bg-fg/15 hover:bg-fg/30'
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  )
}
