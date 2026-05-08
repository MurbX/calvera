'use client'

import { useEffect, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { ShopSidebar } from '@/components/ShopSidebar'

type Props = React.ComponentProps<typeof ShopSidebar>

export function ShopFiltersDrawer(props: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      {/* Inline sidebar on lg+ */}
      <div className="hidden lg:block">
        <ShopSidebar {...props} />
      </div>

      {/* Mobile/tablet trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-fg/85 hover:border-fg/30 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Mobile/tablet drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute right-0 top-0 flex h-full w-[88%] max-w-90 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-bold text-fg">Filters</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="grid h-9 w-9 place-items-center rounded-lg text-fg/70 transition hover:bg-soft hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <ShopSidebar {...props} />
            </div>
            <div className="border-t border-border bg-white px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-brand-800 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Show results
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
