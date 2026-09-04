import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { getDefaultPose, type CameraPose } from './vesselGeometry'
import { useReducedMotion } from '../hooks/useReducedMotion'

type SceneContextValue = {
  pose: CameraPose
  setPose: (pose: CameraPose) => void
  resetPose: () => void
  hotspotsEnabled: boolean
  setHotspotsEnabled: (v: boolean) => void
  selectedHotspotId: string | null
  setSelectedHotspotId: (id: string | null) => void
  shipRoot: THREE.Object3D | null
  registerShipRoot: (root: THREE.Object3D) => void
  reducedMotion: boolean
  canvasReady: boolean
  setCanvasReady: (v: boolean) => void
  visible: boolean
  setVisible: (v: boolean) => void
}

const SceneContext = createContext<SceneContextValue | null>(null)

export function SceneProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [pose, setPoseState] = useState<CameraPose>(() => getDefaultPose())
  const [hotspotsEnabled, setHotspotsEnabled] = useState(false)
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const shipRootRef = useRef<THREE.Object3D | null>(null)
  const [, forceRender] = useState(0)

  const setPose = useCallback((next: CameraPose) => setPoseState(next), [])
  const resetPose = useCallback(() => setPoseState(getDefaultPose()), [])
  const registerShipRoot = useCallback((root: THREE.Object3D) => {
    shipRootRef.current = root
    forceRender((n) => n + 1)
  }, [])

  const value = useMemo<SceneContextValue>(
    () => ({
      pose,
      setPose,
      resetPose,
      hotspotsEnabled,
      setHotspotsEnabled,
      selectedHotspotId,
      setSelectedHotspotId,
      shipRoot: shipRootRef.current,
      registerShipRoot,
      reducedMotion,
      canvasReady,
      setCanvasReady,
      visible,
      setVisible,
    }),
    [
      pose,
      setPose,
      resetPose,
      hotspotsEnabled,
      selectedHotspotId,
      registerShipRoot,
      reducedMotion,
      canvasReady,
      visible,
    ],
  )

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used within SceneProvider')
  return ctx
}
