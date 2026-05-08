'use client'

import { useState } from 'react'
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

type Props = {
  product: Omit<CartItem, 'quantity'>
}

export function ProductBuyBox({ product }: Props) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const onAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      <div className="inline-flex items-center rounded-full border border-border bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-12 w-11 place-items-center rounded-l-full text-fg/70 hover:bg-soft hover:text-fg"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-10 px-2 text-center text-sm font-bold text-fg">{qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => q + 1)}
          className="grid h-12 w-11 place-items-center rounded-r-full text-fg/70 hover:bg-soft hover:text-fg"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className={cn(
          'inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-800 px-6 text-sm font-semibold text-white transition hover:bg-brand-700',
          added && 'bg-emerald-600 hover:bg-emerald-600',
        )}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" /> Added to cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> Add {qty > 1 ? `${qty} ` : ''}to cart
          </>
        )}
      </button>
    </div>
  )
}
