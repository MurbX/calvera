import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'

const VALID_SOURCES = new Set([
  'contact_form',
  'find_installer',
  'calculator',
  'newsletter',
  'other',
])

type Body = {
  name?: string
  phone?: string
  email?: string
  message?: string
  source?: string
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

  const source = VALID_SOURCES.has(body.source ?? '') ? body.source : 'contact_form'

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'leads',
      data: {
        name: body.name.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || undefined,
        message: body.message?.trim() || undefined,
        source: source as 'contact_form' | 'find_installer' | 'newsletter' | 'other',
      },
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/leads]', err)
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 },
    )
  }
}
