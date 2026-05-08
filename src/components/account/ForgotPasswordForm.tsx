'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Mail, Send } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/customers/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      // Payload returns 200 even when the email doesn't exist (privacy by design).
      if (!res.ok && res.status !== 200) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.errors?.[0]?.message ?? `HTTP ${res.status}`)
      }
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="font-bold">Check your email</p>
          <p className="mt-1 leading-relaxed">
            If an account exists for <span className="font-semibold">{email}</span>, we&apos;ve
            sent a password reset link. The link expires in 1 hour.
          </p>
        </div>
        <p className="text-center text-sm text-fg/70">
          Didn&apos;t receive it?{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-semibold text-brand-800 hover:text-brand-700"
          >
            Try again
          </button>
          {' · '}
          <Link href="/account/login" className="font-semibold text-brand-800 hover:text-brand-700">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="fp-email">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg/40" />
          <input
            id="fp-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input pl-9"
            placeholder="you@example.com"
          />
        </div>
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          'Sending reset link…'
        ) : (
          <>
            <Send className="h-4 w-4" /> Send reset link
          </>
        )}
      </button>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
      )}

      <p className="pt-2 text-center text-sm text-fg/70">
        Remembered it?{' '}
        <Link href="/account/login" className="font-semibold text-brand-800 hover:text-brand-700">
          Sign in
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
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 block text-xs font-semibold text-fg">{label}</span>
      {children}
    </label>
  )
}
