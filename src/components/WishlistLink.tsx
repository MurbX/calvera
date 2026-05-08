'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'

export function WishlistLink() {
  const { count, hydrated } = useWishlist()
  return (
    <Link
      href="/wishlist"
      className="relative flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium hover:text-brand-700"
      aria-label={`Wishlist (${hydrated ? count : 0} items)`}
    >
      <span className="relative">
        <Heart className="h-5 w-5" />
        {hydrated && count > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Wishlist</span>
    </Link>
  )
}
