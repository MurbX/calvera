import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSiteSettings } from './site-settings'

let cachedClient: GoogleGenerativeAI | null = null
let cachedKey: string | null = null

export async function getGemini(): Promise<GoogleGenerativeAI> {
  const settings = await getSiteSettings()
  const key = settings.geminiApiKey
  if (!key) {
    throw new Error(
      'Gemini API key is not configured. Set it in Admin → Site Settings or the GEMINI_API_KEY environment variable.',
    )
  }
  // Re-create client if the key changed (e.g. updated in admin)
  if (cachedClient && cachedKey === key) return cachedClient
  cachedClient = new GoogleGenerativeAI(key)
  cachedKey = key
  return cachedClient
}

// Cheapest credible vision + chat + tools combo as of May 2026.
// $0.30 / $2.50 per 1M tokens — about 3-10x cheaper than the alternatives.
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash'
