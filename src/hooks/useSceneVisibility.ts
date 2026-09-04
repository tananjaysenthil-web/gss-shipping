import { useEffect } from 'react'
import { useScene } from '../three/SceneContext'

/** Shows the persistent 3D layer while the calling page is mounted, hides it (and pauses its render loop) otherwise. */
export function useSceneVisibility(options?: { hotspots?: boolean }) {
  const { setVisible, setHotspotsEnabled, resetPose, setSelectedHotspotId } = useScene()

  useEffect(() => {
    setVisible(true)
    setHotspotsEnabled(!!options?.hotspots)
    return () => {
      setVisible(false)
      setHotspotsEnabled(false)
      setSelectedHotspotId(null)
      resetPose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
