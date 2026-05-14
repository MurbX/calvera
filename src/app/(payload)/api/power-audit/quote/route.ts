import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  buildRecommendation,
  parseRecommendationInput,
} from '@/lib/power-audit-recommend'
import { QuotationPDFv2 } from '@/components/QuotationPDFv2'
import { loadLogoDataUri } from '@/lib/logo'
import { getSiteSettings } from '@/lib/site-settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CustomerBody = {
  name?: string
  phone?: string
  email?: string
  address?: string
}

function quotationNumber() {
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `CTS-${yyyymmdd}-${rand}`
}

/**
 * Renders a branded PDF quotation for any Power Audit service. The body
 * carries `{ type, customer, appliances | needs }`.
 */
export async function POST(request: Request) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const body = (raw ?? {}) as { customer?: CustomerBody }
  const name = body.customer?.name?.trim()
  const phone = body.customer?.phone?.trim()
  if (!name || !phone) {
    return NextResponse.json(
      { error: 'Customer name and phone are required.' },
      { status: 400 },
    )
  }

  const input = parseRecommendationInput(raw)
  if ('error' in input) {
    return NextResponse.json({ error: input.error }, { status: 400 })
  }

  const recommendation = await buildRecommendation(input)
  const number = quotationNumber()
  const date = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const logoSrc = await loadLogoDataUri()
  const settings = await getSiteSettings()

  const pdf = await renderToBuffer(
    QuotationPDFv2({
      quotationNumber: number,
      date,
      logoSrc,
      quoteKind: recommendation.quoteKind,
      customer: {
        name,
        phone,
        email: body.customer?.email?.trim() || undefined,
        address: body.customer?.address?.trim() || undefined,
      },
      systemSummary: recommendation.summary,
      items: recommendation.pdfItems,
      subtotalKes: recommendation.estimatedTotalKes,
      business: {
        name: 'Calvera Tech Solutions',
        phone: settings.whatsappPhone,
        email: settings.businessEmail,
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
