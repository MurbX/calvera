import { DELIVERY_OPTIONS } from '@/lib/checkout'
import { formatKes } from '@/lib/utils'

/**
 * WhatsApp order hand-off.
 *
 * Orders are still saved to the database, but instead of an on-site payment
 * step the customer sends a pre-filled order summary to the business
 * WhatsApp number via a wa.me click-to-chat link. No WhatsApp Business API
 * is needed — the message lands in the normal WhatsApp app on the phone.
 */

/** Business WhatsApp number as wa.me-ready digits (no +, spaces or dashes). */
export function whatsappNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE ??
    process.env.NEXT_PUBLIC_BUSINESS_PHONE ??
    '+254723284994'
  return raw.replace(/\D/g, '')
}

export type WhatsAppOrderItem = {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type WhatsAppOrderAddress = {
  line1?: string | null
  line2?: string | null
  city?: string | null
  county?: string | null
  postalCode?: string | null
  notes?: string | null
}

export type WhatsAppOrder = {
  orderNumber: string
  customer: { name: string; phone: string; email?: string | null }
  items: WhatsAppOrderItem[]
  deliveryMethod: string
  shippingAddress?: WhatsAppOrderAddress | null
  subtotal: number
  total: number
}

function deliveryLabel(method: string): string {
  return DELIVERY_OPTIONS.find((o) => o.id === method)?.label ?? method
}

/**
 * Build the order message. Uses WhatsApp's lightweight markup (*bold*) and
 * emoji section headers so it lands as a clean, scannable order card.
 */
export function buildWhatsAppOrderMessage(o: WhatsAppOrder): string {
  const lines: string[] = []

  lines.push('🛒 *New Order — Calvera Tech Solutions*')
  lines.push(`Order #${o.orderNumber}`)
  lines.push('')

  lines.push('👤 *Customer*')
  lines.push(o.customer.name)
  lines.push(`📞 ${o.customer.phone}`)
  if (o.customer.email) lines.push(`✉️ ${o.customer.email}`)
  lines.push('')

  lines.push('📦 *Items*')
  for (const it of o.items) {
    lines.push(`• ${it.quantity} × ${it.name}`)
    lines.push(`   ${formatKes(it.unitPrice)} each — ${formatKes(it.lineTotal)}`)
  }
  lines.push('')

  lines.push('💰 *Summary*')
  lines.push(`Subtotal: ${formatKes(o.subtotal)}`)
  lines.push(`Delivery: To be confirmed`)
  lines.push(`*Total (excl. delivery): ${formatKes(o.total)}*`)
  lines.push('')

  lines.push('🚚 *Delivery*')
  lines.push(deliveryLabel(o.deliveryMethod))
  const a = o.shippingAddress
  if (a && o.deliveryMethod !== 'pickup_nairobi') {
    const addr = [a.line1, a.line2, a.city, a.county, a.postalCode]
      .map((p) => (p ?? '').trim())
      .filter(Boolean)
      .join(', ')
    if (addr) lines.push(addr)
  }
  if (a?.notes?.trim()) {
    lines.push('')
    lines.push('📝 *Notes*')
    lines.push(a.notes.trim())
  }

  lines.push('')
  lines.push('— Sent from the Calvera website. Please confirm availability and payment details.')

  return lines.join('\n')
}

/** Full wa.me URL with the order message pre-filled. */
export function whatsappOrderUrl(o: WhatsAppOrder): string {
  const text = encodeURIComponent(buildWhatsAppOrderMessage(o))
  return `https://wa.me/${whatsappNumber()}?text=${text}`
}
