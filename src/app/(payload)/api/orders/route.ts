import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type DeliveryMethod } from '@/lib/checkout'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Item = {
  productId: number | string
  name: string
  unitPrice: number
  quantity: number
}

type Body = {
  customer: { name: string; phone: string; email?: string }
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    county?: string
    postalCode?: string
    notes?: string
  }
  deliveryMethod: DeliveryMethod
  items: Item[]
}

const VALID_DELIVERY: DeliveryMethod[] = [
  'same_day_nairobi',
  'standard_countrywide',
  'pickup_nairobi',
]

function generateOrderNumber() {
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `CTS-${yyyymmdd}-${rand}`
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.customer?.name?.trim() || !body.customer?.phone?.trim()) {
    return NextResponse.json(
      { error: 'Customer name and phone are required' },
      { status: 400 },
    )
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }
  if (!VALID_DELIVERY.includes(body.deliveryMethod)) {
    return NextResponse.json({ error: 'Invalid delivery method' }, { status: 400 })
  }
  if (body.deliveryMethod !== 'pickup_nairobi' && !body.shippingAddress?.line1?.trim()) {
    return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
  }

  const items = body.items
    .filter((i) => i.name?.trim() && Number(i.unitPrice) > 0 && Number(i.quantity) > 0)
    .map((i) => ({
      product: i.productId as number,
      name: i.name.trim(),
      unitPrice: Number(i.unitPrice),
      quantity: Number(i.quantity),
      lineTotal: Number(i.unitPrice) * Number(i.quantity),
    }))

  if (items.length === 0) {
    return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 })
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  const shipping = 0 // Delivery fee confirmed on WhatsApp — varies by location
  const total = subtotal
  const orderNumber = generateOrderNumber()

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        status: 'pending',
        // Orders are placed via WhatsApp — payment is arranged there.
        paymentMethod: 'whatsapp',
        deliveryMethod: body.deliveryMethod,
        items,
        subtotal,
        shipping,
        tax: 0,
        total,
        customer: {
          name: body.customer.name.trim(),
          phone: body.customer.phone.trim(),
          email: body.customer.email?.trim() || undefined,
        },
        shippingAddress: {
          line1: body.shippingAddress?.line1?.trim() || 'Pickup at office',
          line2: body.shippingAddress?.line2?.trim() || undefined,
          city: body.shippingAddress?.city?.trim() || 'Pickup',
          county: body.shippingAddress?.county?.trim() || undefined,
          postalCode: body.shippingAddress?.postalCode?.trim() || undefined,
          notes: body.shippingAddress?.notes?.trim() || undefined,
        },
      },
      overrideAccess: true,
    })

    return NextResponse.json({ orderNumber, total })
  } catch (err) {
    console.error('[/api/orders]', err)
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 },
    )
  }
}
