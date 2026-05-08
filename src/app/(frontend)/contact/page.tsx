import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { LeadForm } from '@/components/LeadForm'

export const metadata: Metadata = {
  title: 'Contact Us — Calvera Tech Solutions',
  description:
    'Get in touch with Calvera Tech Solutions. Phone, WhatsApp, email and office address — replies within 30 minutes during business hours.',
}

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994'
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? 'calveratechsolutions@gmail.com'
  const phoneDigits = phone.replace(/\s|\+/g, '')
  const address = 'North Airport Rd, Embakasi, Nairobi'
  const mapQuery = encodeURIComponent(address)

  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-16">
          <nav className="flex items-center gap-1 text-xs text-fg/60">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-fg">Contact</span>
          </nav>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            Contact us
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-fg md:text-5xl">
            Talk to a real solar expert
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg/75 md:text-base">
            Get in touch about anything related to our products, installations or warranty
            claims. We&apos;ll do our best to get back to you as soon as possible — usually
            within 30 minutes during business hours.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-350 px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <ContactCard
              Icon={Phone}
              label="Phone"
              value={phone}
              hint="Mon–Sat, 8am–6pm EAT"
              href={`tel:${phoneDigits}`}
              cta="Call now"
            />
            <ContactCard
              Icon={MessageCircle}
              label="WhatsApp"
              value={phone}
              hint="Fastest channel — replies in minutes"
              href={`https://wa.me/${phoneDigits}`}
              cta="Open WhatsApp"
            />
            <ContactCard
              Icon={Mail}
              label="Email"
              value={email}
              hint="For quotes, invoices and warranty claims"
              href={`mailto:${email}`}
              cta="Send email"
            />
            <ContactCard
              Icon={MapPin}
              label="Office"
              value={address}
              hint="Visits by appointment only"
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              cta="Open in Maps"
            />
            <ContactCard
              Icon={Clock}
              label="Business hours"
              value="Mon–Sat: 8am–6pm"
              hint="Sunday: emergency support only"
            />

            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Follow us
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://www.facebook.com/calveratechsolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg hover:border-brand-700 hover:text-brand-700"
                >
                  Facebook
                </a>
                <a
                  href="https://www.youtube.com/@calveratechsolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg hover:border-brand-700 hover:text-brand-700"
                >
                  YouTube
                </a>
                <a
                  href="https://www.tiktok.com/@calveratechsolutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg hover:border-brand-700 hover:text-brand-700"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>

          <LeadForm
            source="contact_form"
            title="Send us a message"
            buttonLabel="Send message"
          />
        </div>
      </div>
    </>
  )
}

function ContactCard({
  Icon,
  label,
  value,
  hint,
  href,
  cta,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
  href?: string
  cta?: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </div>
        <div className="mt-0.5 text-base font-bold text-fg">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
      </div>
      {href && cta && (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-fg hover:border-brand-700 hover:text-brand-700"
        >
          {cta}
        </a>
      )}
    </div>
  )
}
