'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react'
import {
  AUDIT_TYPE_META,
  FLOOD_LIGHT_APPLICATION_LABEL,
  FLOOD_LIGHT_BRIGHTNESS_LABEL,
  type FloodLightNeeds,
} from '@/lib/power-audit-types'
import { computeFloodLightRecommendation } from '@/lib/flood-light-calculator'

type Props = {
  initial: FloodLightNeeds
  onBack: () => void
  onNext: (needs: FloodLightNeeds) => void
}

export function StepFloodLight({ initial, onBack, onNext }: Props) {
  const [needs, setNeeds] = useState<FloodLightNeeds>(initial)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FloodLightNeeds>(key: K, value: FloodLightNeeds[K]) =>
    setNeeds((prev) => ({ ...prev, [key]: value }))

  const preview = useMemo(() => computeFloodLightRecommendation(needs), [needs])

  const onContinue = () => {
    setError(null)
    if (!needs.mountingPoints || needs.mountingPoints < 1) {
      return setError('Tell us how many mounting points / poles you need lit.')
    }
    onNext({ ...needs, mountingPoints: Math.round(needs.mountingPoints) })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
            {AUDIT_TYPE_META.flood_light.needsStepTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Step 2 of 3 — we size the fixtures from the area you want to light.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="What are you lighting?" required>
            <select
              value={needs.application}
              onChange={(e) =>
                set('application', e.target.value as FloodLightNeeds['application'])
              }
              className="input"
            >
              {(Object.keys(FLOOD_LIGHT_APPLICATION_LABEL) as FloodLightNeeds['application'][]).map(
                (v) => (
                  <option key={v} value={v}>
                    {FLOOD_LIGHT_APPLICATION_LABEL[v]}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field
            label="Mounting points to light"
            required
            hint="One fixture goes on each pole or wall point."
          >
            <input
              type="number"
              min={1}
              max={200}
              value={needs.mountingPoints || ''}
              onChange={(e) => set('mountingPoints', Number(e.target.value) || 0)}
              className="input"
              placeholder="e.g. 4"
            />
          </Field>
          <Field label="Brightness level">
            <select
              value={needs.brightness}
              onChange={(e) => set('brightness', e.target.value as FloodLightNeeds['brightness'])}
              className="input"
            >
              {(Object.keys(FLOOD_LIGHT_BRIGHTNESS_LABEL) as FloodLightNeeds['brightness'][]).map(
                (v) => (
                  <option key={v} value={v}>
                    {FLOOD_LIGHT_BRIGHTNESS_LABEL[v]}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Hours lit per night" hint="Most solar units run dusk-to-dawn (~10–12 h).">
            <input
              type="number"
              min={1}
              max={24}
              value={needs.hoursPerNight || ''}
              onChange={(e) => set('hoursPerNight', Number(e.target.value) || 0)}
              className="input"
              placeholder="e.g. 10"
            />
          </Field>
        </div>

        {/* Poles toggle */}
        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-semibold text-fg">
            Do you already have poles / walls to mount on?
          </span>
          <div className="inline-flex rounded-full border border-border bg-white p-1">
            <button
              type="button"
              onClick={() => set('hasPoles', true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                needs.hasPoles ? 'bg-brand-800 text-white' : 'text-fg/70 hover:text-fg'
              }`}
            >
              Yes, I have them
            </button>
            <button
              type="button"
              onClick={() => set('hasPoles', false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                !needs.hasPoles ? 'bg-brand-800 text-white' : 'text-fg/70 hover:text-fg'
              }`}
            >
              No, include poles
            </button>
          </div>
        </div>

        {/* Live sizing preview */}
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-800">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-brand-900">
              Estimated: {preview.fixtureCount} × {preview.recommendedWatts} W solar flood light
              {preview.fixtureCount === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 text-xs text-fg/70">
              {preview.totalWatts} W total output
              {preview.poleCount > 0
                ? ` · ${preview.poleCount} mounting pole${preview.poleCount === 1 ? '' : 's'} included`
                : ' · using your existing poles'}
              . Final layout is confirmed on a free site survey.
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
