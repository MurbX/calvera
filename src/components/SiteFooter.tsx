import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Truck, Wrench } from 'lucide-react'

export function SiteFooter() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 700 000 000'
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? 'hello@calvera.tech'
  return (
    <footer className="mt-10 sm:mt-12">
      <div className="mx-auto max-w-350 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 border-y border-border py-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-fg/80">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-fg">Same-day Nairobi delivery</div>
              <div className="text-xs text-muted">Countrywide via courier</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-fg/80">
              <Wrench className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-fg">Vetted local installers</div>
              <div className="text-xs text-muted">Free site survey on kits</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-fg/80">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-fg">Genuine, warrantied</div>
              <div className="text-xs text-muted">Manufacturer-backed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-900 text-brand-100">
        <div className="mx-auto grid max-w-350 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/calvera-logo.png"
                alt="Calvera"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <div className="leading-tight">
                <div className="text-base font-extrabold tracking-tight text-white">CALVERA</div>
                <div className="text-[10px] tracking-[0.2em] opacity-70">TECH SOLUTIONS</div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm opacity-80">
              Reliable, affordable and smart solar solutions for homes, shops and businesses
              across Kenya.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              <li><Link href="/shop" className="hover:text-white">All products</Link></li>
              <li><Link href="/categories/panels" className="hover:text-white">Solar panels</Link></li>
              <li><Link href="/categories/inverters" className="hover:text-white">Inverters</Link></li>
              <li><Link href="/categories/batteries" className="hover:text-white">Batteries</Link></li>
              <li><Link href="/categories/flood-lights" className="hover:text-white">Flood lights</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/installation" className="hover:text-white">Installation</Link></li>
              <li><Link href="/power-audit" className="hover:text-white">Solar calculator</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              <li>{phone}</li>
              <li>{email}</li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
          © {new Date().getFullYear()} Calvera Tech Solutions Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
