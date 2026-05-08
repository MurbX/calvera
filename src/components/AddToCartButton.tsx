'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

type Props = {
  product: Omit<CartItem, 'quantity'>
  quantity?: number
  variant?: 'pill' | 'pill-icon' | 'block'
  label?: string
  className?: string
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = 'pill',
  label,
  className,
}: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  if (variant === 'pill-icon') {
    return (
      <button
        type="button"
        aria-label="Add to cart"
        onClick={onClick}
        className={cn(
          'grid h-9 w-9 place-items-center rounded-full bg-brand-800 text-white transition hover:bg-brand-700',
          added && 'bg-emerald-600 hover:bg-emerald-600',
          className,
        )}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    )
  }

  const baseClasses =
    variant === 'block'
      ? 'inline-flex items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700'
      : 'inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(baseClasses, added && 'bg-emerald-600 hover:bg-emerald-600', className)}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        label ?? 'Add to cart'
      )}
    </button>
  )
}
