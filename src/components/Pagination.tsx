import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  current: number
  total: number
  basePath: string
  searchParams?: Record<string, string | string[] | undefined>
  pageParam?: string
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined> = {},
  pageParam: string,
  page: number,
) {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || key === pageParam) continue
    if (Array.isArray(value)) value.forEach((v) => usp.append(key, v))
    else usp.set(key, value)
  }
  if (page > 1) usp.set(pageParam, String(page))
  const qs = usp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function Pagination({
  current,
  total,
  basePath,
  searchParams,
  pageParam = 'page',
}: Props) {
  if (total <= 1) return null
  const pages: number[] = []
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <PrevNext
        kind="prev"
        href={buildHref(basePath, searchParams, pageParam, current - 1)}
        disabled={current <= 1}
      />
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, searchParams, pageParam, p)}
          aria-current={p === current ? 'page' : undefined}
          className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-semibold transition ${
            p === current
              ? 'bg-brand-800 text-white'
              : 'text-fg/70 hover:bg-soft hover:text-fg'
          }`}
        >
          {p}
        </Link>
      ))}
      <PrevNext
        kind="next"
        href={buildHref(basePath, searchParams, pageParam, current + 1)}
        disabled={current >= total}
      />
    </nav>
  )
}

function PrevNext({
  kind,
  href,
  disabled,
}: {
  kind: 'prev' | 'next'
  href: string
  disabled: boolean
}) {
  const Icon = kind === 'prev' ? ChevronLeft : ChevronRight
  const label = kind === 'prev' ? 'Previous page' : 'Next page'
  const cls =
    'grid h-9 w-9 place-items-center rounded-full border border-border text-fg/70 transition hover:border-fg/30 hover:text-fg'
  if (disabled) {
    return (
      <span aria-label={label} aria-disabled className={`${cls} cursor-not-allowed opacity-40`}>
        <Icon className="h-4 w-4" />
      </span>
    )
  }
  return (
    <Link href={href} aria-label={label} className={cls}>
      <Icon className="h-4 w-4" />
    </Link>
  )
}
