'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2, Download, ArrowRight } from 'lucide-react'
import { formatKes } from '@/lib/utils'
import {
  APPLIANCE_PRESETS,
  computeRecommendation,
  type ApplianceInput,
} from '@/lib/calculator'

type FormState = {
  name: string
  phone: string
  email: string
  location: string
  appliances: (ApplianceInput & { id: string })[]
}

const newId = () => Math.random().toString(36).slice(2, 9)

const STARTER_APPLIANCES = [
  { ...APPLIANCE_PRESETS[0], id: newId() },
  { ...APPLIANCE_PRESETS[1], id: newId() },
  { ...APPLIANCE_PRESETS[2], id: newId() },
]

export function CalculatorForm() {
  const [state, setState] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    location: 'Nairobi',
    appliances: STARTER_APPLIANCES,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recommendation = useMemo(
    () => computeRecommendation(state.appliances),
    [state.appliances],
  )

  const updateAppliance = (id: string, patch: Partial<ApplianceInput>) =>
    setState((s) => ({
      ...s,
      appliances: s.appliances.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }))

  const removeAppliance = (id: string) =>
    setState((s) => ({ ...s, appliances: s.appliances.filter((a) => a.id !== id) }))

  const addPreset = (preset: ApplianceInput) =>
    setState((s) => ({
      ...s,
      appliances: [...s.appliances, { ...preset, id: newId() }],
    }))

  const addBlank = () =>
    setState((s) => ({
      ...s,
      appliances: [
        ...s.appliances,
        { id: newId(), name: '', wattage: 0, quantity: 1, hoursPerDay: 4 },
      ],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleaned = state.appliances
      .map(({ id: _id, ...a }) => a)
      .filter((a) => a.name.trim() && a.wattage > 0 && a.quantity > 0)

    if (!state.name.trim() || !state.phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }
    if (cleaned.length === 0) {
      setError('Add at least one appliance.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/calculator/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name,
          phone: state.phone,
          email: state.email || undefined,
          location: state.location || undefined,
          appliances: cleaned,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Quote failed (HTTP ${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `calvera-quotation-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSubmitted(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalAppliances = state.appliances.length

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-lg font-bold text-fg">Your details</h2>
          <p className="mt-1 text-sm text-muted">
            We'll send the quotation as a PDF and our team will follow up on WhatsApp/email.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input
                type="text"
                value={state.name}
                onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                required
                className="input"
                placeholder="Brian Mutuku"
              />
            </Field>
            <Field label="Phone (M-Pesa)" required>
              <input
                type="tel"
                value={state.phone}
                onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
                required
                className="input"
                placeholder="+254 7XX XXX XXX"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={state.email}
                onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={state.location}
                onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
                className="input"
                placeholder="Nairobi"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-fg">Your appliances</h2>
              <p className="mt-1 text-sm text-muted">
                Add what you actually use. Tweak hours per day for accuracy.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              {totalAppliances} {totalAppliances === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {APPLIANCE_PRESETS.map((p) => (
              <button
                type="button"
                key={p.name}
                onClick={() => addPreset(p)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-soft px-3 py-1.5 text-xs font-medium text-fg/80 hover:border-brand-300 hover:text-fg"
              >
                <Plus className="h-3 w-3" /> {p.name}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {state.appliances.map((a) => (
              <div
                key={a.id}
                className="grid items-center gap-3 rounded-xl border border-border bg-soft p-3 sm:grid-cols-[1.5fr_repeat(3,1fr)_auto]"
              >
                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => updateAppliance(a.id, { name: e.target.value })}
                  className="input bg-white"
                  placeholder="Appliance name"
                />
                <NumberField
                  label="Watts"
                  value={a.wattage}
                  onChange={(v) => updateAppliance(a.id, { wattage: v })}
                />
                <NumberField
                  label="Qty"
                  value={a.quantity}
                  onChange={(v) => updateAppliance(a.id, { quantity: v })}
                />
                <NumberField
                  label="Hrs/day"
                  value={a.hoursPerDay}
                  step={0.25}
                  onChange={(v) => updateAppliance(a.id, { hoursPerDay: v })}
                />
                <button
                  type="button"
                  aria-label="Remove appliance"
                  onClick={() => removeAppliance(a.id)}
                  className="grid h-9 w-9 place-items-center rounded-full text-fg/50 hover:bg-white hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addBlank}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-white px-4 py-2 text-sm font-medium text-fg/70 hover:border-fg/30 hover:text-fg"
          >
            <Plus className="h-4 w-4" /> Add custom appliance
          </button>
        </section>

        <style jsx>{`
          .input {
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid var(--color-border);
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            background: white;
          }
          .input:focus {
            border-color: var(--color-fg);
          }
        `}</style>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl bg-brand-800 p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
            Recommended system
          </p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
            {recommendation.panelWattsTotal === 0
              ? 'Add appliances to see your size'
              : `${(recommendation.panelWattsTotal / 1000).toFixed(1)}kW Solar System`}
          </h3>

          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Total connected load" value={`${recommendation.totalConnectedWatts.toLocaleString()} W`} />
            <Row label="Daily energy use" value={`${recommendation.dailyEnergyWh.toLocaleString()} Wh`} />
            <Row label="Recommended panels" value={`${recommendation.panelWattsTotal.toLocaleString()} W`} />
            <Row label="Recommended inverter" value={`${recommendation.inverterWatts.toLocaleString()} W`} />
            <Row label="Recommended battery" value={`${recommendation.batteryWh.toLocaleString()} Wh`} />
          </dl>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs uppercase tracking-wider text-white/60">Estimated price</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatKes(recommendation.estimatedPriceKes)}
            </p>
            <p className="mt-1 text-xs text-white/70">Includes basic installation</p>
          </div>

          <button
            type="submit"
            disabled={submitting || recommendation.dailyEnergyWh === 0}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-brand-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Generating quotation…' : (
              <>
                <Download className="h-4 w-4" />
                Download Quotation PDF
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 rounded-lg bg-rose-500/20 px-3 py-2 text-xs text-rose-100">
              {error}
            </p>
          )}
          {submitted && !error && (
            <p className="mt-3 rounded-lg bg-amber-400/20 px-3 py-2 text-xs text-amber-100">
              Quotation downloaded ✓ — our team will reach out shortly.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-white p-5 text-sm">
          <p className="font-semibold text-fg">Why these numbers?</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted">
            {recommendation.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
            Live update <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </aside>
    </form>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-white/70">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-fg">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input bg-white"
      />
    </label>
  )
}
