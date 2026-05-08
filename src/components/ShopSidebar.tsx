'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { formatKes } from '@/lib/utils'

const POWER_RANGES: { value: string; label: string }[] = [
  { value: 'under-100', label: 'Under 100W' },
  { value: '100-500', label: '100 – 500W' },
  { value: '500-2000', label: '500W – 2kW' },
  { value: '2000-5000', label: '2kW – 5kW' },
  { value: '5000-plus', label: '5kW+' },
]
const RATINGS = [5, 4, 3]

type Props = {
  showCategories?: boolean
  categories?: { name: string; slug: string }[]
  activeSlugs?: string[]
  priceMax?: number
  inStockOnly?: boolean
  powerRanges?: string[]
  ratingMin?: number
}

export function ShopSidebar({
  showCategories = false,
  categories = [],
  activeSlugs = [],
  priceMax: priceMaxProp,
  inStockOnly: inStockOnlyProp = false,
  powerRanges: powerRangesProp = [],
  ratingMin: ratingMinProp,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [priceMax, setPriceMax] = useState(priceMaxProp ?? 2_000_000)

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const toggleCategory = (slug: string, on: boolean) => {
    pushParams((p) => {
      const current = p.getAll('cats').flatMap((v) => v.split(',')).filter(Boolean)
      const next = on ? [...new Set([...current, slug])] : current.filter((s) => s !== slug)
      p.delete('cats')
      p.delete('cat')
      next.forEach((s) => p.append('cats', s))
    })
  }

  const applyPrice = (max: number) => {
    pushParams((p) => {
      if (max >= 2_000_000) p.delete('priceMax')
      else p.set('priceMax', String(max))
    })
  }

  const toggleInStock = (on: boolean) => {
    pushParams((p) => {
      if (on) p.set('inStock', '1')
      else p.delete('inStock')
    })
  }

  const togglePowerRange = (value: string, on: boolean) => {
    pushParams((p) => {
      const current = p.getAll('power').flatMap((v) => v.split(',')).filter(Boolean)
      const next = on ? [...new Set([...current, value])] : current.filter((s) => s !== value)
      p.delete('power')
      next.forEach((v) => p.append('power', v))
    })
  }

  const setRatingMin = (value: number | null) => {
    pushParams((p) => {
      if (value == null) p.delete('ratingMin')
      else p.set('ratingMin', String(value))
    })
  }

  return (
    <aside className="space-y-6">
      {showCategories && categories.length > 0 && (
        <FilterGroup title="Categories" defaultOpen>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Checkbox
                  label={c.name}
                  checked={activeSlugs.includes(c.slug)}
                  onChange={(on) => toggleCategory(c.slug, on)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Price" defaultOpen>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={2_000_000}
            step={10_000}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            onMouseUp={(e) => applyPrice(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => applyPrice(Number((e.target as HTMLInputElement).value))}
            className="w-full accent-brand-800"
          />
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatKes(0)}</span>
            <span className="font-semibold text-fg">Up to {formatKes(priceMax)}</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Power Capacity">
        <ul className="space-y-2">
          {POWER_RANGES.map((r) => (
            <li key={r.value}>
              <Checkbox
                label={r.label}
                checked={powerRangesProp.includes(r.value)}
                onChange={(on) => togglePowerRange(r.value, on)}
              />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-muted">
          For panels, inverters, lights and power stations.
        </p>
      </FilterGroup>

      <FilterGroup title="Rating">
        <ul className="space-y-2">
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-fg/80 hover:text-fg">
              <input
                type="radio"
                name="ratingMin"
                checked={!ratingMinProp}
                onChange={() => setRatingMin(null)}
                className="h-4 w-4 accent-brand-800"
              />
              Any rating
            </label>
          </li>
          {RATINGS.map((r) => (
            <li key={r}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg/80 hover:text-fg">
                <input
                  type="radio"
                  name="ratingMin"
                  checked={ratingMinProp === r}
                  onChange={() => setRatingMin(r)}
                  className="h-4 w-4 accent-brand-800"
                />
                {r} stars &amp; up
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Availability" defaultOpen>
        <Checkbox
          label="In stock only"
          checked={inStockOnlyProp}
          onChange={toggleInStock}
        />
      </FilterGroup>

      <div className="flex flex-col gap-2 border-t border-border pt-5">
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-fg/80 hover:border-fg/30"
        >
          Clear all filters
        </button>
      </div>
    </aside>
  )
}

function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border pb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-fg"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
}: {
  label: string
  checked?: boolean
  onChange?: (on: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      className={`flex items-center gap-2 text-sm ${
        disabled
          ? 'cursor-not-allowed text-fg/40'
          : 'cursor-pointer text-fg/80 hover:text-fg'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-brand-800 disabled:opacity-50"
      />
      {label}
    </label>
  )
}
