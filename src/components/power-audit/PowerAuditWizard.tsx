'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { StepIndicator } from '@/components/power-audit/StepIndicator'
import { StepTypeSelect } from '@/components/power-audit/StepTypeSelect'
import { StepLead } from '@/components/power-audit/StepLead'
import { StepAppliances } from '@/components/power-audit/StepAppliances'
import { StepWaterHeater } from '@/components/power-audit/StepWaterHeater'
import { StepFloodLight } from '@/components/power-audit/StepFloodLight'
import { StepQuotation } from '@/components/power-audit/StepQuotation'
import {
  AUDIT_TYPE_META,
  EMPTY_FLOOD_LIGHT,
  EMPTY_LEAD,
  EMPTY_WATER_HEATER,
  STORAGE_KEY,
  type AuditType,
  type PowerAuditAppliance,
  type PowerAuditLead,
  type PowerAuditState,
  type Step,
} from '@/lib/power-audit-types'

const VALID_STEPS = new Set<Step>([1, 2, 3])
const VALID_TYPES = new Set<AuditType>(['solar', 'water_heater', 'flood_light'])

const initialState: PowerAuditState = {
  auditType: null,
  step: 1,
  leadId: null,
  lead: EMPTY_LEAD,
  appliances: [],
  waterHeater: EMPTY_WATER_HEATER,
  floodLight: EMPTY_FLOOD_LIGHT,
}

export function PowerAuditWizard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState<PowerAuditState>(initialState)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from sessionStorage on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PowerAuditState>
        setState({
          auditType: VALID_TYPES.has(parsed.auditType as AuditType)
            ? (parsed.auditType as AuditType)
            : null,
          step: VALID_STEPS.has(parsed.step as Step) ? (parsed.step as Step) : 1,
          leadId: parsed.leadId ?? null,
          lead: { ...EMPTY_LEAD, ...(parsed.lead ?? {}) },
          appliances: Array.isArray(parsed.appliances)
            ? (parsed.appliances as PowerAuditAppliance[])
            : [],
          waterHeater: { ...EMPTY_WATER_HEATER, ...(parsed.waterHeater ?? {}) },
          floodLight: { ...EMPTY_FLOOD_LIGHT, ...(parsed.floodLight ?? {}) },
        })
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist on every change.
  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state, hydrated])

  // Reflect step in URL so refresh / share keeps the user in place. We won't
  // jump forward past a step that isn't yet unlocked.
  useEffect(() => {
    if (!hydrated || !state.auditType) return
    const urlStep = Number(searchParams.get('step')) as Step
    if (VALID_STEPS.has(urlStep) && urlStep !== state.step) {
      const allowed = computeMaxStep(state)
      const target = (urlStep <= allowed ? urlStep : allowed) as Step
      setState((s) => ({ ...s, step: target }))
    }
  }, [hydrated, searchParams, state])

  const goToStep = (next: Step) => {
    setState((s) => ({ ...s, step: next }))
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', String(next))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const onTypeSelect = (type: AuditType) => {
    setState((s) => ({ ...s, auditType: type, step: 1 }))
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', '1')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const onChangeService = () => {
    setState((s) => ({ ...s, auditType: null, step: 1 }))
    const params = new URLSearchParams(searchParams.toString())
    params.delete('step')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const onLeadSaved = (leadId: number | string, lead: PowerAuditLead) => {
    setState((s) => ({ ...s, leadId, lead }))
    goToStep(2)
  }

  // Stable request payload for the quotation step — only changes when the
  // service or its step-2 inputs change, so the recommendation fetch is not
  // re-triggered on every render.
  const requestPayload = useMemo<({ type: AuditType } & Record<string, unknown>) | null>(() => {
    switch (state.auditType) {
      case 'solar':
        return {
          type: 'solar',
          appliances: state.appliances.map((a) => ({
            name: a.name,
            wattage: a.wattage,
            quantity: a.quantity,
            hoursPerDay: a.hoursPerDay,
          })),
        }
      case 'water_heater':
        return { type: 'water_heater', needs: state.waterHeater }
      case 'flood_light':
        return { type: 'flood_light', needs: state.floodLight }
      default:
        return null
    }
  }, [state.auditType, state.appliances, state.waterHeater, state.floodLight])

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-soft" />
  }

  // No service chosen yet — show the picker.
  if (!state.auditType) {
    return <StepTypeSelect onSelect={onTypeSelect} />
  }

  const meta = AUDIT_TYPE_META[state.auditType]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StepIndicator current={state.step} auditType={state.auditType} />
        <button
          type="button"
          onClick={onChangeService}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-fg/75 transition hover:border-fg/30 hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {meta.short} · change service
        </button>
      </div>

      {state.step === 1 && (
        <StepLead initial={state.lead} auditType={state.auditType} onSaved={onLeadSaved} />
      )}

      {state.step === 2 && state.auditType === 'solar' && (
        <StepAppliances
          initial={state.appliances}
          onBack={() => goToStep(1)}
          onNext={(appliances) => {
            setState((s) => ({ ...s, appliances }))
            goToStep(3)
          }}
        />
      )}

      {state.step === 2 && state.auditType === 'water_heater' && (
        <StepWaterHeater
          initial={state.waterHeater}
          onBack={() => goToStep(1)}
          onNext={(waterHeater) => {
            setState((s) => ({ ...s, waterHeater }))
            goToStep(3)
          }}
        />
      )}

      {state.step === 2 && state.auditType === 'flood_light' && (
        <StepFloodLight
          initial={state.floodLight}
          onBack={() => goToStep(1)}
          onNext={(floodLight) => {
            setState((s) => ({ ...s, floodLight }))
            goToStep(3)
          }}
        />
      )}

      {state.step === 3 && requestPayload && (
        <StepQuotation
          auditType={state.auditType}
          lead={state.lead}
          requestPayload={requestPayload}
          onBack={() => goToStep(2)}
        />
      )}
    </div>
  )
}

function computeMaxStep(state: PowerAuditState): Step {
  if (!state.leadId) return 1
  // Solar needs at least one appliance before the quotation unlocks; the
  // water heater / flood light steps always carry valid defaults.
  if (state.auditType === 'solar' && state.appliances.length === 0) return 2
  return 3
}
