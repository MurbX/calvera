'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconMapPin,
  IconUser,
  IconHeart,
  IconLogout,
} from '@tabler/icons-react'

const NAV = [
  { href: '/account', label: 'Dashboard', Icon: IconLayoutDashboard },
  { href: '/account/orders', label: 'Orders', Icon: IconShoppingBag },
  { href: '/account/addresses', label: 'Addresses', Icon: IconMapPin },
  { href: '/account/details', label: 'Profile', Icon: IconUser },
  { href: '/wishlist', label: 'Wishlist', Icon: IconHeart },
]

type Props = {
  firstName: string | null
  email: string
  children: React.ReactNode
}

export function AccountShell({ firstName, email, children }: Props) {
  const router = useRouter()
  const pathname = usePathname() ?? '/account'

  const isActive = (href: string) => {
    if (href === '/account') return pathname === '/account' || pathname === '/account/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const initials = (firstName?.[0] ?? email[0] ?? 'C').toUpperCase()
  const greeting = firstName?.trim() || email.split('@')[0]

  const onLogout = async () => {
    try {
      await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    router.replace('/account/login')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-10">
      {/* Mobile / tablet: horizontal pill nav */}
      <div className="mb-6 flex items-center gap-3 lg:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-800">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted">Welcome</p>
          <p className="truncate text-sm font-bold text-fg">{greeting}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full text-fg/70 transition hover:bg-soft hover:text-fg"
        >
          <IconLogout size={18} stroke={1.6} />
        </button>
      </div>
      <nav
        aria-label="Account navigation"
        className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-brand-800 text-white'
                  : 'border border-border bg-white text-fg/80 hover:border-fg/30 hover:text-fg'
              }`}
            >
              <item.Icon size={16} stroke={1.6} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden self-start rounded-2xl border border-border bg-white p-5 lg:block">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-base font-bold text-brand-800">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted">Welcome</p>
              <p className="truncate text-sm font-bold text-fg">{greeting}</p>
            </div>
          </div>

          <ul className="mt-3 space-y-1">
            {NAV.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-fg/80 hover:bg-soft hover:text-fg'
                    }`}
                  >
                    <item.Icon size={18} stroke={1.6} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fg/70 transition hover:bg-soft hover:text-fg"
          >
            <IconLogout size={18} stroke={1.6} />
            Log out
          </button>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
