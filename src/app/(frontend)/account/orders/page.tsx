import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Package, ShoppingBag } from 'lucide-react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { formatKes } from '@/lib/utils'
import { getCurrentCustomer } from '@/lib/auth'
import { AccountShell } from '@/components/account/AccountShell'
import { Pagination } from '@/components/Pagination'
import { readNumber, readString } from '@/lib/searchparams'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your orders — Calvera Tech Solutions',
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Awaiting payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-emerald-100 text-emerald-900',
  processing: 'bg-blue-100 text-blue-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-rose-100 text-rose-900',
  refunded: 'bg-zinc-100 text-zinc-900',
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

const VALID_STATUSES = new Set(STATUS_FILTERS.map((s) => s.value))

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CustomerOrdersPage({ searchParams }: Props) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect('/account/login?next=/account/orders')

  const sp = await searchParams
  const page = readNumber(sp.page, 1) ?? 1
  const pageSize = 12
  const statusRaw = readString(sp.status) ?? 'all'
  const status = VALID_STATUSES.has(statusRaw) ? statusRaw : 'all'

  const where: Where[] = [{ 'customer.email': { equals: customer.email } }]
  if (status !== 'all') where.push({ status: { equals: status } })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'orders',
    where: { and: where },
    sort: '-createdAt',
    page,
    limit: pageSize,
    depth: 0,
    overrideAccess: true,
  })

  type OrderDoc = {
    id: number | string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    items?: unknown[]
    paymentMethod?: string
  }
  const orders = result.docs as unknown as OrderDoc[]

  return (
    <AccountShell firstName={customer.firstName ?? null} email={customer.email}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">Your orders</h1>
          <p className="mt-1 text-sm text-muted">
            {result.totalDocs} {result.totalDocs === 1 ? 'order' : 'orders'}
            {status !== 'all' ? ` · ${STATUS_LABEL[status] ?? status}` : ' total'}
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1 text-sm font-semibold text-brand-800 hover:text-brand-700 sm:inline-flex"
        >
          Shop solar <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = f.value === status
          const href =
            f.value === 'all'
              ? '/account/orders'
              : `/account/orders?status=${encodeURIComponent(f.value)}`
          return (
            <Link
              key={f.value}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-brand-800 text-white'
                  : 'border border-border bg-white text-fg/80 hover:border-fg/30 hover:text-fg'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-soft p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-fg/30" />
          <p className="mt-4 text-base font-bold text-fg">
            {status === 'all' ? 'No orders yet' : `No ${STATUS_LABEL[status]?.toLowerCase()} orders`}
          </p>
          <p className="mt-1 text-sm text-muted">
            {status === 'all'
              ? "When you place an order, it'll show up here for tracking."
              : 'Try a different filter, or browse our solar gear.'}
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Shop solar
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="hidden border-b border-border bg-soft text-xs uppercase tracking-wider text-muted md:table-header-group">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={String(o.id)} className="border-t border-border first:border-t-0">
                    <td className="px-4 py-4">
                      <p className="font-bold text-fg">{o.orderNumber}</p>
                      <p className="text-xs text-muted md:hidden">
                        {new Date(o.createdAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted">
                        {Array.isArray(o.items) ? o.items.length : 0}{' '}
                        {(Array.isArray(o.items) ? o.items.length : 0) === 1 ? 'item' : 'items'}
                      </p>
                    </td>
                    <td className="hidden px-4 py-4 text-fg/80 md:table-cell">
                      {new Date(o.createdAt).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          STATUS_COLOR[o.status] ?? 'bg-soft text-fg'
                        }`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-extrabold text-fg">
                      {formatKes(o.total)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/account/orders/${o.orderNumber}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-fg hover:border-brand-700 hover:text-brand-700"
                      >
                        <Package className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <Pagination
              current={result.page ?? 1}
              total={result.totalPages}
              basePath="/account/orders"
              searchParams={sp}
            />
          </div>
        </>
      )}
    </AccountShell>
  )
}
