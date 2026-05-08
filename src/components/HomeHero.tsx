import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calculator, MapPin, ShoppingBag } from 'lucide-react'

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-50">
      <div className="mx-auto grid max-w-350 px-4 sm:px-6 md:grid-cols-12 md:items-stretch md:gap-0 md:px-0">
        <div className="py-12 md:col-span-5 md:py-20 md:pl-6 md:pr-8 lg:py-24 lg:pl-10">
          <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Power Your Kenya Home.
            <br />
            Connect with Local
            <br />
            Solar Experts.
          </h1>

          <p className="mt-5 max-w-md text-sm text-fg/75 sm:text-base">
            Panels, inverters, batteries and full kits — delivered, installed and warrantied
            anywhere in Kenya.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/power-audit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <Calculator className="h-4 w-4" />
              Solar Calculator
            </Link>
            <Link
              href="/categories/kits"
              className="inline-flex items-center gap-2 rounded-full border border-brand-800/15 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:border-brand-800/40"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Solar Kits
            </Link>
          </div>

          {/* Mobile-only installer pill: lives inline in the text column */}
          <Link
            href="/installation"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-md ring-1 ring-black/5 transition hover:shadow-lg md:hidden"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-800">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-fg/85">
                Find Your Local Installer
              </span>
              <span className="block text-[10px] text-muted">
                47 counties · vetted technicians
              </span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-fg/40 transition group-hover:translate-x-0.5 group-hover:text-fg" />
          </Link>
        </div>

        <div className="relative hidden md:col-span-7 md:block md:min-h-140 md:mr-[min(0px,calc((87.5rem-100vw)/2))] lg:min-h-160">
          <Image
            src="/hero/home-solar-v3.png"
            alt="Modern Kenyan home with rooftop solar panels"
            fill
            priority
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-contain"
            style={{ objectPosition: 'center bottom' }}
          />

          {/* Desktop installer pill: overlay on the photo */}
          <Link
            href="/installation"
            className="group absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg ring-1 ring-black/5 transition hover:shadow-xl sm:bottom-6 sm:right-6"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-800">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-fg/85">
                Find Your Local Installer
              </span>
              <span className="block text-[10px] text-muted">
                47 counties · vetted technicians
              </span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-fg/40 transition group-hover:translate-x-0.5 group-hover:text-fg" />
          </Link>
        </div>
      </div>
    </section>
  )
}
