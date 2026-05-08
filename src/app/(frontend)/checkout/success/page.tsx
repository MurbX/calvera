import Link from 'next/link'
import { CheckCircle2, Package, Truck } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { formatKes } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ order?: string; phone?: string }>
}

const DELIVERY_LABEL: Record<string, string> = {
  same_day_nairobi: 'Same-day Nairobi delivery',
  standard_countrywide: 'Standard countrywide delivery',
  pickup_nairobi: 'Pickup at our Nairobi office',
}

const PAYMENT_LABEL: Record<string, string> = {
  mpesa_on_delivery: 'M-Pesa on delivery',
  cash_on_delivery: 'Cash on delivery',
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order, phone } = await searchParams
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No order to display</h1>
        <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-brand-800 hover:text-brand-700">
          Back to home
        </Link>
      </div>
    )
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: order } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const orderDoc = result.docs[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-brand-50 p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-700" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-fg md:text-4xl">
          Order placed!
        </h1>
        <p className="mt-2 text-sm text-fg/70 md:text-base">
          Thanks — we'll prepare your order and reach out at {phone || 'your phone number'} to
          confirm delivery. You'll pay when it arrives.
        </p>
        <p className="mt-4 inline-flex rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
          Order #{order}
        </p>
      </div>

      {orderDoc && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Truck className="h-4 w-4 text-brand-700" /> Delivery
            </div>
            <p className="mt-2 text-sm text-fg/80">
              {DELIVERY_LABEL[orderDoc.deliveryMethod as string] ?? orderDoc.deliveryMethod}
            </p>
            {orderDoc.shippingAddress?.line1 && (
              <p className="mt-1 text-xs text-muted">
                {orderDoc.shippingAddress.line1}
                {orderDoc.shippingAddress.city ? `, ${orderDoc.shippingAddress.city}` : ''}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Package className="h-4 w-4 text-brand-700" /> Payment
            </div>
            <p className="mt-2 text-sm text-fg/80">
              {PAYMENT_LABEL[orderDoc.paymentMethod] ?? orderDoc.paymentMethod}
            </p>
            <p className="mt-1 text-xs text-muted">
              Total: <span className="font-semibold text-fg">{formatKes(orderDoc.total)}</span>
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/account?order=${encodeURIComponent(order)}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Track this order
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-fg hover:border-fg/30"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
