import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { hotspots } from '../content/vessel'
import { getWorldBoundsCenter } from './nodeUtils'
import { useScene } from './SceneContext'

type HotspotsProps = {
  shipRoot: THREE.Object3D
}

export function Hotspots({ shipRoot }: HotspotsProps) {
  const { selectedHotspotId, setSelectedHotspotId, setPose } = useScene()

  return (
    <>
      {hotspots.map((h) => {
        const measured = getWorldBoundsCenter(shipRoot, h.nodeNames)
        const anchor = measured ? [measured.x, measured.y, measured.z] : h.anchor
        const isSelected = selectedHotspotId === h.id

        return (
          <Html key={h.id} position={anchor as [number, number, number]} center distanceFactor={90} zIndexRange={[10, 0]}>
            <button
              type="button"
              className={`hotspot-marker${isSelected ? ' hotspot-marker--active' : ''}`}
              aria-pressed={isSelected}
              aria-label={`View specification: ${h.label}`}
              onClick={() => {
                if (isSelected) {
                  setSelectedHotspotId(null)
                  return
                }
                setSelectedHotspotId(h.id)
                setPose({
                  target: anchor as [number, number, number],
                  position: [
                    (anchor as number[])[0] + h.cameraOffset[0],
                    (anchor as number[])[1] + h.cameraOffset[1],
                    (anchor as number[])[2] + h.cameraOffset[2],
                  ],
                })
              }}
            >
              <span aria-hidden="true" className="hotspot-marker__dot" />
              {h.label}
            </button>
          </Html>
        )
      })}
    </>
  )
}
