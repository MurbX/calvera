// Shared types for the multi-step Power Audit wizard.

import type { ApplianceInput } from '@/lib/calculator'

export type Step = 1 | 2 | 3

export type PowerAuditLead = {
  name: string
  phone: string
  email: string
  address: string
  monthlyBill: '' | 'under_2k' | '2k_5k' | '5k_10k' | '10k_20k' | '20k_50k' | 'over_50k'
  rooftopType: '' | 'concrete' | 'iron_sheet' | 'tile' | 'other'
}

export type PowerAuditAppliance = ApplianceInput & {
  id: string
  source?: 'manual' | 'photo'
  photoUrl?: string | null
}

export type PowerAuditState = {
  step: Step
  leadId: number | string | null
  lead: PowerAuditLead
  appliances: PowerAuditAppliance[]
}

export const STORAGE_KEY = 'calvera-power-audit-v1'

export const BILL_LABEL: Record<PowerAuditLead['monthlyBill'], string> = {
  '': 'Select a range',
  under_2k: 'Under KES 2,000',
  '2k_5k': 'KES 2,000 – 5,000',
  '5k_10k': 'KES 5,000 – 10,000',
  '10k_20k': 'KES 10,000 – 20,000',
  '20k_50k': 'KES 20,000 – 50,000',
  over_50k: 'Over KES 50,000',
}

export const ROOFTOP_LABEL: Record<PowerAuditLead['rooftopType'], string> = {
  '': 'Select a roof type',
  concrete: 'Concrete (flat)',
  iron_sheet: 'Iron sheet (mabati)',
  tile: 'Tile',
  other: 'Other',
}

export const EMPTY_LEAD: PowerAuditLead = {
  name: '',
  phone: '',
  email: '',
  address: '',
  monthlyBill: '',
  rooftopType: '',
}
