import Image from 'next/image'
import Link from 'next/link'
import { Phone, MapPin, ChevronDown } from 'lucide-react'
import { HeaderNav } from '@/components/HeaderNav'
import { HeaderSearch } from '@/components/HeaderSearch'
import { CartLink } from '@/components/CartLink'
import { WishlistLink } from '@/components/WishlistLink'
import { HeaderUserMenu } from '@/components/HeaderUserMenu'
import { MobileNav } from '@/components/MobileNav'
import { getCategories, getFeaturedProducts } from '@/lib/payload-data'
import { getCurrentCustomer } from '@/lib/auth'

export async function SiteHeader() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 700 000 000'

  // Run all three fetches in parallel; any single failure falls back to
  // an empty value rather than crashing the layout.
  const [catsR, featuredR, customerR] = await Promise.allSettled([
    getCategories(),
    getFeaturedProducts(),
    getCurrentCustomer(),
  ])

  const categories =
    catsR.status === 'fulfilled'
      ? catsR.value.map((c) => ({
          name: c.name,
          slug: c.slug,
          tagline: (c as { tagline?: string | null }).tagline ?? null,
        }))
      : []
  const featuredProducts =
    featuredR.status === 'fulfilled'
      ? featuredR.value.slice(0, 4).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          imageUrl: p.imageUrl ?? null,
          categoryName: p.category?.name ?? null,
        }))
      : []
  const customer = customerR.status === 'fulfilled' ? customerR.value : null
  const customerForMenu = customer
    ? { email: customer.email, firstName: customer.firstName ?? null }
    : null

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="hidden bg-brand-800 text-white sm:block">
        <div className="mx-auto flex max-w-350 items-center justify-between gap-4 px-4 py-2 text-xs sm:text-sm sm:px-6">
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:opacity-90">
            <Phone className="h-4 w-4" />
            <span>{phone} • Solar Experts</span>
          </a>
          <p className="hidden sm:block text-center opacity-90">
            Free Installation Bundle on Hybrid Kits — this month only
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Nairobi, KE
            </span>
            <span className="hidden md:inline opacity-50">|</span>
            <button className="hidden md:flex items-center gap-1 hover:opacity-90">
              Map <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-350 items-center gap-5 px-4 py-4 sm:px-6 xl:gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/brand/calvera-logo.png"
              alt="Calvera"
              width={44}
              height={44}
              priority
              className="h-11 w-11 object-contain"
            />
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight text-brand-800">
                CALVERA
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-muted">
                TECH SOLUTIONS
              </span>
            </span>
          </Link>

          <HeaderNav categories={categories} featuredProducts={featuredProducts} />

          <HeaderSearch />

          <Link
            href="/power-audit"
            className="hidden whitespace-nowrap rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 xl:inline-flex"
          >
            Power Audit
          </Link>

          <div className="hidden xl:flex xl:items-center xl:gap-5">
            <HeaderUserMenu customer={customerForMenu} />
          </div>
          <div className="ml-auto flex items-center gap-3 xl:ml-0 xl:gap-5">
            <WishlistLink />
            <CartLink />
            <MobileNav categories={categories} customer={customerForMenu} />
          </div>
        </div>
      </div>
    </header>
  )
}
