'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Droplets } from 'lucide-react'
import {
  AUDIT_TYPE_META,
  WATER_HEATER_HEATING_LABEL,
  WATER_HEATER_USAGE_LABEL,
  type WaterHeaterNeeds,
} from '@/lib/power-audit-types'
import { computeWaterHeaterRecommendation } from '@/lib/water-heater-calculator'

type Props = {
  initial: WaterHeaterNeeds
  onBack: () => void
  onNext: (needs: WaterHeaterNeeds) => void
}

export function StepWaterHeater({ initial, onBack, onNext }: Props) {
  const [needs, setNeeds] = useState<WaterHeaterNeeds>(initial)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof WaterHeaterNeeds>(key: K, value: WaterHeaterNeeds[K]) =>
    setNeeds((prev) => ({ ...prev, [key]: value }))

  const preview = useMemo(() => computeWaterHeaterRecommendation(needs), [needs])

  const onContinue = () => {
    setError(null)
    if (!needs.household || needs.household < 1) {
      return setError('Tell us how many people are in the household.')
    }
    if (!needs.bathrooms || needs.bathrooms < 1) {
      return setError('Enter at least one bathroom.')
    }
    onNext({ ...needs, household: Math.round(needs.household), bathrooms: Math.round(needs.bathrooms) })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
            {AUDIT_TYPE_META.water_heater.needsStepTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Step 2 of 3 — we size the solar tank from your household demand.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="People in the household" required hint="Everyone who showers here regularly.">
            <input
              type="number"
              min={1}
              max={50}
              value={needs.household || ''}
              onChange={(e) => set('household', Number(e.target.value) || 0)}
              className="input"
              placeholder="e.g. 4"
            />
          </Field>
          <Field label="Number of bathrooms" required>
            <input
              type="number"
              min={1}
              max={20}
              value={needs.bathrooms || ''}
              onChange={(e) => set('bathrooms', Number(e.target.value) || 0)}
              className="input"
              placeholder="e.g. 2"
            />
          </Field>
          <Field label="Hot water usage" hint="How heavily hot water is used day to day.">
            <select
              value={needs.usage}
              onChange={(e) => set('usage', e.target.value as WaterHeaterNeeds['usage'])}
              className="input"
            >
              {(Object.keys(WATER_HEATER_USAGE_LABEL) as WaterHeaterNeeds['usage'][]).map((v) => (
                <option key={v} value={v}>
                  {WATER_HEATER_USAGE_LABEL[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Current water heating">
            <select
              value={needs.currentHeating}
              onChange={(e) =>
                set('currentHeating', e.target.value as WaterHeaterNeeds['currentHeating'])
              }
              className="input"
            >
              {(Object.keys(WATER_HEATER_HEATING_LABEL) as WaterHeaterNeeds['currentHeating'][]).map(
                (v) => (
                  <option key={v} value={v}>
                    {WATER_HEATER_HEATING_LABEL[v]}
                  </option>
                ),
              )}
            </select>
          </Field>
        </div>

        {/* Live sizing preview */}
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-800">
            <Droplets className="h-4 w-4" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-brand-900">
              Estimated:{' '}
              {preview.unitCount > 1
                ? `${preview.unitCount} × ${preview.recommendedLitres} L tanks`
                : `${preview.recommendedLitres} L tank`}
            </p>
            <p className="mt-0.5 text-xs text-fg/70">
              ~{preview.litresNeeded} L/day of hot water demand. Final sizing is confirmed on a free
              site survey.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-fg hover:border-fg/30"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continue: see my quotation <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid var(--color-border);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: var(--color-fg);
        }
        select.input {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path fill='%236b7280' d='M2 4l4 4 4-4z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2rem;
        }
      `}</style>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-fg">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  )
}
