import type { CollectionAfterChangeHook } from 'payload'

type OrderItem = {
  product?: number | string | { id: number | string } | null
  quantity?: number
}

type OrderShape = {
  id: number | string
  status: string
  items?: OrderItem[]
}

const RELEASE_STATES = new Set(['cancelled', 'refunded'])

function productId(item: OrderItem): number | string | null {
  if (item.product == null) return null
  if (typeof item.product === 'object') return item.product.id
  return item.product
}

/**
 * Adjust each product's `stock` by `delta * quantity` (delta is +1 to add
 * back, -1 to subtract on a new order). Skips products with `trackInventory`
 * turned off, and clamps the resulting stock at 0.
 */
async function adjustStock(
  payload: Parameters<CollectionAfterChangeHook>[0]['req']['payload'],
  items: OrderItem[],
  delta: -1 | 1,
) {
  for (const item of items) {
    const id = productId(item)
    const qty = Number(item.quantity ?? 0)
    if (id == null || !Number.isFinite(qty) || qty <= 0) continue

    try {
      const product = await payload.findByID({
        collection: 'products',
        id,
        depth: 0,
        overrideAccess: true,
      })
      const tracked = (product as { trackInventory?: boolean }).trackInventory
      if (tracked === false) continue

      const current = Number((product as { stock?: number }).stock ?? 0)
      const next = Math.max(0, current + delta * qty)
      if (next === current) continue

      await payload.update({
        collection: 'products',
        id,
        data: { stock: next },
        overrideAccess: true,
      })
    } catch (err) {
      // Don't block the order on a single product update failure — log it.
      console.error('[orders.adjustStock] failed for product', id, err)
    }
  }
}

/**
 * Order lifecycle inventory hook.
 *
 * - On CREATE: deduct stock for every line item (skipping items already in a
 *   release state, e.g. an admin manually creates a "cancelled" order).
 * - On UPDATE: only react to a status transition crossing the release line.
 *   Active → cancelled/refunded ⇒ add stock back. Cancelled/refunded →
 *   active again ⇒ deduct it again.
 *
 * Race conditions: Postgres has no row-level lock through Payload here, so
 * two concurrent orders for the same SKU can both read the same starting
 * stock. We clamp at 0 so we never go negative — worst case is one customer
 * gets a "this is out of stock" experience after they ordered. That's
 * acceptable for cash-on-delivery; we'd reconcile with the customer.
 */
export const inventoryHook: CollectionAfterChangeHook<OrderShape> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const items = Array.isArray(doc.items) ? doc.items : []
  if (items.length === 0) return doc

  if (operation === 'create') {
    if (!RELEASE_STATES.has(doc.status)) {
      await adjustStock(req.payload, items, -1)
    }
    return doc
  }

  if (operation === 'update') {
    const prevReleased = previousDoc ? RELEASE_STATES.has(previousDoc.status) : false
    const nowReleased = RELEASE_STATES.has(doc.status)
    if (prevReleased === nowReleased) return doc

    if (!prevReleased && nowReleased) {
      // Active → cancelled/refunded: put stock back.
      await adjustStock(req.payload, items, +1)
    } else if (prevReleased && !nowReleased) {
      // Reopened: deduct again.
      await adjustStock(req.payload, items, -1)
    }
  }

  return doc
}
