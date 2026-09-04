import { Link } from 'react-router-dom'
import { useSceneVisibility } from '../hooks/useSceneVisibility'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { hotspots } from '../content/vessel'
import { useScene } from '../three/SceneContext'
import { VesselParticulars } from '../components/VesselParticulars'
import { SpecCard } from '../components/SpecCard'
import { DimensionDivider } from '../components/DimensionDivider'
import { Reveal } from '../components/motion/Reveal'

export function Fleet() {
  useSceneVisibility({ hotspots: true })
  useDocumentMeta({
    title: 'Fleet',
    description:
      'An interactive 3D look at the project-carrier class of vessel GSS coordinates port operations for: pedestal cranes, ODC deck cargo, and full vessel particulars.',
    path: '/fleet',
  })
  const { selectedHotspotId, setSelectedHotspotId, setPose, resetPose } = useScene()

  return (
    <>
      <section
        className="viewer-slot flex min-h-[70vh] flex-col justify-end px-4 pb-8 sm:px-6"
        aria-label="Interactive 3D vessel viewer"
      >
        <span className="sr-only">
          Drag to orbit the vessel, scroll to zoom. Use the hotspot buttons below the viewer to inspect the
          cranes, tower sections and blade stack. This works identically with or without 3D graphics enabled.
        </span>
        <div className="mx-auto">
          <Link
            to="/contact"
            className="glass press inline-block rounded-md px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach/40"
          >
            Discuss an operation
          </Link>
        </div>
      </section>

      <section className="page-surface page-surface--opaque flex-1">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal>
            <h1 className="text-3xl text-ink sm:text-4xl">Project Carrier</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              The model above illustrates the class of heavy-lift, multi-purpose tonnage GSS coordinates port
              operations for: pedestal cranes, ODC deck cargo (tower sections, turbine blades) and the working
              deck our Port Captains manage from pre-berthing to sail-out.
            </p>
            <p className="mt-3 max-w-2xl rounded-md border border-border bg-yellow/60 px-4 py-3 text-sm text-ink">
              TODO: confirm with GSS whether this hull represents a vessel in their managed/chartered rotation or
              a generic representative class, and supply deadweight, crane SWL and flag details.
            </p>
            <Link
              to="/contact"
              className="press mt-5 inline-block rounded-md bg-coral px-6 py-3 font-mono text-sm uppercase tracking-wide2 text-ink transition-colors hover:bg-peach"
            >
              Discuss an operation
            </Link>
          </Reveal>

          <DimensionDivider className="my-10" />

          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-lg text-ink">Inspect a component</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {hotspots.map((h) => {
                  const isSelected = selectedHotspotId === h.id
                  return (
                    <li key={h.id}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        className={`press rounded-md border px-4 py-2 font-mono text-xs uppercase tracking-wide2 transition-colors ${
                          isSelected
                            ? 'border-coral bg-coral text-ink'
                            : 'border-ink/25 text-ink hover:border-coral hover:bg-peach2/50'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedHotspotId(null)
                            resetPose()
                            return
                          }
                          setSelectedHotspotId(h.id)
                          setPose({ target: h.anchor, position: [
                            h.anchor[0] + h.cameraOffset[0],
                            h.anchor[1] + h.cameraOffset[1],
                            h.anchor[2] + h.cameraOffset[2],
                          ] })
                        }}
                      >
                        {h.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4">
                <SpecCard />
              </div>
            </div>

            <div>
              <VesselParticulars caption="Vessel particulars (measured from 3D asset)" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
