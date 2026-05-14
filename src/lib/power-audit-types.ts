// Shared types for the multi-step Power Audit wizard.
//
// The wizard now covers three services. The user first picks a service
// (`AuditType`), then runs the same 3 steps: details → needs → quotation.

import type { ApplianceInput } from '@/lib/calculator'

export type Step = 1 | 2 | 3

/** Which Calvera service the visitor is getting a quotation for. */
export type AuditType = 'solar' | 'water_heater' | 'flood_light'

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

/** Step-2 inputs for a solar water heater quotation. */
export type WaterHeaterNeeds = {
  /** People in the household — the main driver of tank size. */
  household: number
  bathrooms: number
  usage: 'light' | 'moderate' | 'heavy'
  currentHeating: '' | 'electric_tank' | 'instant_shower' | 'none' | 'other'
}

/** Step-2 inputs for a solar flood light quotation. */
export type FloodLightNeeds = {
  application:
    | 'home_compound'
    | 'parking'
    | 'security_perimeter'
    | 'commercial_yard'
    | 'sports'
    | 'signage'
  /** Number of poles / mounting points to be lit. */
  mountingPoints: number
  /** Are there already poles/walls to mount on? */
  hasPoles: boolean
  hoursPerNight: number
  brightness: 'standard' | 'bright' | 'max'
}

export type PowerAuditState = {
  auditType: AuditType | null
  step: Step
  leadId: number | string | null
  lead: PowerAuditLead
  appliances: PowerAuditAppliance[]
  waterHeater: WaterHeaterNeeds
  floodLight: FloodLightNeeds
}

// Bumped to v2 — the persisted shape changed (auditType + per-service needs).
export const STORAGE_KEY = 'calvera-power-audit-v2'

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

export const WATER_HEATER_USAGE_LABEL: Record<WaterHeaterNeeds['usage'], string> = {
  light: 'Light — quick showers, occasional use',
  moderate: 'Moderate — daily showers for everyone',
  heavy: 'Heavy — long showers, baths, kitchen use',
}

export const WATER_HEATER_HEATING_LABEL: Record<WaterHeaterNeeds['currentHeating'], string> = {
  '': 'Select current method',
  electric_tank: 'Electric storage tank',
  instant_shower: 'Instant electric shower',
  none: 'No hot water yet',
  other: 'Other',
}

export const FLOOD_LIGHT_APPLICATION_LABEL: Record<FloodLightNeeds['application'], string> = {
  home_compound: 'Home compound / yard',
  parking: 'Parking area',
  security_perimeter: 'Security perimeter / fence line',
  commercial_yard: 'Commercial yard / warehouse',
  sports: 'Sports ground / arena',
  signage: 'Signage / billboard',
}

export const FLOOD_LIGHT_BRIGHTNESS_LABEL: Record<FloodLightNeeds['brightness'], string> = {
  standard: 'Standard — general visibility',
  bright: 'Bright — clear, well-lit area',
  max: 'Maximum — wide-area / high-mast',
}

/** Per-service metadata used by the type picker, indicator and step copy. */
export const AUDIT_TYPE_META: Record<
  AuditType,
  {
    label: string
    short: string
    tagline: string
    /** Heading for step 2 — the "define your needs" step. */
    needsStepLabel: string
    needsStepTitle: string
  }
> = {
  solar: {
    label: 'Solar power system',
    short: 'Solar system',
    tagline: 'Panels, inverter and batteries sized to your appliances.',
    needsStepLabel: 'Power needs',
    needsStepTitle: 'Tell us how to define your power needs',
  },
  water_heater: {
    label: 'Solar water heater',
    short: 'Water heater',
    tagline: 'A solar water heater sized to your household hot-water demand.',
    needsStepLabel: 'Hot water needs',
    needsStepTitle: 'Tell us about your hot water needs',
  },
  flood_light: {
    label: 'Solar flood lights',
    short: 'Flood lights',
    tagline: 'Solar flood lights sized to the area you want to light.',
    needsStepLabel: 'Lighting needs',
    needsStepTitle: 'Tell us about your lighting needs',
  },
}

export const EMPTY_LEAD: PowerAuditLead = {
  name: '',
  phone: '',
  email: '',
  address: '',
  monthlyBill: '',
  rooftopType: '',
}

export const EMPTY_WATER_HEATER: WaterHeaterNeeds = {
  household: 4,
  bathrooms: 1,
  usage: 'moderate',
  currentHeating: '',
}

export const EMPTY_FLOOD_LIGHT: FloodLightNeeds = {
  application: 'home_compound',
  mountingPoints: 2,
  hasPoles: false,
  hoursPerNight: 10,
  brightness: 'standard',
}
