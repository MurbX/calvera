import { Check } from 'lucide-react'
import { AUDIT_TYPE_META, type AuditType, type Step } from '@/lib/power-audit-types'

export function StepIndicator({
  current,
  auditType,
}: {
  current: Step
  auditType: AuditType
}) {
  const steps: { id: Step; label: string }[] = [
    { id: 1, label: 'About you' },
    { id: 2, label: AUDIT_TYPE_META[auditType].needsStepLabel },
    { id: 3, label: 'Quotation' },
  ]

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
      {steps.map((s) => {
        const isDone = current > s.id
        const isActive = current === s.id
        return (
          <li
            key={s.id}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold ${
              isDone
                ? 'bg-brand-50 text-brand-800'
                : isActive
                  ? 'bg-brand-800 text-white'
                  : 'border border-border bg-white text-fg/60'
            }`}
          >
            {isDone ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-current/15 text-[10px] font-bold">
                {s.id}
              </span>
            )}
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">Step {s.id}</span>
          </li>
        )
      })}
    </ol>
  )
}
