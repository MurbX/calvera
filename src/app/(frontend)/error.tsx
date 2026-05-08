'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FrontendError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[frontend error boundary]', error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600">
        <RefreshCw className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-fg">
        We hit a snag loading this page
      </h1>
      <p className="mt-2 text-sm text-muted">
        The connection to our catalog hiccuped. Try again in a moment — if it keeps happening,
        please let us know.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-fg hover:border-fg/30"
        >
          Go to homepage
        </Link>
      </div>
      {process.env.NODE_ENV !== 'production' && error?.message && (
        <pre className="mt-8 max-w-full overflow-auto whitespace-pre-wrap rounded-xl bg-soft p-4 text-left text-[11px] text-fg/70">
          {error.message}
        </pre>
      )}
    </div>
  )
}
