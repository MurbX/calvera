import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'

type Settings = {
  whatsappPhone: string
  businessEmail: string
  geminiApiKey: string
}

let cached: Settings | null = null

/**
 * Read site settings from the Payload global, falling back to env vars.
 * Results are cached in-process — call `invalidateSettingsCache()` after
 * the global is updated (handled automatically by the afterChange hook).
 */
export async function getSiteSettings(): Promise<Settings> {
  if (cached) return cached
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: true,
    })
    cached = {
      whatsappPhone:
        (doc as Record<string, unknown>).whatsappPhone as string ||
        process.env.NEXT_PUBLIC_BUSINESS_PHONE ||
        '+254 723 284 994',
      businessEmail:
        (doc as Record<string, unknown>).businessEmail as string ||
        process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
        'calveratechsolutions@gmail.com',
      geminiApiKey:
        (doc as Record<string, unknown>).geminiApiKey as string ||
        process.env.GEMINI_API_KEY ||
        '',
    }
  } catch {
    cached = {
      whatsappPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+254 723 284 994',
      businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'calveratechsolutions@gmail.com',
      geminiApiKey: process.env.GEMINI_API_KEY || '',
    }
  }
  return cached
}

/** Bust the in-process cache so the next call re-reads from the DB. */
export function invalidateSettingsCache() {
  cached = null
}
