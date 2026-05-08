import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { formatKes } from '@/lib/utils'
import { getCurrentCustomer } from '@/lib/auth'
import { AccountShell } from '@/components/account/AccountShell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your account — Calvera Tech Solutions',
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

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

type RecentOrder = {
  id: number | string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  itemCount: number
}

async function getRecentOrders(email: string): Promise<RecentOrder[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'orders',
    where: { 'customer.email': { equals: email } },
    sort: '-createdAt',
    limit: 3,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs.map((d) => {
    const doc = d as unknown as {
      id: number | string
      orderNumber: string
      status: string
      total: number
      createdAt: string
      items?: unknown[]
    }
    return {
      id: doc.id,
      orderNumber: doc.orderNumber,
      status: doc.status,
      total: doc.total,
      createdAt: doc.createdAt,
      itemCount: Array.isArray(doc.items) ? doc.items.length : 0,
    }
  })
}

export default async function AccountDashboardPage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect('/account/login?next=/account')

  const recent = await getRecentOrders(customer.email)
  const greeting = (customer.firstName?.trim() || customer.email.split('@')[0]).split(' ')[0]
  const businessPhone = (process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994')
    .replace(/\s|\+/g, '')

  return (
    <AccountShell firstName={customer.firstName ?? null} email={customer.email}>
      <section className="rounded-3xl bg-brand-50 p-6 md:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          Hi {greeting}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
          Welcome back to your Calvera account
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg/75">
          Pick up where you left off — track an order, manage your delivery addresses,
          or browse new solar products.
        </p>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-fg">Recent orders</h2>
            <p className="mt-1 text-sm text-muted">Your last 3 orders.</p>
          </div>
          <Link
            href="/account/orders"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-800 hover:text-brand-700 sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-soft p-8 text-center">
            <ShoppingBag className="mx-auto h-9 w-9 text-fg/30" />
            <p className="mt-3 text-base font-bold text-fg">No orders yet</p>
            <p className="mt-1 text-sm text-muted">
              When you place an order, it&apos;ll show up here for tracking.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Shop solar
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((o) => (
              <li
                key={String(o.id)}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Order
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-fg">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[o.status] ?? 'bg-soft text-fg'}`}
                >
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-extrabold text-fg">{formatKes(o.total)}</p>
                </div>
                <Link
                  href={`/account/orders/${o.orderNumber}`}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-fg hover:border-brand-700 hover:text-brand-700"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-fg">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ActionCard
            href="/account/orders"
            Icon={Package}
            title="Your orders"
            description="View status, reorder items and download invoices."
          />
          <ActionCard
            href="/account/addresses"
            Icon={MapPin}
            title="Saved addresses"
            description="Add or edit delivery addresses for faster checkout."
          />
          <ActionCard
            href="/account/details"
            Icon={User}
            title="Profile"
            description="Update your name, phone and password."
          />
          <ActionCard
            href="/wishlist"
            Icon={Heart}
            title="Wishlist"
            description="Items you&apos;ve saved for later."
          />
          <ActionCard
            href="/track-order"
            Icon={Truck}
            title="Track an order"
            description="Track a guest order using its order number and phone."
          />
          <ActionCard
            href={`https://wa.me/${businessPhone}`}
            external
            Icon={MessageCircle}
            title="WhatsApp support"
            description="Talk to a Calvera solar expert — replies in minutes."
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-white p-5 text-sm text-fg/80">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
          <p>
            Order updates and receipts are sent to{' '}
            <span className="font-semibold text-fg">{customer.email}</span>. Need to change
            it?{' '}
            <Link href="/account/details" className="font-semibold text-brand-800 hover:text-brand-700">
              Update your profile
            </Link>
            .
          </p>
        </div>
      </section>
    </AccountShell>
  )
}

function ActionCard({
  href,
  Icon,
  title,
  description,
  external = false,
}: {
  href: string
  Icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  external?: boolean
}) {
  const inner = (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-fg/20 hover:shadow-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-fg">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-fg/40" />
    </div>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }
  return <Link href={href}>{inner}</Link>
}
