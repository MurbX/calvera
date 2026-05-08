import 'server-only'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { withRetry } from './db-retry'

export type Customer = {
  id: number | string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  collection: 'customers'
}

/**
 * Read the currently logged-in customer from the Payload session cookie.
 * Returns null if no customer is logged in (or if an admin User is logged in).
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const payload = await getPayload({ config })
  const reqHeaders = await nextHeaders()
  const result = await withRetry(() => payload.auth({ headers: reqHeaders }))
  const user = result.user as
    | (Customer & { collection?: string })
    | null
    | undefined
  if (!user) return null
  if (user.collection !== 'customers') return null
  return user
}
