'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Battery,
  Cpu,
  Download,
  Frame,
  Loader2,
  MessageCircle,
  Send,
  SolarPanel,
  Wrench,
} from 'lucide-react'
import { formatKes } from '@/lib/utils'
import type { PowerAuditAppliance, PowerAuditLead } from '@/lib/power-audit-types'

const FALLBACK_IMAGE = '/placeholder-product.svg'

type BomItem = {
  productId: number | string
  name: string
  slug: string
  unitPriceKes: number
  imageUrl: string | null
  shortDescription: string | null
  quantity: number
  totalWatts?: number
  totalWh?: number
}

type Bom = {
  panel: BomItem | null
  inverter: BomItem | null
  battery: BomItem | null
  mountingKes: number
  installationKes: number
  materialsSubtotalKes: number
  estimatedTotalKes: number
}

type Recommendation = {
  totalConnectedWatts: number
  dailyEnergyWh: number
  panelWattsTotal: number
  inverterWatts: number
  batteryWh: number
  estimatedPriceKes: number
  notes: string[]
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  lead: PowerAuditLead
  appliances: PowerAuditAppliance[]
  onBack: () => void
}

export function StepQuotation({ lead, appliances, onBack }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bom, setBom] = useState<Bom | null>(null)
  const [rec, setRec] = useState<Recommendation | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi ${lead.name?.split(' ')[0] || 'there'}, I'm Aria — Calvera's solar assistant. Your audit is sized below. Ask me anything about it (e.g. "Is this enough for my fridge and pump?" or "Show me a smaller battery option").`,
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch the recommendation+BOM on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/power-audit/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appliances: appliances.map((a) => ({
              name: a.name,
              wattage: a.wattage,
              quantity: a.quantity,
              hoursPerDay: a.hoursPerDay,
            })),
          }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`)
        if (cancelled) return
        setRec(body.recommendation as Recommendation)
        setBom(body.bom as Bom)
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
  }, [appliances])

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
        body: JSON.stringify({
          messages: next,
          context: rec
            ? {
                panelWattsTotal: rec.panelWattsTotal,
                inverterWatts: rec.inverterWatts,
                batteryWh: rec.batteryWh,
                dailyEnergyWh: rec.dailyEnergyWh,
                // Match what's shown on screen and on the PDF subtotal.
                estimatedPriceKes: bom?.estimatedTotalKes ?? rec.estimatedPriceKes,
                appliances: appliances.map((a) => ({
                  name: a.name,
                  wattage: a.wattage,
                  quantity: a.quantity,
                  hoursPerDay: a.hoursPerDay,
                })),
                bom: bom
                  ? {
                      panel: bom.panel
                        ? {
                            name: bom.panel.name,
                            quantity: bom.panel.quantity,
                            unitPriceKes: bom.panel.unitPriceKes,
                          }
                        : null,
                      inverter: bom.inverter
                        ? {
                            name: bom.inverter.name,
                            quantity: bom.inverter.quantity,
                            unitPriceKes: bom.inverter.unitPriceKes,
                          }
                        : null,
                      battery: bom.battery
                        ? {
                            name: bom.battery.name,
                            quantity: bom.battery.quantity,
                            unitPriceKes: bom.battery.unitPriceKes,
                          }
                        : null,
                      mountingStructureKes: bom.mountingKes,
                      installationKes: bom.installationKes,
                    }
                  : null,
              }
            : undefined,
        }),
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
          customer: {
            name: lead.name,
            phone: lead.phone,
            email: lead.email || undefined,
            address: lead.address || undefined,
          },
          appliances: appliances.map((a) => ({
            name: a.name,
            wattage: a.wattage,
            quantity: a.quantity,
            hoursPerDay: a.hoursPerDay,
          })),
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
        <p className="mt-3 text-sm text-muted">Sizing your system from our catalog…</p>
      </div>
    )
  }
  if (error || !rec || !bom) {
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
              Recommended system
            </h2>
            <span className="text-xs text-muted">
              Picked from Calvera&apos;s catalog
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <ChipStat label="Panels" value={`${rec.panelWattsTotal} W`} />
            <ChipStat label="Inverter" value={`${rec.inverterWatts} W`} />
            <ChipStat label="Battery" value={`${(rec.batteryWh / 1000).toFixed(1)} kWh`} />
          </div>
        </div>

        <ul className="space-y-3">
          {bom.panel ? (
            <BomCard
              icon={<SolarPanel className="h-5 w-5" />}
              kind="Solar panels"
              item={bom.panel}
              extra={`Total ${bom.panel.totalWatts}W`}
            />
          ) : (
            <MissingCard
              icon={<SolarPanel className="h-5 w-5" />}
              kind="Solar panels"
              note={`No panel in stock matches ${rec.panelWattsTotal}W — talk to us to source one.`}
            />
          )}
          {bom.inverter ? (
            <BomCard icon={<Cpu className="h-5 w-5" />} kind="Inverter" item={bom.inverter} />
          ) : (
            <MissingCard
              icon={<Cpu className="h-5 w-5" />}
              kind="Inverter"
              note={`No inverter in stock matches ${rec.inverterWatts}W.`}
            />
          )}
          {bom.battery ? (
            <BomCard
              icon={<Battery className="h-5 w-5" />}
              kind="Battery storage"
              item={bom.battery}
              extra={
                bom.battery.totalWh
                  ? `${(bom.battery.totalWh / 1000).toFixed(2)} kWh total`
                  : undefined
              }
            />
          ) : (
            <MissingCard
              icon={<Battery className="h-5 w-5" />}
              kind="Battery storage"
              note={`No battery in stock matches ${(rec.batteryWh / 1000).toFixed(1)} kWh.`}
            />
          )}
          {bom.mountingKes > 0 && (
            <SimpleCostCard
              icon={<Frame className="h-5 w-5" />}
              kind="Mounting"
              title="Solar mounting structure"
              description={
                bom.panel
                  ? `Roof rails / brackets sized for ${bom.panel.quantity} panel${bom.panel.quantity === 1 ? '' : 's'} (KES 15,000 per 4 panels, prorated)`
                  : 'KES 15,000 per 4 panels, prorated'
              }
              totalKes={bom.mountingKes}
            />
          )}
          {bom.installationKes > 0 && (
            <SimpleCostCard
              icon={<Wrench className="h-5 w-5" />}
              kind="Installation"
              title="Professional installation"
              description="20% of materials · vetted installer · site survey · commissioning"
              totalKes={bom.installationKes}
            />
          )}
        </ul>

        <div className="rounded-2xl border border-border bg-brand-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Indicative system cost
              </p>
              <p className="mt-1 text-3xl font-extrabold text-brand-800">
                {formatKes(bom.estimatedTotalKes)}
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
          <ArrowLeft className="h-4 w-4" /> Back to power needs
        </button>
      </div>

      {/* Chat panel — fixed height, internal scroll, sticky on lg+ so it
          never stretches with the BoM column */}
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
          {chatSending && (
            <ChatBubble role="assistant" content="…" />
          )}
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

function BomCard({
  icon,
  kind,
  item,
  extra,
}: {
  icon: React.ReactNode
  kind: string
  item: BomItem
  extra?: string
}) {
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
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{kind}</p>
          <Link href={`/products/${item.slug}`} className="text-sm font-bold text-fg hover:text-brand-700">
            {item.name}
          </Link>
          {item.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs text-muted">{item.shortDescription}</p>
          )}
          {extra && <p className="mt-1 text-[11px] font-medium text-brand-700">{extra}</p>}
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

function SimpleCostCard({
  icon,
  kind,
  title,
  description,
  totalKes,
}: {
  icon: React.ReactNode
  kind: string
  title: string
  description?: string
  totalKes: number
}) {
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-fg/85 sm:h-16 sm:w-16">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{kind}</p>
          <p className="text-sm font-bold text-fg">{title}</p>
          {description && <p className="mt-1 text-xs text-muted">{description}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-fg">{formatKes(totalKes)}</p>
        </div>
      </div>
    </li>
  )
}

function MissingCard({
  icon,
  kind,
  note,
}: {
  icon: React.ReactNode
  kind: string
  note: string
}) {
  return (
    <li className="rounded-2xl border border-dashed border-border bg-soft/40 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-fg/55">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{kind}</p>
          <p className="mt-1 text-sm font-semibold text-fg/85">Sourced on request</p>
          <p className="mt-0.5 text-xs text-muted">{note}</p>
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
