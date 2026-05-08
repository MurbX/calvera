'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { formatKes } from '@/lib/utils'

const FALLBACK_IMAGE = '/placeholder-product.svg'
const DEBOUNCE_MS = 200

type SearchResult = {
  id: number | string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  categoryName: string | null
}

export function HeaderSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults([])
      setTotal(0)
      setLoading(false)
      return
    }
    const timer = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { results: SearchResult[]; total: number }
        setResults(data.results)
        setTotal(data.total)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error(err)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [q])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed.length === 0) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div ref={containerRef} className="relative hidden flex-1 xl:block">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm"
      >
        <Search className="h-4 w-4 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products"
          className="w-44 bg-transparent outline-none placeholder:text-muted"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              setResults([])
              setOpen(false)
            }}
            aria-label="Clear search"
            className="text-muted hover:text-fg"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[360px] rounded-2xl border border-border bg-white p-2 shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between px-3 py-2 text-xs">
            <span className="font-semibold text-fg">
              {loading ? 'Searching…' : total === 0 ? 'No matches' : `${total} match${total === 1 ? '' : 'es'}`}
            </span>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
          </div>

          {results.length > 0 && (
            <ul className="max-h-96 overflow-y-auto py-1">
              {results.map((r) => (
                <li key={String(r.id)}>
                  <Link
                    href={`/products/${r.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-soft"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-soft">
                      <Image
                        src={r.imageUrl || FALLBACK_IMAGE}
                        alt={r.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-semibold text-fg">{r.name}</div>
                      <div className="line-clamp-1 text-xs text-muted">{r.categoryName}</div>
                    </div>
                    <div className="shrink-0 text-sm font-extrabold text-brand-800">
                      {formatKes(r.price)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && results.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted">
              Try a different keyword — e.g. "panel", "battery", "100W"
            </p>
          )}

          {total > results.length && (
            <Link
              href={`/search?q=${encodeURIComponent(q.trim())}`}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl px-3 py-2.5 text-center text-xs font-semibold text-brand-800 hover:bg-soft"
            >
              View all {total} results →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
