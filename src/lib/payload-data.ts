import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload, type Where } from 'payload'
import config from '@payload-config'
import { withRetry } from './db-retry'

/**
 * Module-level Payload singleton.
 *
 * Why globalThis? In dev, Next.js HMR re-evaluates this module on every code
 * change, which would re-init Payload (1.5-4s each time). Stashing on
 * globalThis preserves the instance across reloads. In production it just
 * acts as a normal module-level cache.
 *
 * Why a promise cache too? Concurrent first requests would otherwise each
 * call getPayload() — caching the promise dedupes the init.
 */
type PayloadCache = { client: Payload | null; promise: Promise<Payload> | null }
const globalForPayload = globalThis as unknown as { _payloadCache?: PayloadCache }
const cached: PayloadCache = (globalForPayload._payloadCache ??= {
  client: null,
  promise: null,
})

async function getPayloadClient(): Promise<Payload> {
  if (cached.client) return cached.client
  if (!cached.promise) {
    cached.promise = getPayload({ config }).then((c) => {
      cached.client = c
      return c
    })
  }
  return cached.promise
}

const getCachedPayload = cache(getPayloadClient)

const PRODUCT_LIST_SELECT = {
  name: true,
  slug: true,
  sku: true,
  productType: true,
  category: true,
  brand: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  isFeatured: true,
  shortDescription: true,
  imageUrl: true,
  rating: true,
  reviews: true,
  badges: true,
} as const

const PRODUCT_DETAIL_SELECT = {
  ...PRODUCT_LIST_SELECT,
  description: true,
  specs: true,
  panelDetails: true,
  inverterDetails: true,
  batteryDetails: true,
  kitContents: true,
  seo: true,
} as const

export type ProductRecord = {
  id: number | string
  name: string
  slug: string
  sku?: string | null
  productType: string
  category: { id: number | string; name: string; slug: string }
  brand?: { id: number | string; name: string; slug: string } | null
  price: number
  compareAtPrice?: number | null
  stock?: number | null
  isFeatured?: boolean | null
  shortDescription?: string | null
  imageUrl?: string | null
  rating?: number | null
  reviews?: number | null
  badges?: { label: string }[] | null
  description?: unknown
  specs?: { label: string; value: string }[] | null
}

/**
 * Internal: the shape Payload returns when we query with depth: 0 — relations
 * come back as raw FK ids instead of populated objects. We use depth: 0 to
 * sidestep a v3 row-mapper edge case that throws "Cannot read properties of
 * undefined (reading 'id')" on certain product rows during relation populate.
 */
type RawProduct = Omit<ProductRecord, 'category' | 'brand'> & {
  category: number | string | null
  brand?: number | string | null
}

async function enrichProducts(raw: RawProduct[]): Promise<ProductRecord[]> {
  const cats = await getCategories()
  const catById = new Map<string | number, CategoryRecord>(cats.map((c) => [c.id, c]))
  return raw.map((p) => {
    const cat = p.category != null ? catById.get(p.category) : undefined
    return {
      ...p,
      category: cat
        ? { id: cat.id, name: cat.name, slug: cat.slug }
        : { id: p.category ?? 0, name: 'Uncategorized', slug: '' },
      brand: null,
    }
  })
}

export type CategoryRecord = {
  id: number | string
  name: string
  slug: string
  tagline?: string | null
  description?: string | null
  order?: number | null
}

const CATEGORY_SELECT = {
  name: true,
  slug: true,
  tagline: true,
  description: true,
  order: true,
} as const

const REVALIDATE_SECONDS = 5 * 60 // 5 minutes — products & categories don't change often

/**
 * Cross-request caching wrapper.
 * - First call hits Payload; subsequent calls within `revalidate` window are cached.
 * - Tags let Payload `afterChange` hooks call `revalidateTag()` to invalidate.
 * - React `cache()` then dedupes within a single render.
 */
