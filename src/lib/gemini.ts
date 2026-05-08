import 'server-only'
import { GoogleGenerativeAI } from '@google/generative-ai'

let cachedClient: GoogleGenerativeAI | null = null

export function getGemini(): GoogleGenerativeAI {
  if (cachedClient) return cachedClient
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set in the environment.')
  }
  cachedClient = new GoogleGenerativeAI(key)
  return cachedClient
}

// Cheapest credible vision + chat + tools combo as of May 2026.
// $0.30 / $2.50 per 1M tokens — about 3-10x cheaper than the alternatives.
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash'
