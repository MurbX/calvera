import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, Search } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { ProductRecord } from '@/lib/payload-data'
import { withRetry } from '@/lib/db-retry'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Search results` : 'Search — Calvera Tech Solutions',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  let items: ProductRecord[] = []
  let total = 0

  if (query.length >= 2) {
    try {
      const payload = await getPayload({ config })
      const result = await withRetry(() =>
        payload.find({
          collection: 'products',
          where: {
            and: [
              { isPublished: { equals: true } },
              {
                or: [
                  { name: { like: query } },
                  { shortDescription: { like: query } },
                  { sku: { like: query } },
                ],
              },
            ],
          },
          limit: 50,
          depth: 1,
          overrideAccess: true,
        }),
      )
      items = result.docs as unknown as ProductRecord[]
      total = result.totalDocs
    } catch (err) {
      console.error('[search] query failed', err)
    }
  }

  return (
    <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Search</span>
      </nav>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          Search
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
          {query.length === 0
            ? 'What are you looking for?'
            : query.length < 2
              ? 'Type at least 2 characters'
              : `${total} ${total === 1 ? 'result' : 'results'} for "${query}"`}
        </h1>
      </div>

      <form action="/search" method="GET" className="mt-6 max-w-xl">
        <label className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-3 focus-within:border-fg/30">
          <Search className="h-4 w-4 text-muted" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-full bg-brand-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </label>
      </form>

      {query.length >= 2 && items.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 md:gap-y-10 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={String(p.id)} product={p} />
          ))}
        </div>
      )}

      {query.length >= 2 && items.length === 0 && (
        <div className="mt-12 rounded-2xl bg-soft p-10 text-center">
          <p className="text-base font-semibold text-fg">No products matched "{query}"</p>
          <p className="mt-2 text-sm text-muted">
            Try a different keyword, or browse our{' '}
            <Link href="/categories" className="font-semibold text-brand-800 hover:text-brand-700">
              categories
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}
