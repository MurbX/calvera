'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!acceptTerms) {
      setError('Please accept the terms to continue.')
      return
    }
    setSubmitting(true)
    try {
      // Create the account
      const createRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          marketingOptIn,
        }),
      })
      if (!createRes.ok) {
        const body = await createRes.json().catch(() => ({}))
        const msg = body?.errors?.[0]?.message ?? `Sign-up failed (HTTP ${createRes.status})`
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('unique')) {
          throw new Error('An account with this email already exists. Try signing in instead.')
        }
        throw new Error(msg)
      }

      // Auto-login so they land on /account already authed
      const loginRes = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      if (!loginRes.ok) {
        // Account exists; just send them to login
        router.replace(`/account/login${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`)
        return
      }
      router.replace(next)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="reg-email">
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" htmlFor="reg-password">
        <div className="relative">
          <input
            id="reg-password"
            type={showPw ? 'text' : 'password'}
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
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg/55 hover:text-fg"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted">
          Use 8+ characters. Mix letters and numbers for a stronger password.
        </p>
      </Field>

      <label className="flex cursor-pointer items-start gap-2 text-xs text-fg/80">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 rounded border-border accent-brand-800"
        />
        <span>
          I agree to Calvera&apos;s{' '}
          <Link href="/terms" className="font-semibold text-brand-800 hover:text-brand-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-semibold text-brand-800 hover:text-brand-700">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-2 text-xs text-fg/80">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-brand-800"
        />
        <span>Send me solar deals, tips and product updates (you can unsubscribe anytime).</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          'Creating your account…'
        ) : (
          <>
            <UserPlus className="h-4 w-4" /> Create account
          </>
        )}
      </button>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
      )}

      <p className="pt-2 text-center text-sm text-fg/70">
        Already have an account?{' '}
        <Link
          href={`/account/login${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-semibold text-brand-800 hover:text-brand-700"
        >
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
