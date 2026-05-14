import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import {
  getCategories,
  type ProductRecord,
  type CategoryRecord,
} from './payload-data'
import { withRetry } from './db-retry'
import type { Recommendation } from './calculator'
import type { WaterHeaterRecommendation } from './water-heater-calculator'
import type { FloodLightRecommendation } from './flood-light-calculator'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Sizing-only product fetcher: pulls EVERY published product across the
 * sizing-relevant categories, depth 0, no select trim. Avoids the 24-item
 * cap on getProducts() that was hiding panels/inverters/batteries from the
 * BoM builder.
 */
const fetchSizingProducts = unstable_cache(
  async (): Promise<ProductRecord[]> => {
    const payload = await getPayload({ config })
    const result = await withRetry(() =>
      payload.find({
        collection: 'products',
        where: {
          and: [
            { isPublished: { equals: true } },
            {
              or: [
                { 'category.slug': { equals: 'panels' } },
                { 'category.slug': { equals: 'inverters' } },
                { 'category.slug': { equals: 'batteries' } },
                { 'category.slug': { equals: 'accessories' } },
                { 'category.slug': { equals: 'water-heaters' } },
                { 'category.slug': { equals: 'flood-lights' } },
              ],
            },
          ],
        },
        limit: 500,
        depth: 0,
        pagination: false,
        overrideAccess: true,
      }),
    )

    const cats = await getCategories()
    const catById = new Map<string | number, CategoryRecord>(
      cats.map((c) => [c.id, c]),
    )
    return result.docs.map((doc) => {
      const raw = doc as unknown as Omit<ProductRecord, 'category' | 'brand'> & {
        category: number | string | null
      }
      const cat = raw.category != null ? catById.get(raw.category) : undefined
      return {
        ...raw,
        category: cat
          ? { id: cat.id, name: cat.name, slug: cat.slug }
          : { id: raw.category ?? 0, name: 'Uncategorized', slug: '' },
        brand: null,
      } as ProductRecord
    })
  },
  ['sizing', 'products'],
  { revalidate: 5 * 60, tags: ['products', 'categories'] },
)

const getSizingProducts = cache(fetchSizingProducts)

export type SystemBom = {
  panel: { product: ProductRecord; quantity: number; totalWatts: number } | null
  inverter: { product: ProductRecord; quantity: number } | null
  battery: { product: ProductRecord; quantity: number; totalWh: number } | null
  mounting: { product: ProductRecord; quantity: number } | null
  estimatedTotalKes: number
}

// Best-effort wattage extraction from a product name (e.g. "100W", "3kVA").
function nameWatts(p: ProductRecord): number {
  const m = p.name.match(/(\d+(?:\.\d+)?)\s*(kVA|kW|W)\b/i)
  if (!m) return 0
  const n = Number(m[1])
  if (!Number.isFinite(n)) return 0
  return /kva|kw/i.test(m[2]) ? Math.round(n * 1000) : Math.round(n)
}

// Best-effort battery Wh extraction (e.g. "5.12kWh", "200Ah 12V")
function nameBatteryWh(p: ProductRecord): number {
  const kwh = p.name.match(/(\d+(?:\.\d+)?)\s*kWh\b/i)
  if (kwh) return Math.round(Number(kwh[1]) * 1000)
  const ah = p.name.match(/(\d+(?:\.\d+)?)\s*Ah\b/i)
  const v = p.name.match(/(\d+(?:\.\d+)?)\s*V\b/i)
  if (ah) {
    const A = Number(ah[1])
    const V = v ? Number(v[1]) : 12
    if (Number.isFinite(A) && Number.isFinite(V)) return Math.round(A * V)
  }
  return 0
}

function pickPanel(products: ProductRecord[], targetWatts: number) {
  const panels = products.filter((p) => p.category?.slug === 'panels' && (p.stock ?? 1) > 0)
  if (panels.length === 0) return null
  // We want the largest panel that's <= target so we can fit with whole units.
  const sorted = [...panels].sort((a, b) => nameWatts(b) - nameWatts(a))
  const chosen =
    sorted.find((p) => nameWatts(p) > 0 && nameWatts(p) <= targetWatts) ?? sorted[0]
  const w = Math.max(1, nameWatts(chosen))
  const quantity = Math.max(1, Math.ceil(targetWatts / w))
  return { product: chosen, quantity, totalWatts: w * quantity }
}

function pickInverter(products: ProductRecord[], targetWatts: number) {
  const inverters = products.filter(
    (p) => p.category?.slug === 'inverters' && (p.stock ?? 1) > 0,
  )
  if (inverters.length === 0) return null
  // Prefer the smallest inverter >= target.
  const sorted = [...inverters]
    .filter((p) => nameWatts(p) > 0)
    .sort((a, b) => nameWatts(a) - nameWatts(b))
  const chosen = sorted.find((p) => nameWatts(p) >= targetWatts) ?? sorted[sorted.length - 1] ?? inverters[0]
  return { product: chosen, quantity: 1 }
}

