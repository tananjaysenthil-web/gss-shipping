import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildHeroWorld, envTexture, waveHeight, FOG_FAR, FOG_NEAR, HAZE, SUN_DIR } from './heroWorld'

type HeroSceneProps = {
  animate: boolean
  onShipReady?: (root: THREE.Object3D) => void
}

/** Sky, ocean, lighting and the procedural carrier from the standalone hero page. */
export function HeroScene({ animate, onShipReady }: HeroSceneProps) {
  const { gl, scene } = useThree()
  const world = useMemo(() => buildHeroWorld(), [])
  const timeRef = useRef(0)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const src = envTexture()
    const env = pmrem.fromEquirectangular(src).texture
    const prevEnv = scene.environment
    const prevFog = scene.fog
    scene.environment = env
    scene.fog = new THREE.Fog(HAZE, FOG_NEAR, FOG_FAR)
    gl.toneMappingExposure = 1.05
    src.dispose()
    pmrem.dispose()
    return () => {
      scene.environment = prevEnv
      scene.fog = prevFog
      env.dispose()
    }
  }, [gl, scene])

  useEffect(() => {
    onShipReady?.(world.rider)
  }, [world, onShipReady])

  useFrame((state, delta) => {
    if (animate) timeRef.current += Math.min(delta, 0.05)
    const t = timeRef.current
    world.oceanUniforms.uTime.value = t
    world.oceanUniforms.uCam.value.copy(state.camera.position)

    // the ship rides the same wave field the shader draws
    const k = animate ? 1 : 0.25
    const hF = waveHeight(52, 0, t)
    const hA = waveHeight(-58, 0, t)
    const hP = waveHeight(0, 9, t)
    const hS = waveHeight(0, -9, t)
    const rider = world.rider
    rider.position.y = -world.draft + (hF + hA) * 0.5 * 0.5 * k
    rider.rotation.z = Math.atan2(hF - hA, 118) * 3.2 * k // pitch, about the beam axis
    rider.rotation.x = (-((hP - hS) / 18) * 2.2 + Math.sin(t * 0.47) * 0.012) * k // roll

    sunTarget.position.copy(rider.position)
  })

  const sunPos = useMemo(() => SUN_DIR.clone().multiplyScalar(360), [])
  const sunTarget = useMemo(() => new THREE.Object3D(), [])

  return (
    <>
      {/* Intensities are the hero page's legacy-lighting values x PI (three r155+ physical units). */}
      <directionalLight
        target={sunTarget}
        position={sunPos}
        color={0xfff3df}
        intensity={2.45 * Math.PI}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={40}
        shadow-camera-far={760}
        shadow-camera-left={-140}
        shadow-camera-right={140}
        shadow-camera-top={140}
        shadow-camera-bottom={-140}
        shadow-bias={-0.0005}
        shadow-normalBias={0.8}
      />
      <primitive object={sunTarget} />
      <hemisphereLight args={[0xa8cde6, 0x1d3a4b, 0.6 * Math.PI]} />
      <primitive object={world.sky} />
      <primitive object={world.ocean} />
      <primitive object={world.rider} />
    </>
  )
}
