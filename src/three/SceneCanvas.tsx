import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { HeroScene } from './HeroScene'
import { CameraRig } from './CameraRig'
import { Hotspots } from './Hotspots'
import { useScene } from './SceneContext'

export function SceneCanvas() {
  const { pose, reducedMotion, hotspotsEnabled, shipRoot, registerShipRoot, setCanvasReady, visible } = useScene()

  const handleShipReady = useCallback(
    (root: THREE.Object3D) => {
      registerShipRoot(root)
    },
    [registerShipRoot],
  )

  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 38, near: 1, far: 8000 }}
      onCreated={() => setCanvasReady(true)}
      frameloop={visible ? 'always' : 'never'}
    >
      <Suspense fallback={null}>
        <HeroScene animate={!reducedMotion} onShipReady={handleShipReady} />
      </Suspense>

      {hotspotsEnabled && shipRoot ? <Hotspots shipRoot={shipRoot} /> : null}

      <CameraRig animate={!reducedMotion} pose={pose} />
    </Canvas>
  )
}
