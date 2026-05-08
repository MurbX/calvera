'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

const FALLBACK_IMAGE = '/placeholder-product.svg'

type Props = {
  name: string
  primary: string | null
  gallery?: string[]
}

export function ProductImageGallery({ name, primary, gallery = [] }: Props) {
  const all = [primary, ...gallery].filter((s): s is string => Boolean(s))
  const images = all.length > 0 ? all : [FALLBACK_IMAGE]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const go = (next: number) => setActive((next + images.length) % images.length)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(active + 1)
      if (e.key === 'ArrowLeft') go(active - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, active, images.length])

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-soft">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Zoom image"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-fg/70 shadow-sm transition hover:text-fg"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <Image
          src={images[active]}
          alt={name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain p-10 transition duration-500"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-fg/70 shadow-sm transition hover:text-fg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-fg/70 shadow-sm transition hover:text-fg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              type="button"
              key={img + i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded-xl border bg-soft transition ${
                i === active ? 'border-brand-800 ring-1 ring-brand-800' : 'border-border hover:border-fg/30'
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox(false)
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-full max-h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={name}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation()
                  go(active - 1)
                }}
                className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation()
                  go(active + 1)
                }}
                className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
