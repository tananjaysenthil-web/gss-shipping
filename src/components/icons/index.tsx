// Hand-drawn single-stroke technical icons (no icon-set match for
// maritime/heavy-lift subjects was found in the design database, so this set
// is custom-authored to match the GA-drawing line weight of the rest of the site).
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CraneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21h9" />
      <path d="M6.5 21V4" />
      <path d="M6.5 4h12" />
      <path d="M18.5 4v3" />
      <path d="M6.5 8h9.5" />
      <path d="M16 8l2.5 4" />
      <circle cx="18.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
      <path d="M18.5 13.8V17" />
    </svg>
  )
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="4" width="13" height="17" rx="1" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 12.5l2 2 4-4.5" />
    </svg>
  )
}

export function ContainerStackIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="8" height="5.5" />
      <rect x="13" y="5" width="8" height="5.5" />
      <rect x="3" y="13.5" width="8" height="5.5" />
      <rect x="13" y="13.5" width="8" height="5.5" />
    </svg>
  )
}

export function AnchorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v14" />
      <path d="M7 11h10" />
      <path d="M4 14a8 8 0 0 0 8 7 8 8 0 0 0 8-7" />
    </svg>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-4 1 2-5z" />
      <path d="M12 3v1.5" />
      <path d="M12 19.5V21" />
      <path d="M3 12h1.5" />
      <path d="M19.5 12H21" />
    </svg>
  )
}

export function HelmWheelIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v4" />
      <path d="M12 16v4" />
      <path d="M4 12h4" />
      <path d="M16 12h4" />
      <path d="M6.3 6.3l2.8 2.8" />
      <path d="M14.9 14.9l2.8 2.8" />
      <path d="M17.7 6.3l-2.8 2.8" />
      <path d="M9.1 14.9l-2.8 2.8" />
    </svg>
  )
}

export function FlagIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 21V4" />
      <path d="M6 4h13l-3 4 3 4H6" />
    </svg>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-7-6.5-7-11.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  )
}
