'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type Section = {
  id: string
  title: string
  body: ReactNode
  defaultOpen?: boolean
}

export function ProductAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.id, Boolean(s.defaultOpen)])),
  )
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      {sections.map((s, i) => {
        const isOpen = !!open[s.id]
        return (
          <div key={s.id} className={i > 0 ? 'border-t border-border' : ''}>
            <button
              type="button"
              onClick={() => setOpen((p) => ({ ...p, [s.id]: !p[s.id] }))}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-fg hover:bg-soft"
            >
              {s.title}
              <ChevronDown
                className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && <div className="border-t border-border bg-soft/40 px-5 py-4">{s.body}</div>}
          </div>
        )
      })}
    </div>
  )
}
