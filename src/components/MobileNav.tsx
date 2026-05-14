'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Calculator,
  ChevronRight,
  LogIn,
  LogOut,
  Menu,
  Phone,
  ShoppingBag,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type Category = { name: string; slug: string; tagline?: string | null }

type Props = {
  categories: Category[]
  customer: { email: string; firstName: string | null } | null
}

export function MobileNav({ categories, customer }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  const onLogout = async () => {
    close()
    try {
      await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    router.replace('/')
    router.refresh()
  }

  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-fg/85 transition hover:bg-soft xl:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />

          <aside className="absolute right-0 top-0 flex h-full w-[88%] max-w-90 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              {customer ? (
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted">Signed in as</p>
                  <p className="truncate text-sm font-bold text-fg">
                    {customer.firstName?.trim() || customer.email}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-fg">Menu</p>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-fg/70 transition hover:bg-soft hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <Link
                href="/power-audit"
                onClick={close}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                <Calculator className="h-4 w-4" /> Get a Quote
              </Link>

              <ul className="mt-5 space-y-1">
                <RowLink href="/shop" label="Shop all products" onClick={close} />
                <RowLink href="/categories" label="All categories" onClick={close} />
              </ul>

              <p className="mt-6 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Browse by category
              </p>
              <ul className="mt-2 space-y-1">
                {categories.length === 0 ? (
                  <li className="px-2 py-2 text-sm text-muted">Loading…</li>
                ) : (
                  categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categories/${c.slug}`}
                        onClick={close}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-fg/85 transition hover:bg-soft hover:text-fg"
                      >
                        <span>{c.name}</span>
                        <ChevronRight className="h-4 w-4 text-fg/40" />
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              <p className="mt-6 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Pages
              </p>
              <ul className="mt-2 space-y-1">
                <RowLink href="/installation" label="Installation" onClick={close} Icon={Wrench} />
                <RowLink href="/projects" label="Projects" onClick={close} />
                <RowLink href="/about" label="About" onClick={close} />
                <RowLink href="/contact" label="Contact" onClick={close} />
              </ul>

              <p className="mt-6 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Account
              </p>
              <ul className="mt-2 space-y-1">
                {customer ? (
                  <>
                    <RowLink href="/account" label="Dashboard" onClick={close} />
                    <RowLink href="/account/orders" label="Orders" onClick={close} />
                    <RowLink href="/account/addresses" label="Addresses" onClick={close} />
                    <RowLink href="/wishlist" label="Wishlist" onClick={close} />
                    <li>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-fg/85 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        <span className="inline-flex items-center gap-2">
                          <LogOut className="h-4 w-4" /> Log out
                        </span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <RowLink href="/account/login" label="Sign in" onClick={close} Icon={LogIn} />
                    <RowLink href="/account/register" label="Register" onClick={close} Icon={UserPlus} />
                  </>
                )}
                <RowLink href="/cart" label="Cart" onClick={close} Icon={ShoppingBag} />
              </ul>

              <a
                href={`tel:${businessPhone.replace(/\s|\+/g, '')}`}
                className="mt-7 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800"
              >
                <Phone className="h-4 w-4" /> {businessPhone}
              </a>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

function RowLink({
  href,
  label,
  onClick,
  Icon,
}: {
  href: string
  label: string
  onClick?: () => void
  Icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-fg/85 transition hover:bg-soft hover:text-fg"
      >
        <span className="inline-flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </span>
        <ChevronRight className="h-4 w-4 text-fg/40" />
      </Link>
    </li>
  )
}
