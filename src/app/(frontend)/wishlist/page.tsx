'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { formatKes } from '@/lib/utils'

const FALLBACK_IMAGE = '/placeholder-product.svg'

export default function WishlistPage() {
  const { items, count, hydrated, remove, clear } = useWishlist()
  const { addItem } = useCart()

  const moveToCart = (item: (typeof items)[number]) => {
    addItem(
      {
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      },
      1,
    )
    remove(item.productId)
  }

  const moveAllToCart = () => {
    items.forEach((i) =>
      addItem(
        {
          productId: i.productId,
          slug: i.slug,
          name: i.name,
          price: i.price,
          imageUrl: i.imageUrl,
        },
        1,
      ),
    )
    clear()
  }

  return (
    <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Wishlist</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Your wishlist</h1>
          <p className="mt-1 text-sm text-muted">
            {hydrated
              ? `${count} ${count === 1 ? 'item' : 'items'} saved for later`
              : 'Loading…'}
          </p>
        </div>
        {hydrated && count > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={moveAllToCart}
              className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <ShoppingCart className="h-4 w-4" /> Move all to cart
            </button>
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-medium text-fg/70 hover:border-fg/30 hover:text-fg"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>

      {hydrated && count === 0 ? (
        <div className="mt-12 rounded-2xl bg-soft p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-fg/30" />
          <h2 className="mt-4 text-lg font-bold text-fg">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-muted">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={String(item.productId)}
              className="group flex flex-col rounded-2xl bg-white"
            >
              <div className="relative mt-2 mx-2 overflow-hidden rounded-xl bg-soft">
                <button
                  type="button"
                  aria-label="Remove from wishlist"
                  onClick={() => remove(item.productId)}
                  className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-rose-500 shadow-sm transition hover:text-rose-600"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
                <Link
                  href={`/products/${item.slug}`}
                  className="relative block aspect-square w-full"
                >
                  <Image
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
                    className="object-contain p-6 transition duration-500 group-hover:scale-[1.04]"
                  />
                </Link>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
                {item.categoryName && (
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
                    {item.categoryName}
                  </div>
                )}
                <Link
                  href={`/products/${item.slug}`}
                  className="line-clamp-1 text-sm font-semibold text-fg hover:text-brand-700"
                >
                  {item.name}
                </Link>
                <div className="text-base font-extrabold text-fg">{formatKes(item.price)}</div>
                <button
                  type="button"
                  onClick={() => moveToCart(item)}
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-800 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Move to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
