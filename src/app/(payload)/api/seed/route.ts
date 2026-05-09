import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CATEGORY_NAV, PRODUCTS } from '@/data/products'

export async function POST(request: Request) {
  // In production, require Authorization: Bearer <SEED_TOKEN> so random
  // visitors can't reseed the catalogue. In dev anyone on localhost can hit
  // it without a token.
  if (process.env.NODE_ENV === 'production') {
    const expected = process.env.SEED_TOKEN
    if (!expected) {
      return NextResponse.json(
        { error: 'SEED_TOKEN not configured on this deployment' },
        { status: 503 },
      )
    }
    const auth = request.headers.get('authorization') ?? ''
    const provided = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : ''
    if (provided !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const payload = await getPayload({ config })

  const stats = {
    categoriesCreated: 0,
    categoriesSkipped: 0,
    productsCreated: 0,
    productsSkipped: 0,
    productsDeleted: 0,
    errors: [] as string[],
  }

  // Soft-delete products whose slug isn't in our current seed list:
  // mark them isPublished=false so they vanish from the storefront, but keep
  // the rows so existing orders that reference them stay intact (Postgres
  // would block a hard delete on a FK-referenced product anyway).
  try {
    const validSlugs = new Set(PRODUCTS.map((p) => p.slug))
    const all = await payload.find({
      collection: 'products',
      limit: 500,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: { isPublished: { equals: true } },
    })
    for (const doc of all.docs) {
      const docSlug = (doc as unknown as { slug: string }).slug
      if (!validSlugs.has(docSlug)) {
        try {
          await payload.update({
            collection: 'products',
            id: doc.id,
            data: { isPublished: false },
            overrideAccess: true,
          })
          stats.productsDeleted++
        } catch (innerErr) {
          stats.errors.push(`Soft-delete ${docSlug}: ${(innerErr as Error).message}`)
        }
      }
    }
  } catch (err) {
    stats.errors.push(`Cleanup: ${(err as Error).message}`)
  }

  const categoryIdBySlug = new Map<string, string | number>()

  for (let i = 0; i < CATEGORY_NAV.length; i++) {
    const c = CATEGORY_NAV[i]
    const data = {
      name: c.label,
      slug: c.slug,
      tagline: c.tagline,
      description: c.longDescription,
      order: i,
    }
    try {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: c.slug } },
        limit: 1,
        depth: 0,
      })

      if (existing.docs[0]) {
        await payload.update({
          collection: 'categories',
          id: existing.docs[0].id,
          data,
        })
        categoryIdBySlug.set(c.slug, existing.docs[0].id)
        stats.categoriesSkipped++
        continue
      }

      const created = await payload.create({
        collection: 'categories',
        data,
      })
      categoryIdBySlug.set(c.slug, created.id)
      stats.categoriesCreated++
    } catch (err) {
      stats.errors.push(`Category ${c.slug}: ${(err as Error).message}`)
    }
  }

  const productTypeMap: Record<string, string> = {
    panels: 'panel',
    inverters: 'inverter',
    batteries: 'battery',
    'flood-lights': 'accessory',
    'ceiling-lights': 'accessory',
    'water-pumps': 'accessory',
    'water-heaters': 'accessory',
    'power-stations': 'accessory',
    accessories: 'accessory',
    kits: 'kit',
  }

  // Wattage-bearing product types. Batteries/heaters/pumps don't get powerWatts
  // because their headline number (Ah, L, m) isn't power.
  const WATTABLE = new Set([
    'panels',
    'inverters',
    'flood-lights',
    'ceiling-lights',
    'power-stations',
  ])
  function parseWatts(name: string): number | undefined {
    // Match e.g. "100W", "1kW", "1KVA", "2.2KW", "10.2KW", "1kVA". Skip kWh.
    const match = name.match(/(\d+(?:\.\d+)?)\s*(kVA|kW|KVA|KW|W)\b/)
    if (!match) return undefined
    const raw = match[0].toUpperCase()
    if (raw.includes('KWH')) return undefined
    const n = Number(match[1])
    if (!Number.isFinite(n)) return undefined
    if (raw.includes('KVA') || raw.includes('KW')) return Math.round(n * 1000)
    return Math.round(n)
  }

  for (const p of PRODUCTS) {
    try {
      const categoryId = categoryIdBySlug.get(p.category)
      if (!categoryId) {
        stats.errors.push(`Product ${p.slug}: missing category ${p.category}`)
        continue
      }

      const powerWatts = WATTABLE.has(p.category) ? parseWatts(p.name) : undefined

      const data = {
        name: p.name,
        slug: p.slug,
        sku: p.id,
        productType: productTypeMap[p.category] ?? 'other',
        category: categoryId,
        price: p.price,
        stock: p.inStock ? 10 : 0,
        isPublished: true,
        isFeatured: Boolean(p.featured),
        shortDescription: p.shortDescription,
        imageUrl: p.image,
        rating: p.rating,
        reviews: p.reviews,
        powerWatts,
        specs: p.specs.map((s) => ({ label: s.label, value: s.value })),
        badges: (p.badges ?? []).map((label) => ({ label })),
      }

      const existing = await payload.find({
        collection: 'products',
        where: { slug: { equals: p.slug } },
        limit: 1,
        depth: 0,
      })

      if (existing.docs[0]) {
        await payload.update({
          collection: 'products',
          id: existing.docs[0].id,
          data,
        })
        stats.productsSkipped++ // counts updates
        continue
      }

      await payload.create({ collection: 'products', data })
      stats.productsCreated++
    } catch (err) {
      stats.errors.push(`Product ${p.slug}: ${(err as Error).message}`)
    }
  }

  // Flush cross-request caches so the storefront sees the new data on the
  // next render instead of waiting for the 5-min `unstable_cache` window.
  revalidateTag('products', 'max')
  revalidateTag('products:featured', 'max')
  revalidateTag('categories', 'max')

  return NextResponse.json(stats)
}
