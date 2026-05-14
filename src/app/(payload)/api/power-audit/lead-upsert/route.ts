import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  name?: string
  phone?: string
  email?: string
  address?: string
  monthlyBill?: string
  rooftopType?: string
  service?: string
}

const VALID_BILLS = new Set([
  'under_2k',
  '2k_5k',
  '5k_10k',
  '10k_20k',
  '20k_50k',
  'over_50k',
])
const VALID_ROOFS = new Set(['concrete', 'iron_sheet', 'tile', 'other'])
const VALID_SERVICES = new Set(['solar', 'water_heater', 'flood_light'])

// Normalize local phone numbers so we can deduplicate reliably:
//   "+254 723 284 994" → "254723284994"
//   "0723 284 994"     → "254723284994"
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('0')) return '254' + digits.slice(1)
  if (digits.startsWith('7') || digits.startsWith('1')) return '254' + digits
  return digits
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  const phoneRaw = (body.phone ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase() || undefined
  const address = (body.address ?? '').trim() || undefined
  const monthlyBill =
    body.monthlyBill && VALID_BILLS.has(body.monthlyBill) ? body.monthlyBill : undefined
  const rooftopType =
    body.rooftopType && VALID_ROOFS.has(body.rooftopType) ? body.rooftopType : undefined
  const service =
    body.service && VALID_SERVICES.has(body.service) ? body.service : undefined

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (!phoneRaw || phoneRaw.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ error: 'A valid phone number is required.' }, { status: 400 })
  }

  const phone = normalizePhone(phoneRaw)

  const data = {
    name,
    phone,
    email,
    address,
    monthlyBill,
    rooftopType,
    service,
    source: 'power_audit' as const,
  }

  try {
    const payload = await getPayload({ config })
    // Upsert by normalized phone — restarting the form should update the same row.
    const existing = await payload.find({
      collection: 'leads',
      where: { phone: { equals: phone } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      const id = existing.docs[0].id
      await payload.update({
        collection: 'leads',
        id,
        data,
        overrideAccess: true,
      })
      return NextResponse.json({ leadId: id, created: false })
    }

    const created = await payload.create({
      collection: 'leads',
      data: { ...data, status: 'new' },
      overrideAccess: true,
    })
    return NextResponse.json({ leadId: created.id, created: true })
  } catch (err) {
    console.error('[lead-upsert]', err)
    return NextResponse.json(
      { error: 'Could not save your details. Please try again.' },
      { status: 500 },
    )
  }
}
