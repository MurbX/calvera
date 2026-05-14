import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotationPDFv2 } from '@/components/QuotationPDFv2'
import { loadLogoDataUri } from '@/lib/logo'
import { getSiteSettings } from '@/lib/site-settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const payload = await getPayload({ config })
  let doc: Record<string, unknown>
  try {
    doc = (await payload.findByID({
      collection: 'manual-quotes',
      id,
      overrideAccess: true,
    })) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  const customer = (doc.customer ?? {}) as Record<string, string | undefined>
  const items = (doc.items ?? []) as Array<{
    qty: number
    product: string
    description?: string
    unitPriceKes: number
    totalKes: number
  }>
  const systemSummary = (doc.systemSummary ?? []) as Array<{
    label: string
    value: string
  }>
  const notes = (doc.notes ?? []) as Array<{ note: string }>

  const quotationNumber = (doc.quotationNumber as string) || 'DRAFT'
  const date = new Date(
    (doc.createdAt as string) || Date.now(),
  ).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const logoSrc = await loadLogoDataUri()
  const settings = await getSiteSettings()

  const pdf = await renderToBuffer(
    QuotationPDFv2({
      quotationNumber,
      date,
      logoSrc,
      quoteKind: (doc.quoteKind as string) || undefined,
      customer: {
        name: customer.name || 'Customer',
        phone: customer.phone || '',
        email: customer.email || undefined,
        address: customer.address || undefined,
      },
      systemSummary,
      items: items.map((it) => ({
        qty: it.qty,
        product: it.product,
        description: it.description,
        unitPriceKes: it.unitPriceKes,
        totalKes: it.totalKes,
      })),
      subtotalKes: (doc.subtotalKes as number) || 0,
      business: {
        name: 'Calvera Tech Solutions',
        phone: settings.whatsappPhone,
        email: settings.businessEmail,
      },
      notes: notes.map((n) => n.note),
    }),
  )

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="calvera-quotation-${quotationNumber}.pdf"`,
    },
  })
}
