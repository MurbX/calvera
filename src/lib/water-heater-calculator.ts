/**
 * Solar water heater sizing.
 *
 * Solar water heaters are sized by storage volume (litres). The main driver
 * is household size; usage intensity and bathroom count adjust the figure.
 *
 * Assumptions:
 *  - Hot water per person/day: light 30 L, moderate 45 L, heavy 65 L
 *  - Each bathroom implies a baseline of ~50 L of simultaneous demand
 *  - Catalog tanks come in 150 / 200 / 300 L; larger demand uses multiple units
 */

import type { WaterHeaterNeeds } from '@/lib/power-audit-types'

export type WaterHeaterRecommendation = {
  household: number
  bathrooms: number
  /** Estimated daily hot-water demand before rounding to a tank size. */
  litresNeeded: number
  /** Tank size we recommend per unit (150 / 200 / 300). */
  recommendedLitres: number
  /** How many tanks of `recommendedLitres` to install. */
  unitCount: number
  /** Total installed capacity (recommendedLitres × unitCount). */
  totalLitres: number
  notes: string[]
}

const PER_PERSON_LITRES: Record<WaterHeaterNeeds['usage'], number> = {
  light: 30,
  moderate: 45,
  heavy: 65,
}

const TANK_SIZES = [150, 200, 300]

function nextTankSize(target: number): number {
  for (const s of TANK_SIZES) if (s >= target) return s
  return TANK_SIZES[TANK_SIZES.length - 1]
}

export function computeWaterHeaterRecommendation(
  needs: WaterHeaterNeeds,
): WaterHeaterRecommendation {
  const household = Math.max(1, Math.round(needs.household || 1))
  const bathrooms = Math.max(1, Math.round(needs.bathrooms || 1))
  const perPerson = PER_PERSON_LITRES[needs.usage] ?? PER_PERSON_LITRES.moderate

  const byHousehold = household * perPerson
  const byBathrooms = bathrooms * 50
  const litresNeeded = Math.max(byHousehold, byBathrooms)

  let recommendedLitres: number
  let unitCount: number
  if (litresNeeded <= 300) {
    recommendedLitres = nextTankSize(litresNeeded)
    unitCount = 1
  } else {
    recommendedLitres = 300
    unitCount = Math.ceil(litresNeeded / 300)
  }
  const totalLitres = recommendedLitres * unitCount

  const usageLabel =
    needs.usage === 'light' ? 'light' : needs.usage === 'heavy' ? 'heavy' : 'moderate'

  const notes: string[] = [
    `Sized for ${household} ${household === 1 ? 'person' : 'people'} at ${perPerson} L/person/day (${usageLabel} usage).`,
    `Baseline of 50 L per bathroom across ${bathrooms} bathroom${bathrooms === 1 ? '' : 's'} also considered.`,
    unitCount > 1
      ? `Demand exceeds a single tank — ${unitCount} × ${recommendedLitres} L units recommended.`
      : `A single ${recommendedLitres} L tank covers the estimated demand.`,
    'Final sizing is confirmed on a free site survey (roof pitch, plumbing runs, backup element).',
  ]

  return {
    household,
    bathrooms,
    litresNeeded: Math.round(litresNeeded),
    recommendedLitres,
    unitCount,
    totalLitres,
    notes,
  }
}
