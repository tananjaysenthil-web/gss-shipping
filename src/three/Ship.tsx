import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { waveHeight, waveGradient } from './waves'
import { VESSEL } from './vesselGeometry'

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

type ShipProps = {
  animate: boolean
  onReady?: (root: THREE.Object3D) => void
}

const HEAVE_DAMP = 0.55
const PITCH_DAMP = 0.4
const ROLL_DAMP = 0.3

export function Ship({ animate, onReady }: ShipProps) {
  const { scene } = useGLTF(VESSEL.modelUrl)
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  const readyFired = useRef(false)

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = false
        obj.receiveShadow = false
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (animate) timeRef.current += delta
    const t = timeRef.current
    const group = groupRef.current
    if (!group) return

    const h = waveHeight(0, 0, t)
    const [gx, gz] = waveGradient(0, 0, t)

    group.position.y = h * HEAVE_DAMP
    group.rotation.z = -Math.atan(gx) * PITCH_DAMP
    group.rotation.x = Math.atan(gz) * ROLL_DAMP

    if (!readyFired.current) {
      readyFired.current = true
      onReady?.(group)
    }
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(VESSEL.modelUrl)
