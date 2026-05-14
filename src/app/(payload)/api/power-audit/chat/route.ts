import { NextResponse } from 'next/server'
import { getGemini, GEMINI_FLASH_MODEL } from '@/lib/gemini'
import {
  SchemaType,
  type Content,
  type FunctionCall,
  type FunctionDeclaration,
} from '@google/generative-ai'
import { getProducts } from '@/lib/payload-data'
import { formatKes } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

type LineItem = {
  qty: number
  product: string
  description?: string
  unitPriceKes: number
  totalKes: number
}

/**
 * The normalized `chatContext` produced by `power-audit-recommend.ts`. Shape
 * varies by service, so everything beyond the shared keys is optional.
 */
type ChatContext = {
  service?: 'solar' | 'water_heater' | 'flood_light'
  estimatedPriceKes?: number
  lineItems?: LineItem[]
  // solar
  panelWattsTotal?: number
  inverterWatts?: number
  batteryWh?: number
  dailyEnergyWh?: number
  totalConnectedWatts?: number
  appliances?: { name: string; wattage: number; quantity: number; hoursPerDay: number }[]
  // water heater
  household?: number
  bathrooms?: number
  usage?: string
  currentHeating?: string
  litresNeeded?: number
  recommendedLitres?: number
  unitCount?: number
  totalLitres?: number
  // flood light
  application?: string
  recommendedWatts?: number
  fixtureCount?: number
  poleCount?: number
  hoursPerNight?: number
  totalWatts?: number
}

type Body = {
  messages: IncomingMessage[]
  context?: ChatContext
}

const SYSTEM_PROMPT = `You are "Aria", Calvera Tech Solutions' friendly solar expert chatbot.
Calvera supplies and installs solar power systems, solar water heaters and solar flood lights.
You help customers understand the recommendation we generated for them and pick products from our catalog.

Style:
- Short, plain English. Bullet points when comparing options.
- KES prices, local context (mobile money, grid power, metro delivery etc.).
- Never invent prices. If a product isn't in the searchProducts() result, say so.
- Answer using the customer's audit context below — don't re-size from scratch unless asked.

Tools:
- searchProducts({ query, category? }) — search Calvera's product catalog. Use this whenever the user asks about a panel, inverter, battery, kit, light, water heater, etc.

When the user asks something product-specific, ALWAYS call searchProducts first, then answer using only those results.`

const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'searchProducts',
    description: "Search Calvera's product catalog by free text and optional category slug.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description:
            'Free-text search, e.g. "3kVA hybrid inverter", "200Ah battery", "200W flood light", "300L water heater".',
        },
        category: {
          type: SchemaType.STRING,
          description:
            'Optional category slug to narrow results: panels, inverters, batteries, flood-lights, ceiling-lights, kits, water-pumps, water-heaters, power-stations, accessories.',
        },
      },
      required: ['query'],
    },
  },
]

async function searchProducts(args: { query?: string; category?: string }) {
  const query = (args.query ?? '').toLowerCase().trim()
  const category = (args.category ?? '').toLowerCase().trim()
  const all = await getProducts() // already cached + retried

  const matches = all
    .filter((p) => {
      if (category && p.category?.slug !== category) return false
      if (!query) return true
      const hay = `${p.name} ${p.shortDescription ?? ''} ${p.category?.name ?? ''}`.toLowerCase()
      return hay.includes(query)
    })
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name ?? null,
      price: p.price,
      priceFormatted: formatKes(p.price),
      shortDescription: p.shortDescription ?? null,
      stock: p.stock ?? 0,
      url: `/products/${p.slug}`,
    }))

  return { count: matches.length, products: matches }
}

function toGeminiHistory(messages: IncomingMessage[]): Content[] {
  // Gemini requires history to start with a 'user' turn — drop any leading
  // 'assistant' (e.g. our prefilled welcome greeting) before sending.
  const firstUser = messages.findIndex((m) => m.role === 'user')
  const trimmed = firstUser === -1 ? [] : messages.slice(firstUser)
  return trimmed.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))
}