function cachedQuery<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyParts: string[],
  tags: string[],
) {
  const retried = (...args: TArgs) => withRetry(() => fn(...args))
  const wrapped = unstable_cache(retried, keyParts, { revalidate: REVALIDATE_SECONDS, tags })
  return cache(wrapped) as (...args: TArgs) => Promise<TReturn>
}

export const getProducts = cachedQuery(
  async (): Promise<ProductRecord[]> => {
    const payload = await getCachedPayload()
    const result = await payload.find({
      collection: 'products',
      where: { isPublished: { equals: true } },
      limit: 24,
      depth: 0,
      select: PRODUCT_LIST_SELECT,
      overrideAccess: true,
      sort: '-createdAt',
    })
    return enrichProducts(result.docs as unknown as RawProduct[])
  },
  ['products', 'list'],
  ['products'],
)

export const getFeaturedProducts = cachedQuery(
  async (): Promise<ProductRecord[]> => {
    const payload = await getCachedPayload()
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [{ isPublished: { equals: true } }, { isFeatured: { equals: true } }],
      },
      limit: 8,
      depth: 0,
      select: PRODUCT_LIST_SELECT,
      overrideAccess: true,
    })
    return enrichProducts(result.docs as unknown as RawProduct[])
  },
  ['products', 'featured'],
  ['products', 'products:featured'],
)

export const getProductBySlug = cachedQuery(
  async (slug: string): Promise<ProductRecord | null> => {
    const payload = await getCachedPayload()
    const result = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      select: PRODUCT_DETAIL_SELECT,
      overrideAccess: true,
    })
    const raw = result.docs[0] as unknown as RawProduct | undefined
    if (!raw) return null
    const [enriched] = await enrichProducts([raw])
    return enriched
  },
  ['products', 'by-slug'],
  ['products'],
)

export const getCategories = cachedQuery(
  async (): Promise<CategoryRecord[]> => {
    const payload = await getCachedPayload()
    const result = await payload.find({
      collection: 'categories',
      limit: 50,
      depth: 0,
      select: CATEGORY_SELECT,
      sort: 'order',
      overrideAccess: true,
    })
    return result.docs as unknown as CategoryRecord[]
  },
  ['categories', 'list'],
  ['categories'],
)

export const getCategoryBySlug = cachedQuery(
  async (slug: string): Promise<CategoryRecord | null> => {
    const payload = await getCachedPayload()
    const result = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      select: CATEGORY_SELECT,
      overrideAccess: true,
    })
    return (result.docs[0] as unknown as CategoryRecord) ?? null
  },
  ['categories', 'by-slug'],
  ['categories'],
)

export const getProductsByCategory = cachedQuery(
  async (categorySlug: string): Promise<ProductRecord[]> => {
    const payload = await getCachedPayload()
    const cat = await getCategoryBySlug(categorySlug)
    if (!cat) return []
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [{ isPublished: { equals: true } }, { category: { equals: cat.id } }],
      },
      limit: 50,
      depth: 0,
      select: PRODUCT_LIST_SELECT,
      overrideAccess: true,
      sort: '-createdAt',
    })
    return enrichProducts(result.docs as unknown as RawProduct[])
  },
  ['products', 'by-category'],
  ['products', 'categories'],
)

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'top-rated'

export type PowerRange =
  | 'under-100'
  | '100-500'
  | '500-2000'
  | '2000-5000'
  | '5000-plus'

export const POWER_RANGE_BOUNDS: Record<PowerRange, [number, number | undefined]> = {
  'under-100': [0, 99],
  '100-500': [100, 500],
  '500-2000': [501, 2000],
  '2000-5000': [2001, 5000],
  '5000-plus': [5001, undefined],
}

export type ProductQueryArgs = {
  page?: number
  pageSize?: number
  categorySlugs?: string[]
  priceMax?: number
  priceMin?: number
  powerRanges?: PowerRange[]
  ratingMin?: number
  inStockOnly?: boolean
  featuredOnly?: boolean
  sort?: ProductSort
}

