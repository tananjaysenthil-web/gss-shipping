import { hotspots } from '../content/vessel'
import { useScene } from '../three/SceneContext'

export function SpecCard() {
  const { selectedHotspotId, setSelectedHotspotId, resetPose } = useScene()
  const hotspot = hotspots.find((h) => h.id === selectedHotspotId)

  if (!hotspot) {
    return (
      <div className="glass rounded-lg p-5 text-sm text-muted" aria-live="polite">
        Select a hotspot on the vessel to see its specification here.
      </div>
    )
  }

  return (
    <div className="glass rounded-lg p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg text-ink">{hotspot.label}</h3>
        <button
          type="button"
          className="press font-mono text-xs uppercase tracking-wide2 text-muted hover:text-ink hover:underline"
          onClick={() => {
            setSelectedHotspotId(null)
            resetPose()
          }}
        >
          Close ✕
        </button>
      </div>
      <dl className="mt-3 space-y-1">
        {hotspot.spec.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 font-mono text-sm">
            <dt className="text-muted">{row.label}</dt>
            <dd className="figure text-right text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
