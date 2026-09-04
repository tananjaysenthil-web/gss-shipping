type DimensionDividerProps = {
  label?: string
  tone?: 'light' | 'dark'
  className?: string
}

/** A drafting-style dimension line — the recurring "GA drawing" structural device between sections. */
export function DimensionDivider({ label, tone = 'light', className = '' }: DimensionDividerProps) {
  const lineColor = tone === 'dark' ? 'bg-peach2/40' : 'bg-ink/20'
  const labelColor = tone === 'dark' ? 'text-peach2' : 'text-muted'

  return (
    <div className={`flex items-center gap-3 ${className}`} role="presentation" aria-hidden="true">
      <span className={`h-2.5 w-px ${lineColor}`} />
      <span className={`h-px flex-1 ${lineColor}`} />
      {label ? (
        <span className={`font-mono text-xs uppercase tracking-wide2 ${labelColor} whitespace-nowrap`}>{label}</span>
      ) : null}
      <span className={`h-px flex-1 ${lineColor}`} />
      <span className={`h-2.5 w-px ${lineColor}`} />
    </div>
  )
}
