'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = {
  href: string
  label: string
  /** collection slug — used to filter against the user's visible entities */
  slug?: string
  /** show this item even if no collection slug — used for the dashboard home */
  alwaysShow?: boolean
}

type Group = {
  label?: string
  items: NavItem[]
}

const GROUPS: Group[] = [
  {
    items: [{ href: '/admin', label: 'Dashboard', alwaysShow: true }],
  },
  {
    label: 'Workflow',
    items: [
      { href: '/admin/collections/leads', label: 'Leads', slug: 'leads' },
      {
        href: '/admin/collections/calculator-submissions',
        label: 'Calculator Quotes',
        slug: 'calculator-submissions',
      },
      { href: '/admin/collections/orders', label: 'Orders', slug: 'orders' },
      { href: '/admin/collections/customers', label: 'Customers', slug: 'customers' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/collections/products', label: 'Products', slug: 'products' },
      { href: '/admin/collections/categories', label: 'Categories', slug: 'categories' },
      { href: '/admin/collections/brands', label: 'Brands', slug: 'brands' },
    ],
  },
  {
    label: 'Library',
    items: [
      { href: '/admin/collections/media', label: 'Media', slug: 'media' },
      { href: '/admin/collections/users', label: 'Team', slug: 'users' },
    ],
  },
]

type Props = {
  visibleSlugs: string[]
}

export function NavClient({ visibleSlugs }: Props) {
  const pathname = usePathname() ?? '/admin'

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside className="cv-nav">
      <div className="cv-nav__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/calvera-logo.png" alt="" width={36} height={36} />
        <div className="cv-nav__brandText">
          <span className="cv-nav__brandName">CALVERA</span>
          <span className="cv-nav__brandTag">TECH SOLUTIONS</span>
        </div>
      </div>

      <nav className="cv-nav__groups" aria-label="Admin navigation">
        {GROUPS.map((group, gi) => {
          const items = group.items.filter(
            (i) => i.alwaysShow || (i.slug && visibleSlugs.includes(i.slug)),
          )
          if (items.length === 0) return null
          return (
            <div key={gi} className="cv-nav__group">
              {group.label && <span className="cv-nav__groupLabel">{group.label}</span>}
              <ul className="cv-nav__items">
                {items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`cv-nav__link${active ? ' cv-nav__link--active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default NavClient
