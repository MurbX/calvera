import { NextResponse } from 'next/server'
import {
  buildRecommendation,
  parseRecommendationInput,
} from '@/lib/power-audit-recommend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Sizes any Power Audit service (solar / water heater / flood light) and
 * returns a normalized recommendation the quotation UI renders directly.
 */
export async function POST(request: Request) {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const input = parseRecommendationInput(raw)
  if ('error' in input) {
    return NextResponse.json({ error: input.error }, { status: 400 })
  }

  const recommendation = await buildRecommendation(input)
  return NextResponse.json({ recommendation })
}
