import Link from 'next/link'
import {
  ArrowRight,
  Wrench,
  SolarPanel,
  BatteryFull,
  Spotlight,
  LampCeiling,
  Boxes,
  Construction,
  Cable,
  Power,
  Droplets,
  Flame,
} from 'lucide-react'
import { CategoryCard } from '@/components/CategoryCard'
import { HomeHero } from '@/components/HomeHero'
import { OffersSection } from '@/components/OffersSection'
import { Pagination } from '@/components/Pagination'
import { ProductCard } from '@/components/ProductCard'
import { InverterIcon } from '@/components/icons/solar'
import {
  getCategories,
  getFilteredProducts,
  getProductCountsByCategory,
} from '@/lib/payload-data'
import { readNumber } from '@/lib/searchparams'

const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  panels: SolarPanel,
  inverters: InverterIcon,
  batteries: BatteryFull,
  'flood-lights': Spotlight,
  'ceiling-lights': LampCeiling,
  kits: Boxes,
  'water-pumps': Droplets,
  'water-heaters': Flame,
  'power-stations': Power,
  accessories: Cable,
}

const EXTRA_CATEGORIES = [
  { href: '/installation', title: 'Mounting Gear', count: 'On request', Icon: Construction },
]

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams
  const page = readNumber(sp.page, 1) ?? 1

  // Resilient parallel fetch: a failing query (e.g. Neon cold-start) falls back
  // to an empty default rather than crashing the whole tree. The first two are
  // cross-request cached (5-min TTL) so the homepage is essentially free.
  const [categoriesR, countsR, productsR] = await Promise.allSettled([
    getCategories(),
    getProductCountsByCategory(),
    getFilteredProducts({ page, pageSize: 20, sort: 'featured' }),
  ])

  const categories = categoriesR.status === 'fulfilled' ? categoriesR.value : []
  const counts = countsR.status === 'fulfilled' ? countsR.value : {}
  const products =
    productsR.status === 'fulfilled'
      ? productsR.value
      : { items: [], total: 0, page, pageSize: 20, totalPages: 0 }

  if (
    categoriesR.status === 'rejected' ||
    countsR.status === 'rejected' ||
    productsR.status === 'rejected'
  ) {
    console.error('[home] partial fetch failure', {
      categories: categoriesR.status === 'rejected' ? categoriesR.reason : null,
      counts: countsR.status === 'rejected' ? countsR.reason : null,
      products: productsR.status === 'rejected' ? productsR.reason : null,
    })
  }

  return (
    <>
      <HomeHero />

      <OffersSection />

      <section className="mx-auto max-w-350 px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              Browse by category
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-fg md:text-3xl">
              Categories
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-800 hover:text-brand-700 sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? SolarPanel
            const count = counts[c.slug] ?? 0
            return (
              <CategoryCard
                key={c.slug}
                href={`/categories/${c.slug}`}
                title={c.name}
                count={count > 0 ? `${count} ${count === 1 ? 'item' : 'items'}` : 'On request'}
                Icon={Icon}
              />
            )
          })}
          {EXTRA_CATEGORIES.map((c) => (
            <CategoryCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              Featured this month
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
              Kenya&apos;s Solar Products!
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-800 hover:text-brand-700 sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-2 text-sm text-muted">
          {products.total} {products.total === 1 ? 'product' : 'products'} in stock
        </p>

        {products.items.length === 0 ? (
          <p className="mt-12 rounded-2xl bg-soft p-8 text-center text-muted">
            No products to show right now.
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 md:gap-y-10 lg:grid-cols-4">
              {products.items.map((p, i) => (
                <ProductCard key={String(p.id)} product={p} priority={i < 4} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination
                current={products.page}
                total={products.totalPages}
                basePath="/"
                searchParams={sp}
              />
            </div>
          </>
        )}
      </section>

      <section className="mx-auto max-w-350 px-4 py-10 sm:px-6 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-900 via-brand-800 to-brand-700 p-10 md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div className="text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Reliable, affordable &amp; smart solar
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Cut your electricity costs. Power your day.
              </h2>
              <p className="mt-3 max-w-lg text-white/80">
                Tell us what you run — fridge, lights, TV, pump, office gear — and we&apos;ll
                size your panels, inverter and batteries. You&apos;ll get a branded PDF
                quotation in seconds, and our team follows up to confirm and install.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/power-audit"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-amber-300"
              >
                Open the calculator <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/installation"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                <Wrench className="h-4 w-4" /> Talk to an installer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
