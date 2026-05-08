import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getPayload } from 'payload'
import config from '@payload-config'
import { computeRecommendation, type ApplianceInput } from '@/lib/calculator'
import { QuotationPDF } from '@/components/QuotationPDF'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  name: string
  phone: string
  email?: string
  location?: string
  appliances: ApplianceInput[]
}

function quotationNumber() {
  const now = new Date()
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CTS-${yyyymmdd}-${rand}`
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }
  if (!Array.isArray(body.appliances) || body.appliances.length === 0) {
    return NextResponse.json({ error: 'At least one appliance is required' }, { status: 400 })
  }

  const cleanedAppliances = body.appliances
    .filter((a) => a.name?.trim() && a.wattage > 0 && a.quantity > 0)
    .map((a) => ({
      name: a.name.trim(),
      wattage: Number(a.wattage),
      quantity: Number(a.quantity),
      hoursPerDay: Number(a.hoursPerDay),
    }))

  if (cleanedAppliances.length === 0) {
    return NextResponse.json({ error: 'No valid appliances provided' }, { status: 400 })
  }

  const recommendation = computeRecommendation(cleanedAppliances)
  const number = quotationNumber()
  const date = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Persist the submission so Calvera's team sees it as a lead
  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'calculator-submissions',
      data: {
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || undefined,
        location: body.location?.trim() || undefined,
        appliances: cleanedAppliances,
        totalWattage: recommendation.totalConnectedWatts,
        dailyEnergyWh: recommendation.dailyEnergyWh,
        recommendation: {
          panelWattsTotal: recommendation.panelWattsTotal,
          inverterWatts: recommendation.inverterWatts,
          batteryWh: recommendation.batteryWh,
          estimatedPriceKes: recommendation.estimatedPriceKes,
          notes: recommendation.notes.join('\n'),
        },
        status: 'new',
      },
      overrideAccess: true,
    })
  } catch (err) {
    // Don't block the PDF on a DB failure — log and continue
    console.error('[calculator/quote] failed to persist submission', err)
  }

  const pdf = await renderToBuffer(
    QuotationPDF({
      quotationNumber: number,
      date,
      customer: {
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim(),
        location: body.location?.trim(),
      },
      appliances: cleanedAppliances,
      recommendation,
      business: {
        phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+254 700 000 000',
        email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'hello@calvera.tech',
      },
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
