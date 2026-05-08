'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get('token') ?? ''

  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token.trim()) {
      setError('Reset token is missing. Use the link from your email.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: token.trim(), password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          body?.errors?.[0]?.message ??
            'Reset link is invalid or has expired. Request a new one.',
        )
      }
      setDone(true)
      setTimeout(() => {
        router.replace('/account')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900">
        <p className="font-bold">Password updated</p>
        <p className="mt-1">You&apos;re signed in. Redirecting to your account…</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!tokenFromUrl && (
        <Field label="Reset token" htmlFor="rp-token" hint="Paste the token from the link in your email.">
          <input
            id="rp-token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input font-mono text-xs"
            placeholder="Paste token here"
          />
        </Field>
      )}

      <Field label="New password" htmlFor="rp-pw">
        <div className="relative">
          <input
            id="rp-pw"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pr-10"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg/55 hover:text-fg"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Field label="Confirm new password" htmlFor="rp-confirm">
        <input
          id="rp-confirm"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          'Updating…'
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" /> Set new password
          </>
        )}
      </button>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
      )}

      <p className="pt-2 text-center text-sm text-fg/70">
        Need a new link?{' '}
        <Link
          href="/account/forgot-password"
          className="font-semibold text-brand-800 hover:text-brand-700"
        >
          Request another reset email
        </Link>
      </p>

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
      `}</style>
    </form>
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
