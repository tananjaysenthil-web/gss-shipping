import type { CSSProperties } from 'react'

// Inlined so the hero poster costs zero extra network requests — it is the
// very first thing painted, before the 3D bundle has even started loading.
export function PosterGraphic({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="posterSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff0c9" />
          <stop offset="60%" stopColor="#ffe5d2" />
          <stop offset="100%" stopColor="#ffb38a" />
        </linearGradient>
        <linearGradient id="posterSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fc2bd" />
          <stop offset="100%" stopColor="#2c4a52" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1600" height="540" fill="url(#posterSky)" />
      <rect x="0" y="540" width="1600" height="360" fill="url(#posterSea)" />
      <g opacity={0.5} stroke="#fff7ec" strokeWidth={2} fill="none">
        <path d="M0 560 Q 200 545 400 560 T 800 560 T 1200 560 T 1600 560" />
        <path d="M0 600 Q 200 585 400 600 T 800 600 T 1200 600 T 1600 600" />
      </g>
      <g transform="translate(560,470)">
        <path d="M0 90 L640 90 L610 130 L40 130 Z" fill="#3d2b28" />
        <rect x="60" y="40" width="120" height="55" fill="#3d2b28" />
        <rect x="80" y="15" width="70" height="30" fill="#3d2b28" />
        <rect x="400" y="10" width="14" height="90" fill="#ff8f70" />
        <rect x="220" y="20" width="14" height="80" fill="#ff8f70" />
        <line x1="400" y1="10" x2="470" y2="60" stroke="#ff8f70" strokeWidth={6} />
        <line x1="220" y1="20" x2="150" y2="65" stroke="#ff8f70" strokeWidth={6} />
      </g>
    </svg>
  )
}
