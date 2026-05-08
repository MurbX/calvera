import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export function SolarPanelIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="14" rx="1.5" />
      <path d="M3 8.5h18M3 13h18" />
      <path d="M9 4v14M15 4v14" />
      <path d="M10 21h4M12 18v3" />
    </svg>
  )
}

export function InverterIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <rect x="7" y="6" width="10" height="4" rx="0.6" />
      <circle cx="9" cy="14.5" r="1" />
      <circle cx="13" cy="14.5" r="1" />
      <path d="M8 18h8" />
    </svg>
  )
}

export function BatteryBlockIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3.5" y="6" width="17" height="13" rx="1.6" />
      <rect x="7.5" y="3.5" width="3" height="2.5" rx="0.5" />
      <rect x="13.5" y="3.5" width="3" height="2.5" rx="0.5" />
      <path d="M9 12h2M10 11v2M14 12h2" />
    </svg>
  )
}

export function MountingGearIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 18l4-12M19 18l-4-12" />
      <path d="M3 18h18" />
      <path d="M9 6h6" />
      <circle cx="6.5" cy="18" r="1" />
      <circle cx="17.5" cy="18" r="1" />
      <path d="M9 12h6" />
    </svg>
  )
}

export function FloodLightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 7l11-3v12L5 13z" />
      <path d="M5 7v6" />
      <path d="M9 16v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3" />
      <path d="M18 9l3-1M18 12h3M18 15l3 1" />
    </svg>
  )
}

export function CeilingLightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3v3" />
      <path d="M5 12c0-3.5 3-6 7-6s7 2.5 7 6" />
      <path d="M5 12h14" />
      <path d="M8 12v3a4 4 0 0 0 8 0v-3" />
    </svg>
  )
}

export function KitIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="6" width="8" height="6" rx="1" />
      <rect x="13" y="6" width="8" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
      <path d="M7 9h0M17 9h0" />
    </svg>
  )
}

export function AccessoriesIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M14.5 6.5l3 3-9 9-3-3z" />
      <path d="M3 21l3-1 1-3" />
      <path d="M14 7l3 3" />
      <circle cx="18.5" cy="5.5" r="1.5" />
    </svg>
  )
}

export function MonitoringIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M7 12l3-3 3 3 4-5" />
      <path d="M9 21h6M12 17v4" />
    </svg>
  )
}

export function CableIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 4v3a3 3 0 0 0 3 3v4a4 4 0 0 0 4 4 4 4 0 0 0 4-4v-4a3 3 0 0 0 3-3V4" />
      <path d="M3 4h4M17 4h4" />
    </svg>
  )
}
