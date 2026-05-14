import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calculator, MapPin, ShoppingBag } from 'lucide-react'

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-900">
      {/* Background photo */}
      <Image
        src="/hero/hero-installers.png"
        alt="Solar technicians installing rooftop panels"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Readability scrim — brand-tinted, darker on the left where the copy sits */}
      <div className="absolute inset-0 bg-linear-to-r from-brand-900/90 via-brand-900/60 to-brand-900/15" />
      <div className="absolute inset-0 bg-linear-to-t from-brand-900/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-130 max-w-350 flex-col justify-center px-4 py-16 sm:px-6 md:min-h-150 md:py-24 lg:min-h-160">
        <div className="max-w-xl">
          <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Power Your Home.
            <br />
            Connect with Local
            <br />
            Solar Experts.
          </h1>

          <p className="mt-5 max-w-md text-sm text-white/80 sm:text-base">
            Panels, inverters, batteries and full kits — delivered, installed and warrantied
            wherever you are.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/power-audit"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
            >
              <Calculator className="h-4 w-4" />
              Get a Quote
            </Link>
            <Link
              href="/categories/kits"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Solar Kits
            </Link>
          </div>
        </div>

        {/* Installer pill: inline on mobile, overlaid bottom-right on desktop */}
        <Link
          href="/installation"
          className="group mt-8 inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2.5 shadow-lg ring-1 ring-black/5 transition hover:shadow-xl md:absolute md:bottom-6 md:right-6 md:mt-0 md:self-auto"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-800">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <span className="text-left">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-fg/85">
              Find Your Local Installer
            </span>
            <span className="block text-[10px] text-muted">
              Near you · vetted technicians
            </span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-fg/40 transition group-hover:translate-x-0.5 group-hover:text-fg" />
        </Link>
      </div>
    </section>
  )
}
