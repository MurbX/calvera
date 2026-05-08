import Link from 'next/link'
import type { ComponentType, SVGProps } from 'react'

type Props = {
  href: string
  title: string
  count: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  size?: 'sm' | 'md'
}

export function CategoryCard({ href, title, count, Icon, size = 'md' }: Props) {
  const isSm = size === 'sm'
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-white p-3 transition hover:border-fg/20 hover:shadow-sm"
    >
      <span
        className={`grid shrink-0 place-items-center rounded-xl border border-border bg-soft text-fg/85 transition group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-800 ${
          isSm ? 'h-10 w-10' : 'h-12 w-12'
        }`}
      >
        <Icon className={isSm ? 'h-5 w-5' : 'h-6 w-6'} />
      </span>
      <div className="min-w-0">
        <div className={`font-semibold text-fg ${isSm ? 'text-sm' : 'text-[15px]'} truncate`}>
          {title}
        </div>
        <div className="text-xs text-muted">{count}</div>
      </div>
    </Link>
  )
}
