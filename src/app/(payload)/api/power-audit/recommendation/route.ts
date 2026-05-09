import { NextResponse } from 'next/server'
import { computeRecommendation, type ApplianceInput } from '@/lib/calculator'
import { buildBom } from '@/lib/sizing-products'
import { priceBreakdown } from '@/lib/quotation-pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = { appliances: ApplianceInput[] }

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const cleaned = (body.appliances ?? [])
    .filter((a) => a.name?.trim() && a.wattage > 0 && a.quantity > 0)
    .map((a) => ({
      name: a.name.trim(),
      wattage: Number(a.wattage),
      quantity: Number(a.quantity),
      hoursPerDay: Number(a.hoursPerDay),
    }))

  if (cleaned.length === 0) {
    return NextResponse.json({ error: 'At least one appliance is required.' }, { status: 400 })
  }

  const recommendation = computeRecommendation(cleaned)
  const bom = await buildBom(recommendation)

  // Slim the BoM to the shape the UI consumes (avoid sending whole product docs).
  const trim = (
    p: { product: { id: number | string; name: string; slug: string; price: number; imageUrl?: string | null; shortDescription?: string | null }; quantity: number },
    extras?: Record<string, unknown>,
  ) => ({
    productId: p.product.id,
    name: p.product.name,
    slug: p.product.slug,
    unitPriceKes: p.product.price,
    imageUrl: p.product.imageUrl ?? null,
    shortDescription: p.product.shortDescription ?? null,
    quantity: p.quantity,
    ...extras,
  })

  const trimmedPanel = bom.panel ? trim(bom.panel, { totalWatts: bom.panel.totalWatts }) : null
  const trimmedInverter = bom.inverter ? trim(bom.inverter) : null
  const trimmedBattery = bom.battery ? trim(bom.battery, { totalWh: bom.battery.totalWh }) : null

  const pricing = priceBreakdown({
    panel: trimmedPanel
      ? { name: trimmedPanel.name, quantity: trimmedPanel.quantity, unitPriceKes: trimmedPanel.unitPriceKes, totalWatts: bom.panel?.totalWatts }
      : null,
    inverter: trimmedInverter
      ? { name: trimmedInverter.name, quantity: trimmedInverter.quantity, unitPriceKes: trimmedInverter.unitPriceKes }
      : null,
    battery: trimmedBattery
      ? { name: trimmedBattery.name, quantity: trimmedBattery.quantity, unitPriceKes: trimmedBattery.unitPriceKes, totalWh: bom.battery?.totalWh }
      : null,
  })

  return NextResponse.json({
    recommendation,
    bom: {
      panel: trimmedPanel,
      inverter: trimmedInverter,
      battery: trimmedBattery,
      mountingKes: pricing.mountingKes,
      installationKes: pricing.installationKes,
      materialsSubtotalKes: pricing.materialsSubtotalKes,
      estimatedTotalKes: pricing.subtotalKes,
    },
  })
}
