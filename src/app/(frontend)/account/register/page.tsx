import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { RegisterForm } from '@/components/account/RegisterForm'
import { getCurrentCustomer } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Create account — Calvera Tech Solutions',
  description:
    'Create a free Calvera account to track orders, save addresses and get tailored solar offers.',
}

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams
  const customer = await getCurrentCustomer()
  if (customer) redirect(next || '/account')

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 md:py-20">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="mx-1 inline h-3 w-3" />
        <span className="text-fg">Create account</span>
      </nav>

      <div className="mt-6 rounded-3xl border border-border bg-white p-7 sm:p-9">
        <h1 className="text-3xl font-bold tracking-tight text-fg">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          Email and password is all we need — we&apos;ll ask for delivery details at your first
          order.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
