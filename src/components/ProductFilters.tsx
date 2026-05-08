'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { formatKes } from '@/lib/utils'

type Category = { name: string; slug: string }

type Props = {
  categories: Category[]
  basePath?: string
}

const PRICE_RANGES: { label: string; max: number }[] = [
  { label: 'Under KSh 5,000', max: 5_000 },
  { label: 'Under KSh 20,000', max: 20_000 },
  { label: 'Under KSh 50,000', max: 50_000 },
  { label: 'Under KSh 100,000', max: 100_000 },
  { label: 'Under KSh 500,000', max: 500_000 },
]

export function ProductFilters({ categories, basePath = '/' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openLabel, setOpenLabel] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpenLabel(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenLabel(null)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const activeCats = searchParams.getAll('cats').flatMap((v) => v.split(',')).filter(Boolean)
  const activePriceMax = searchParams.get('priceMax')
  const inStockOn = searchParams.get('inStock') === '1'

  const push = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : (basePath || pathname))
  }

  const toggleCategory = (slug: string) => {
    push((p) => {
      const next = activeCats.includes(slug)
        ? activeCats.filter((s) => s !== slug)
        : [...activeCats, slug]
      p.delete('cats')
      p.delete('cat')
      next.forEach((s) => p.append('cats', s))
    })
  }

  const setPriceMax = (max: number | null) => {
    push((p) => {
      if (max == null) p.delete('priceMax')
      else p.set('priceMax', String(max))
    })
  }

  const toggleInStock = () => {
    push((p) => {
      if (inStockOn) p.delete('inStock')
      else p.set('inStock', '1')
    })
  }

  const clearAll = () => router.push(pathname)
  const hasAny = activeCats.length > 0 || activePriceMax != null || inStockOn

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-2">
      <FilterPill
        label="Category"
        count={activeCats.length}
        isOpen={openLabel === 'Category'}
        onToggle={() => setOpenLabel(openLabel === 'Category' ? null : 'Category')}
      >
        <Panel title="Category" onClear={activeCats.length ? () => push((p) => { p.delete('cats'); p.delete('cat') }) : undefined}>
          <ul className="max-h-72 overflow-y-auto py-1">
            {categories.map((c) => {
              const checked = activeCats.includes(c.slug)
              return (
                <li key={c.slug}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg hover:bg-soft">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c.slug)}
                      className="h-4 w-4 rounded border-border accent-brand-800"
                    />
                    <span>{c.name}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </Panel>
      </FilterPill>

      <FilterPill
        label="Price"
        count={activePriceMax ? 1 : 0}
        isOpen={openLabel === 'Price'}
        onToggle={() => setOpenLabel(openLabel === 'Price' ? null : 'Price')}
      >
        <Panel title="Price" onClear={activePriceMax ? () => setPriceMax(null) : undefined}>
          <ul className="py-1">
            <li>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg hover:bg-soft">
                <input
                  type="radio"
                  name="priceMax"
                  checked={!activePriceMax}
                  onChange={() => setPriceMax(null)}
                  className="h-4 w-4 accent-brand-800"
                />
                <span>Any price</span>
              </label>
            </li>
            {PRICE_RANGES.map((r) => (
              <li key={r.max}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg hover:bg-soft">
                  <input
                    type="radio"
                    name="priceMax"
                    checked={activePriceMax === String(r.max)}
                    onChange={() => setPriceMax(r.max)}
                    className="h-4 w-4 accent-brand-800"
                  />
                  <span>{r.label}</span>
                </label>
              </li>
            ))}
          </ul>
          {activePriceMax && (
            <p className="px-3 py-2 text-xs text-muted">
              Showing items up to {formatKes(Number(activePriceMax))}
            </p>
          )}
        </Panel>
      </FilterPill>

      <button
        type="button"
        onClick={toggleInStock}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
          inStockOn
            ? 'border-brand-800 bg-brand-50 text-brand-800'
            : 'border-border bg-white text-fg hover:border-fg/30'
        }`}
      >
        In stock
        {inStockOn && <span className="text-xs">✓</span>}
      </button>

      {hasAny && (
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-fg/70 hover:border-fg/30"
        >
          <X className="h-3 w-3" /> Clear all
        </button>
      )}

      <div className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-fg/40">
        All Filters
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
      </div>
    </div>
  )
}

function FilterPill({
  label,
  count,
  isOpen,
  onToggle,
  children,
}: {
  label: string
  count: number
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
          count > 0
            ? 'border-brand-800 bg-brand-50 text-brand-800'
            : isOpen
              ? 'border-fg/30 bg-white text-fg'
              : 'border-border bg-white text-fg hover:border-fg/30'
        }`}
      >
        {label}
        {count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-800 px-1.5 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-lg ring-1 ring-black/5">
          {children}
        </div>
      )}
    </div>
  )
}

function Panel({
  title,
  onClear,
  children,
}: {
  title: string
  onClear?: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 text-xs">
        <span className="font-semibold text-fg">{title}</span>
        {onClear && (
          <button onClick={onClear} className="text-brand-800 hover:text-brand-700">
            Clear
          </button>
        )}
      </div>
      {children}
    </>
  )
}
