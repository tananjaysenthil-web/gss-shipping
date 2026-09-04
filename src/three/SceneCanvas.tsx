import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { Ship } from './Ship'
import { Ocean } from './Ocean'
import { CameraRig } from './CameraRig'
import { Hotspots } from './Hotspots'
import { useScene } from './SceneContext'
import { VESSEL } from './vesselGeometry'

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
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 38, near: 1, far: 3000 }}
      onCreated={() => setCanvasReady(true)}
      frameloop={visible ? 'always' : 'never'}
    >
      <color attach="background" args={['#ffe5d2']} />
      <hemisphereLight args={['#fff0c9', '#3d2b28', 0.9]} />
      <ambientLight intensity={0.4} color="#ffe5d2" />
      <directionalLight position={[110, 140, 70]} intensity={1.6} color="#ffd9ad" />

      <Sky sunPosition={[110, 35, 60]} turbidity={5} rayleigh={2.2} mieCoefficient={0.02} mieDirectionalG={0.88} />
      <Environment preset="sunset" environmentIntensity={0.5} />

      <Suspense fallback={null}>
        <Ship animate={!reducedMotion} onReady={handleShipReady} />
      </Suspense>

      <Ocean animate={!reducedMotion} hullBow={VESSEL.bow} hullStern={VESSEL.stern} hullBeam={VESSEL.beam} />

      {hotspotsEnabled && shipRoot ? <Hotspots shipRoot={shipRoot} /> : null}

      <CameraRig animate={!reducedMotion} pose={pose} />
    </Canvas>
  )
}