function pickBattery(products: ProductRecord[], targetWh: number) {
  const batteries = products.filter(
    (p) => p.category?.slug === 'batteries' && (p.stock ?? 1) > 0,
  )
  if (batteries.length === 0) return null
  const sorted = [...batteries]
    .filter((p) => nameBatteryWh(p) > 0)
    .sort((a, b) => nameBatteryWh(b) - nameBatteryWh(a))
  const chosen =
    sorted.find((p) => nameBatteryWh(p) > 0 && nameBatteryWh(p) <= targetWh) ?? sorted[0] ?? batteries[0]
  const wh = Math.max(1, nameBatteryWh(chosen))
  const quantity = Math.max(1, Math.ceil(targetWh / wh))
  return { product: chosen, quantity, totalWh: wh * quantity }
}

function pickMounting(products: ProductRecord[]) {
  // Only return an accessory that's actually mounting/cabling/balance-of-system.
  // If we don't have one in the catalog yet, return null — better to show no
  // mounting line than to recommend something unrelated like a sound bar.
  const accessories = products.filter(
    (p) => p.category?.slug === 'accessories' && (p.stock ?? 1) > 0,
  )
  const mount = accessories.find((p) =>
    /mount|rail|bracket|clamp|pv\s*cable|cable|wire|fuse|breaker|combiner|earth|mc4/i.test(
      p.name,
    ),
  )
  return mount ? { product: mount, quantity: 1 } : null
}

export async function buildBom(rec: Recommendation): Promise<SystemBom> {
  const products = await getSizingProducts()
  const panel = pickPanel(products, rec.panelWattsTotal)
  const inverter = pickInverter(products, rec.inverterWatts)
  const battery = pickBattery(products, rec.batteryWh)
  const mounting = pickMounting(products)

  const estimatedTotalKes =
    (panel ? panel.product.price * panel.quantity : 0) +
    (inverter ? inverter.product.price * inverter.quantity : 0) +
    (battery ? battery.product.price * battery.quantity : 0) +
    (mounting ? mounting.product.price * mounting.quantity : 0)

  return { panel, inverter, battery, mounting, estimatedTotalKes }
}

// ---------------------------------------------------------------------------
// Solar water heater BoM
// ---------------------------------------------------------------------------

// Best-effort litres extraction from a product name (e.g. "150L Aquasun ...").
function nameLitres(p: ProductRecord): number {
  const m = p.name.match(/(\d+(?:\.\d+)?)\s*L\b/i)
  if (!m) return 0
  const n = Number(m[1])
  return Number.isFinite(n) ? Math.round(n) : 0
}

export type WaterHeaterBom = {
  heater: { product: ProductRecord; quantity: number; litres: number } | null
}

function pickWaterHeater(products: ProductRecord[], targetLitres: number) {
  const heaters = products.filter(
    (p) => p.category?.slug === 'water-heaters' && (p.stock ?? 1) > 0,
  )
  if (heaters.length === 0) return null
  // Smallest tank that meets the target; fall back to the largest available.
  const sorted = [...heaters]
    .filter((p) => nameLitres(p) > 0)
    .sort((a, b) => nameLitres(a) - nameLitres(b))
  const chosen =
    sorted.find((p) => nameLitres(p) >= targetLitres) ??
    sorted[sorted.length - 1] ??
    heaters[0]
  return { product: chosen, litres: Math.max(1, nameLitres(chosen)) }
}

export async function buildWaterHeaterBom(
  rec: WaterHeaterRecommendation,
): Promise<WaterHeaterBom> {
  const products = await getSizingProducts()
  const picked = pickWaterHeater(products, rec.recommendedLitres)
  if (!picked) return { heater: null }
  return {
    heater: { product: picked.product, quantity: rec.unitCount, litres: picked.litres },
  }
}

// ---------------------------------------------------------------------------
// Solar flood light BoM
// ---------------------------------------------------------------------------

export type FloodLightBom = {
  light: { product: ProductRecord; quantity: number; watts: number } | null
}

function pickFloodLight(products: ProductRecord[], targetWatts: number) {
  const lights = products.filter(
    (p) => p.category?.slug === 'flood-lights' && (p.stock ?? 1) > 0,
  )
  if (lights.length === 0) return null
  const sorted = [...lights]
    .filter((p) => nameWatts(p) > 0)
    .sort((a, b) => nameWatts(a) - nameWatts(b))
  // Smallest fixture that meets the target wattage; else the brightest stocked.
  const chosen =
    sorted.find((p) => nameWatts(p) >= targetWatts) ??
    sorted[sorted.length - 1] ??
    lights[0]
  return { product: chosen, watts: Math.max(1, nameWatts(chosen)) }
}

export async function buildFloodLightBom(
  rec: FloodLightRecommendation,
): Promise<FloodLightBom> {
  const products = await getSizingProducts()
  const picked = pickFloodLight(products, rec.recommendedWatts)
  if (!picked) return { light: null }
  return {
    light: { product: picked.product, quantity: rec.fixtureCount, watts: picked.watts },
  }
}
