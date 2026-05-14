import 'server-only'

/**
 * One place that turns any Power Audit input (solar appliances, water heater
 * needs, flood light needs) into a *normalized* recommendation.
 *
 * Both the `/recommendation` API (drives the on-screen quotation UI) and the
 * `/quote` API (renders the PDF) call `buildRecommendation` so the three
 * services stay consistent and the UI never has to branch on type.
 */

import { computeRecommendation, type ApplianceInput } from '@/lib/calculator'
import {
  computeWaterHeaterRecommendation,
} from '@/lib/water-heater-calculator'
import {
  computeFloodLightRecommendation,
} from '@/lib/flood-light-calculator'
import {
  buildBom,
  buildWaterHeaterBom,
  buildFloodLightBom,
} from '@/lib/sizing-products'
import {
  priceBreakdown,
  priceWaterHeaterBreakdown,
  priceFloodLightBreakdown,
} from '@/lib/quotation-pricing'
import {
  AUDIT_TYPE_META,
  FLOOD_LIGHT_APPLICATION_LABEL,
  type AuditType,
  type FloodLightNeeds,
  type WaterHeaterNeeds,
} from '@/lib/power-audit-types'

/** A catalog product line shown as a card in the quotation UI. */
export type NormalizedItem = {
  kind: string
  productId: number | string
  name: string
  slug: string
  imageUrl: string | null
  shortDescription: string | null
  unitPriceKes: number
  quantity: number
  extra?: string
}

/** A cost-only line (mounting, installation, plumbing) — no catalog product. */
export type NormalizedCostLine = {
  kind: string
  title: string
  description?: string
  totalKes: number
}

/** A part of the system the catalog can't currently fulfil. */
export type NormalizedMissing = {
  kind: string
  note: string
}

export type NormalizedSummaryStat = { label: string; value: string }

/** A flat line item for the PDF table. */
export type PdfLineItem = {
  qty: number
  product: string
  description?: string
  unitPriceKes: number
  totalKes: number
}

export type NormalizedRecommendation = {
  auditType: AuditType
  /** Header sub-line for the PDF, e.g. "Solar System Quote". */
  quoteKind: string
  summary: NormalizedSummaryStat[]
  items: NormalizedItem[]
  costLines: NormalizedCostLine[]
  missing: NormalizedMissing[]
  estimatedTotalKes: number
  notes: string[]
  pdfItems: PdfLineItem[]
  /** Opaque structured context handed to the AI chat route. */
  chatContext: Record<string, unknown>
}

export type RecommendationInput =
  | { type: 'solar'; appliances: ApplianceInput[] }
  | { type: 'water_heater'; needs: WaterHeaterNeeds }
  | { type: 'flood_light'; needs: FloodLightNeeds }

const QUOTE_KIND: Record<AuditType, string> = {
  solar: 'Solar System Quote',
  water_heater: 'Solar Water Heater Quote',
  flood_light: 'Solar Flood Light Quote',
}

export async function buildRecommendation(
  input: RecommendationInput,
): Promise<NormalizedRecommendation> {
  switch (input.type) {
    case 'solar':
      return buildSolar(input.appliances)
    case 'water_heater':
      return buildWaterHeater(input.needs)
    case 'flood_light':
      return buildFloodLight(input.needs)
  }
}

// ---------------------------------------------------------------------------
// Solar
// ---------------------------------------------------------------------------

