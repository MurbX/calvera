'use client'

import { useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { APPLIANCE_PRESETS } from '@/lib/calculator'
import type { PowerAuditAppliance } from '@/lib/power-audit-types'

type Props = {
  initial: PowerAuditAppliance[]
  onBack: () => void
  onNext: (appliances: PowerAuditAppliance[]) => void
}

const newId = () => Math.random().toString(36).slice(2, 9)

export function StepAppliances({ initial, onBack, onNext }: Props) {
  const [appliances, setAppliances] = useState<PowerAuditAppliance[]>(initial)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const totals = useMemo(() => {
    const dailyWh = appliances.reduce(
      (s, a) => s + (a.wattage || 0) * (a.quantity || 0) * (a.hoursPerDay || 0),
      0,
    )
    const peakW = appliances.reduce((s, a) => s + (a.wattage || 0) * (a.quantity || 0), 0)
    return { dailyWh: Math.round(dailyWh), peakW: Math.round(peakW) }
  }, [appliances])

  const update = (id: string, patch: Partial<PowerAuditAppliance>) =>
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const remove = (id: string) =>
    setAppliances((prev) => prev.filter((a) => a.id !== id))

  const addBlank = () =>
    setAppliances((prev) => [
      ...prev,
      { id: newId(), name: '', wattage: 0, quantity: 1, hoursPerDay: 0, source: 'manual' },
    ])

  const addPreset = (preset: typeof APPLIANCE_PRESETS[number]) =>
    setAppliances((prev) => [...prev, { ...preset, id: newId(), source: 'manual' }])

  const onPickPhoto = () => {
    setExtractError(null)
    fileInputRef.current?.click()
  }

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return

    setExtracting(true)
    setExtractError(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/power-audit/extract-label', {
        method: 'POST',
        body: fd,
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)

      // Build object URL just for in-page preview (no upload to storage yet)
      const photoUrl = URL.createObjectURL(file)
      setAppliances((prev) => [
        ...prev,
        {
          id: newId(),
          name: body.name ?? 'Unknown',
          wattage: Number(body.wattage) || 0,
          quantity: Number(body.quantity) || 1,
          hoursPerDay: Number(body.hoursPerDay) || 0,
          source: 'photo',
          photoUrl,
        },
      ])
    } catch (err) {
      setExtractError((err as Error).message)
    } finally {
      setExtracting(false)
    }
  }

  const onContinue = () => {
    const valid = appliances.filter((a) => a.name.trim() && a.wattage > 0 && a.quantity > 0)
    if (valid.length === 0) {
      setExtractError('Add at least one appliance with a wattage and quantity.')
      return
    }
    onNext(valid)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
              Tell us how to define your power needs
            </h2>
            <p className="mt-1 text-sm text-muted">
              Step 2 of 3 — list your appliances or snap a photo of any nameplate.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => addBlank()}
            className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 text-left transition hover:border-fg/30"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-fg">Add manually</p>
              <p className="mt-0.5 text-xs text-muted">
                Type the appliance name, watts, qty and daily hours.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onPickPhoto}
            disabled={extracting}
            className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 text-left transition hover:border-fg/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
              {extracting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </span>
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm font-bold text-fg">
                Take photo of appliance label
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {extracting
                  ? 'Reading the label…'
                  : 'Snap the rating sticker — AI extracts the wattage automatically.'}
              </p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhotoChange}
            className="hidden"
          />
        </div>

        {extractError && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {extractError}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border bg-soft px-4 py-3 sm:px-6">
          <p className="text-sm font-bold text-fg">Appliance list</p>
        </div>

        {/* Mobile: stacked cards */}
        <div className="divide-y divide-border md:hidden">
          {appliances.map((a, i) => (
            <ApplianceCard key={a.id} index={i + 1} appliance={a} onChange={(p) => update(a.id, p)} onRemove={() => remove(a.id)} />
          ))}
          {appliances.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">No appliances yet.</p>
          )}
        </div>

        {/* md+: table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-border bg-soft/50">
                <th className="w-10 px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left font-semibold">Appliance</th>
                <th className="w-28 px-3 py-2 text-left font-semibold">Watts</th>
                <th className="w-20 px-3 py-2 text-left font-semibold">Qty</th>
                <th className="w-28 px-3 py-2 text-left font-semibold">Hours/day</th>
                <th className="w-32 px-3 py-2 text-right font-semibold">Daily kWh</th>
                <th className="w-10 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {appliances.map((a, i) => {
                const dailyKwh = ((a.wattage * a.quantity * a.hoursPerDay) / 1000).toFixed(2)
                return (
                  <tr key={a.id} className="border-t border-border first:border-t-0">
                    <td className="px-3 py-2 align-middle text-xs text-muted">
                      <span className="inline-flex items-center gap-2">
                        {i + 1}
                        {a.source === 'photo' && (
                          <span title="From photo" className="grid h-5 w-5 place-items-center rounded-full bg-amber-100 text-amber-800">
                            <Camera className="h-3 w-3" />
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} className="cell" placeholder="Appliance name" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} value={a.wattage || ''} onChange={(e) => update(a.id, { wattage: Number(e.target.value) || 0 })} className="cell" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={1} value={a.quantity || ''} onChange={(e) => update(a.id, { quantity: Number(e.target.value) || 1 })} className="cell" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} max={24} step={0.25} value={a.hoursPerDay || ''} onChange={(e) => update(a.id, { hoursPerDay: Number(e.target.value) || 0 })} className="cell" />
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-sm font-semibold text-fg">
                      {dailyKwh}
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => remove(a.id)} aria-label="Remove" className="grid h-8 w-8 place-items-center rounded-full text-fg/50 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-soft/30 px-4 py-3 text-xs sm:px-6">
          <button type="button" onClick={addBlank} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 font-medium text-fg/85 hover:border-fg/30">
            <Plus className="h-3.5 w-3.5" /> Add appliance
          </button>
          <div className="text-right">
            <p className="text-muted">Daily energy</p>
            <p className="text-base font-extrabold text-brand-800">
              {(totals.dailyWh / 1000).toFixed(2)} kWh
            </p>
          </div>
        </div>
      </div>

      <details className="rounded-2xl border border-border bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold text-fg">
          Common appliances · tap to add
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {APPLIANCE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => addPreset(p)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-fg/80 transition hover:border-fg/30"
            >
              <Plus className="h-3 w-3" /> {p.name} <span className="text-muted">({p.wattage}W)</span>
            </button>
          ))}
        </div>
      </details>

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
        .cell {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          padding: 0.45rem 0.65rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .cell:focus {
          border-color: var(--color-fg);
        }
      `}</style>

      <input type="hidden" data-cells />
    </div>
  )
}

function ApplianceCard({
  index,
  appliance,
  onChange,
  onRemove,
}: {
  index: number
  appliance: PowerAuditAppliance
  onChange: (patch: Partial<PowerAuditAppliance>) => void
  onRemove: () => void
}) {
  const dailyKwh = ((appliance.wattage * appliance.quantity * appliance.hoursPerDay) / 1000).toFixed(2)
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          #{index}
          {appliance.source === 'photo' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              <Camera className="h-3 w-3" /> photo
            </span>
          )}
        </span>
        <button type="button" onClick={onRemove} aria-label="Remove" className="grid h-8 w-8 place-items-center rounded-full text-fg/50 hover:bg-rose-50 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <input
        value={appliance.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Appliance name"
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-fg"
      />
      <div className="grid grid-cols-3 gap-2">
        <Field label="Watts">
          <input type="number" min={0} value={appliance.wattage || ''} onChange={(e) => onChange({ wattage: Number(e.target.value) || 0 })} className="cell-inline" />
        </Field>
        <Field label="Qty">
          <input type="number" min={1} value={appliance.quantity || ''} onChange={(e) => onChange({ quantity: Number(e.target.value) || 1 })} className="cell-inline" />
        </Field>
        <Field label="Hrs/day">
          <input type="number" min={0} max={24} step={0.25} value={appliance.hoursPerDay || ''} onChange={(e) => onChange({ hoursPerDay: Number(e.target.value) || 0 })} className="cell-inline" />
        </Field>
      </div>
      <p className="text-xs text-muted">
        Daily energy: <span className="font-mono font-semibold text-fg">{dailyKwh} kWh</span>
      </p>
      <style jsx>{`
        .cell-inline {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          padding: 0.4rem 0.55rem;
          font-size: 0.85rem;
          outline: none;
          background: white;
        }
        .cell-inline:focus {
          border-color: var(--color-fg);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  )
}

// upload icon export so it's imported (TS hint)
export const _Upload = Upload
