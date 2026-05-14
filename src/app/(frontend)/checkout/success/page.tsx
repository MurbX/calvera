import Link from 'next/link'
import { CheckCircle2, Truck } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { formatKes } from '@/lib/utils'
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  deliveryLabel,
  type DeliveryMethod,
} from '@/lib/checkout'

export const dynamic = 'force-dynamic'

const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994'

type Props = {
  searchParams: Promise<{ order?: string; phone?: string }>
}

type OrderItem = { name: string; unitPrice: number; quantity: number; lineTotal: number }

/** WhatsApp glyph — lucide dropped its brand icons, so we inline it. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.41 1.95.957 2.78 1.04 1.59 2.18 2.84 3.79 3.834.69.43 2.005 1.348 2.81 1.348.317 0 .76-.215.96-.43.34-.358.62-.788.785-1.27.13-.376.13-.75.07-.9-.03-.07-.6-.36-.945-.5z" />
      <path d="M16 4C9.373 4 4 9.373 4 16c0 2.119.555 4.18 1.61 5.997L4 28l6.182-1.625A12 12 0 0 0 28 16c0-6.627-5.373-12-12-12zm0 22a9.95 9.95 0 0 1-5.07-1.382l-.363-.215-3.766.99 1.005-3.673-.236-.378A9.96 9.96 0 0 1 6 16c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
    </svg>
  )
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams
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
  const orderDoc = result.docs[0] as unknown as
    | {
        orderNumber: string
        deliveryMethod: string
        subtotal: number
        total: number
        items?: OrderItem[]
        customer?: { name?: string; phone?: string; email?: string | null }
        shippingAddress?: {
          line1?: string | null
          line2?: string | null
          city?: string | null
          county?: string | null
          postalCode?: string | null
          notes?: string | null
        }
      }
    | undefined

  // Rebuild the WhatsApp message from the saved order so the button always
  // works, even if the checkout-time pop-up was blocked.
  const waUrl = orderDoc
    ? buildWhatsAppUrl(
        BUSINESS_PHONE,
        buildWhatsAppOrderMessage({
          orderNumber: orderDoc.orderNumber,
          customer: {
            name: orderDoc.customer?.name ?? 'Customer',
            phone: orderDoc.customer?.phone ?? '',
            email: orderDoc.customer?.email ?? undefined,
          },
          items: (orderDoc.items ?? []).map((it) => ({
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
          deliveryMethod: orderDoc.deliveryMethod as DeliveryMethod,
          address:
            orderDoc.deliveryMethod === 'pickup_nairobi'
              ? null
              : orderDoc.shippingAddress ?? null,
          subtotal: orderDoc.subtotal,
          total: orderDoc.total,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        }),
      )
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl bg-brand-50 p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-700" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-fg md:text-4xl">
          Almost done — one last step
        </h1>
        <p className="mt-2 text-sm text-fg/70 md:text-base">
          We&apos;ve saved your order. Tap below to send it to us on WhatsApp — that&apos;s where
          we confirm availability, payment and delivery.
        </p>
        <p className="mt-4 inline-flex rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800">
          Order #{order}
        </p>
      </div>

      {/* Primary action — send the order on WhatsApp */}
      {waUrl && (
        <div className="mt-6 text-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5a]"
          >
            <WhatsAppIcon className="h-6 w-6" />
            Send my order on WhatsApp
          </a>
          <p className="mt-2 text-xs text-muted">
            Opens WhatsApp with your order details ready to send.
          </p>
        </div>
      )}

      {orderDoc && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-sm font-bold text-fg">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {(orderDoc.items ?? []).map((it, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-fg/80">
                    {it.quantity} × {it.name}
                  </span>
                  <span className="shrink-0 font-semibold text-fg">
                    {formatKes(it.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-fg/70">Subtotal</dt>
                <dd className="font-semibold text-fg">{formatKes(orderDoc.subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-fg/70">Delivery</dt>
                <dd className="font-semibold text-fg">Confirmed on WhatsApp</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <dt className="font-semibold text-fg">Total (excl. delivery)</dt>
                <dd className="text-lg font-extrabold text-brand-800">
                  {formatKes(orderDoc.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Truck className="h-4 w-4 text-brand-700" /> Delivery
            </div>
            <p className="mt-2 text-sm text-fg/80">
              {deliveryLabel(orderDoc.deliveryMethod as DeliveryMethod)}
            </p>
            {orderDoc.shippingAddress?.line1 &&
              orderDoc.deliveryMethod !== 'pickup_nairobi' && (
                <p className="mt-1 text-xs text-muted">
                  {orderDoc.shippingAddress.line1}
                  {orderDoc.shippingAddress.city
                    ? `, ${orderDoc.shippingAddress.city}`
                    : ''}
                </p>
              )}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/account?order=${encodeURIComponent(order)}${
            orderDoc?.customer?.phone
              ? `&phone=${encodeURIComponent(orderDoc.customer.phone)}`
              : ''
          }`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-fg hover:border-fg/30"
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
