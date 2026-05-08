import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ClipboardList, MapPin, ShieldCheck, Wrench } from 'lucide-react'
import { LeadForm } from '@/components/LeadForm'

export const metadata: Metadata = {
  title: 'Solar Installation — Calvera Tech Solutions',
  description:
    'Vetted local solar installers across all 47 counties. Free site survey, professional installation, and post-install support.',
}

const STEPS = [
  {
    icon: ClipboardList,
    title: '1. Tell us your needs',
    body:
      'Use our solar calculator or send a list of your appliances. We size the system in under a day.',
  },
  {
    icon: MapPin,
    title: '2. Free site survey',
    body:
      'A vetted installer visits your home or business, checks the roof, wiring and load. No fee, no obligation.',
  },
  {
    icon: Wrench,
    title: '3. Professional installation',
    body:
      'Certified electricians install panels, inverter, batteries and wiring. Most homes done in 1–2 days.',
  },
  {
    icon: ShieldCheck,
    title: '4. Warranty + support',
    body:
      'Manufacturer-backed warranty plus our 12-month workmanship cover. Reach support 24/7.',
  },
]

const FAQ = [
  {
    q: 'Do you install outside Nairobi?',
    a: 'Yes — we have vetted installer partners across all 47 counties. Site surveys happen within 3 working days of your request.',
  },
  {
    q: 'How long does installation take?',
    a: 'Small home kits (1–3 kW) typically take 1 day. Larger hybrid and commercial systems take 2–3 days, depending on roof access and wiring complexity.',
  },
  {
    q: 'Is there a payment plan?',
    a: 'M-Pesa, card and bank transfer accepted. We can split payments into 50% on order and 50% on commissioning.',
  },
  {
    q: 'What warranty do I get?',
    a: 'Panels: up to 25 years (manufacturer). Inverters: 5–10 years. Batteries: 2–10 years depending on chemistry. Plus our 12-month workmanship warranty on the install itself.',
  },
]

export default function InstallationPage() {
  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-16">
          <nav className="flex items-center gap-1 text-xs text-fg/60">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-fg">Installation</span>
          </nav>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            Solar installation
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-fg md:text-5xl">
            Vetted installers across all 47 counties
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg/75 md:text-base">
            Calvera works with a network of certified electricians and solar technicians. We
            handle the survey, installation, commissioning and warranty so you don't have to
            chase anyone.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/power-audit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Size my system
            </Link>
            <a
              href="#installer-form"
              className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-5 py-3 text-sm font-medium text-fg hover:border-fg/30"
            >
              Find a local installer
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-800">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-fg">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="installer-form" className="mx-auto max-w-350 px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
              Find a local installer
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Tell us your location and load needs. A vetted installer will reach out within
              one working day with a survey window. Free of charge.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-fg/80">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                <span>Genuine, manufacturer-backed gear only — no grey market.</span>
              </li>
              <li className="flex items-start gap-2">
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                <span>Certified, insured electricians for every install.</span>
              </li>
              <li className="flex items-start gap-2">
                <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                <span>12-month workmanship warranty in addition to product warranty.</span>
              </li>
            </ul>
          </div>
          <LeadForm
            source="find_installer"
            title="Request a site survey"
            buttonLabel="Find my installer"
            successMessage="Thanks — a local installer will reach out within one working day."
          />
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 pb-20 pt-2 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
          Frequently asked
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border border-border bg-white p-6">
              <h3 className="text-base font-bold text-fg">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
