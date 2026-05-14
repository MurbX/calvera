import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  CreditCard,
  MapPin,
  MessageCircle,
  Package,
  Truck,
} from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { formatKes } from '@/lib/utils'
import { getCurrentCustomer } from '@/lib/auth'
import { AccountShell } from '@/components/account/AccountShell'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ orderNumber: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params
  return { title: `Order ${orderNumber} — Calvera Tech Solutions` }
}

const DELIVERY_LABEL: Record<string, string> = {
  same_day_nairobi: 'Same-day local delivery',
  standard_countrywide: 'Standard courier delivery',
  pickup_nairobi: 'Pickup at our office',
}

const PAYMENT_LABEL: Record<string, string> = {
  whatsapp: 'Arranged on WhatsApp',
  mpesa_on_delivery: 'Mobile money on delivery',
  cash_on_delivery: 'Cash on delivery',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-emerald-100 text-emerald-900',
  processing: 'bg-blue-100 text-blue-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-rose-100 text-rose-900',
  refunded: 'bg-zinc-100 text-zinc-900',
}

const TIMELINE_ORDER = ['pending', 'paid', 'processing', 'shipped', 'delivered'] as const

type OrderItem = {
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}
type OrderDoc = {
  id: number | string
  orderNumber: string
  status: string
  paymentMethod: string
  paymentRef?: string | null
  deliveryMethod: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  createdAt: string
  customer: {
    name: string
    email?: string | null
    phone: string
  }
  shippingAddress?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    county?: string | null
    postalCode?: string | null
    notes?: string | null
  } | null
}

export default async function CustomerOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params
  const customer = await getCurrentCustomer()
  if (!customer) {
    redirect(`/account/login?next=/account/orders/${encodeURIComponent(orderNumber)}`)
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { orderNumber: { equals: orderNumber } },
        { 'customer.email': { equals: customer.email } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const order = result.docs[0] as unknown as OrderDoc | undefined
  if (!order) notFound()

  const businessPhone = (process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994').replace(
    /\s|\+/g,
    '',
  )
  const supportMessage = `Hi Calvera, I have a question about order ${order.orderNumber}.`
  const cancelled = order.status === 'cancelled' || order.status === 'refunded'
  const statusIndex = TIMELINE_ORDER.indexOf(
    order.status as (typeof TIMELINE_ORDER)[number],
  )

  return (
    <AccountShell firstName={customer.firstName ?? null} email={customer.email}>
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/account" className="hover:text-brand-700">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/account/orders" className="hover:text-brand-700">Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">{order.orderNumber}</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Order</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-fg md:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Placed {new Date(order.createdAt).toLocaleDateString('en-KE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
            STATUS_COLOR[order.status] ?? 'bg-soft text-fg'
          }`}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {!cancelled && (
        <div className="mt-6 rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Status</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-5">
            {TIMELINE_ORDER.map((s, i) => {
              const reached = statusIndex >= 0 && i <= statusIndex
              return (
                <li key={s} className="flex items-start gap-2">
                  {reached ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-fg/20" />
                  )}
                  <span
                    className={`text-xs ${reached ? 'font-semibold text-fg' : 'text-muted'}`}
                  >
                    {STATUS_LABEL[s]}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Truck className="h-4 w-4 text-brand-700" /> Delivery
          </div>
          <p className="mt-2 text-sm text-fg/85">
            {DELIVERY_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
          </p>
          {order.shippingAddress?.line1 && (
            <div className="mt-3 flex items-start gap-2 text-xs text-muted">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {[order.shippingAddress.city, order.shippingAddress.county]
                    .filter(Boolean)
                    .join(', ')}
                  {order.shippingAddress.postalCode
                    ? ` · ${order.shippingAddress.postalCode}`
                    : ''}
                </p>
                {order.shippingAddress.notes && (
                  <p className="mt-1 italic">"{order.shippingAddress.notes}"</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-fg">
            <CreditCard className="h-4 w-4 text-brand-700" /> Payment
          </div>
          <p className="mt-2 text-sm text-fg/85">
            {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
          </p>
          {order.paymentRef && (
            <p className="mt-1 text-xs text-muted">Reference: {order.paymentRef}</p>
          )}
          <p className="mt-3 text-xs uppercase tracking-wider text-muted">Total</p>
          <p className="text-2xl font-extrabold text-brand-800">{formatKes(order.total)}</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold text-fg">Items in this order</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white">
          <ul className="divide-y divide-border">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-semibold text-fg">{item.name}</p>
                  <p className="text-xs text-muted">
                    {formatKes(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-fg">{formatKes(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 border-t border-border bg-soft/50 px-4 py-4 text-sm">
            <Row label="Subtotal" value={formatKes(order.subtotal)} />
            <Row label="Delivery" value="Confirmed on WhatsApp" />
            {order.tax > 0 && <Row label="Tax" value={formatKes(order.tax)} />}
            <div className="flex items-baseline justify-between border-t border-border pt-2">
              <dt className="text-sm font-bold text-fg">Total</dt>
              <dd className="text-lg font-extrabold text-brand-800">
                {formatKes(order.total)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Package className="h-4 w-4" /> Reorder items
        </Link>
        <a
          href={`https://wa.me/${businessPhone}?text=${encodeURIComponent(supportMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-fg hover:border-[#25D366] hover:text-[#25D366]"
        >
          <MessageCircle className="h-4 w-4" /> Message support
        </a>
      </section>
    </AccountShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-fg/80">{label}</dt>
      <dd className="font-semibold text-fg">{value}</dd>
    </div>
  )
}
