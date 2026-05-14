'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Pencil, Plus, Star, Trash2, X } from 'lucide-react'

export type Address = {
  id?: string
  label?: string
  recipientName?: string
  phone?: string
  line1: string
  line2?: string
  city: string
  county?: string
  postalCode?: string
  landmark?: string
  notes?: string
  isDefaultShipping?: boolean
  isDefaultBilling?: boolean
}

type Props = {
  customerId: number | string
  initialAddresses: Address[]
}

const EMPTY: Address = {
  label: '',
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  county: '',
  postalCode: '',
  landmark: '',
  notes: '',
  isDefaultShipping: false,
  isDefaultBilling: false,
}

export function AddressesManager({ customerId, initialAddresses }: Props) {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [editingIndex, setEditingIndex] = useState<number | 'new' | null>(null)
  const [draft, setDraft] = useState<Address>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startNew = () => {
    setDraft(EMPTY)
    setEditingIndex('new')
    setError(null)
  }

  const startEdit = (i: number) => {
    setDraft(addresses[i])
    setEditingIndex(i)
    setError(null)
  }

  const cancel = () => {
    setEditingIndex(null)
    setDraft(EMPTY)
    setError(null)
  }

  const persist = async (next: Address[]) => {
    setSaving(true)
    setError(null)
    try {
      // If a new address is marked default, clear that flag on others
      const cleaned = next.map((a, i) => ({
        ...a,
        isDefaultShipping:
          a.isDefaultShipping &&
          !next.some((b, j) => j !== i && b.isDefaultShipping && j > i),
        isDefaultBilling:
          a.isDefaultBilling &&
          !next.some((b, j) => j !== i && b.isDefaultBilling && j > i),
      }))
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ addresses: cleaned }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.errors?.[0]?.message ?? `Save failed (HTTP ${res.status})`)
      }
      const body = await res.json()
      const updated = (body?.doc?.addresses ?? cleaned) as Address[]
      setAddresses(updated)
      setEditingIndex(null)
      setDraft(EMPTY)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    if (!draft.line1.trim() || !draft.city.trim()) {
      setError('Address line 1 and city are required.')
      return
    }
    let next: Address[]
    if (editingIndex === 'new') {
      next = [...addresses, draft]
    } else if (typeof editingIndex === 'number') {
      next = addresses.map((a, i) => (i === editingIndex ? draft : a))
    } else {
      return
    }

    // If this address is the new default, unset it on others
    if (draft.isDefaultShipping) {
      next = next.map((a, i) => ({
        ...a,
        isDefaultShipping:
          editingIndex === 'new' ? i === next.length - 1 : i === editingIndex,
      }))
    }
    if (draft.isDefaultBilling) {
      next = next.map((a, i) => ({
        ...a,
        isDefaultBilling:
          editingIndex === 'new' ? i === next.length - 1 : i === editingIndex,
      }))
    }
    await persist(next)
  }

  const remove = async (i: number) => {
    if (!confirm('Delete this address? This cannot be undone.')) return
    const next = addresses.filter((_, idx) => idx !== i)
    await persist(next)
  }

  const setDefault = async (i: number, kind: 'shipping' | 'billing') => {
    const next = addresses.map((a, idx) => ({
      ...a,
      isDefaultShipping:
        kind === 'shipping' ? idx === i : a.isDefaultShipping,
      isDefaultBilling: kind === 'billing' ? idx === i : a.isDefaultBilling,
    }))
    await persist(next)
  }

  if (addresses.length === 0 && editingIndex === null) {
    return (
      <div className="mt-6">
        <div className="rounded-2xl bg-soft p-10 text-center">
          <p className="text-base font-bold text-fg">No saved addresses</p>
          <p className="mt-1 text-sm text-muted">
            Save delivery addresses for faster checkout.
          </p>
          <button
            type="button"
            onClick={startNew}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Add your first address
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {addresses.map((a, i) => (
        <div key={i} className="rounded-2xl border border-border bg-white p-5">
          {editingIndex === i ? (
            <AddressForm
              draft={draft}
              setDraft={setDraft}
              onSave={save}
              onCancel={cancel}
              saving={saving}
              error={error}
            />
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-fg">{a.label || 'Address'}</p>
                  {a.isDefaultShipping && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-800">
                      <Star className="h-3 w-3 fill-current" /> Default shipping
                    </span>
                  )}
                  {a.isDefaultBilling && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      Default billing
                    </span>
                  )}
                </div>
                {a.recipientName && (
                  <p className="mt-1 text-sm font-semibold text-fg">{a.recipientName}</p>
                )}
                <p className="mt-1 text-sm text-fg/80">{a.line1}</p>
                {a.line2 && <p className="text-sm text-fg/80">{a.line2}</p>}
                <p className="text-sm text-fg/80">
                  {[a.city, a.county].filter(Boolean).join(', ')}
                  {a.postalCode ? ` · ${a.postalCode}` : ''}
                </p>
                {a.landmark && (
                  <p className="mt-1 text-xs italic text-muted">"{a.landmark}"</p>
                )}
                {a.phone && <p className="mt-1 text-xs text-muted">📞 {a.phone}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!a.isDefaultShipping && (
                  <button
                    type="button"
                    onClick={() => setDefault(i, 'shipping')}
                    disabled={saving}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-fg hover:border-brand-700 hover:text-brand-700 disabled:opacity-50"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  className="grid h-8 w-8 place-items-center rounded-full text-fg/60 hover:bg-soft hover:text-fg"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={saving}
                  className="grid h-8 w-8 place-items-center rounded-full text-fg/60 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {editingIndex === 'new' ? (
        <div className="rounded-2xl border border-border bg-white p-5">
          <AddressForm
            draft={draft}
            setDraft={setDraft}
            onSave={save}
            onCancel={cancel}
            saving={saving}
            error={error}
          />
        </div>
      ) : (
        editingIndex === null && (
          <button
            type="button"
            onClick={startNew}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white p-5 text-sm font-semibold text-fg/70 transition hover:border-fg/30 hover:text-fg"
          >
            <Plus className="h-4 w-4" /> Add another address
          </button>
        )
      )}
    </div>
  )
}

function AddressForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  error,
}: {
  draft: Address
  setDraft: (a: Address) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft({ ...draft, [key]: e.target.value })
  const setBool = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft({ ...draft, [key]: e.target.checked })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label" hint="e.g. Home, Office">
          <input value={draft.label ?? ''} onChange={set('label')} className="input" placeholder="Home" />
        </Field>
        <Field label="Recipient name">
          <input
            value={draft.recipientName ?? ''}
            onChange={set('recipientName')}
            className="input"
            placeholder="Full name"
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={draft.phone ?? ''}
            onChange={set('phone')}
            className="input"
            placeholder="+254 7XX XXX XXX"
          />
        </Field>
        <Field label="Address line 1" required>
          <input
            value={draft.line1}
            onChange={set('line1')}
            required
            className="input"
            placeholder="Apartment, building, street"
          />
        </Field>
        <Field label="Address line 2">
          <input
            value={draft.line2 ?? ''}
            onChange={set('line2')}
            className="input"
            placeholder="Estate, gate code"
          />
        </Field>
        <Field label="Town / City" required>
          <input value={draft.city} onChange={set('city')} required className="input" placeholder="Your town or city" />
        </Field>
        <Field label="County">
          <input value={draft.county ?? ''} onChange={set('county')} className="input" placeholder="Your county or region" />
        </Field>
        <Field label="Postal code">
          <input
            value={draft.postalCode ?? ''}
            onChange={set('postalCode')}
            className="input"
            placeholder="00100"
          />
        </Field>
      </div>

      <Field label="Landmark" hint="Helps the rider find you faster">
        <input
          value={draft.landmark ?? ''}
          onChange={set('landmark')}
          className="input"
          placeholder='e.g. "Opp. Naivas Embakasi"'
        />
      </Field>

      <Field label="Delivery notes">
        <textarea
          value={draft.notes ?? ''}
          onChange={set('notes')}
          rows={2}
          className="input"
          placeholder="Anything we should know"
        />
      </Field>

      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-fg/80">
          <input
            type="checkbox"
            checked={Boolean(draft.isDefaultShipping)}
            onChange={setBool('isDefaultShipping')}
            className="h-4 w-4 rounded border-border accent-brand-800"
          />
          Default shipping address
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-fg/80">
          <input
            type="checkbox"
            checked={Boolean(draft.isDefaultBilling)}
            onChange={setBool('isDefaultBilling')}
            className="h-4 w-4 rounded border-border accent-brand-800"
          />
          Default billing address
        </label>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Save address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-fg hover:border-fg/30"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
      )}

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
