'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'
import {
  SolarPanel,
  BatteryFull,
  Spotlight,
  LampCeiling,
  Boxes,
  Sparkles,
  TrendingUp,
  Tag,
  PackageOpen,
} from 'lucide-react'
import { InverterIcon } from '@/components/icons/solar'
import { formatKes } from '@/lib/utils'

const FALLBACK_IMAGE = '/placeholder-product.svg'

const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  panels: SolarPanel,
  inverters: InverterIcon,
  batteries: BatteryFull,
  'flood-lights': Spotlight,
  'ceiling-lights': LampCeiling,
  kits: Boxes,
}

const SHOP_QUICK_LINKS = [
  { href: '/shop', label: 'All products', description: 'Browse the full catalog', Icon: PackageOpen },
  { href: '/shop', label: 'Featured', description: 'Hand-picked by our team', Icon: Sparkles },
  { href: '/shop', label: 'Best sellers', description: 'Most popular this month', Icon: TrendingUp },
  { href: '/shop', label: 'On sale', description: 'Discounted gear', Icon: Tag },
]

type Category = { name: string; slug: string; tagline?: string | null }
type FeaturedProduct = {
  id: number | string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  categoryName: string | null
}

type Props = {
  categories: Category[]
  featuredProducts: FeaturedProduct[]
}

export function HeaderNav({ categories, featuredProducts }: Props) {
  const [openMenu, setOpenMenu] = useState<'shop' | 'categories' | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const featuredForShop = featuredProducts.slice(0, 2)
  const featuredForCategories = featuredProducts.slice(0, 3)

  return (
    <nav
      ref={containerRef}
      className="hidden flex-1 items-center gap-7 text-sm font-medium text-fg xl:flex"
    >
      {/* SHOP */}
      <div
        onMouseEnter={() => {
          cancelClose()
          setOpenMenu('shop')
        }}
        onMouseLeave={scheduleClose}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setOpenMenu((v) => (v === 'shop' ? null : 'shop'))}
          aria-expanded={openMenu === 'shop'}
          className={`flex items-center gap-1 transition ${openMenu === 'shop' ? 'text-brand-700' : 'hover:text-brand-700'}`}
        >
          Shop
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${openMenu === 'shop' ? 'rotate-180' : ''}`}
          />
        </button>
        {openMenu === 'shop' && (
          <MegaPanel width={780} onClose={() => setOpenMenu(null)}>
            <div className="grid grid-cols-[1fr_1.4fr] gap-6">
              <div>
                <PanelHeading>Browse</PanelHeading>
                <ul className="mt-3 space-y-1">
                  {SHOP_QUICK_LINKS.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpenMenu(null)}
                        className="flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-soft"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-soft text-fg/85">
                          <l.Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-fg">{l.label}</div>
                          <div className="text-xs text-muted">{l.description}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <PanelHeading>Featured products</PanelHeading>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {featuredForShop.map((p) => (
                    <Link
                      key={String(p.id)}
                      href={`/products/${p.slug}`}
                      onClick={() => setOpenMenu(null)}
                      className="group flex flex-col gap-2 rounded-xl border border-border bg-white p-3 transition hover:border-brand-300 hover:shadow-sm"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-soft">
                        <Image
                          src={p.imageUrl || FALLBACK_IMAGE}
                          alt={p.name}
                          fill
                          sizes="160px"
                          className="object-contain p-3 transition group-hover:scale-105"
                        />
                      </div>
                      <div>
                        <div className="line-clamp-1 text-xs font-semibold text-fg">{p.name}</div>
                        <div className="text-xs font-extrabold text-brand-800">
                          {formatKes(p.price)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/shop"
                  onClick={() => setOpenMenu(null)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:text-brand-700"
                >
                  View all products <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-brand-800 p-4 text-white">
              <div>
                <div className="text-sm font-bold">Power Audit</div>
                <div className="text-xs text-white/75">
                  Size your system with our 4-step assessment and download a PDF quotation.
                </div>
              </div>
              <Link
                href="/power-audit"
                onClick={() => setOpenMenu(null)}
                className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-brand-900 hover:bg-amber-300"
              >
                Open <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </MegaPanel>
        )}
      </div>

      {/* CATEGORIES */}
      <div
        onMouseEnter={() => {
          cancelClose()
          setOpenMenu('categories')
        }}
        onMouseLeave={scheduleClose}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setOpenMenu((v) => (v === 'categories' ? null : 'categories'))}
          aria-expanded={openMenu === 'categories'}
          className={`flex items-center gap-1 transition ${openMenu === 'categories' ? 'text-brand-700' : 'hover:text-brand-700'}`}
        >
          Categories
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${openMenu === 'categories' ? 'rotate-180' : ''}`}
          />
        </button>
        {openMenu === 'categories' && (
          <MegaPanel width={860} onClose={() => setOpenMenu(null)}>
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <div>
                <PanelHeading>All categories</PanelHeading>
                <ul className="mt-3 grid grid-cols-1 gap-1">
                  {categories.map((c) => {
                    const Icon = CATEGORY_ICONS[c.slug] ?? PackageOpen
                    return (
                      <li key={c.slug}>
                        <Link
                          href={`/categories/${c.slug}`}
                          onClick={() => setOpenMenu(null)}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-soft"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-soft text-fg/85 transition group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-800">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-fg">{c.name}</div>
                            {c.tagline && (
                              <div className="line-clamp-1 text-xs text-muted">{c.tagline}</div>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-fg/30 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  href="/categories"
                  onClick={() => setOpenMenu(null)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:text-brand-700"
                >
                  See all categories <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div>
                <PanelHeading>Featured this week</PanelHeading>
                <div className="mt-3 space-y-2">
                  {featuredForCategories.map((p) => (
                    <Link
                      key={String(p.id)}
                      href={`/products/${p.slug}`}
                      onClick={() => setOpenMenu(null)}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-white p-2 pr-3 transition hover:border-brand-300 hover:shadow-sm"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-soft">
                        <Image
                          src={p.imageUrl || FALLBACK_IMAGE}
                          alt={p.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
                          {p.categoryName}
                        </div>
                        <div className="line-clamp-1 text-sm font-semibold text-fg">{p.name}</div>
                      </div>
                      <div className="shrink-0 text-sm font-extrabold text-brand-800">
                        {formatKes(p.price)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </MegaPanel>
        )}
      </div>

      <Link href="/installation" className="hover:text-brand-700">Installation</Link>
      <Link href="/about" className="hover:text-brand-700">About</Link>
      <Link href="/contact" className="hover:text-brand-700">Contact</Link>
    </nav>
  )
}

function MegaPanel({
  children,
  width,
  onClose,
}: {
  children: React.ReactNode
  width: number
  onClose: () => void
}) {
  return (
    <div
      style={{ width }}
      className="absolute left-0 top-full z-30 mt-3 rounded-2xl border border-border bg-white p-5 shadow-2xl ring-1 ring-black/5"
      onClick={(e) => e.stopPropagation()}
      role="menu"
    >
      <span aria-hidden onClick={onClose} className="sr-only" />
      {children}
    </div>
  )
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{children}</p>
  )
}
