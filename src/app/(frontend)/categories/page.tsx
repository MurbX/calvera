import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { getCategories, getProductCountsByCategory } from '@/lib/payload-data'
import { SolarPanel, BatteryFull, Spotlight, LampCeiling, Boxes } from 'lucide-react'
import { InverterIcon } from '@/components/icons/solar'

const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  panels: SolarPanel,
  inverters: InverterIcon,
  batteries: BatteryFull,
  'flood-lights': Spotlight,
  'ceiling-lights': LampCeiling,
  kits: Boxes,
}

export const metadata: Metadata = {
  title: 'Categories — Calvera Tech Solutions',
  description: 'Browse solar panels, inverters, batteries, flood lights, ceiling lights and complete kits.',
}

export default async function CategoriesIndexPage() {
  const [categories, counts] = await Promise.all([getCategories(), getProductCountsByCategory()])

  return (
    <div className="mx-auto max-w-350 px-4 py-12 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Categories</span>
      </nav>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          Shop by category
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
          Everything you need for a complete solar setup
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">
          From panels and inverters to batteries, lighting and full kits — pick a
          category to see what's in stock.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = CATEGORY_ICONS[c.slug] ?? SolarPanel
          const count = counts[c.slug] ?? 0
          return (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 transition hover:border-fg/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-xl border border-border bg-soft text-fg/85 transition group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-800">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  {count > 0 ? `${count} ${count === 1 ? 'item' : 'items'}` : 'On request'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-fg">{c.name}</h2>
                {c.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">{c.description}</p>
                )}
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-800 group-hover:text-brand-700">
                Browse {c.name} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
