'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatKes } from '@/lib/utils'

const FALLBACK_IMAGE = '/placeholder-product.svg'

export default function CartPage() {
  const { items, total, count, hydrated, updateQuantity, removeItem, clear } = useCart()

  return (
    <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Cart</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-fg md:text-4xl">Your cart</h1>
      <p className="mt-1 text-sm text-muted">
        {hydrated ? `${count} ${count === 1 ? 'item' : 'items'}` : ' '}
      </p>

      {hydrated && items.length === 0 ? (
        <div className="mt-12 rounded-2xl bg-soft p-12 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-fg/30" />
          <h2 className="mt-4 text-lg font-bold text-fg">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted">
            Browse our solar gear and add what you need.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity
              return (
                <div
                  key={String(item.productId)}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-soft"
                  >
                    <Image
                      src={item.imageUrl || FALLBACK_IMAGE}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-semibold text-fg hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      Unit price: {formatKes(item.price)}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center rounded-l-full text-fg/70 hover:bg-soft hover:text-fg"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-9 px-2 text-center text-sm font-semibold text-fg">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center rounded-r-full text-fg/70 hover:bg-soft hover:text-fg"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-fg/60 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-fg">{formatKes(lineTotal)}</div>
                  </div>
                </div>
              )
            })}

            <div className="pt-2">
              <button
                type="button"
                onClick={clear}
                className="text-xs font-medium text-fg/60 hover:text-rose-600"
              >
                Clear cart
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-bold text-fg">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label={`Subtotal (${count} ${count === 1 ? 'item' : 'items'})`} value={formatKes(total)} />
                <Row label="Delivery" value="Calculated at checkout" muted />
                <Row label="Tax" value="Included" muted />
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm font-semibold text-fg">Estimated total</span>
                <span className="text-2xl font-extrabold text-brand-800">{formatKes(total)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
              >
                Checkout
              </Link>
              <Link
                href="/shop"
                className="mt-2 inline-flex w-full items-center justify-center text-xs font-semibold text-brand-800 hover:text-brand-700"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={muted ? 'text-muted' : 'text-fg/80'}>{label}</dt>
      <dd className={muted ? 'text-muted' : 'font-semibold text-fg'}>{value}</dd>
    </div>
  )
}
