'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'top-rated', label: 'Top rated' },
]

export function ShopSortSelect({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value === 'featured') params.delete('sort')
    else params.set('sort', e.target.value)
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-fg/80">
      <span>Sort by</span>
      <select
        value={current}
        onChange={onChange}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-sm focus:border-fg/30 focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
