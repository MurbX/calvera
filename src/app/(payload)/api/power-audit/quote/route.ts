import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { computeRecommendation, type ApplianceInput } from '@/lib/calculator'
import { buildBom } from '@/lib/sizing-products'
import { priceBreakdown } from '@/lib/quotation-pricing'
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

  const pricing = priceBreakdown({
    panel: bom.panel
      ? {
          name: bom.panel.product.name,
          quantity: bom.panel.quantity,
          unitPriceKes: bom.panel.product.price,
          totalWatts: bom.panel.totalWatts,
        }
      : null,
    inverter: bom.inverter
      ? {
          name: bom.inverter.product.name,
          quantity: bom.inverter.quantity,
          unitPriceKes: bom.inverter.product.price,
        }
      : null,
    battery: bom.battery
      ? {
          name: bom.battery.product.name,
          quantity: bom.battery.quantity,
          unitPriceKes: bom.battery.product.price,
          totalWh: bom.battery.totalWh,
        }
      : null,
  })

  const items: QuotationLineItem[] = pricing.lines.map((line) => ({
    qty: line.quantity,
    product: line.name,
    description: line.description,
    unitPriceKes: line.unitPriceKes,
    totalKes: line.totalKes,
  }))

  const subtotal = pricing.subtotalKes

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
