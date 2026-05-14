import { NextResponse } from 'next/server'
import { getGemini, GEMINI_FLASH_MODEL } from '@/lib/gemini'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic'])

const PROMPT = `You are an expert at reading appliance nameplates and product labels.
Look at this image and identify the appliance and its electrical specifications.

Return ONLY a JSON object (no prose, no markdown fences) matching this exact shape:
{
  "name": string,            // human-friendly appliance name, e.g. "Samsung Fridge", "LG TV", "LED bulb"
  "wattage": number,         // continuous power in watts. If only kW is shown, multiply by 1000.
                             // If only voltage and amperage are shown, multiply (V × A).
                             // If only Btu/h is shown for an aircon, divide by 3.412 to get watts.
  "quantity": number,        // default to 1
  "hoursPerDay": number,     // sensible daily usage estimate based on the appliance type
  "confidence": "high"|"medium"|"low",
  "notes": string             // 1 short sentence about what you saw or any caveats
}

Sensible defaults for hoursPerDay if not obvious:
- Lights: 5
- Fridge: 8 (compressor on/off cycle averaged)
- TV: 4
- Router: 24
- Iron / kettle / microwave: 0.5
- Computer / laptop: 6
- Pump / borehole pump: 1
- Camera / CCTV: 24

If the image is not an appliance or you can't read the label, return:
{ "name": "Unknown", "wattage": 0, "quantity": 1, "hoursPerDay": 0, "confidence": "low", "notes": "Could not identify the appliance from the image." }`

type Extracted = {
  name: string
  wattage: number
  quantity: number
  hoursPerDay: number
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

function safeParseJson(raw: string): Extracted | null {
  // Gemini sometimes wraps JSON in ```json ... ``` despite the instruction.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  try {
    const obj = JSON.parse(cleaned) as Partial<Extracted>
    return {
      name: typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : 'Unknown',
      wattage: Math.max(0, Math.round(Number(obj.wattage) || 0)),
      quantity: Math.max(1, Math.round(Number(obj.quantity) || 1)),
      hoursPerDay: Math.max(0, Math.min(24, Number(obj.hoursPerDay) || 0)),
      confidence:
        obj.confidence === 'high' || obj.confidence === 'medium' || obj.confidence === 'low'
          ? obj.confidence
          : 'low',
      notes: typeof obj.notes === 'string' ? obj.notes : '',
    }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data with an "image" field.' }, { status: 400 })
  }

  const file = formData.get('image')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing image upload.' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Empty image upload.' }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `Image too large. Max ${MAX_IMAGE_BYTES / 1024 / 1024}MB.` },
      { status: 413 },
    )
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type "${file.type}". Use JPEG, PNG, WebP or HEIC.` },
      { status: 415 },
    )
  }

  const arrayBuf = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuf).toString('base64')

  try {
    const model = (await getGemini()).getGenerativeModel({
      model: GEMINI_FLASH_MODEL,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent([
      { text: PROMPT },
      { inlineData: { mimeType: file.type, data: base64 } },
    ])

    const text = result.response.text()
    const parsed = safeParseJson(text)
    if (!parsed) {
      return NextResponse.json(
        { error: 'AI response could not be parsed. Please try a clearer photo.' },
        { status: 502 },
      )
    }
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[extract-label]', err)
    const msg = (err as Error)?.message ?? 'AI request failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
