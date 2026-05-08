'use client'

import { Heart } from 'lucide-react'
import { useWishlist, type WishlistItem } from '@/lib/wishlist-context'
import { cn } from '@/lib/utils'

type Props = {
  item: WishlistItem
  className?: string
}

export function WishlistButton({ item, className }: Props) {
  const { has, toggle, hydrated } = useWishlist()
  const saved = hydrated && has(item.productId)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(item)
  }

  return (
    <button
      type="button"
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      onClick={onClick}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm transition',
        saved ? 'text-rose-500 hover:text-rose-600' : 'text-fg/55 hover:text-rose-500',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
    </button>
  )
}
