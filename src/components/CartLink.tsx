'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function CartLink() {
  const { count, hydrated } = useCart()
  return (
    <Link
      href="/cart"
      className="relative flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium hover:text-brand-700"
      aria-label={`Cart (${hydrated ? count : 0} items)`}
    >
      <span className="relative">
        <ShoppingCart className="h-5 w-5" />
        {hydrated && count > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-800 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Cart</span>
    </Link>
  )
}
