import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { ShopFiltersDrawer } from '@/components/ShopFiltersDrawer'
import { Pagination } from '@/components/Pagination'
import { ShopSortSelect } from '@/components/ShopSortSelect'
import {
  getCategories,
  getFilteredProducts,
  type PowerRange,
  type ProductSort,
} from '@/lib/payload-data'
import { readList, readNumber, readString, readBool } from '@/lib/searchparams'

const VALID_SORTS: ProductSort[] = [
  'featured',
  'price-asc',
  'price-desc',
  'newest',
  'top-rated',
]
const VALID_POWER: PowerRange[] = [
  'under-100',
  '100-500',
  '500-2000',
  '2000-5000',
  '5000-plus',
]

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams
  const categories = await getCategories()

  // Read URL params
  const requestedCats = readList(sp.cats)
  const legacyCat = readString(sp.cat) // backwards-compatible single-cat param
  const categorySlugs = requestedCats.length > 0 ? requestedCats : legacyCat ? [legacyCat] : []
  const validCatSlugs = categorySlugs.filter((s) => categories.some((c) => c.slug === s))
  const page = readNumber(sp.page, 1) ?? 1
  const priceMax = readNumber(sp.priceMax)
  const inStockOnly = readBool(sp.inStock)
  const sortRaw = readString(sp.sort) as ProductSort | undefined
  const sort = sortRaw && VALID_SORTS.includes(sortRaw) ? sortRaw : 'featured'
  const powerRangesAll = readList(sp.power) as PowerRange[]
  const powerRanges = powerRangesAll.filter((p) => VALID_POWER.includes(p))
  const ratingMin = readNumber(sp.ratingMin)

  const result = await getFilteredProducts({
    page,
    pageSize: 12,
    categorySlugs: validCatSlugs.length > 0 ? validCatSlugs : undefined,
    priceMax,
    inStockOnly,
    powerRanges: powerRanges.length > 0 ? powerRanges : undefined,
    ratingMin,
    sort,
  })

  const heading =
    validCatSlugs.length === 1
      ? categories.find((c) => c.slug === validCatSlugs[0])?.name ?? "Kenya's Solar Products"
      : "Kenya's Solar Products"

  return (
    <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-fg">Shop</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[260px_1fr]">
        <ShopFiltersDrawer
          showCategories
          categories={categories}
          activeSlugs={validCatSlugs}
          priceMax={priceMax}
          inStockOnly={inStockOnly}
          powerRanges={powerRanges}
          ratingMin={ratingMin}
        />

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">{heading}</h1>
              <p className="mt-1 text-sm text-muted">
                {result.total} {result.total === 1 ? 'product' : 'products'}
                {validCatSlugs.length > 0
                  ? ` • filtered by ${validCatSlugs
                      .map((s) => categories.find((c) => c.slug === s)?.name)
                      .filter(Boolean)
                      .join(', ')}`
                  : ''}
              </p>
            </div>
            <ShopSortSelect current={sort} />
          </div>

          {result.items.length === 0 ? (
            <p className="mt-12 rounded-2xl bg-soft p-8 text-center text-muted">
              No products match your filters.
            </p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 md:gap-y-10">
                {result.items.map((p, i) => (
                  <ProductCard key={String(p.id)} product={p} priority={i < 3} />
                ))}
              </div>
              <div className="mt-12">
                <Pagination
                  current={result.page}
                  total={result.totalPages}
                  basePath="/shop"
                  searchParams={sp}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
