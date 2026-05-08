import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim()
  const limit = Math.min(20, Number(url.searchParams.get('limit') ?? 8))

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'products',
    where: {
      and: [
        { isPublished: { equals: true } },
        {
          or: [
            { name: { like: q } },
            { shortDescription: { like: q } },
            { sku: { like: q } },
          ],
        },
      ],
    },
    limit,
    depth: 1,
    select: {
      name: true,
      slug: true,
      price: true,
      imageUrl: true,
      category: true,
      shortDescription: true,
    },
    overrideAccess: true,
    sort: '-createdAt',
  })

  return NextResponse.json({
    results: result.docs.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      imageUrl: p.imageUrl,
      categoryName:
        typeof p.category === 'object' && p.category !== null && 'name' in p.category
          ? (p.category as { name: string }).name
          : null,
    })),
    total: result.totalDocs,
  })
}