/** Service-specific summary lines for the system instruction. */
function contextLines(ctx: ChatContext): string[] {
  const lines: string[] = []

  if (ctx.service === 'water_heater') {
    lines.push('- Service: solar water heater')
    if (ctx.household) lines.push(`- Household: ${ctx.household} people, ${ctx.bathrooms ?? 1} bathroom(s)`)
    if (ctx.usage) lines.push(`- Usage intensity: ${ctx.usage}`)
    if (ctx.currentHeating) lines.push(`- Current heating: ${ctx.currentHeating}`)
    if (ctx.litresNeeded) lines.push(`- Estimated daily demand: ${ctx.litresNeeded} L`)
    if (ctx.recommendedLitres)
      lines.push(
        `- Recommended: ${ctx.unitCount ?? 1} × ${ctx.recommendedLitres} L tank (${ctx.totalLitres ?? ctx.recommendedLitres} L total)`,
      )
  } else if (ctx.service === 'flood_light') {
    lines.push('- Service: solar flood lights')
    if (ctx.application) lines.push(`- Application: ${ctx.application}`)
    if (ctx.recommendedWatts)
      lines.push(`- Recommended fixture: ${ctx.recommendedWatts}W × ${ctx.fixtureCount ?? 1}`)
    if (ctx.poleCount != null) lines.push(`- Mounting poles supplied: ${ctx.poleCount}`)
    if (ctx.hoursPerNight) lines.push(`- Run time: ~${ctx.hoursPerNight} h/night`)
    if (ctx.totalWatts) lines.push(`- Total lighting output: ${ctx.totalWatts}W`)
  } else {
    lines.push('- Service: solar power system')
    if (ctx.panelWattsTotal) lines.push(`- Sized panels: ${ctx.panelWattsTotal}W total`)
    if (ctx.inverterWatts) lines.push(`- Inverter: ${ctx.inverterWatts}W`)
    if (ctx.batteryWh) lines.push(`- Battery: ${(ctx.batteryWh / 1000).toFixed(1)}kWh`)
    if (ctx.dailyEnergyWh)
      lines.push(`- Daily energy: ${(ctx.dailyEnergyWh / 1000).toFixed(2)} kWh/day`)
    if (ctx.appliances?.length) {
      lines.push("- Customer's appliance list:")
      for (const a of ctx.appliances.slice(0, 12)) {
        lines.push(`  · ${a.name} — ${a.wattage}W × ${a.quantity}, ${a.hoursPerDay} hrs/day`)
      }
    }
  }

  if (ctx.estimatedPriceKes)
    lines.push(`- Indicative total cost: ${formatKes(ctx.estimatedPriceKes)}`)

  if (ctx.lineItems?.length) {
    lines.push('- Quotation line items (already shown to the customer):')
    for (const it of ctx.lineItems.slice(0, 12)) {
      lines.push(
        `  · ${it.qty}× ${it.product} @ ${formatKes(it.unitPriceKes)} = ${formatKes(it.totalKes)}`,
      )
    }
  }

  return lines
}

function buildSystemInstruction(context?: ChatContext): string {
  if (!context) return SYSTEM_PROMPT
  const lines = contextLines(context)
  if (lines.length === 0) return SYSTEM_PROMPT
  return `${SYSTEM_PROMPT}\n\n## This customer's audit\n${lines.join('\n')}`
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages[] is required' }, { status: 400 })
  }
  // Last message must be the user's
  const last = body.messages[body.messages.length - 1]
  if (last?.role !== 'user' || !last.content?.trim()) {
    return NextResponse.json({ error: 'Last message must be a non-empty user turn' }, { status: 400 })
  }

  try {
    const model = (await getGemini()).getGenerativeModel({
      model: GEMINI_FLASH_MODEL,
      systemInstruction: buildSystemInstruction(body.context),
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      generationConfig: { temperature: 0.4 },
    })

    const chat = model.startChat({
      history: toGeminiHistory(body.messages.slice(0, -1)),
    })

    let result = await chat.sendMessage(last.content)
    // Tool-calling loop — Gemini may want to call searchProducts before answering.
    for (let hops = 0; hops < 3; hops++) {
      const calls: FunctionCall[] = result.response.functionCalls() ?? []
      if (calls.length === 0) break
      const responses = await Promise.all(
        calls.map(async (call) => {
          if (call.name === 'searchProducts') {
            const out = await searchProducts(call.args as { query?: string; category?: string })
            return { functionResponse: { name: 'searchProducts', response: out } }
          }
          return { functionResponse: { name: call.name, response: { error: 'Unknown tool' } } }
        }),
      )
      result = await chat.sendMessage(responses)
    }

    const reply = result.response.text()
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[power-audit/chat]', err)
    const msg = (err as Error)?.message ?? 'AI request failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
