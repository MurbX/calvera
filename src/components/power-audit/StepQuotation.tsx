'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Battery,
  Cpu,
  Download,
  Droplets,
  Frame,
  Lightbulb,
  Loader2,
  MessageCircle,
  Package,
  Send,
  SolarPanel,
  Wrench,
} from 'lucide-react'
import { formatKes } from '@/lib/utils'
import { AUDIT_TYPE_META, type AuditType, type PowerAuditLead } from '@/lib/power-audit-types'

const FALLBACK_IMAGE = '/placeholder-product.svg'

// Client-side mirrors of the normalized shape from power-audit-recommend.ts
// (kept local so this client component never imports the server-only lib).
type NormalizedItem = {
  kind: string
  productId: number | string
  name: string
  slug: string
  imageUrl: string | null
  shortDescription: string | null
  unitPriceKes: number
  quantity: number
  extra?: string
}
type NormalizedCostLine = {
  kind: string
  title: string
  description?: string
  totalKes: number
}
type NormalizedMissing = { kind: string; note: string }
type NormalizedRecommendation = {
  auditType: AuditType
  quoteKind: string
  summary: { label: string; value: string }[]
  items: NormalizedItem[]
  costLines: NormalizedCostLine[]
  missing: NormalizedMissing[]
  estimatedTotalKes: number
  notes: string[]
  chatContext: Record<string, unknown>
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type Props = {
  auditType: AuditType
  lead: PowerAuditLead
  /** Already shaped as `{ type, appliances }` or `{ type, needs }`. */
  requestPayload: { type: AuditType } & Record<string, unknown>
  onBack: () => void
}

/** Pick an icon for a BoM line / cost line by its `kind` label. */
function kindIcon(kind: string): React.ReactNode {
  const k = kind.toLowerCase()
  if (k.includes('panel')) return <SolarPanel className="h-5 w-5" />
  if (k.includes('inverter')) return <Cpu className="h-5 w-5" />
  if (k.includes('battery')) return <Battery className="h-5 w-5" />
  if (k.includes('water')) return <Droplets className="h-5 w-5" />
  if (k.includes('flood') || k.includes('light')) return <Lightbulb className="h-5 w-5" />
  if (k.includes('mount') || k.includes('pole')) return <Frame className="h-5 w-5" />
  if (k.includes('install')) return <Wrench className="h-5 w-5" />
  return <Package className="h-5 w-5" />
}

export function StepQuotation({ auditType, lead, requestPayload, onBack }: Props) {
  const meta = AUDIT_TYPE_META[auditType]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rec, setRec] = useState<NormalizedRecommendation | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi ${lead.name?.split(' ')[0] || 'there'}, I'm Aria — Calvera's assistant. Your ${meta.label.toLowerCase()} quotation is sized below. Ask me anything about it, or how to adjust it.`,
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch the recommendation on mount (and whenever the payload changes).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/power-audit/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
        if (cancelled) return
        setRec(body.recommendation as NormalizedRecommendation)
      } catch (err) {
        if (cancelled) return
        setError((err as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [requestPayload])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, chatSending])

  const onSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = chatInput.trim()
    if (!msg || chatSending) return
    const next: ChatMessage[] = [...chat, { role: 'user', content: msg }]
    setChat(next)
    setChatInput('')
    setChatSending(true)
    try {
      const res = await fetch('/api/power-audit/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context: rec?.chatContext }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
      setChat((prev) => [...prev, { role: 'assistant', content: body.reply }])
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry — I couldn't reach the assistant just now (${(err as Error).message}). Please try again.`,
        },
      ])
    } finally {
      setChatSending(false)
    }
  }

  const onDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch('/api/power-audit/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestPayload,
          customer: {
            name: lead.name,
            phone: lead.phone,
            email: lead.email || undefined,
            address: lead.address || undefined,
          },
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `calvera-quotation-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Could not generate the PDF: ${(err as Error).message}`)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-700" />
        <p className="mt-3 text-sm text-muted">Sizing your {meta.short.toLowerCase()} from our catalog…</p>
      </div>
    )
  }
  if (error || !rec) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        Could not generate a recommendation: {error ?? 'unknown error'}.
        <div className="mt-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-4 py-2 text-xs font-medium hover:border-rose-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-800">
              Step 3 of 3
            </span>
            <h2 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
              Recommended {meta.short.toLowerCase()}
            </h2>
            <span className="text-xs text-muted">Picked from Calvera&apos;s catalog</span>
          </div>

          {rec.summary.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {rec.summary.map((s) => (
                <ChipStat key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {rec.items.map((item) => (
            <BomCard key={`${item.kind}-${item.productId}`} item={item} />
          ))}
          {rec.costLines.map((line) => (
            <SimpleCostCard key={line.kind} line={line} />
          ))}
          {rec.missing.map((m) => (
            <MissingCard key={m.kind} missing={m} />
          ))}
        </ul>

        <div className="rounded-2xl border border-border bg-brand-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Indicative total cost
              </p>
              <p className="mt-1 text-3xl font-extrabold text-brand-800">
                {formatKes(rec.estimatedTotalKes)}
              </p>
              <p className="mt-1 text-xs text-muted">
                Final price confirmed after a free site survey.
              </p>
            </div>
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download PDF quotation
                </>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-fg hover:border-fg/30"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {meta.needsStepLabel.toLowerCase()}
        </button>
      </div>

      {/* Chat panel — fixed height, internal scroll, sticky on lg+ */}
      <aside className="flex h-150 flex-col self-start rounded-2xl border border-border bg-white lg:sticky lg:top-6 lg:h-[clamp(560px,calc(100vh-3rem),720px)]">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-800">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-fg">Aria — Solar Expert AI</p>
            <p className="text-[11px] text-muted">Has access to Calvera&apos;s catalog</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {chat.map((m, i) => (
            <ChatBubble key={i} role={m.role} content={m.content} />
          ))}
          {chatSending && <ChatBubble role="assistant" content="…" />}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={onSendChat} className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Aria anything…"
            className="flex-1 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-fg"
          />
          <button
            type="submit"
            disabled={chatSending || !chatInput.trim()}
            aria-label="Send"
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-800 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </div>
  )
}

function ChipStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-soft/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-brand-800">{value}</p>
    </div>
  )
}

