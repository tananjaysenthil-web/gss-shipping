import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { buildWaveGLSL } from './waves'

const WATER_BASE_URL = '/models/water-waves-base.glb'

const VERTEX = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  uniform float uTime;

  ${buildWaveGLSL()}

  void main() {
    vec3 pos = position;
    vec4 worldPos4 = modelMatrix * vec4(pos, 1.0);
    // Real sculpted base relief (from the source water-waves asset) plus our
    // own animated displacement on top of it.
    float h = waveHeightAt(worldPos4.xz, uTime);
    worldPos4.y += h;
    vec3 n = waveNormalAt(worldPos4.xz, uTime);

    vWorldPos = worldPos4.xyz;
    vNormalW = n;

    gl_Position = projectionMatrix * viewMatrix * worldPos4;
  }
`

const FRAGMENT = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  uniform float uTime;
  uniform vec3 uSeaDeep;
  uniform vec3 uSeaShallow;
  uniform vec3 uFoamColor;
  uniform vec3 uSunDir;
  uniform vec3 uCameraPos;
  uniform vec3 uHullBow;
  uniform vec3 uHullStern;
  uniform float uHullBeam;
  uniform float uFoamAmount;

  ${buildWaveGLSL()}

  // Distance from point p to segment a-b, in the XZ plane.
  float distToSegmentXZ(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-5), 0.0, 1.0);
    vec2 proj = a + ab * t;
    return length(p - proj);
  }

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    float fresnel = pow(1.0 - max(dot(vNormalW, viewDir), 0.0), 4.0);

    float diffuse = clamp(dot(vNormalW, normalize(uSunDir)), 0.0, 1.0);
    vec3 sea = mix(uSeaDeep, uSeaShallow, diffuse * 0.6 + 0.2);

    // Crest foam: where the analytic slope is steep.
    float steepness = 1.0 - clamp(vNormalW.y, 0.0, 1.0);
    float crestFoam = smoothstep(0.35, 0.7, steepness);

    // Hull-contact foam band hugging the ship's waterline footprint.
    float hullDist = distToSegmentXZ(vWorldPos.xz, uHullBow.xz, uHullStern.xz);
    float band = 1.0 - smoothstep(uHullBeam * 0.55, uHullBeam * 1.4, hullDist);
    float hullFoam = band * uFoamAmount;

    // Simple bow/stern wake: brighter foam fanning from the two hull ends.
    float bowDist = length(vWorldPos.xz - uHullBow.xz);
    float sternDist = length(vWorldPos.xz - uHullStern.xz);
    float wake = (1.0 - smoothstep(0.0, uHullBeam * 3.0, bowDist)) * 0.6
      + (1.0 - smoothstep(0.0, uHullBeam * 3.5, sternDist)) * 0.5;

    float foam = clamp(crestFoam * 0.35 + hullFoam + wake * uFoamAmount, 0.0, 1.0);

    vec3 color = mix(sea, uFoamColor, foam);
    color += fresnel * vec3(0.2, 0.15, 0.1);

    gl_FragColor = vec4(color, 1.0);
  }
`

type OceanProps = {
  animate: boolean
  hullBow: [number, number, number]
  hullStern: [number, number, number]
  hullBeam: number
}

/** Loads the real (Sketchfab "water waves") base mesh, baking each node's
 * world transform into the geometry once so it can be rendered at the scene
 * root with our own animated shader material on top. */
function useWaterBaseGeometry(): THREE.BufferGeometry | null {
  const { scene } = useGLTF(WATER_BASE_URL)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)

  useEffect(() => {
    scene.updateMatrixWorld(true)
    let baked: THREE.BufferGeometry | null = null
    scene.traverse((obj) => {
      if (baked || !(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      const geo = mesh.geometry.clone()
      geo.applyMatrix4(mesh.matrixWorld)
      geo.computeVertexNormals()
      baked = geo
    })
    setGeometry(baked)
  }, [scene])

  return geometry
}

export function Ocean({ animate, hullBow, hullStern, hullBeam }: OceanProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const timeRef = useRef(0)
  const baseGeometry = useWaterBaseGeometry()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Warm, golden-hour water to match the site's cream/peach/coral palette.
      uSeaDeep: { value: new THREE.Color('#2c4a52') },
      uSeaShallow: { value: new THREE.Color('#9fc2bd') },
      uFoamColor: { value: new THREE.Color('#fff7ec') },
      uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.25) },
      uCameraPos: { value: new THREE.Vector3() },
      uHullBow: { value: new THREE.Vector3(...hullBow) },
      uHullStern: { value: new THREE.Vector3(...hullStern) },
      uHullBeam: { value: hullBeam },
      uFoamAmount: { value: 0.85 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) => {
    if (animate) timeRef.current += delta
    const u = materialRef.current?.uniforms
    if (!u) return
    u.uTime.value = timeRef.current
    u.uCameraPos.value.copy(state.camera.position)
    u.uHullBow.value.set(...hullBow)
    u.uHullStern.value.set(...hullStern)
  })

  if (!baseGeometry) return null

  return (
    <mesh geometry={baseGeometry} receiveShadow={false} frustumCulled={false}>
      <shaderMaterial ref={materialRef} vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
    </mesh>
  )
}

useGLTF.preload(WATER_BASE_URL)
