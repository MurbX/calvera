import Link from 'next/link'
import { Star } from 'lucide-react'
import { formatKes } from '@/lib/utils'

type Props = {
  href: string
  title: string
  price: number
  rating?: number
  imageEmoji?: string
}

export function PackageCard({ href, title, price, rating = 5, imageEmoji = '☀️' }: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border bg-white p-4 transition hover:shadow-md"
    >
      <div className="grid aspect-[4/3] place-items-center rounded-xl bg-surface text-5xl">
        <span aria-hidden>{imageEmoji}</span>
      </div>
      <div className="mt-3 flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-fg">{title}</h3>
      <div className="mt-1 text-base font-bold text-brand-700">{formatKes(price)}</div>
    </Link>
  )
}
