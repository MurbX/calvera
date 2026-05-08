import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { LoginForm } from '@/components/account/LoginForm'
import { getCurrentCustomer } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Sign in — Calvera Tech Solutions',
  description: 'Sign in to your Calvera account to view orders, manage addresses and more.',
}

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams
  const customer = await getCurrentCustomer()
  if (customer) redirect(next || '/account')

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 md:py-20">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span className="text-fg">Sign in</span>
      </nav>

      <div className="mt-6 rounded-3xl border border-border bg-white p-7 sm:p-9">
        <h1 className="text-3xl font-bold tracking-tight text-fg">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Sign in to your Calvera account to view orders, save addresses and track installations.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
