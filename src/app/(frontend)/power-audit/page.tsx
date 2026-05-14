import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PowerAuditWizard } from '@/components/power-audit/PowerAuditWizard'

export const metadata: Metadata = {
  title: 'Get a Quote — Calvera Tech Solutions',
  description:
    'Get a tailored quotation for a solar power system, solar water heater or solar flood lights — a quick 3-step assessment with an AI assistant and a downloadable PDF quotation.',
}

export default function PowerAuditPage() {
  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            Get a Quote
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg md:text-4xl">
            Get a quotation tailored to your needs
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg/75 md:text-base">
            Choose a service — a solar power system, a solar water heater or solar flood lights.
            Tell us your details, define your needs, and our AI will recommend the right products
            from our catalog. Download a branded PDF quotation when you&apos;re ready.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-soft" />}>
          <PowerAuditWizard />
        </Suspense>
      </div>
    </>
  )
}
