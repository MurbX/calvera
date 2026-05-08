import { headers as nextHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  currentPassword?: string
  newPassword?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const currentPassword = (body.currentPassword ?? '').trim()
  const newPassword = (body.newPassword ?? '').trim()

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Current and new password are required.' },
      { status: 400 },
    )
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters.' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })
  const reqHeaders = await nextHeaders()
  const auth = await payload.auth({ headers: reqHeaders })
  const user = auth.user as { id: number | string; email: string; collection?: string } | null

  if (!user || user.collection !== 'customers') {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  // Verify the current password by attempting a fresh login
  try {
    await payload.login({
      collection: 'customers',
      data: { email: user.email, password: currentPassword },
    })
  } catch {
    return NextResponse.json(
      { error: 'Current password is incorrect.' },
      { status: 400 },
    )
  }

  try {
    await payload.update({
      collection: 'customers',
      id: user.id,
      data: { password: newPassword } as Record<string, unknown>,
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[/api/customers/change-password]', err)
    return NextResponse.json(
      { error: 'Could not update password. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
