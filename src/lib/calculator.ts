/**
 * Solar system sizing for Kenya.
 *
 * Assumptions used in the math (call them out in the PDF):
 *  - Average peak sun hours: 5 (Kenya equator average — conservative)
 *  - System losses (wiring, dust, temperature, charge controller): 30%
 *  - Battery depth-of-discharge for lithium: 80% (use 1.25× factor)
 *  - Inverter buffer over peak load: 25%
 *  - Days of autonomy: 1.0 (one cloudy day backup)
 */

export type ApplianceInput = {
  name: string
  wattage: number
  quantity: number
  hoursPerDay: number
}

export type Recommendation = {
  totalConnectedWatts: number
  dailyEnergyWh: number
  panelWattsTotal: number
  inverterWatts: number
  batteryWh: number
  estimatedPriceKes: number
  notes: string[]
}

const PEAK_SUN_HOURS = 5
const SYSTEM_LOSSES = 1.3
const INVERTER_BUFFER = 1.25
const BATTERY_DOD_FACTOR = 1.25
const DAYS_OF_AUTONOMY = 1

const STANDARD_INVERTER_SIZES = [500, 1000, 1500, 2000, 3000, 5000, 8000, 10000]
const STANDARD_PANEL_TOTALS = [200, 400, 600, 1000, 1500, 2000, 3000, 5000, 8000, 10000]
const STANDARD_BATTERY_WH = [1200, 2400, 4800, 7200, 10000, 15000, 20000]

const PRICE_PER_PANEL_WATT = 50
const PRICE_PER_INVERTER_WATT = 25
const PRICE_PER_BATTERY_WH = 30
const INSTALLATION_FLAT = 25000

function nextSize(target: number, sizes: number[]) {
  for (const s of sizes) if (s >= target) return s
  return sizes[sizes.length - 1]
}

export function computeRecommendation(appliances: ApplianceInput[]): Recommendation {
  const totalConnectedWatts = appliances.reduce(
    (sum, a) => sum + (a.wattage || 0) * (a.quantity || 0),
    0,
  )
  const dailyEnergyWh = appliances.reduce(
    (sum, a) => sum + (a.wattage || 0) * (a.quantity || 0) * (a.hoursPerDay || 0),
    0,
  )

  const panelWattsRaw = (dailyEnergyWh / PEAK_SUN_HOURS) * SYSTEM_LOSSES
  const inverterWattsRaw = totalConnectedWatts * INVERTER_BUFFER
  const batteryWhRaw = dailyEnergyWh * BATTERY_DOD_FACTOR * DAYS_OF_AUTONOMY

  const panelWattsTotal = nextSize(panelWattsRaw, STANDARD_PANEL_TOTALS)
  const inverterWatts = nextSize(inverterWattsRaw, STANDARD_INVERTER_SIZES)
  const batteryWh = nextSize(batteryWhRaw, STANDARD_BATTERY_WH)

  const estimatedPriceKes =
    panelWattsTotal * PRICE_PER_PANEL_WATT +
    inverterWatts * PRICE_PER_INVERTER_WATT +
    batteryWh * PRICE_PER_BATTERY_WH +
    INSTALLATION_FLAT

  const notes: string[] = [
    `Sized for ${PEAK_SUN_HOURS} peak sun hours/day (Kenya average).`,
    `Includes ${Math.round((SYSTEM_LOSSES - 1) * 100)}% allowance for system losses.`,
    `Inverter has a ${Math.round((INVERTER_BUFFER - 1) * 100)}% buffer over peak load.`,
    `Battery sized for ${DAYS_OF_AUTONOMY} day(s) of autonomy at ${Math.round((1 / BATTERY_DOD_FACTOR) * 100)}% DoD.`,
    'Final price depends on chosen brands, mounting, cabling and site conditions.',
  ]

  return {
    totalConnectedWatts: Math.round(totalConnectedWatts),
    dailyEnergyWh: Math.round(dailyEnergyWh),
    panelWattsTotal,
    inverterWatts,
    batteryWh,
    estimatedPriceKes: Math.round(estimatedPriceKes / 1000) * 1000,
    notes,
  }
}

export const APPLIANCE_PRESETS: ApplianceInput[] = [
  { name: 'LED bulb', wattage: 8, quantity: 8, hoursPerDay: 5 },
  { name: 'TV (LED)', wattage: 80, quantity: 1, hoursPerDay: 4 },
  { name: 'Refrigerator', wattage: 150, quantity: 1, hoursPerDay: 8 },
  { name: 'Laptop', wattage: 65, quantity: 1, hoursPerDay: 4 },
  { name: 'Wi-Fi router', wattage: 12, quantity: 1, hoursPerDay: 24 },
  { name: 'Phone charger', wattage: 10, quantity: 2, hoursPerDay: 3 },
  { name: 'Ceiling fan', wattage: 60, quantity: 1, hoursPerDay: 6 },
  { name: 'Microwave', wattage: 1000, quantity: 1, hoursPerDay: 0.5 },
  { name: 'Iron box', wattage: 1000, quantity: 1, hoursPerDay: 0.5 },
  { name: 'Electric kettle', wattage: 1500, quantity: 1, hoursPerDay: 0.25 },
  { name: 'Water pump', wattage: 750, quantity: 1, hoursPerDay: 1 },
  { name: 'CCTV camera', wattage: 10, quantity: 4, hoursPerDay: 24 },
  { name: 'Desktop PC', wattage: 250, quantity: 1, hoursPerDay: 6 },
  { name: 'Welder (small)', wattage: 4000, quantity: 1, hoursPerDay: 0.5 },
]
