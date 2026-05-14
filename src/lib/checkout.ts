import { formatKes } from '@/lib/utils'

export type DeliveryMethod = 'same_day_nairobi' | 'standard_countrywide' | 'pickup_nairobi'

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod
  label: string
  hint: string
  feeLabel: string
  eta: string
}[] = [
  {
    id: 'same_day_nairobi',
    label: 'Same-day local delivery',
    hint: 'Order before 1pm — we deliver today within the metro area.',
    feeLabel: 'Varies by location',
    eta: 'Today',
  },
  {
    id: 'standard_countrywide',
    label: 'Standard courier delivery',
    hint: 'Tracked courier delivery to your address.',
    feeLabel: 'Varies by location',
    eta: '1–3 working days',
  },
  {
    id: 'pickup_nairobi',
    label: 'Pickup at our office',
    hint: 'Pick up free of charge during business hours.',
    feeLabel: 'Free',
    eta: 'Ready in 2 hours',
  },
]

export function deliveryLabel(method: DeliveryMethod): string {
  return DELIVERY_OPTIONS.find((o) => o.id === method)?.label ?? method
}

// ---------------------------------------------------------------------------
// WhatsApp order hand-off
//
// Orders are placed by sending a pre-filled message to the business WhatsApp
// (click-to-chat / wa.me — no WhatsApp Business API needed). Payment and
// delivery are then arranged directly on WhatsApp. The order is still saved
// to the database so there's a record in the admin.
// ---------------------------------------------------------------------------

export type WhatsAppOrderItem = {
  name: string
  slug?: string | null
  quantity: number
  unitPrice: number
}

export type WhatsAppOrderInput = {
  orderNumber: string
  customer: { name: string; phone: string; email?: string | null }
  items: WhatsAppOrderItem[]
  deliveryMethod: DeliveryMethod
  address?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    county?: string | null
    postalCode?: string | null
    notes?: string | null
  } | null
  subtotal: number
  total: number
  /** Absolute site URL, used to add product links — e.g. https://calvera.tech */
  siteUrl?: string | null
}

/** Strip a phone number down to digits for a wa.me link. */
export function normalizeWhatsAppPhone(raw: string): string {
  return raw.replace(/\D/g, '')
}

/** Build a wa.me click-to-chat URL with the message pre-filled. */
export function buildWhatsAppUrl(businessPhone: string, message: string): string {
  return `https://wa.me/${normalizeWhatsAppPhone(businessPhone)}?text=${encodeURIComponent(message)}`
}

/**
 * Format an order into a tidy, readable WhatsApp message. WhatsApp renders
 * `*bold*` and treats blank lines as spacing — keep the structure simple so
 * it looks good in the chat.
 */
export function buildWhatsAppOrderMessage(o: WhatsAppOrderInput): string {
  const site = o.siteUrl ? o.siteUrl.replace(/\/$/, '') : null
  const lines: string[] = []

  lines.push('*NEW ORDER -- Calvera Tech Solutions*')
  lines.push(`Order #${o.orderNumber}`)
  lines.push('')

  lines.push('*Customer*')
  lines.push(o.customer.name)
  lines.push(`Phone: ${o.customer.phone}`)
  if (o.customer.email) lines.push(`Email: ${o.customer.email}`)
  lines.push('')

  lines.push(`*Items (${o.items.length})*`)
  o.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`)
    lines.push(
      `   ${it.quantity} x ${formatKes(it.unitPrice)} = ${formatKes(it.unitPrice * it.quantity)}`,
    )
    if (it.slug && site) lines.push(`   ${site}/products/${it.slug}`)
  })
  lines.push('')

  lines.push('*Summary*')
  lines.push(`Subtotal: ${formatKes(o.subtotal)}`)
  lines.push(`Delivery (${deliveryLabel(o.deliveryMethod)}): To be confirmed`)
  lines.push(`*Total (excl. delivery): ${formatKes(o.total)}*`)
  lines.push('')

  lines.push('*Delivery*')
  lines.push(deliveryLabel(o.deliveryMethod))
  if (o.deliveryMethod !== 'pickup_nairobi' && o.address) {
    const a = o.address
    if (a.line1) lines.push(a.line1)
    if (a.line2) lines.push(a.line2)
    const cityLine = [a.city, a.county, a.postalCode].filter(Boolean).join(', ')
    if (cityLine) lines.push(cityLine)
    if (a.notes) lines.push(`Note: ${a.notes}`)
  }
  lines.push('')

  lines.push(
    'Please confirm availability, delivery fee and share payment details so we can complete this order. Thank you!',
  )

  return lines.join('\n')
}
