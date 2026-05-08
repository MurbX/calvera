import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { computeRecommendation, type ApplianceInput } from '@/lib/calculator'
import { buildBom } from '@/lib/sizing-products'
import { QuotationPDFv2, type QuotationLineItem } from '@/components/QuotationPDFv2'

let cachedLogo: string | null = null
async function loadLogoDataUri(): Promise<string | null> {
  if (cachedLogo !== null) return cachedLogo
  try {
    const file = path.resolve(process.cwd(), 'public/brand/calvera-logo.png')
    const buf = await fs.readFile(file)
    cachedLogo = `data:image/png;base64,${buf.toString('base64')}`
    return cachedLogo
  } catch (err) {
    console.warn('[power-audit/quote] could not load logo:', err)
    return null
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  customer: {
    name?: string
    phone?: string
    email?: string
    address?: string
  }
  appliances: ApplianceInput[]
}

function quotationNumber() {
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

  const name = body.customer?.name?.trim()
  const phone = body.customer?.phone?.trim()
  if (!name || !phone) {
    return NextResponse.json({ error: 'Customer name and phone are required.' }, { status: 400 })
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
  const number = quotationNumber()
  const date = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const items: QuotationLineItem[] = []
  if (bom.panel) {
    const total = bom.panel.product.price * bom.panel.quantity
    items.push({
      qty: bom.panel.quantity,
      product: bom.panel.product.name,
      description: `Total: ${bom.panel.totalWatts}W (${bom.panel.quantity}× module)`,
      unitPriceKes: bom.panel.product.price,
      totalKes: total,
    })
  }
  if (bom.inverter) {
    const total = bom.inverter.product.price * bom.inverter.quantity
    items.push({
      qty: bom.inverter.quantity,
      product: bom.inverter.product.name,
      description: bom.inverter.product.shortDescription ?? undefined,
      unitPriceKes: bom.inverter.product.price,
      totalKes: total,
    })
  }
  if (bom.battery) {
    const total = bom.battery.product.price * bom.battery.quantity
    items.push({
      qty: bom.battery.quantity,
      product: bom.battery.product.name,
      description: `Total storage: ${(bom.battery.totalWh / 1000).toFixed(2)} kWh`,
      unitPriceKes: bom.battery.product.price,
      totalKes: total,
    })
  }
  if (bom.mounting) {
    const total = bom.mounting.product.price * bom.mounting.quantity
    items.push({
      qty: bom.mounting.quantity,
      product: bom.mounting.product.name,
      description: 'Mounting / balance of system',
      unitPriceKes: bom.mounting.product.price,
      totalKes: total,
    })
  }

  const subtotal = items.reduce((s, i) => s + i.totalKes, 0)

  const logoSrc = await loadLogoDataUri()

  const pdf = await renderToBuffer(
    QuotationPDFv2({
      quotationNumber: number,
      date,
      logoSrc,
      customer: {
        name,
        phone,
        email: body.customer?.email?.trim() || undefined,
        address: body.customer?.address?.trim() || undefined,
      },
      systemSummary: {
        panelWattsTotal: recommendation.panelWattsTotal,
        inverterWatts: recommendation.inverterWatts,
        batteryWh: recommendation.batteryWh,
        dailyEnergyWh: recommendation.dailyEnergyWh,
      },
      items,
      subtotalKes: subtotal,
      business: {
        name: 'Calvera Tech Solutions',
        phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994',
        email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? 'hello@calvera.tech',
      },
      notes: recommendation.notes,
    }),
  )

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="calvera-quotation-${number}.pdf"`,
    },
  })
}
