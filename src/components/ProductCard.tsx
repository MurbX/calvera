import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { formatKes } from '@/lib/utils'
import { AddToCartButton } from '@/components/AddToCartButton'
import { WishlistButton } from '@/components/WishlistButton'
import type { ProductRecord } from '@/lib/payload-data'

const FALLBACK_IMAGE = '/placeholder-product.svg'

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductRecord
  priority?: boolean
}) {
  const badge = product.badges?.[0]?.label
  const rating = product.rating ?? 0
  const reviews = product.reviews ?? 0
  const image = product.imageUrl || FALLBACK_IMAGE
  const categoryLabel = product.category?.name ?? ''

  return (
    <article className="group flex flex-col rounded-2xl bg-white">
      <div className="relative mt-2 mx-2 overflow-hidden rounded-xl bg-soft">
        {badge && (
          <span className="absolute left-3 top-3 z-10 inline-flex rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-900">
            {badge}
          </span>
        )}
        <WishlistButton
          className="absolute right-3 top-3 z-10"
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl ?? null,
            categoryName: product.category?.name ?? null,
          }}
        />

        <Link href={`/products/${product.slug}`} className="relative block aspect-square w-full">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition duration-500 group-hover:scale-[1.04]"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
        {categoryLabel && (
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {categoryLabel}
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-1 text-sm font-semibold text-fg hover:text-brand-700"
          >
            {product.name}
          </Link>
          <div className="shrink-0 text-sm font-extrabold text-fg">{formatKes(product.price)}</div>
        </div>
        {product.shortDescription && (
          <p className="line-clamp-1 text-xs text-muted">{product.shortDescription}</p>
        )}
        <div className="flex items-center gap-1 text-brand-700">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
          <span className="ml-1 text-[11px] text-muted">({reviews})</span>
        </div>
        <div className="mt-2">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl ?? null,
            }}
            label="Add to Cart"
          />
        </div>
      </div>
    </article>
  )
}
