import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronRight } from 'lucide-react'
import { ResetPasswordForm } from '@/components/account/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset password — Calvera Tech Solutions',
  description: 'Set a new password for your Calvera account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 md:py-20">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <Link href="/account/login" className="hover:text-brand-700">Sign in</Link>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span className="text-fg">Reset password</span>
      </nav>

      <div className="mt-6 rounded-3xl border border-border bg-white p-7 sm:p-9">
        <h1 className="text-3xl font-bold tracking-tight text-fg">Set a new password</h1>
        <p className="mt-1 text-sm text-muted">
          Choose a strong password — at least 8 characters, mixing letters and numbers.
        </p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-soft" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
