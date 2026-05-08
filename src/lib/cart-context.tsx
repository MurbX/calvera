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

export type CartItem = {
  productId: number | string
  slug: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  total: number
  count: number
  hydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: CartItem['productId'], quantity: number) => void
  removeItem: (productId: CartItem['productId']) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'calvera-cart-v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
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

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId)
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i,
          )
        }
        return [...prev, { ...item, quantity }]
      })
    },
    [],
  )

  const updateQuantity = useCallback(
    (productId: CartItem['productId'], quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) return prev.filter((i) => i.productId !== productId)
        return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      })
    },
    [],
  )

  const removeItem = useCallback((productId: CartItem['productId']) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
    // Badge counts unique line items, not quantity sums.
    const count = items.length
    return {
      items,
      total,
      count,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }
  }, [items, hydrated, addItem, updateQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