async function buildSolar(
  appliances: ApplianceInput[],
): Promise<NormalizedRecommendation> {
  const rec = computeRecommendation(appliances)
  const bom = await buildBom(rec)

  const pricing = priceBreakdown({
    panel: bom.panel
      ? {
          name: bom.panel.product.name,
          quantity: bom.panel.quantity,
          unitPriceKes: bom.panel.product.price,
          totalWatts: bom.panel.totalWatts,
        }
      : null,
    inverter: bom.inverter
      ? {
          name: bom.inverter.product.name,
          quantity: bom.inverter.quantity,
          unitPriceKes: bom.inverter.product.price,
        }
      : null,
    battery: bom.battery
      ? {
          name: bom.battery.product.name,
          quantity: bom.battery.quantity,
          unitPriceKes: bom.battery.product.price,
          totalWh: bom.battery.totalWh,
        }
      : null,
  })

  const items: NormalizedItem[] = []
  const missing: NormalizedMissing[] = []

  if (bom.panel) {
    items.push({
      kind: 'Solar panels',
      ...slim(bom.panel.product),
      quantity: bom.panel.quantity,
      extra: `${bom.panel.totalWatts}W total`,
    })
  } else {
    missing.push({
      kind: 'Solar panels',
      note: `No panel in stock matches ${rec.panelWattsTotal}W — talk to us to source one.`,
    })
  }

  if (bom.inverter) {
    items.push({
      kind: 'Inverter',
      ...slim(bom.inverter.product),
      quantity: bom.inverter.quantity,
    })
  } else {
    missing.push({
      kind: 'Inverter',
      note: `No inverter in stock matches ${rec.inverterWatts}W.`,
    })
  }

  if (bom.battery) {
    items.push({
      kind: 'Battery storage',
      ...slim(bom.battery.product),
      quantity: bom.battery.quantity,
      extra: bom.battery.totalWh
        ? `${(bom.battery.totalWh / 1000).toFixed(2)} kWh total`
        : undefined,
    })
  } else {
    missing.push({
      kind: 'Battery storage',
      note: `No battery in stock matches ${(rec.batteryWh / 1000).toFixed(1)} kWh.`,
    })
  }

  const costLines: NormalizedCostLine[] = []
  if (pricing.mountingKes > 0) {
    costLines.push({
      kind: 'Mounting',
      title: 'Solar mounting structure',
      description: bom.panel
        ? `Roof rails / brackets sized for ${bom.panel.quantity} panel${bom.panel.quantity === 1 ? '' : 's'}`
        : 'Roof rails / brackets',
      totalKes: pricing.mountingKes,
    })
  }
  if (pricing.installationKes > 0) {
    costLines.push({
      kind: 'Installation',
      title: 'Professional installation',
      description: '20% of materials · vetted installer · site survey · commissioning',
      totalKes: pricing.installationKes,
    })
  }

  const summary: NormalizedSummaryStat[] = [
    { label: 'Solar panels', value: `${rec.panelWattsTotal}W` },
    { label: 'Inverter', value: `${rec.inverterWatts}W` },
    { label: 'Battery', value: `${(rec.batteryWh / 1000).toFixed(1)} kWh` },
    { label: 'Daily energy', value: `${(rec.dailyEnergyWh / 1000).toFixed(2)} kWh` },
  ]

  return {
    auditType: 'solar',
    quoteKind: QUOTE_KIND.solar,
    summary,
    items,
    costLines,
    missing,
    estimatedTotalKes: pricing.subtotalKes,
    notes: rec.notes,
    pdfItems: pricing.lines.map(toPdfLine),
    chatContext: {
      service: 'solar',
      panelWattsTotal: rec.panelWattsTotal,
      inverterWatts: rec.inverterWatts,
      batteryWh: rec.batteryWh,
      dailyEnergyWh: rec.dailyEnergyWh,
      totalConnectedWatts: rec.totalConnectedWatts,
      estimatedPriceKes: pricing.subtotalKes,
      appliances: appliances.map((a) => ({
        name: a.name,
        wattage: a.wattage,
        quantity: a.quantity,
        hoursPerDay: a.hoursPerDay,
      })),
      lineItems: pricing.lines.map(toPdfLine),
    },
  }
}

// ---------------------------------------------------------------------------
// Solar water heater
// ---------------------------------------------------------------------------

