'use client'

import { useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import {
  AUDIT_TYPE_META,
  BILL_LABEL,
  ROOFTOP_LABEL,
  type AuditType,
  type PowerAuditLead,
} from '@/lib/power-audit-types'

type Props = {
  initial: PowerAuditLead
  auditType: AuditType
  onSaved: (leadId: number | string, lead: PowerAuditLead) => void
}

export function StepLead({ initial, auditType, onSaved }: Props) {
  const meta = AUDIT_TYPE_META[auditType]
  const [lead, setLead] = useState<PowerAuditLead>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof PowerAuditLead>(key: K, value: PowerAuditLead[K]) =>
    setLead((prev) => ({ ...prev, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!lead.name.trim()) return setError('Please enter your name.')
    if (lead.phone.replace(/\D/g, '').length < 9)
      return setError('Please enter a valid phone number.')

    setSubmitting(true)
    try {
      const res = await fetch('/api/power-audit/lead-upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, service: auditType }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
      onSaved(body.leadId, lead)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-white p-5 sm:p-7">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
          Start your {meta.label.toLowerCase()} assessment
        </h2>
        <p className="mt-1 text-sm text-muted">Step 1 of 3 — tell us about you.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            type="text"
            autoComplete="name"
            required
            value={lead.name}
            onChange={(e) => set('name', e.target.value)}
            className="input"
            placeholder="Brian Mutuku"
          />
        </Field>
        <Field label="Phone (Mobile money)" required hint="We send order updates here.">
          <input
            type="tel"
            autoComplete="tel"
            required
            value={lead.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="input"
            placeholder="Your phone number"
          />
        </Field>
        <Field label="Email" hint="For the PDF quotation we'll generate.">
          <input
            type="email"
            autoComplete="email"
            value={lead.email}
            onChange={(e) => set('email', e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Property address" hint="Town / estate is enough.">
          <input
            type="text"
            value={lead.address}
            onChange={(e) => set('address', e.target.value)}
            className="input"
            placeholder="e.g. your neighbourhood or town"
          />
        </Field>
        <Field label="Average monthly electricity bill">
          <select
            value={lead.monthlyBill}
            onChange={(e) => set('monthlyBill', e.target.value as PowerAuditLead['monthlyBill'])}
            className="input"
          >
            {(Object.keys(BILL_LABEL) as PowerAuditLead['monthlyBill'][]).map((v) => (
              <option key={v} value={v}>
                {BILL_LABEL[v]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rooftop type">
          <select
            value={lead.rooftopType}
            onChange={(e) => set('rooftopType', e.target.value as PowerAuditLead['rooftopType'])}
            className="input"
          >
            {(Object.keys(ROOFTOP_LABEL) as PowerAuditLead['rooftopType'][]).map((v) => (
              <option key={v} value={v}>
                {ROOFTOP_LABEL[v]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-soft px-3 py-2.5 text-xs text-fg/70">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
        We only use these details to size your system and send the quotation. We won&apos;t
        share them with anyone else.
      </p>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? 'Saving…' : <>Next: {meta.needsStepLabel} <ArrowRight className="h-4 w-4" /></>}
      </button>

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
    </form>
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
