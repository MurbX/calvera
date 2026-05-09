// Single source of truth for quotation totals so the recommendation API,
// the PDF and the chat all agree.

export const MOUNTING_KES_PER_GROUP_OF_4 = 15_000
export const INSTALLATION_RATE = 0.2 // 20% of materials

export type PricedLine = {
  name: string
  description?: string
  quantity: number
  unitPriceKes: number
  totalKes: number
}

/**
 * Panel mounting structure cost: 15,000 KES per 4 panels.
 * Partial groups are prorated — e.g. 9 panels = 2 full groups (8) + 1 panel
 * remainder = 30,000 + (15,000/4) = 33,750.
 */
export function mountingCostKes(panelQuantity: number): number {
  const qty = Math.max(0, Math.floor(panelQuantity))
  return Math.round((qty / 4) * MOUNTING_KES_PER_GROUP_OF_4)
}

/**
 * Installation cost: a flat percentage of the materials subtotal (panels
 * + inverter + battery + mounting structure).
 */
export function installationCostKes(materialsSubtotalKes: number): number {
  return Math.round(materialsSubtotalKes * INSTALLATION_RATE)
}

/**
 * Sum a BoM into a structured price breakdown. Pass any of `panel`,
 * `inverter`, `battery` as `null` if the catalog doesn't currently stock
 * a matching item.
 */
export function priceBreakdown(args: {
  panel: { name: string; quantity: number; unitPriceKes: number; totalWatts?: number } | null
  inverter: { name: string; quantity: number; unitPriceKes: number } | null
  battery: { name: string; quantity: number; unitPriceKes: number; totalWh?: number } | null
}) {
  const lines: PricedLine[] = []

  if (args.panel) {
    lines.push({
      name: args.panel.name,
      description: args.panel.totalWatts
        ? `${args.panel.quantity}× module · ${args.panel.totalWatts}W total`
        : undefined,
      quantity: args.panel.quantity,
      unitPriceKes: args.panel.unitPriceKes,
      totalKes: args.panel.unitPriceKes * args.panel.quantity,
    })
  }
  if (args.inverter) {
    lines.push({
      name: args.inverter.name,
      quantity: args.inverter.quantity,
      unitPriceKes: args.inverter.unitPriceKes,
      totalKes: args.inverter.unitPriceKes * args.inverter.quantity,
    })
  }
  if (args.battery) {
    lines.push({
      name: args.battery.name,
      description: args.battery.totalWh
        ? `${(args.battery.totalWh / 1000).toFixed(2)} kWh total storage`
        : undefined,
      quantity: args.battery.quantity,
      unitPriceKes: args.battery.unitPriceKes,
      totalKes: args.battery.unitPriceKes * args.battery.quantity,
    })
  }

  // Panel mounting structure — 15k per 4 panels, prorated for remainders.
  const panelQty = args.panel?.quantity ?? 0
  const mountingTotal = mountingCostKes(panelQty)
  if (mountingTotal > 0) {
    lines.push({
      name: 'Solar mounting structure',
      description: `Roof rails / brackets sized for ${panelQty} panel${panelQty === 1 ? '' : 's'}`,
      quantity: panelQty,
      unitPriceKes: Math.round(MOUNTING_KES_PER_GROUP_OF_4 / 4),
      totalKes: mountingTotal,
    })
  }

  const materialsSubtotalKes = lines.reduce((s, l) => s + l.totalKes, 0)
  const installationKes = installationCostKes(materialsSubtotalKes)

  if (installationKes > 0) {
    lines.push({
      name: 'Professional installation',
      description: '20% of materials · vetted installer · site survey · commissioning',
      quantity: 1,
      unitPriceKes: installationKes,
      totalKes: installationKes,
    })
  }

  const subtotalKes = lines.reduce((s, l) => s + l.totalKes, 0)

  return {
    lines,
    materialsSubtotalKes,
    mountingKes: mountingTotal,
    installationKes,
    subtotalKes,
  }
}
