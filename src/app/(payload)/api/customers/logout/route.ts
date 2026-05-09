import { headers as nextHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Custom logout for storefront customers.
 *
 * Payload's built-in /api/customers/logout (handled by the REST catch-all)
 * sometimes returns 400 "No User" when the cookie auth state can't be
 * resolved on the POST — most likely because the `users` and `customers`
 * collections share the `payload-token` cookie name and the catch-all
 * picks up an inconsistent state. Either way, the user expectation is
 * simple: hit logout, get logged out.
 *
 * This route always clears the cookie and best-effort revokes the
 * matching server-side session record. Idempotent — calling it without a
 * valid cookie still clears it.
 */
export async function POST() {
  const reqHeaders = await nextHeaders()

  // Best-effort server-side session cleanup. If we can resolve the cookie
  // to a customer we drop their current session id from `sessions[]` so
  // the JWT can't be replayed even if someone copied the cookie before
  // logout. Failures here don't block the logout — the cookie clear below
  // always fires.
  try {
    const payload = await getPayload({ config })
    const auth = await payload.auth({ headers: reqHeaders })
    const user = auth.user as
      | { id: number | string; collection?: string; _sid?: string; sessions?: { id: string }[] }
      | null

    if (user && user.collection === 'customers' && user._sid) {
      const remaining = (user.sessions ?? []).filter((s) => s.id !== user._sid)
      await payload.update({
        collection: 'customers',
        id: user.id,
        data: { sessions: remaining } as Record<string, unknown>,
        overrideAccess: true,
      })
    }
  } catch (err) {
    console.warn('[/api/customers/logout] session cleanup skipped:', err)
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('payload-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  })
  return res
}