function BomCard({ item }: { item: NormalizedItem }) {
  const total = item.unitPriceKes * item.quantity
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <Link
          href={`/products/${item.slug}`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-soft sm:h-20 sm:w-20"
        >
          <Image
            src={item.imageUrl || FALLBACK_IMAGE}
            alt={item.name}
            fill
            sizes="80px"
            className="object-contain p-2"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{item.kind}</p>
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-bold text-fg hover:text-brand-700"
          >
            {item.name}
          </Link>
          {item.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs text-muted">{item.shortDescription}</p>
          )}
          {item.extra && <p className="mt-1 text-[11px] font-medium text-brand-700">{item.extra}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">
            {item.quantity} × {formatKes(item.unitPriceKes)}
          </p>
          <p className="mt-0.5 text-sm font-extrabold text-fg">{formatKes(total)}</p>
        </div>
      </div>
    </li>
  )
}

function SimpleCostCard({ line }: { line: NormalizedCostLine }) {
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-fg/85 sm:h-16 sm:w-16">
          {kindIcon(line.kind)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{line.kind}</p>
          <p className="text-sm font-bold text-fg">{line.title}</p>
          {line.description && <p className="mt-1 text-xs text-muted">{line.description}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-fg">{formatKes(line.totalKes)}</p>
        </div>
      </div>
    </li>
  )
}

function MissingCard({ missing }: { missing: NormalizedMissing }) {
  return (
    <li className="rounded-2xl border border-dashed border-border bg-soft/40 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-fg/55">
          {kindIcon(missing.kind)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {missing.kind}
          </p>
          <p className="mt-1 text-sm font-semibold text-fg/85">Sourced on request</p>
          <p className="mt-0.5 text-xs text-muted">{missing.note}</p>
        </div>
      </div>
    </li>
  )
}

function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
          isUser ? 'bg-brand-800 text-white' : 'bg-soft text-fg'
        }`}
      >
        {content}
      </div>
    </div>
  )
}
