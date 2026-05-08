import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentCustomer } from '@/lib/auth'
import { AccountShell } from '@/components/account/AccountShell'
import { AddressesManager, type Address } from '@/components/account/AddressesManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Saved addresses — Calvera Tech Solutions',
}

export default async function CustomerAddressesPage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect('/account/login?next=/account/addresses')

  const payload = await getPayload({ config })
  const doc = await payload.findByID({
    collection: 'customers',
    id: customer.id,
    depth: 0,
    overrideAccess: true,
  })

  const docAddresses = (doc as unknown as { addresses?: unknown }).addresses
  const initialAddresses = (Array.isArray(docAddresses) ? docAddresses : []) as Address[]

  return (
    <AccountShell firstName={customer.firstName ?? null} email={customer.email}>
      <nav className="flex items-center gap-1 text-xs text-muted">
        <Link href="/account" className="hover:text-brand-700">Account</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-fg">Addresses</span>
      </nav>

      <div className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">Saved addresses</h1>
        <p className="mt-1 text-sm text-muted">
          Manage delivery addresses. Setting a default fills it in automatically at checkout.
        </p>
      </div>

      <AddressesManager customerId={customer.id} initialAddresses={initialAddresses} />
    </AccountShell>
  )
}