export type ProductQueryResult = {
  items: ProductRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const SORT_MAP: Record<ProductSort, string> = {
  featured: '-isFeatured',
  'price-asc': 'price',
  'price-desc': '-price',
  newest: '-createdAt',
  'top-rated': '-rating',
}

export async function getFilteredProducts(
  args: ProductQueryArgs = {},
): Promise<ProductQueryResult> {
  const payload = await getCachedPayload()
  const page = Math.max(1, args.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, args.pageSize ?? 12))
  const sort = SORT_MAP[args.sort ?? 'featured']

  const where: Where[] = [{ isPublished: { equals: true } }]

  if (args.categorySlugs && args.categorySlugs.length > 0) {
    const cats = await getCategories()
    const catIds = cats
      .filter((c) => args.categorySlugs!.includes(c.slug))
      .map((c) => c.id)
    if (catIds.length === 0) {
      // Slug provided but no match → return empty result
      return { items: [], total: 0, page, pageSize, totalPages: 0 }
    }
    where.push({ category: { in: catIds } })
  }
  if (typeof args.priceMin === 'number' && args.priceMin > 0) {
    where.push({ price: { greater_than_equal: args.priceMin } })
  }
  if (typeof args.priceMax === 'number' && args.priceMax > 0) {
    where.push({ price: { less_than_equal: args.priceMax } })
  }
  if (args.inStockOnly) {
    where.push({ stock: { greater_than: 0 } })
  }
  if (args.featuredOnly) {
    where.push({ isFeatured: { equals: true } })
  }
  if (args.powerRanges && args.powerRanges.length > 0) {
    const orClauses: Where[] = args.powerRanges
      .map((range) => POWER_RANGE_BOUNDS[range])
      .filter(Boolean)
      .map(([min, max]) => {
        const clause: Where = max === undefined
          ? { powerWatts: { greater_than_equal: min } }
          : { and: [
              { powerWatts: { greater_than_equal: min } },
              { powerWatts: { less_than_equal: max } },
            ] }
        return clause
      })
    if (orClauses.length > 0) where.push({ or: orClauses })
  }
  if (typeof args.ratingMin === 'number' && args.ratingMin > 0) {
    where.push({ rating: { greater_than_equal: args.ratingMin } })
  }

  const result = await withRetry(() =>
    payload.find({
      collection: 'products',
      where: { and: where },
      page,
      limit: pageSize,
      depth: 0,
      select: PRODUCT_LIST_SELECT,
      overrideAccess: true,
      sort,
    }),
  )

  const items = await enrichProducts(result.docs as unknown as RawProduct[])
  return {
    items,
    total: result.totalDocs,
    page,
    pageSize,
    totalPages: result.totalPages,
  }
}

/**
 * Single-query category counts. Pulls minimal product data (just category)
 * and aggregates client-side. Replaces the previous N+1 (one count() per
 * category) which fired 6+ DB roundtrips.
 */
export const getProductCountsByCategory = cachedQuery(
  async (): Promise<Record<string, number>> => {
    const payload = await getCachedPayload()
    const result = await payload.find({
      collection: 'products',
      where: { isPublished: { equals: true } },
      limit: 1000,
      depth: 0,
      select: { category: true },
      pagination: false,
      overrideAccess: true,
    })
    const cats = await getCategories()
    const slugById = new Map<string | number, string>(cats.map((c) => [c.id, c.slug]))
    const counts: Record<string, number> = {}
    for (const doc of result.docs) {
      const catId = (doc as unknown as { category?: number | string | null }).category
      if (catId == null) continue
      const slug = slugById.get(catId)
      if (slug) counts[slug] = (counts[slug] ?? 0) + 1
    }
    return counts
  },
  ['products', 'category-counts'],
  ['products', 'categories'],
)