async function buildWaterHeater(
  needs: WaterHeaterNeeds,
): Promise<NormalizedRecommendation> {
  const rec = computeWaterHeaterRecommendation(needs)
  const bom = await buildWaterHeaterBom(rec)

  const pricing = priceWaterHeaterBreakdown({
    heater: bom.heater
      ? {
          name: bom.heater.product.name,
          quantity: bom.heater.quantity,
          unitPriceKes: bom.heater.product.price,
          litres: bom.heater.litres,
        }
      : null,
  })

  const items: NormalizedItem[] = []
  const missing: NormalizedMissing[] = []

  if (bom.heater) {
    items.push({
      kind: 'Solar water heater',
      ...slim(bom.heater.product),
      quantity: bom.heater.quantity,
      extra: `${rec.totalLitres} L installed capacity`,
    })
  } else {
    missing.push({
      kind: 'Solar water heater',
      note: `No water heater in stock matches ${rec.recommendedLitres} L — talk to us to source one.`,
    })
  }

  const costLines: NormalizedCostLine[] = []
  if (pricing.installationKes > 0) {
    costLines.push({
      kind: 'Installation',
      title: 'Plumbing & installation',
      description: '20% of materials · pipes, mixers, brackets · fitting & commissioning',
      totalKes: pricing.installationKes,
    })
  }

  const summary: NormalizedSummaryStat[] = [
    { label: 'Tank size', value: `${rec.recommendedLitres} L` },
    { label: 'Units', value: String(rec.unitCount) },
    {
      label: 'Household',
      value: `${rec.household} ${rec.household === 1 ? 'person' : 'people'}`,
    },
    { label: 'Daily demand', value: `${rec.litresNeeded} L` },
  ]

  return {
    auditType: 'water_heater',
    quoteKind: QUOTE_KIND.water_heater,
    summary,
    items,
    costLines,
    missing,
    estimatedTotalKes: pricing.subtotalKes,
    notes: rec.notes,
    pdfItems: pricing.lines.map(toPdfLine),
    chatContext: {
      service: 'water_heater',
      household: rec.household,
      bathrooms: rec.bathrooms,
      usage: needs.usage,
      currentHeating: needs.currentHeating,
      litresNeeded: rec.litresNeeded,
      recommendedLitres: rec.recommendedLitres,
      unitCount: rec.unitCount,
      totalLitres: rec.totalLitres,
      estimatedPriceKes: pricing.subtotalKes,
      lineItems: pricing.lines.map(toPdfLine),
    },
  }
}

// ---------------------------------------------------------------------------
// Solar flood lights
// ---------------------------------------------------------------------------

