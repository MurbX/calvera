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

type BomLine = { name: string; quantity: number; unitPriceKes: number } | null

type Body = {
  messages: IncomingMessage[]
  context?: {
    panelWattsTotal?: number
    inverterWatts?: number
    batteryWh?: number
    dailyEnergyWh?: number
    estimatedPriceKes?: number
    appliances?: { name: string; wattage: number; quantity: number; hoursPerDay: number }[]
    bom?: {
      panel: BomLine
      inverter: BomLine
      battery: BomLine
      mountingStructureKes?: number
      installationKes?: number
    } | null
  }
}

const SYSTEM_PROMPT = `You are "Aria", Calvera Tech Solutions' friendly solar expert chatbot for Kenya.
You help customers understand the system size we recommended for them and pick products from our catalog.

Style:
- Short, plain English. Bullet points when comparing options.
- KES prices, Kenyan context (M-Pesa, Kenya Power, Nairobi metro etc.).
- Never invent prices. If a product isn't in the searchProducts() result, say so.
- If someone asks "is this enough for my fridge and pump?" use the system context they were sized for.

Tools:
- searchProducts({ query, category? }) — search Calvera's product catalog. Use this whenever the user asks about a panel, inverter, battery, kit, light, etc.

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
            'Free-text search, e.g. "3kVA hybrid inverter", "200Ah battery", "100W panel".',
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

function buildSystemInstruction(context?: Body['context']): string {
  if (!context) return SYSTEM_PROMPT
  const lines: string[] = []
  if (context.panelWattsTotal) lines.push(`- Sized panels: ${context.panelWattsTotal}W total`)
  if (context.inverterWatts) lines.push(`- Inverter: ${context.inverterWatts}W`)
  if (context.batteryWh) lines.push(`- Battery: ${(context.batteryWh / 1000).toFixed(1)}kWh`)
  if (context.dailyEnergyWh) lines.push(`- Daily energy: ${(context.dailyEnergyWh / 1000).toFixed(2)} kWh/day`)
  if (context.estimatedPriceKes) lines.push(`- Indicative system cost: ${formatKes(context.estimatedPriceKes)}`)
  if (context.appliances?.length) {
    lines.push("- Customer's appliance list:")
    for (const a of context.appliances.slice(0, 12)) {
      lines.push(`  · ${a.name} — ${a.wattage}W × ${a.quantity}, ${a.hoursPerDay} hrs/day`)
    }
  }
  if (context.bom) {
    const fmtLine = (label: string, item: BomLine) => {
      if (!item) return `  · ${label}: not in stock — needs sourcing`
      const total = item.unitPriceKes * item.quantity
      return `  · ${label}: ${item.quantity}× ${item.name} @ ${formatKes(item.unitPriceKes)} each (${formatKes(total)})`
    }
    lines.push('- Recommended bill of materials (already shown to the customer):')
    lines.push(fmtLine('Solar panel', context.bom.panel))
    lines.push(fmtLine('Inverter', context.bom.inverter))
    lines.push(fmtLine('Battery', context.bom.battery))
    if (context.bom.mountingStructureKes && context.bom.mountingStructureKes > 0) {
      lines.push(
        `  · Solar mounting structure: ${formatKes(context.bom.mountingStructureKes)} (KES 15,000 per 4 panels, prorated)`,
      )
    }
    if (context.bom.installationKes && context.bom.installationKes > 0) {
      lines.push(
        `  · Professional installation: ${formatKes(context.bom.installationKes)} (20% of materials)`,
      )
    }
  }
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
    const model = getGemini().getGenerativeModel({
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
