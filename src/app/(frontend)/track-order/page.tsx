import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, Search } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { formatKes } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Track your order — Calvera Tech Solutions',
}

const DELIVERY_LABEL: Record<string, string> = {
  same_day_nairobi: 'Same-day local delivery',
  standard_countrywide: 'Standard courier delivery',
  pickup_nairobi: 'Pickup at our office',
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Pending payment', tone: 'bg-amber-100 text-amber-900' },
  paid: { label: 'Paid', tone: 'bg-emerald-100 text-emerald-900' },
  processing: { label: 'Processing', tone: 'bg-blue-100 text-blue-900' },
  shipped: { label: 'Shipped', tone: 'bg-indigo-100 text-indigo-900' },
  delivered: { label: 'Delivered', tone: 'bg-emerald-100 text-emerald-900' },
  cancelled: { label: 'Cancelled', tone: 'bg-rose-100 text-rose-900' },
  refunded: { label: 'Refunded', tone: 'bg-zinc-100 text-zinc-900' },
}

type Props = {
  searchParams: Promise<{ order?: string; phone?: string }>
}

export default async function AccountPage({ searchParams }: Props) {
  const { order, phone } = await searchParams
  type OrderDoc = {
    orderNumber: string
    status: string
    deliveryMethod: string
    paymentMethod: string
    total: number
    items: { name: string; quantity: number; lineTotal: number }[]
  }
  let orderDoc: OrderDoc | null = null
  let error: string | null = null

  if (order && phone) {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { orderNumber: { equals: order.trim() } },
          { 'customer.phone': { equals: phone.trim() } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const found = result.docs[0]
    if (found) orderDoc = found as unknown as OrderDoc
    else error = "We couldn't find an order matching that number and phone."
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Track order</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-fg md:text-4xl">
        Track your order
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter your order number and the phone number you used at checkout.
      </p>

      <form action="/account" method="GET" className="mt-6 grid gap-3 sm:grid-cols-[2fr_2fr_auto]">
        <input
          name="order"
          defaultValue={order ?? ''}
          placeholder="Order number (e.g. CTS-20260504-A1B2C)"
          className="rounded-full border border-border bg-white px-4 py-3 text-sm outline-none focus:border-fg/30"
        />
        <input
          name="phone"
          defaultValue={phone ?? ''}
          placeholder="Phone number used at checkout"
          className="rounded-full border border-border bg-white px-4 py-3 text-sm outline-none focus:border-fg/30"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Search className="h-4 w-4" /> Find order
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {orderDoc && (
        <div className="mt-8 rounded-2xl border border-border bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Order
              </p>
              <p className="mt-0.5 text-lg font-extrabold text-fg">{orderDoc.orderNumber}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_LABEL[orderDoc.status]?.tone ?? 'bg-soft text-fg'}`}
            >
              {STATUS_LABEL[orderDoc.status]?.label ?? orderDoc.status}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Delivery</p>
              <p className="mt-1 text-sm text-fg/80">
                {DELIVERY_LABEL[orderDoc.deliveryMethod as string] ?? orderDoc.deliveryMethod}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total</p>
              <p className="mt-1 text-sm font-bold text-fg">{formatKes(orderDoc.total)}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Items</p>
            <ul className="mt-3 space-y-2">
              {orderDoc.items.map((i, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-fg/80">
                    {i.name} <span className="text-muted">× {i.quantity}</span>
                  </span>
                  <span className="font-semibold text-fg">{formatKes(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
