import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
// eslint-disable-next-line import/no-duplicates
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { CAMERA_DEFAULT, POLAR_LIMITS, getDefaultPose, type CameraPose } from './vesselGeometry'

export type { CameraPose }

type CameraRigProps = {
  animate: boolean
  pose: CameraPose
  autoRotateSpeed?: number
  resumeDelayMs?: number
}

export function CameraRig({ animate, pose, autoRotateSpeed = 0.05, resumeDelayMs = 2500 }: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const goalTarget = useRef(new THREE.Vector3(...pose.target))
  const goalPosition = useRef(new THREE.Vector3(...pose.position))
  const transitioning = useRef(true)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRotating = useRef(animate)

  useEffect(() => {
    const start = getDefaultPose()
    camera.position.set(...start.position)
    if ('fov' in camera) {
      ;(camera as THREE.PerspectiveCamera).fov = CAMERA_DEFAULT.fov
      ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    }
  }, [camera])

  useEffect(() => {
    goalTarget.current.set(...pose.target)
    goalPosition.current.set(...pose.position)
    transitioning.current = true
  }, [pose])

  useEffect(() => {
    autoRotating.current = animate
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [animate])

  const handleStart = () => {
    transitioning.current = false
    autoRotating.current = false
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }

  const handleEnd = () => {
    if (!animate) return
    resumeTimer.current = setTimeout(() => {
      autoRotating.current = true
    }, resumeDelayMs)
  }

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    if (transitioning.current) {
      camera.position.lerp(goalPosition.current, Math.min(delta * 2, 1))
      controls.target.lerp(goalTarget.current, Math.min(delta * 2, 1))
      if (camera.position.distanceTo(goalPosition.current) < 0.05) {
        transitioning.current = false
      }
    }

    controls.autoRotate = autoRotating.current
    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      autoRotateSpeed={autoRotateSpeed * 60 * (180 / Math.PI) * 0.02}
      minPolarAngle={POLAR_LIMITS.min}
      maxPolarAngle={POLAR_LIMITS.max}
      minDistance={60}
      maxDistance={320}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  )
}
