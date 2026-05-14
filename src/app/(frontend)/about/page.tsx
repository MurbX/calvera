import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  Award,
  Cog,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Target,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Calvera Tech Solutions',
  description:
    'Calvera Tech Solutions delivers reliable, affordable and sustainable solar energy solutions for homes and businesses everywhere — supply and installation of solar power systems, solar flood lights and solar water heaters.',
}

const REASONS = [
  {
    Icon: Award,
    title: 'Proven track record',
    body:
      'We started with residential installations and have grown into trusted commercial projects on the back of consistent quality and customer referrals.',
  },
  {
    Icon: ShieldCheck,
    title: 'Quality & workmanship',
    body:
      'Tier-1 manufacturer-backed gear, certified electricians, and standards we hold ourselves to on every install — small or large.',
  },
  {
    Icon: Cog,
    title: 'Customized system design',
    body:
      'No one-size-fits-all kits. We size each system to your actual load, roof, environment and budget — not a sales target.',
  },
  {
    Icon: Heart,
    title: 'Real cost savings',
    body:
      'A right-sized system pays itself back in years, not decades. We model the savings up front so you know what you\'re buying.',
  },
  {
    Icon: Users,
    title: 'Reliable team & support',
    body:
      'Clear communication from quote to commissioning. Real people answer the phone after installation — no ticket black-holes.',
  },
  {
    Icon: Leaf,
    title: 'Cleaner energy for all',
    body:
      'Every kilowatt you generate is a kilowatt that didn\'t come from fossil fuel. Better for your bills, better for the planet.',
  },
]

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-16">
          <nav className="flex items-center gap-1 text-xs text-fg/60">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-fg">About</span>
          </nav>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            About us
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-fg md:text-5xl">
            Reliable, affordable and smart solar solutions
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-fg/75 md:text-base">
            Calvera Tech Solutions was born from a simple mission — to provide reliable,
            affordable and sustainable energy solutions to homes and businesses
            everywhere. We started with residential solar installations and have grown into
            trusted commercial projects on the back of consistent quality and customer
            referrals.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-fg/75 md:text-base">
            Today we specialise in the supply and installation of solar power systems,
            solar flood lights, and solar water heaters — offering customised solutions for
            both residential and commercial clients.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-white p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-800">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Our vision
              </p>
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-fg md:text-3xl">
              Lead the transition to sustainable energy.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Deliver innovative, reliable and impactful solar solutions that power homes,
              businesses and communities — system by system, community by community.
            </p>
          </div>

          <div className="rounded-3xl bg-brand-800 p-8 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-amber-300">
                <Target className="h-5 w-5" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Our mission
              </p>
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight md:text-3xl">
              World-class solar products. Expert installations.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              We empower our clients to reduce costs, achieve energy independence, and
              embrace a cleaner, more sustainable future — every single day.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 pb-14 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          Why Calvera
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
          Six reasons customers choose us
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border bg-white p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-800">
                <r.Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-fg">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-brand-50 p-10 md:p-14">
          <div className="grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Ready when you are
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
                Talk to us about your solar setup
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg/75 md:text-base">
                Use our calculator to size your system, or drop us a line — we'll come back
                with a quote and a free site survey.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Link
                href="/power-audit"
                className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Wrench className="h-4 w-4" /> Get a Quote
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-white px-5 py-3 text-sm font-medium text-fg hover:border-fg/30"
              >
                <Truck className="h-4 w-4" /> Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
