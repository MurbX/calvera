import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, MapPin, ArrowRight, Calculator } from 'lucide-react'
import { getProjects, type ProjectRecord } from '@/lib/payload-data'

export const metadata: Metadata = {
  title: 'Projects — Calvera Tech Solutions',
  description:
    'Solar power systems, water heaters, flood lights and pumps Calvera Tech Solutions has designed, supplied and installed.',
}

const CATEGORY_LABEL: Record<string, string> = {
  solar_power: 'Solar Power',
  water_heater: 'Solar Water Heater',
  flood_light: 'Solar Flood Lights',
  water_pump: 'Solar Water Pump',
  other: 'Project',
}

const FALLBACK_IMAGE = '/placeholder-product.svg'

/** Pull a kW figure out of a capacity string like "250 kW". */
function capacityKw(capacity?: string | null): number {
  if (!capacity) return 0
  const m = capacity.match(/(\d+(?:\.\d+)?)\s*kW\b/i)
  return m ? Number(m[1]) : 0
}

/** Best-effort county extraction from "Town, X County". */
function county(location?: string | null): string | null {
  if (!location) return null
  const m = location.match(/([A-Za-z' ]+?)\s+County/i)
  return m ? m[1].trim() : null
}

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = []
  try {
    projects = await getProjects()
  } catch (err) {
    console.error('[projects] failed to load projects', err)
  }

  // Featured first, then by the admin-set order.
  const sorted = [...projects].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    return 0
  })

  const totalKw = projects.reduce((sum, p) => sum + capacityKw(p.capacity), 0)
  const counties = new Set(projects.map((p) => county(p.location)).filter(Boolean))

  const stats = [
    { value: String(projects.length), label: projects.length === 1 ? 'Project delivered' : 'Projects delivered' },
    ...(totalKw > 0
      ? [{ value: `${totalKw % 1 === 0 ? totalKw : totalKw.toFixed(1)}+ kW`, label: 'Solar capacity installed' }]
      : []),
    ...(counties.size > 0
      ? [{ value: `${counties.size}+`, label: counties.size === 1 ? 'County served' : 'Counties served' }]
      : []),
  ]

  return (
    <>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-16">
          <nav className="flex items-center gap-1 text-xs text-fg/60">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-fg">Projects</span>
          </nav>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            Our work
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-fg md:text-5xl">
            Projects we&apos;ve delivered
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg/75 md:text-base">
            Solar power systems, water heaters, flood lights and pumps — designed, supplied and
            installed by Calvera. Here are some of the installations we&apos;ve completed.
          </p>

          {stats.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-white px-5 py-3"
                >
                  <p className="text-xl font-extrabold text-brand-800">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-350 px-4 py-12 sm:px-6 md:py-16">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-soft/40 p-12 text-center">
            <p className="text-sm font-semibold text-fg">No projects published yet</p>
            <p className="mt-1 text-sm text-muted">
              Projects added in the admin panel will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((project) => (
              <ProjectCard key={String(project.id)} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-350 px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-brand-800 p-10 text-white md:p-14">
          <div className="grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Your project next
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Ready to plan your own installation?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                Get a tailored quotation for a solar system, water heater or flood lights —
                sized to your needs, with a downloadable PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/power-audit"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-amber-300"
              >
                <Calculator className="h-4 w-4" /> Get a Quote
              </Link>
              <Link
                href="/installation"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Talk to an installer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ProjectCard({ project }: { project: ProjectRecord }) {
  const categoryLabel = CATEGORY_LABEL[project.category] ?? CATEGORY_LABEL.other
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-soft">
        <Image
          src={project.imageUrl || FALLBACK_IMAGE}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-800 shadow-sm">
          {categoryLabel}
        </span>
        {project.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-900 shadow-sm">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-snug text-fg">{project.title}</h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {project.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand-700" />
              {project.location}
            </span>
          )}
          {project.capacity && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-800">
              {project.capacity}
            </span>
          )}
        </div>

        {project.summary && (
          <p className="mt-3 text-sm leading-relaxed text-fg/75">{project.summary}</p>
        )}

        {project.completedOn && (
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted">
            Completed{' '}
            {new Date(project.completedOn).toLocaleDateString('en-KE', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </article>
  )
}
