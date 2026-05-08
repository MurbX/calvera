/**
 * Delivery-estimate helper.
 *
 * Rule of thumb (matches Calvera's actual SLA):
 *   - Order before 13:00 EAT, weekday → same-day Nairobi delivery
 *   - Order after 13:00 → next business day in Nairobi
 *   - Saturday cut-off is 11:00, no Sunday delivery
 *   - Outside Nairobi → 1–3 business days via courier
 */

const TZ = 'Africa/Nairobi'

const WEEKDAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

function nowInNairobi(): { date: Date; weekday: number; hour: number; minute: number } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  const wd: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    date: now,
    weekday: wd[map.weekday as string] ?? 1,
    hour: Number(map.hour ?? 0),
    minute: Number(map.minute ?? 0),
  }
}

export type DeliveryEstimate = {
  /** Short headline, e.g. "Get it today in Nairobi" */
  headline: string
  /** Subline with cut-off countdown or next-business-day note */
  subline: string
}

export function getDeliveryEstimate(): DeliveryEstimate {
  const { weekday, hour, minute } = nowInNairobi()
  const isWeekday = weekday >= 1 && weekday <= 5
  const isSaturday = weekday === 6
  const isSunday = weekday === 0
  const cutoff = isSaturday ? 11 : 13
  const beforeCutoff = hour < cutoff
  const minsUntilCutoff = beforeCutoff ? (cutoff - hour) * 60 - minute : 0

  if (isSunday) {
    return {
      headline: 'Delivered Monday in Nairobi',
      subline: 'Sundays we rest — orders placed today ship Monday morning.',
    }
  }

  if ((isWeekday || isSaturday) && beforeCutoff) {
    const h = Math.floor(minsUntilCutoff / 60)
    const m = minsUntilCutoff % 60
    return {
      headline: 'Get it today in Nairobi',
      subline: `Order in the next ${h}h ${m}m for same-day delivery.`,
    }
  }

  // After cut-off → next business day
  const next = (() => {
    if (isSaturday) return 'Monday'
    if (weekday === 5) return 'Monday'
    return WEEKDAY_NAMES[(weekday + 1) % 7]
  })()
  return {
    headline: `Delivered ${next} in Nairobi`,
    subline: 'Cut-off has passed — your order goes out first thing the next business day.',
  }
}
