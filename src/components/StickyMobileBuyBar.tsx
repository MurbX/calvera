'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart-context'
import { formatKes } from '@/lib/utils'

type Props = {
  product: Omit<CartItem, 'quantity'>
  triggerSelector?: string // when this element scrolls offscreen, the bar appears
}

export function StickyMobileBuyBar({ product, triggerSelector = '#product-buy-box' }: Props) {
  const { addItem } = useCart()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = document.querySelector(triggerSelector)
    if (!el) {
      setShow(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [triggerSelector])

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-2xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs text-muted">{product.name}</p>
          <p className="text-base font-extrabold text-fg">{formatKes(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => addItem(product, 1)}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </button>
      </div>
    </div>
  )
}
