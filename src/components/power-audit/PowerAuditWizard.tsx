'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { StepIndicator } from '@/components/power-audit/StepIndicator'
import { StepLead } from '@/components/power-audit/StepLead'
import { StepAppliances } from '@/components/power-audit/StepAppliances'
import { StepQuotation } from '@/components/power-audit/StepQuotation'
import {
  EMPTY_LEAD,
  STORAGE_KEY,
  type PowerAuditAppliance,
  type PowerAuditLead,
  type PowerAuditState,
  type Step,
} from '@/lib/power-audit-types'

const VALID_STEPS = new Set<Step>([1, 2, 3])

const initialState: PowerAuditState = {
  step: 1,
  leadId: null,
  lead: EMPTY_LEAD,
  appliances: [],
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
          step: VALID_STEPS.has(parsed.step as Step) ? (parsed.step as Step) : 1,
          leadId: parsed.leadId ?? null,
          lead: { ...EMPTY_LEAD, ...(parsed.lead ?? {}) },
          appliances: Array.isArray(parsed.appliances)
            ? (parsed.appliances as PowerAuditAppliance[])
            : [],
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
    if (!hydrated) return
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

  const onLeadSaved = (leadId: number | string, lead: PowerAuditLead) => {
    setState((s) => ({ ...s, leadId, lead }))
    goToStep(2)
  }

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-soft" />
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={state.step} />

      {state.step === 1 && <StepLead initial={state.lead} onSaved={onLeadSaved} />}

      {state.step === 2 && (
        <StepAppliances
          initial={state.appliances}
          onBack={() => goToStep(1)}
          onNext={(appliances) => {
            setState((s) => ({ ...s, appliances }))
            goToStep(3)
          }}
        />
      )}

      {state.step === 3 && (
        <StepQuotation
          lead={state.lead}
          appliances={state.appliances}
          onBack={() => goToStep(2)}
        />
      )}
    </div>
  )
}

function computeMaxStep(state: PowerAuditState): Step {
  if (!state.leadId) return 1
  if (state.appliances.length === 0) return 2
  return 3
}
