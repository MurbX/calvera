'use client'

import { ArrowRight, Droplets, Lightbulb, SolarPanel } from 'lucide-react'
import { AUDIT_TYPE_META, type AuditType } from '@/lib/power-audit-types'

type Props = {
  onSelect: (type: AuditType) => void
}

const OPTIONS: {
  type: AuditType
  icon: React.ReactNode
  bullets: string[]
}[] = [
  {
    type: 'solar',
    icon: <SolarPanel className="h-6 w-6" />,
    bullets: ['Panels, inverter & batteries', 'Sized from your appliances', 'AI assistant + PDF quote'],
  },
  {
    type: 'water_heater',
    icon: <Droplets className="h-6 w-6" />,
    bullets: ['150 – 300 L solar tanks', 'Sized from your household', 'AI assistant + PDF quote'],
  },
  {
    type: 'flood_light',
    icon: <Lightbulb className="h-6 w-6" />,
    bullets: ['50 – 500 W solar fixtures', 'Sized from the area to light', 'AI assistant + PDF quote'],
  },
]

export function StepTypeSelect({ onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
          What would you like a quotation for?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pick a service — each one runs the same quick 3-step assessment.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {OPTIONS.map((opt) => {
          const meta = AUDIT_TYPE_META[opt.type]
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              className="group flex h-full flex-col rounded-2xl border border-border bg-white p-5 text-left transition hover:border-brand-700 hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-800">
                {opt.icon}
              </span>
              <h3 className="mt-4 text-base font-bold text-fg">{meta.label}</h3>
              <p className="mt-1 text-sm text-muted">{meta.tagline}</p>
              <ul className="mt-3 space-y-1.5">
                {opt.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-fg/75">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-700" />
                    {b}
                  </li>
                ))}
              </ul>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800">
                Start
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
