import { Suspense, lazy, useEffect, useState } from 'react'
import { useScene } from './SceneContext'
import { useWebglSupport } from '../hooks/useWebglSupport'
import { PosterGraphic } from '../components/PosterGraphic'

const SceneCanvas = lazy(() => import('./SceneCanvas').then((m) => ({ default: m.SceneCanvas })))

export function CanvasStage() {
  const { canvasReady, visible } = useScene()
  const webglSupported = useWebglSupport()
  const [startLoading, setStartLoading] = useState(false)

  useEffect(() => {
    if (!webglSupported) return

    // Wait for the window `load` event first: the 3D bundle (three/r3f/drei,
    // ~300KB) must not compete on the same HTTP/1.1 connection pool as the
    // page's own critical resources (HTML/fonts) or it measurably delays
    // first paint. Only once the page has fully loaded do we idle-schedule it.
    let idleHandle: number | null = null
    const cic = window.cancelIdleCallback
    const scheduleIdle = () => {
      const ric = window.requestIdleCallback
      if (typeof ric === 'function') {
        idleHandle = ric(() => setStartLoading(true), { timeout: 1500 })
      } else {
        idleHandle = window.setTimeout(() => setStartLoading(true), 200) as unknown as number
      }
    }

    if (document.readyState === 'complete') {
      scheduleIdle()
    } else {
      window.addEventListener('load', scheduleIdle, { once: true })
    }

    return () => {
      window.removeEventListener('load', scheduleIdle)
      if (idleHandle != null) {
        if (typeof cic === 'function') cic(idleHandle)
        else window.clearTimeout(idleHandle)
      }
    }
  }, [webglSupported])

  return (
    <div className="three-stage" style={{ pointerEvents: visible ? 'auto' : 'none' }}>
      <PosterGraphic className="three-stage__poster" style={{ opacity: canvasReady ? 0 : 1 }} />
      {webglSupported && startLoading ? (
        <Suspense fallback={null}>
          <div className="three-stage__canvas" style={{ opacity: canvasReady ? 1 : 0 }}>
            <SceneCanvas />
          </div>
        </Suspense>
      ) : null}
    </div>
  )
}
