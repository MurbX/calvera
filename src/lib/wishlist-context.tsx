'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type WishlistItem = {
  productId: number | string
  slug: string
  name: string
  price: number
  imageUrl: string | null
  categoryName: string | null
}

type WishlistContextValue = {
  items: WishlistItem[]
  count: number
  hydrated: boolean
  has: (productId: WishlistItem['productId']) => boolean
  toggle: (item: WishlistItem) => void
  add: (item: WishlistItem) => void
  remove: (productId: WishlistItem['productId']) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = 'calvera-wishlist-v1'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const has = useCallback(
    (productId: WishlistItem['productId']) => items.some((i) => i.productId === productId),
    [items],
  )

  const add = useCallback((item: WishlistItem) => {
    setItems((prev) => (prev.some((i) => i.productId === item.productId) ? prev : [...prev, item]))
  }, [])

  const remove = useCallback((productId: WishlistItem['productId']) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.productId === item.productId)
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item],
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, hydrated, has, toggle, add, remove, clear }),
    [items, hydrated, has, toggle, add, remove, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
