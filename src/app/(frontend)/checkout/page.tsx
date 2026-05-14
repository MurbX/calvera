'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatKes } from '@/lib/utils'
import {
  DELIVERY_OPTIONS,
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  type DeliveryMethod,
} from '@/lib/checkout'

const FALLBACK_IMAGE = '/placeholder-product.svg'
const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994'

/** WhatsApp glyph — lucide dropped its brand icons, so we inline it. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.41 1.95.957 2.78 1.04 1.59 2.18 2.84 3.79 3.834.69.43 2.005 1.348 2.81 1.348.317 0 .76-.215.96-.43.34-.358.62-.788.785-1.27.13-.376.13-.75.07-.9-.03-.07-.6-.36-.945-.5z" />
      <path d="M16 4C9.373 4 4 9.373 4 16c0 2.119.555 4.18 1.61 5.997L4 28l6.182-1.625A12 12 0 0 0 28 16c0-6.627-5.373-12-12-12zm0 22a9.95 9.95 0 0 1-5.07-1.382l-.363-.215-3.766.99 1.005-3.673-.236-.378A9.96 9.96 0 0 1 6 16c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
    </svg>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, count, hydrated, clear } = useCart()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [county, setCounty] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [notes, setNotes] = useState('')
  const [delivery, setDelivery] = useState<DeliveryMethod>('same_day_nairobi')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grandTotal = total

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    if (delivery !== 'pickup_nairobi' && !line1.trim()) {
      setError('Please enter your delivery address.')
      return
    }
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
          shippingAddress: {
            line1: line1.trim() || 'Pickup at office',
            line2: line2.trim() || undefined,
            city: city.trim(),
            county: county.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            notes: notes.trim() || undefined,
          },
          deliveryMethod: delivery,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            unitPrice: i.price,
            quantity: i.quantity,
          })),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Order failed (HTTP ${res.status})`)
      }
      const data = (await res.json()) as { orderNumber: string }

      // Build the pre-filled WhatsApp message while we still have the cart.
      const message = buildWhatsAppOrderMessage({
        orderNumber: data.orderNumber,
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
        items: items.map((i) => ({
          name: i.name,
          slug: i.slug,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        deliveryMethod: delivery,
        address:
          delivery === 'pickup_nairobi'
            ? null
            : {
                line1: line1.trim(),
                line2: line2.trim() || undefined,
                city: city.trim(),
                county: county.trim() || undefined,
                postalCode: postalCode.trim() || undefined,
                notes: notes.trim() || undefined,
              },
        subtotal: total,
        total: grandTotal,
        siteUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      const waUrl = buildWhatsAppUrl(BUSINESS_PHONE, message)

      clear()
      // Best-effort instant open; the success page has a reliable button too.
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`)
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-350 px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-fg">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Add products before you can check out.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/cart" className="hover:text-brand-700">Cart</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Checkout</span>
      </nav>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-fg md:text-4xl">Checkout</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Tell us what you need and we&apos;ll take it from there on WhatsApp — that&apos;s where we
        confirm availability, payment and delivery.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Your details" step={1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input" placeholder="Brian Mutuku" />
              </Field>
              <Field label="Phone (WhatsApp)" required hint="We'll confirm your order on WhatsApp">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input" placeholder="Your WhatsApp number" />
              </Field>
              <Field label="Email" hint="Optional">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
              </Field>
            </div>
          </Section>

          <Section title="Delivery method" step={2}>
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    delivery === o.id ? 'border-brand-800 bg-brand-50' : 'border-border bg-white hover:border-fg/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={o.id}
                    checked={delivery === o.id}
                    onChange={() => setDelivery(o.id)}
                    className="mt-1 accent-brand-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-fg">{o.label}</span>
                      <span className="text-sm font-extrabold text-fg">
                        {o.feeLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{o.hint}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                      {o.eta}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {delivery !== 'pickup_nairobi' && (
            <Section title="Delivery address" step={3}>
              <div className="grid gap-4">
                <Field label="Address line 1" required>
                  <input value={line1} onChange={(e) => setLine1(e.target.value)} required className="input" placeholder="Apartment, building, street" />
                </Field>
                <Field label="Address line 2 (optional)">
                  <input value={line2} onChange={(e) => setLine2(e.target.value)} className="input" placeholder="Estate, gate code, landmarks" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Town / City" required>
                    <input value={city} onChange={(e) => setCity(e.target.value)} required className="input" placeholder="Your town or city" />
                  </Field>
                  <Field label="County / Region">
                    <input value={county} onChange={(e) => setCounty(e.target.value)} className="input" placeholder="Your county or region" />
                  </Field>
                  <Field label="Postal code">
                    <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="input" placeholder="00100" />
                  </Field>
                </div>
                <Field label="Delivery notes" hint="Pin location, gate access, contact for delivery">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input" placeholder="Anything we should know" />
                </Field>
              </div>
            </Section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold text-fg">Your order</h2>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={String(i.productId)} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0">
                    <div className="h-full w-full overflow-hidden rounded-lg bg-soft">
                      <Image
                        src={i.imageUrl || FALLBACK_IMAGE}
                        alt={i.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <span className="absolute -right-1 -top-1 z-10 grid h-5 min-w-5 place-items-center rounded-full bg-brand-800 px-1 text-[10px] font-bold text-white">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold text-fg">{i.name}</div>
                    <div className="text-xs text-muted">{formatKes(i.price)} × {i.quantity}</div>
                  </div>
                  <div className="shrink-0 text-sm font-bold text-fg">
                    {formatKes(i.price * i.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row label={`Subtotal (${count})`} value={formatKes(total)} />
              <Row label="Delivery" value="Confirmed on WhatsApp" />
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-fg">Total (excl. delivery)</span>
              <span className="text-2xl font-extrabold text-brand-800">{formatKes(grandTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1ebe5a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {submitting ? 'Placing order…' : 'Send order on WhatsApp'}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted">
              No payment now — we confirm everything with you on WhatsApp.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
            )}
          </div>
        </aside>

        <style jsx>{`
          .input {
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid var(--color-border);
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            background: white;
          }
          .input:focus { border-color: var(--color-fg); }
        `}</style>
      </form>
    </div>
  )
}

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
          {step}
        </span>
        <h2 className="text-lg font-bold text-fg">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
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

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-fg">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  )
}
