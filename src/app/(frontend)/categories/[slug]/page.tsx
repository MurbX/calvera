import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight, ChevronRight, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Suspense } from 'react'
import { ShopSidebar } from '@/components/ShopSidebar'
import { Pagination } from '@/components/Pagination'
import {
  getCategories,
  getCategoryBySlug,
  getProductCountsByCategory,
  getProductsByCategory,
} from '@/lib/payload-data'
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

type CategoryRecordWithTagline = Awaited<ReturnType<typeof getCategoryBySlug>> & {
  tagline?: string | null
}

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const cats = await getCategories()
  return cats.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = (await getCategoryBySlug(slug)) as CategoryRecordWithTagline
  if (!category) return { title: 'Category not found' }
  return {
    title: `${category.name} — Calvera Tech Solutions`,
    description: category.description ?? undefined,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = (await getCategoryBySlug(slug)) as CategoryRecordWithTagline
  if (!category) notFound()

  const [itemsR, allCategoriesR, countsR] = await Promise.allSettled([
    getProductsByCategory(category.slug),
    getCategories(),
    getProductCountsByCategory(),
  ])
  const items = itemsR.status === 'fulfilled' ? itemsR.value : []
  const allCategories = allCategoriesR.status === 'fulfilled' ? allCategoriesR.value : []
  const counts = countsR.status === 'fulfilled' ? countsR.value : {}
  if (itemsR.status === 'rejected' || allCategoriesR.status === 'rejected' || countsR.status === 'rejected') {
    console.error('[category detail] partial fetch failure', {
      items: itemsR.status === 'rejected' ? itemsR.reason : null,
      categories: allCategoriesR.status === 'rejected' ? allCategoriesR.reason : null,
      counts: countsR.status === 'rejected' ? countsR.reason : null,
    })
  }
  const Icon = CATEGORY_ICONS[category.slug] ?? SolarPanel
  const otherCategories = allCategories.filter((c) => c.slug !== category.slug)

  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-16">
          <nav className="flex items-center gap-1 text-xs text-fg/60">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/categories" className="hover:text-brand-700">Categories</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-fg">{category.name}</span>
          </nav>

          <div className="mt-6 grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Category
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-fg md:text-5xl">
                {category.name}
              </h1>
              {category.tagline && (
                <p className="mt-2 text-base font-medium text-brand-800">{category.tagline}</p>
              )}
              {category.description && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg/75 md:text-base">
                  {category.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-fg/80">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-brand-700" /> Same-day local delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-brand-700" /> Pro install on request
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-700" /> Manufacturer-backed
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="grid h-40 w-40 place-items-center rounded-3xl bg-white shadow-sm ring-1 ring-brand-100">
                <Icon className="h-20 w-20 text-brand-800" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-soft" />}>
            <ShopSidebar />
          </Suspense>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Showing {items.length} {items.length === 1 ? 'product' : 'products'}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-fg/80">
                <span>Sort by</span>
                <select className="rounded-full border border-border bg-white px-3 py-1.5 text-sm focus:border-fg/30 focus:outline-none">
                  <option>Featured</option>
                  <option>Price: low to high</option>
                  <option>Price: high to low</option>
                  <option>Newest</option>
                  <option>Top rated</option>
                </select>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 md:gap-y-10">
              {items.map((p) => (
                <ProductCard key={String(p.id)} product={p} />
              ))}
            </div>

            {items.length === 0 ? (
              <p className="mt-12 rounded-2xl bg-soft p-8 text-center text-muted">
                No products listed yet — talk to us and we'll source what you need.
              </p>
            ) : (
              <div className="mt-12">
                <Pagination
                  current={1}
                  total={Math.max(1, Math.ceil(items.length / 12))}
                  basePath={`/categories/${category.slug}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-350 px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
            Browse other categories
          </h2>
          <Link
            href="/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-800 hover:text-brand-700 sm:inline-flex"
          >
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {otherCategories.map((c) => {
            const I = CATEGORY_ICONS[c.slug] ?? SolarPanel
            const count = counts[c.slug] ?? 0
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-fg/20 hover:shadow-sm"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-soft text-fg/85">
                  <I className="h-6 w-6" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-fg">{c.name}</div>
                  <div className="text-xs text-muted">
                    {count > 0 ? `${count} ${count === 1 ? 'item' : 'items'}` : 'On request'}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
