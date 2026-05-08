'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Eye, EyeOff, Save } from 'lucide-react'

type Props = {
  customerId: number | string
  initial: {
    email: string
    firstName: string
    lastName: string
    phone: string
    marketingOptIn: boolean
  }
}

export function ProfileForm({ customerId, initial }: Props) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(initial.firstName)
  const [lastName, setLastName] = useState(initial.lastName)
  const [phone, setPhone] = useState(initial.phone)
  const [marketingOptIn, setMarketingOptIn] = useState(initial.marketingOptIn)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSavedOk(false)
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          phone: phone.trim() || null,
          marketingOptIn,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.errors?.[0]?.message ?? `Save failed (HTTP ${res.status})`)
      }
      setSavedOk(true)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl bg-soft px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Email</p>
        <p className="mt-0.5 text-sm font-bold text-fg">{initial.email}</p>
        <p className="mt-1 text-[11px] text-muted">
          Email is your sign-in. Contact support to change it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="pf-first">
          <input
            id="pf-first"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input"
            placeholder="Brian"
          />
        </Field>
        <Field label="Last name" htmlFor="pf-last">
          <input
            id="pf-last"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input"
            placeholder="Mutuku"
          />
        </Field>
      </div>

      <Field label="Phone" htmlFor="pf-phone" hint="M-Pesa-capable Safaricom number for delivery + payment.">
        <input
          id="pf-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
          placeholder="+254 7XX XXX XXX"
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2 text-xs text-fg/80">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-brand-800"
        />
        <span>Send me solar deals, tips and product updates (you can unsubscribe anytime).</span>
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
        {savedOk && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
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
    </form>
  )
}

export function ChangePasswordForm() {
  const router = useRouter()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSavedOk(false)

    if (!currentPw || !newPw || !confirmPw) {
      setError('Please fill in all password fields.')
      return
    }
    if (newPw.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPw === currentPw) {
      setError('New password must be different from your current password.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/customers/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? body?.errors?.[0]?.message ?? `HTTP ${res.status}`)
      }
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setSavedOk(true)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Current password" htmlFor="cp-current">
        <PwInput
          id="cp-current"
          value={currentPw}
          onChange={setCurrentPw}
          show={show}
          onToggleShow={() => setShow((v) => !v)}
          autoComplete="current-password"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="cp-new">
          <PwInput
            id="cp-new"
            value={newPw}
            onChange={setNewPw}
            show={show}
            onToggleShow={() => setShow((v) => !v)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </Field>
        <Field label="Confirm new password" htmlFor="cp-confirm">
          <PwInput
            id="cp-confirm"
            value={confirmPw}
            onChange={setConfirmPw}
            show={show}
            onToggleShow={() => setShow((v) => !v)}
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? 'Updating…' : 'Update password'}
        </button>
        {savedOk && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Check className="h-4 w-4" /> Password updated
          </span>
        )}
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
    </form>
  )
}

function PwInput({
  id,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete: string
  placeholder?: string
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pr-10"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg/55 hover:text-fg"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 block text-xs font-semibold text-fg">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  )
}
