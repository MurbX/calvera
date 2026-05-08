import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/account/ForgotPasswordForm'
import { getCurrentCustomer } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Forgot password — Calvera Tech Solutions',
  description:
    'Reset your Calvera account password. We will email you a secure link to set a new one.',
}

export default async function ForgotPasswordPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect('/account')

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 md:py-20">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <Link href="/account/login" className="hover:text-brand-700">Sign in</Link>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span className="text-fg">Forgot password</span>
      </nav>

      <div className="mt-6 rounded-3xl border border-border bg-white p-7 sm:p-9">
        <h1 className="text-3xl font-bold tracking-tight text-fg">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the email on your account and we&apos;ll send a secure link to set a new password.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
