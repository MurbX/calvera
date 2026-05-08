'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  User,
  UserPlus,
  LogIn,
  Heart,
  MapPin,
} from 'lucide-react'

type Props = {
  customer: {
    email: string
    firstName: string | null
  } | null
}

export function HeaderUserMenu({ customer }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onLogout = async () => {
    setOpen(false)
    try {
      await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    router.replace('/')
    router.refresh()
  }

  if (!customer) {
    return (
      <Link
        href="/account/login"
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium hover:text-brand-700"
      >
        <User className="h-5 w-5" />
        <span className="hidden lg:inline">Sign in</span>
      </Link>
    )
  }

  const initials = (customer.firstName?.[0] ?? customer.email[0] ?? 'C').toUpperCase()
  const greeting = customer.firstName?.trim() || customer.email.split('@')[0]

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border bg-white py-1 pl-1 pr-3 text-sm font-medium hover:border-fg/30"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate lg:inline">{greeting}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-xl ring-1 ring-black/5"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs uppercase tracking-wider text-muted">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-bold text-fg">{customer.email}</p>
          </div>
          <ul className="py-1">
            <MenuLink href="/account" Icon={LayoutDashboard} onClick={() => setOpen(false)}>
              Dashboard
            </MenuLink>
            <MenuLink href="/account/orders" Icon={ShoppingBag} onClick={() => setOpen(false)}>
              Orders
            </MenuLink>
            <MenuLink href="/account/addresses" Icon={MapPin} onClick={() => setOpen(false)}>
              Addresses
            </MenuLink>
            <MenuLink href="/wishlist" Icon={Heart} onClick={() => setOpen(false)}>
              Wishlist
            </MenuLink>
            <MenuLink href="/account/details" Icon={User} onClick={() => setOpen(false)}>
              Profile
            </MenuLink>
          </ul>
          <div className="border-t border-border pt-1">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg/80 transition hover:bg-soft hover:text-fg"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  href,
  Icon,
  children,
  onClick,
}: {
  href: string
  Icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg/80 transition hover:bg-soft hover:text-fg"
      >
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    </li>
  )
}

export function HeaderRegisterLink() {
  return (
    <Link
      href="/account/register"
      className="hidden items-center gap-1.5 rounded-full bg-brand-800 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 sm:inline-flex"
    >
      <UserPlus className="h-3.5 w-3.5" />
      Register
    </Link>
  )
}

export function HeaderSignInLink() {
  return (
    <Link
      href="/account/login"
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium hover:text-brand-700"
    >
      <LogIn className="h-5 w-5" />
      <span className="hidden lg:inline">Sign in</span>
    </Link>
  )
}