async function buildFloodLight(
  needs: FloodLightNeeds,
): Promise<NormalizedRecommendation> {
  const rec = computeFloodLightRecommendation(needs)
  const bom = await buildFloodLightBom(rec)

  const pricing = priceFloodLightBreakdown({
    light: bom.light
      ? {
          name: bom.light.product.name,
          quantity: bom.light.quantity,
          unitPriceKes: bom.light.product.price,
          watts: bom.light.watts,
        }
      : null,
    poleCount: rec.poleCount,
  })

  const items: NormalizedItem[] = []
  const missing: NormalizedMissing[] = []

  if (bom.light) {
    items.push({
      kind: 'Solar flood lights',
      ...slim(bom.light.product),
      quantity: bom.light.quantity,
      extra: `${rec.totalWatts}W total output`,
    })
  } else {
    missing.push({
      kind: 'Solar flood lights',
      note: `No flood light in stock matches ${rec.recommendedWatts}W — talk to us to source one.`,
    })
  }

  const costLines: NormalizedCostLine[] = []
  // Mounting poles are a flat-rate supply line, not a catalog product.
  const poleLine = pricing.lines.find((l) => l.name === 'Mounting poles')
  if (poleLine) {
    costLines.push({
      kind: 'Poles',
      title: 'Mounting poles',
      description: poleLine.description,
      totalKes: poleLine.totalKes,
    })
  }
  if (pricing.installationKes > 0) {
    costLines.push({
      kind: 'Installation',
      title: 'Professional installation',
      description: '20% of materials · vetted installer · wiring · commissioning',
      totalKes: pricing.installationKes,
    })
  }

  const summary: NormalizedSummaryStat[] = [
    { label: 'Per fixture', value: `${rec.recommendedWatts}W` },
    { label: 'Fixtures', value: String(rec.fixtureCount) },
    { label: 'Poles', value: String(rec.poleCount) },
    { label: 'Total output', value: `${rec.totalWatts}W` },
  ]

  return {
    auditType: 'flood_light',
    quoteKind: QUOTE_KIND.flood_light,
    summary,
    items,
    costLines,
    missing,
    estimatedTotalKes: pricing.subtotalKes,
    notes: rec.notes,
    pdfItems: pricing.lines.map(toPdfLine),
    chatContext: {
      service: 'flood_light',
      application: FLOOD_LIGHT_APPLICATION_LABEL[rec.application],
      recommendedWatts: rec.recommendedWatts,
      fixtureCount: rec.fixtureCount,
      poleCount: rec.poleCount,
      hoursPerNight: rec.hoursPerNight,
      totalWatts: rec.totalWatts,
      estimatedPriceKes: pricing.subtotalKes,
      lineItems: pricing.lines.map(toPdfLine),
    },
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slim(p: {
  id: number | string
  name: string
  slug: string
  price: number
  imageUrl?: string | null
  shortDescription?: string | null
}) {
  return {
    productId: p.id,
    name: p.name,
    slug: p.slug,
    unitPriceKes: p.price,
    imageUrl: p.imageUrl ?? null,
    shortDescription: p.shortDescription ?? null,
  }
}

function toPdfLine(line: {
  name: string
  description?: string
  quantity: number
  unitPriceKes: number
  totalKes: number
}): PdfLineItem {
  return {
    qty: line.quantity,
    product: line.name,
    description: line.description,
    unitPriceKes: line.unitPriceKes,
    totalKes: line.totalKes,
  }
}

/** Human label for a service — handy for routes and prompts. */
export function quoteKindLabel(type: AuditType): string {
  return AUDIT_TYPE_META[type].label
}

// ---------------------------------------------------------------------------
// Request parsing — shared by the /recommendation and /quote routes
// ---------------------------------------------------------------------------

const USAGE_VALUES: WaterHeaterNeeds['usage'][] = ['light', 'moderate', 'heavy']
const HEATING_VALUES: WaterHeaterNeeds['currentHeating'][] = [
  '',
  'electric_tank',
  'instant_shower',
  'none',
  'other',
]
const APPLICATION_VALUES: FloodLightNeeds['application'][] = [
  'home_compound',
  'parking',
  'security_perimeter',
  'commercial_yard',
  'sports',
  'signage',
]
const BRIGHTNESS_VALUES: FloodLightNeeds['brightness'][] = ['standard', 'bright', 'max']

const num = (v: unknown, fallback = 0): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Validate and normalize a raw request body into a `RecommendationInput`.
 * Returns `{ error }` with an HTTP-friendly message when the body is invalid.
 * `type` defaults to `solar` so older clients keep working.
 */
export function parseRecommendationInput(
  raw: unknown,
): RecommendationInput | { error: string } {
  const body = (raw ?? {}) as Record<string, unknown>
  const type = (body.type as AuditType) ?? 'solar'

  if (type === 'solar') {
    const list = Array.isArray(body.appliances) ? body.appliances : []
    const appliances: ApplianceInput[] = list
      .map((a) => {
        const item = (a ?? {}) as Record<string, unknown>
        return {
          name: String(item.name ?? '').trim(),
          wattage: num(item.wattage),
          quantity: num(item.quantity),
          hoursPerDay: num(item.hoursPerDay),
        }
      })
      .filter((a) => a.name && a.wattage > 0 && a.quantity > 0)
    if (appliances.length === 0) {
      return { error: 'At least one appliance is required.' }
    }
    return { type: 'solar', appliances }
  }

  if (type === 'water_heater') {
    const n = (body.needs ?? {}) as Record<string, unknown>
    const usage = USAGE_VALUES.includes(n.usage as WaterHeaterNeeds['usage'])
      ? (n.usage as WaterHeaterNeeds['usage'])
      : 'moderate'
    const currentHeating = HEATING_VALUES.includes(
      n.currentHeating as WaterHeaterNeeds['currentHeating'],
    )
      ? (n.currentHeating as WaterHeaterNeeds['currentHeating'])
      : ''
    const household = Math.round(num(n.household, 1))
    const bathrooms = Math.round(num(n.bathrooms, 1))
    if (household < 1) return { error: 'Household size must be at least 1.' }
    return {
      type: 'water_heater',
      needs: { household, bathrooms: Math.max(1, bathrooms), usage, currentHeating },
    }
  }

  if (type === 'flood_light') {
    const n = (body.needs ?? {}) as Record<string, unknown>
    if (!APPLICATION_VALUES.includes(n.application as FloodLightNeeds['application'])) {
      return { error: 'A valid lighting application is required.' }
    }
    const brightness = BRIGHTNESS_VALUES.includes(
      n.brightness as FloodLightNeeds['brightness'],
    )
      ? (n.brightness as FloodLightNeeds['brightness'])
      : 'standard'
    const mountingPoints = Math.round(num(n.mountingPoints, 1))
    if (mountingPoints < 1) return { error: 'At least one mounting point is required.' }
    return {
      type: 'flood_light',
      needs: {
        application: n.application as FloodLightNeeds['application'],
        mountingPoints,
        hasPoles: Boolean(n.hasPoles),
        hoursPerNight: Math.min(24, Math.max(1, num(n.hoursPerNight, 10))),
        brightness,
      },
    }
  }

  return { error: `Unknown audit type: ${String(type)}` }
}
