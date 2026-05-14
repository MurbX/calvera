/**
 * Solar flood light sizing.
 *
 * Flood lights are sized by fixture wattage and count. Wattage is driven by
 * the application (how much area each point must cover), nudged by the
 * brightness preference. Count comes straight from the mounting points the
 * customer wants lit.
 *
 * Catalog fixtures come in 50 / 100 / 200 / 300 / 500 W.
 */

import type { FloodLightNeeds } from '@/lib/power-audit-types'

export type FloodLightRecommendation = {
  application: FloodLightNeeds['application']
  /** Recommended wattage per fixture. */
  recommendedWatts: number
  /** Number of fixtures (one per mounting point). */
  fixtureCount: number
  /** Poles to supply (0 if the customer already has mounting points). */
  poleCount: number
  hoursPerNight: number
  /** Combined fixture wattage across the install. */
  totalWatts: number
  notes: string[]
}

const FIXTURE_WATTS = [50, 100, 200, 300, 500]

/** Base wattage per application before the brightness nudge. */
const BASE_WATTS: Record<FloodLightNeeds['application'], number> = {
  home_compound: 100,
  parking: 200,
  security_perimeter: 100,
  commercial_yard: 300,
  sports: 500,
  signage: 200,
}

const BRIGHTNESS_STEPS: Record<FloodLightNeeds['brightness'], number> = {
  standard: 0,
  bright: 1,
  max: 2,
}

function shiftWatts(base: number, steps: number): number {
  const i = FIXTURE_WATTS.indexOf(base)
  const start = i === -1 ? 0 : i
  const next = Math.min(FIXTURE_WATTS.length - 1, Math.max(0, start + steps))
  return FIXTURE_WATTS[next]
}

export function computeFloodLightRecommendation(
  needs: FloodLightNeeds,
): FloodLightRecommendation {
  const fixtureCount = Math.max(1, Math.round(needs.mountingPoints || 1))
  const hoursPerNight = Math.min(24, Math.max(1, needs.hoursPerNight || 10))

  const base = BASE_WATTS[needs.application] ?? 100
  const recommendedWatts = shiftWatts(base, BRIGHTNESS_STEPS[needs.brightness] ?? 0)
  const poleCount = needs.hasPoles ? 0 : fixtureCount
  const totalWatts = recommendedWatts * fixtureCount

  const notes: string[] = [
    `${recommendedWatts} W per fixture suits the selected application and brightness.`,
    `${fixtureCount} fixture${fixtureCount === 1 ? '' : 's'} — one per mounting point.`,
    poleCount > 0
      ? `${poleCount} mounting pole${poleCount === 1 ? '' : 's'} included (no existing poles on site).`
      : 'Mounts on your existing poles / walls — no poles included.',
    `Each fixture is an all-in-one solar unit with its own panel and battery for ~${hoursPerNight} h/night.`,
    'Final layout (spacing, beam angle, pole height) is confirmed on a free site survey.',
  ]

  return {
    application: needs.application,
    recommendedWatts,
    fixtureCount,
    poleCount,
    hoursPerNight,
    totalWatts,
    notes,
  }
}
