import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, Lock, User } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentCustomer } from '@/lib/auth'
import { AccountShell } from '@/components/account/AccountShell'
import { ChangePasswordForm, ProfileForm } from '@/components/account/ProfileForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profile — Calvera Tech Solutions',
}

type CustomerDoc = {
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  marketingOptIn?: boolean | null
}

export default async function CustomerDetailsPage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect('/account/login?next=/account/details')

  const payload = await getPayload({ config })
  const doc = (await payload.findByID({
    collection: 'customers',
    id: customer.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as CustomerDoc

  return (
    <AccountShell firstName={customer.firstName ?? null} email={customer.email}>
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/account" className="hover:text-brand-700">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Profile</span>
      </nav>

      <div className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Update the personal details we use for delivery, receipts and support.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-fg">
          <User className="h-4 w-4 text-brand-700" /> Personal details
        </div>
        <ProfileForm
          customerId={customer.id}
          initial={{
            email: doc.email,
            firstName: doc.firstName ?? '',
            lastName: doc.lastName ?? '',
            phone: doc.phone ?? '',
            marketingOptIn: Boolean(doc.marketingOptIn),
          }}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-fg">
          <Lock className="h-4 w-4 text-brand-700" /> Change password
        </div>
        <ChangePasswordForm />
      </section>
    </AccountShell>
  )
}
