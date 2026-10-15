// Ported from ~/Downloads/gss-ship-hero.html: procedural heavy-lift carrier,
// sky dome and ocean shader. Builder code keeps the original keel-at-origin
// frame (keel y = 0, waterline y = DRAFT); buildHeroWorld() hands back a
// `rider` group offset by -DRAFT so the rest of the app keeps the site's
// convention of the design waterline at y = 0. Bow points +X, up is +Y.
import * as THREE from 'three'

export const LIVERY = {
  hull: 0x1b2c42, // topside navy
  boot: 0x141a22, // boot-top band at the waterline
  anti: 0x6e2a20, // antifouling below the waterline
  deck: 0x5a3a33, // deck red-oxide
  house: 0xe7ebed, // superstructure white
  crane: 0xc7551e, // heavy-lift crane orange
  cargo: 0xeff2f2, // blades + tower sections
  fittings: 0x36434e, // masts, rails, winches
  glass: 0x0e1a24,
  rescue: 0xe2661f,
}

const DIM = { LOA: 138, BEAM: 21, DEPTH: 11.2, DRAFT: 7.4 }
const HALF = DIM.LOA / 2
const HB = DIM.BEAM / 2

export const SUN_DIR = new THREE.Vector3(-0.55, 0.5, 0.66).normalize()
// Matches skyCol()'s horizon constant exactly, in linear space, so the water
// fades into the sky with no seam at the edge of the sea plane.
export const HAZE = new THREE.Color().setRGB(0.62, 0.71, 0.78)
export const FOG_NEAR = 420
export const FOG_FAR = 800

type V3 = [number, number, number]

/* ---------- utilities ---------- */
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const col = (hex: number) => new THREE.Color(hex)

const _m4 = new THREE.Matrix4()
const _eu = new THREE.Euler()
function place<T extends THREE.BufferGeometry>(g: T, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0): T {
  _eu.set(rx, ry, rz)
  _m4.makeRotationFromEuler(_eu)
  _m4.setPosition(x, y, z)
  g.applyMatrix4(_m4)
  return g
}
const box = (w: number, h: number, d: number, x?: number, y?: number, z?: number, rx?: number, ry?: number, rz?: number) =>
  place(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)
const cyl = (
  rt: number,
  rb: number,
  h: number,
  seg: number,
  x?: number,
  y?: number,
  z?: number,
  rx?: number,
  ry?: number,
  rz?: number,
) => place(new THREE.CylinderGeometry(rt, rb, h, seg || 12), x, y, z, rx, ry, rz)

// Strut between two points, used for crane lattice work.
function strut(p0: THREE.Vector3, p1: THREE.Vector3, r: number, seg = 6): THREE.BufferGeometry {
  const mid = p0.clone().add(p1).multiplyScalar(0.5)
  const d = p1.clone().sub(p0)
  const len = d.length()
  if (len < 1e-5) return new THREE.BufferGeometry()
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
  const g = new THREE.CylinderGeometry(r, r, len, seg)
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q)
  m.setPosition(mid)
  return g.applyMatrix4(m)
}

// Concatenate geometries into one buffer, so a few hundred parts cost one draw call.
function mergeGeos(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = []
  let n = 0
  for (const src of list) {
    const g = src.index ? src.toNonIndexed() : src
    if (!g.attributes.position || g.attributes.position.count === 0) continue
    if (!g.attributes.normal) g.computeVertexNormals()
    geos.push(g)
    n += g.attributes.position.count
  }
  const pos = new Float32Array(n * 3)
  const nor = new Float32Array(n * 3)
  const uv = new Float32Array(n * 2)
  let o = 0
  for (const g of geos) {
    pos.set(g.attributes.position.array as Float32Array, o * 3)
    nor.set(g.attributes.normal.array as Float32Array, o * 3)
    if (g.attributes.uv) uv.set(g.attributes.uv.array as Float32Array, o * 2)
    o += g.attributes.position.count
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return out
}

/* ---------- procedural textures ---------- */
function steelTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const x = c.getContext('2d')!
  x.fillStyle = '#8c8c8c'
  x.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 7000; i++) {
    const v = 140 + (Math.random() * 30 - 15)
    x.fillStyle = `rgb(${v},${v},${v})`
    x.fillRect(Math.random() * 512, Math.random() * 512, 2.5, 2.5)
  }
  x.strokeStyle = 'rgba(64,64,64,.5)'
  x.lineWidth = 2
  for (let j = 0; j <= 8; j++) {
    x.beginPath()
    x.moveTo(0, j * 64)
    x.lineTo(512, j * 64)
    x.stroke()
  }
  x.strokeStyle = 'rgba(74,74,74,.3)'
  x.lineWidth = 1.5
  for (let j = 0; j < 8; j++) {
    for (let i = 0; i < 4; i++) {
      const px = i * 128 + (j % 2 ? 64 : 0)
      x.beginPath()
      x.moveTo(px, j * 64)
      x.lineTo(px, j * 64 + 64)
      x.stroke()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function envTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const x = c.getContext('2d')!
  const g = x.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0.0, '#2C6EA8')
  g.addColorStop(0.34, '#7FADC8')
  g.addColorStop(0.49, '#C9D9E2')
  g.addColorStop(0.52, '#3E6376')
  g.addColorStop(1.0, '#11303F')
  x.fillStyle = g
  x.fillRect(0, 0, 512, 256)
  const sx = 512 * (0.5 + Math.atan2(SUN_DIR.x, SUN_DIR.z) / (Math.PI * 2))
  const sy = 256 * (Math.acos(clamp(SUN_DIR.y, -1, 1)) / Math.PI)
  const s = x.createRadialGradient(sx, sy, 0, sx, sy, 100)
  s.addColorStop(0, 'rgba(255,251,236,1)')
  s.addColorStop(0.18, 'rgba(255,245,218,.6)')
  s.addColorStop(1, 'rgba(255,245,218,0)')
  x.fillStyle = s
  x.fillRect(0, 0, 512, 256)
  const t = new THREE.CanvasTexture(c)
  t.mapping = THREE.EquirectangularReflectionMapping
  return t
}

/* ---------- sky ---------- */
const SKY_GLSL = /* glsl */ `
vec3 skyCol(vec3 d, vec3 sunD){
  float h = clamp(d.y, -1.0, 1.0);
  vec3 zen = vec3(0.075,0.255,0.510);
  vec3 mid = vec3(0.330,0.530,0.700);
  vec3 hor = vec3(0.620,0.710,0.780);
  vec3 c = mix(mid, zen, smoothstep(0.14, 0.86, h));
  c = mix(hor, c, smoothstep(-0.02, 0.19, h));
  c = mix(c, vec3(0.200,0.300,0.365), smoothstep(0.0, -0.10, h));
  float sd = max(dot(normalize(d), normalize(sunD)), 0.0);
  c += vec3(1.0,0.95,0.85) * pow(sd, 7.0) * 0.30;
  c += vec3(1.0,0.97,0.90) * pow(sd, 1.8) * 0.05 * smoothstep(-0.05, 0.40, h);
  return c;
}
`

function buildSky(): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(4200, 40, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uSun: { value: SUN_DIR } },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vDir; uniform vec3 uSun;
        ${SKY_GLSL}
        void main(){
          vec3 d = normalize(vDir);
          vec3 c = skyCol(d, uSun);
          float sd = max(dot(d, normalize(uSun)), 0.0);
          c += vec3(1.0,0.94,0.80) * pow(sd, 500.0) * 6.0;
          c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453) - 0.5) * 0.004;
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }),
  )
}

/* ---------- ocean ---------- */
const WAVES = [
  { dir: [1.0, 0.16], amp: 0.6, len: 58.0, spd: 0.42 },
  { dir: [0.72, -0.7], amp: 0.32, len: 31.0, spd: 0.52 },
  { dir: [-0.36, 0.94], amp: 0.17, len: 16.0, spd: 0.68 },
  { dir: [0.94, 0.34], amp: 0.09, len: 8.0, spd: 0.9 },
]
const waveVec = WAVES.map((w) => {
  const L = Math.hypot(w.dir[0], w.dir[1])
  return new THREE.Vector4(w.dir[0] / L, w.dir[1] / L, w.amp, w.len)
})
const waveSpd = new THREE.Vector4(WAVES[0].spd, WAVES[1].spd, WAVES[2].spd, WAVES[3].spd)
const waveSpdArr = [waveSpd.x, waveSpd.y, waveSpd.z, waveSpd.w]

/** CPU mirror of the shader height field, so the ship rides the water it floats on. */
export function waveHeight(x: number, z: number, t: number): number {
  let h = 0
  for (let i = 0; i < 4; i++) {
    const w = waveVec[i]
    const k = 6.2831853 / w.w
    h += w.z * Math.sin((w.x * x + w.y * z) * k + t * waveSpdArr[i] * Math.sqrt(9.81 * k))
  }
  return h
}

function buildOcean() {
  const uniforms = {
    uTime: { value: 0 },
    uWaves: { value: waveVec },
    uSpeed: { value: waveSpd },
    uSun: { value: SUN_DIR },
    uHaze: { value: HAZE },
    uCam: { value: new THREE.Vector3() },
    uFog: { value: new THREE.Vector2(FOG_NEAR, FOG_FAR) },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec4 uWaves[4]; uniform vec4 uSpeed;
      varying vec3 vWorld; varying float vH;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec2 p = wp.xz; float h = 0.0;
        for (int i = 0; i < 4; i++) {
          vec4 w = uWaves[i];
          float k = 6.2831853 / w.w;
          float sp = (i == 0) ? uSpeed.x : ((i == 1) ? uSpeed.y : ((i == 2) ? uSpeed.z : uSpeed.w));
          h += w.z * sin(dot(w.xy, p) * k + uTime * sp * sqrt(9.81 * k));
        }
        float fade = 1.0 - smoothstep(220.0, 700.0, length(p));
        h *= mix(0.15, 1.0, fade);
        wp.y += h; vH = h; vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec4 uWaves[4]; uniform vec4 uSpeed;
      uniform vec3 uSun; uniform vec3 uHaze; uniform vec3 uCam; uniform vec2 uFog;
      varying vec3 vWorld; varying float vH;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x), f.y);
      }
      ${SKY_GLSL}
      void main(){
        vec2 p = vWorld.xz;
        float dhdx = 0.0, dhdz = 0.0;
        for (int i = 0; i < 4; i++) {
          vec4 w = uWaves[i];
          float k = 6.2831853 / w.w;
          float sp = (i == 0) ? uSpeed.x : ((i == 1) ? uSpeed.y : ((i == 2) ? uSpeed.z : uSpeed.w));
          float c = cos(dot(w.xy, p) * k + uTime * sp * sqrt(9.81 * k)) * w.z * k;
          dhdx += c * w.x; dhdz += c * w.y;
        }
        float fade = 1.0 - smoothstep(220.0, 700.0, length(p));
        dhdx *= mix(0.08, 1.0, fade); dhdz *= mix(0.08, 1.0, fade);
        float n1 = noise(p * 0.62 + uTime * 0.22), n2 = noise(p * 1.55 - uTime * 0.31);
        dhdx += (n1 - 0.5) * 0.40 * fade; dhdz += (n2 - 0.5) * 0.40 * fade;
        vec3 N = normalize(vec3(-dhdx, 1.0, -dhdz));
        vec3 V = normalize(uCam - vWorld);
        vec3 R = reflect(-V, N);
        float fres = 0.022 + 0.978 * pow(1.0 - max(dot(N, V), 0.0), 5.0);

        vec3 deep    = vec3(0.006,0.023,0.041);
        vec3 shallow = vec3(0.016,0.070,0.086);
        vec3 body = mix(deep, shallow, smoothstep(-0.7, 0.9, vH));
        body += vec3(0.008,0.030,0.030) * max(dot(N, normalize(uSun)), 0.0);
        vec3 col = mix(body, skyCol(R, uSun), fres);

        vec3 H = normalize(normalize(uSun) + V);
        col += vec3(1.0,0.96,0.86) * pow(max(dot(N, H), 0.0), 300.0) * 3.0;
        col += vec3(1.0,0.95,0.88) * pow(max(dot(N, H), 0.0), 24.0) * 0.14;

        float foam = 0.0;
        foam += smoothstep(0.58, 0.92, vH) * smoothstep(0.40, 0.82, noise(p * 0.9 + uTime * 0.22)) * 0.30;
        // hull contact: distance to the centreline segment less the local half-beam
        float ax = clamp(p.x, -66.0, 60.0);
        float dHull = length(vec2(p.x - ax, p.y));
        float halfB = 10.5 * (1.0 - smoothstep(28.0, 66.0, abs(p.x)) * 0.35);
        foam += smoothstep(halfB + 3.2, halfB + 0.2, dHull) * 0.80;
        // V-wake shed aft from the bow, only outboard of the hull
        float aft = 62.0 - p.x;
        if (aft > 4.0) {
          float wob = (noise(vec2(aft * 0.11, p.y * 0.11) + uTime * 0.28) - 0.5) * 2.2;
          float band = smoothstep(3.0, 0.0, abs(abs(p.y) - (3.0 + aft * 0.30)) + wob);
          foam += band * (1.0 - smoothstep(20.0, 190.0, aft)) * 0.5;
        }
        // churned trail directly astern
        float sd = -66.0 - p.x;
        if (sd > 0.0) {
          float t2 = smoothstep(12.0, 0.0, abs(p.y) - sd * 0.06) * (1.0 - smoothstep(4.0, 120.0, sd));
          foam += t2 * (0.5 + 0.5 * noise(vec2(sd * 0.16, p.y * 0.28) - uTime * 0.7));
        }
        foam = clamp(foam, 0.0, 1.0) * (0.55 + 0.45 * noise(p * 2.6 + uTime * 0.4));
        col = mix(col, vec3(0.80,0.86,0.88), clamp(foam, 0.0, 1.0) * 0.95);

        // soft cast shadow of the vessel, projected along the sun
        vec2 sh = p + uSun.xz * (11.0 / max(uSun.y, 0.2));
        float e = length(vec2((sh.x + 4.0) / 76.0, sh.y / 15.5));
        col *= mix(0.70, 1.0, smoothstep(0.70, 1.30, e));

        col = mix(col, uHaze, smoothstep(uFog.x, uFog.y, length(uCam - vWorld)));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })

  // A dense disc where the detail matters, plus a coarse ring out to the haze.
  // Both share the wave field and theta count, so the seam at r = 460 is continuous.
  const group = new THREE.Group()
  for (const r of [
    [0.4, 460, 200, 112],
    [460, 5400, 200, 14],
  ]) {
    const g = new THREE.RingGeometry(r[0], r[1], r[2], r[3])
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, material)
    m.renderOrder = -1
    m.frustumCulled = false
    group.add(m)
  }
  return { group, uniforms }
}

/* ---------- hull, lofted from station sections ---------- */
function halfBeamUnder(s: number) {
  if (s < -0.78) return HB * lerp(0.78, 1.0, smoothstep(-1.0, -0.78, s))
  if (s > 0.4) {
    // gentle entrance, then a rounded stem rather than a chisel
    return HB * lerp(1.0, 0.46, smoothstep(0.4, 0.84, s)) * lerp(1.0, 0.17, smoothstep(0.8, 1.0, s))
  }
  return HB
}
function expo(s: number) {
  // superellipse fullness: flat-bottomed amidships, V forward
  const n = lerp(3.4, 5.6, smoothstep(-1.0, -0.55, s))
  return lerp(n, 1.85, smoothstep(0.5, 0.95, s))
}
function flare(s: number) {
  // extra half-beam at deck level, forward
  return lerp(0, 2.7, smoothstep(0.46, 0.82, s)) * lerp(1.0, 0.62, smoothstep(0.82, 1.0, s))
}
function deckY(s: number) {
  // sheer line
  const fwd = clamp((s + 0.1) / 1.1, 0, 1)
  const aft = clamp((-0.1 - s) / 0.9, 0, 1)
  return DIM.DEPTH + 1.4 * Math.pow(fwd, 2.4) + 0.6 * aft * aft
}
const keelY = (s: number) => 2.1 * smoothstep(0.8, 1.0, s)

function sectionPoint(s: number, u: number): [number, number] {
  const th = (u * Math.PI) / 2
  const p = 2 / expo(s)
  const dY = deckY(s)
  const D = dY - keelY(s)
  const z = Math.pow(Math.sin(th), p) * halfBeamUnder(s) + flare(s) * smoothstep(0.45, 1.0, u)
  const y = dY - Math.pow(Math.cos(th), p) * D
  return [z, y]
}

function buildShip(): THREE.Group {
  const NS = 96
  const NU = 26
  const grid: V3[][] = []
  for (let i = 0; i <= NS; i++) {
    const s = -1 + 2 * (i / NS)
    const row: V3[] = []
    for (let j = 0; j <= NU; j++) {
      const sp = sectionPoint(s, j / NU)
      row.push([s * HALF, sp[1], sp[0]])
    }
    grid.push(row)
  }

  const ship = new THREE.Group()
  const steelTex = steelTexture()

  // hull
  {
    const cHull = col(LIVERY.hull)
    const cBoot = col(LIVERY.boot)
    const cAnti = col(LIVERY.anti)
    const pos: number[] = []
    const uvs: number[] = []
    const colA: number[] = []
    const push = (v: V3) => {
      pos.push(v[0], v[1], v[2])
      uvs.push((v[0] + HALF) / 11, v[1] / 5.2)
      const c = v[1] < DIM.DRAFT - 0.3 ? cAnti : v[1] < DIM.DRAFT + 0.55 ? cBoot : cHull
      colA.push(c.r, c.g, c.b)
    }
    const mirror = (v: V3): V3 => [v[0], v[1], -v[2]]
    for (let i = 0; i < NS; i++) {
      for (let j = 0; j < NU; j++) {
        const a = grid[i][j]
        const b = grid[i + 1][j]
        const c2 = grid[i + 1][j + 1]
        const d = grid[i][j + 1]
        push(a); push(b); push(c2); push(a); push(c2); push(d)
        const A = mirror(a), B = mirror(b), C = mirror(c2), D2 = mirror(d)
        push(A); push(C); push(B); push(A); push(D2); push(C)
      }
    }
    const st = grid[0] // transom cap
    for (let j = 0; j < NU; j++) {
      const p0 = st[j]
      const p1 = st[j + 1]
      const m0 = mirror(p0)
      const m1 = mirror(p1)
      push(p0); push(m0); push(m1)
      push(p0); push(m1); push(p1)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colA, 3))
    g.computeVertexNormals()
    const m = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.4,
        roughnessMap: steelTex,
        bumpMap: steelTex,
        bumpScale: 0.03,
      }),
    )
    m.name = 'Hull'
    m.castShadow = true
    m.receiveShadow = true
    ship.add(m)
  }

  // main deck + bulwark
  {
    const deckPos: number[] = []
    const bulPos: number[] = []
    const tri = (arr: number[], a: V3, b: V3, c: V3) => arr.push(...a, ...b, ...c)
    for (let i = 0; i < NS; i++) {
      const e0 = grid[i][NU]
      const e1 = grid[i + 1][NU]
      const a: V3 = [e0[0], e0[1], e0[2]]
      const b: V3 = [e1[0], e1[1], e1[2]]
      const A: V3 = [e0[0], e0[1], -e0[2]]
      const B: V3 = [e1[0], e1[1], -e1[2]]
      tri(deckPos, a, A, B)
      tri(deckPos, a, B, b)
      const h = 1.5
      const at: V3 = [a[0], a[1] + h, a[2]]
      const bt: V3 = [b[0], b[1] + h, b[2]]
      const At: V3 = [A[0], A[1] + h, A[2]]
      const Bt: V3 = [B[0], B[1] + h, B[2]]
      tri(bulPos, a, at, bt)
      tri(bulPos, a, bt, b)
      tri(bulPos, A, Bt, At)
      tri(bulPos, A, B, Bt)
    }
    const meshFrom = (arr: number[], mat: THREE.Material, name: string) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
      g.computeVertexNormals()
      const m = new THREE.Mesh(g, mat)
      m.name = name
      m.castShadow = true
      m.receiveShadow = true
      ship.add(m)
    }
    meshFrom(deckPos, new THREE.MeshStandardMaterial({ color: col(LIVERY.deck), roughness: 0.9, metalness: 0.1, side: THREE.DoubleSide }), 'MainDeck')
    meshFrom(bulPos, new THREE.MeshStandardMaterial({ color: col(LIVERY.hull), roughness: 0.55, metalness: 0.4, side: THREE.DoubleSide }), 'Bulwark')
  }

  // materials
  const matWhite = new THREE.MeshStandardMaterial({ color: col(LIVERY.house), roughness: 0.6, metalness: 0.1, roughnessMap: steelTex, bumpMap: steelTex, bumpScale: 0.018 })
  const matOrange = new THREE.MeshStandardMaterial({ color: col(LIVERY.crane), roughness: 0.58, metalness: 0.3 })
  const matFittings = new THREE.MeshStandardMaterial({ color: col(LIVERY.fittings), roughness: 0.52, metalness: 0.68 })
  const matGlass = new THREE.MeshStandardMaterial({ color: col(LIVERY.glass), roughness: 0.1, metalness: 0.95 })
  const matDark = new THREE.MeshStandardMaterial({ color: col(0x2a3540), roughness: 0.74, metalness: 0.32 })
  const matHullC = new THREE.MeshStandardMaterial({ color: col(LIVERY.hull), roughness: 0.55, metalness: 0.42 })
  const matCargo = new THREE.MeshStandardMaterial({ color: col(LIVERY.cargo), roughness: 0.4, metalness: 0.05 })
  const matRescue = new THREE.MeshStandardMaterial({ color: col(LIVERY.rescue), roughness: 0.5, metalness: 0.1 })

  const BK = { white: [] as THREE.BufferGeometry[], fittings: [] as THREE.BufferGeometry[], glass: [] as THREE.BufferGeometry[], dark: [] as THREE.BufferGeometry[], hullc: [] as THREE.BufferGeometry[] }

  // superstructure
  const HOUSE_BASE = deckY(-0.75) + 0.02
  {
    const levels = [
      { x0: -62.0, x1: -42.6, w: 16.2, h: 3.0 },
      { x0: -61.6, x1: -42.9, w: 15.9, h: 2.9 },
      { x0: -61.2, x1: -43.2, w: 15.6, h: 2.9 },
      { x0: -60.8, x1: -43.5, w: 15.3, h: 2.9 },
    ]
    let y = HOUSE_BASE
    for (const L of levels) {
      const len = L.x1 - L.x0
      const cx = (L.x0 + L.x1) / 2
      BK.white.push(box(len, L.h, L.w, cx, y + L.h / 2, 0))
      BK.glass.push(box(len * 0.88, 0.78, L.w + 0.14, cx, y + L.h * 0.68, 0))
      BK.glass.push(box(len + 0.14, 0.78, L.w * 0.84, cx, y + L.h * 0.68, 0))
      BK.fittings.push(box(len + 0.5, 0.14, L.w + 0.5, cx, y + L.h, 0))
      y += L.h
    }

    const bw = 20.4, bl = 8.4, bh = 3.4, bx = -46.9
    BK.white.push(box(bl, bh, bw, bx, y + bh / 2, 0))
    BK.glass.push(box(bl * 0.46, 1.7, bw + 0.2, bx, y + bh * 0.62, 0))
    BK.glass.push(box(bl + 0.2, 1.7, bw * 0.6, bx, y + bh * 0.62, 0))
    BK.white.push(box(2.0, bh * 0.98, bw * 0.99, bx - bl / 2 - 0.5, y + bh / 2, 0, 0, 0, 0.2))
    BK.fittings.push(box(bl + 1.2, 0.14, bw + 1.2, bx, y + bh + 0.07, 0))

    const wy = y + bh
    for (let i = -1; i <= 1; i += 2) {
      BK.fittings.push(cyl(0.09, 0.09, 1.15, 6, bx - 3.4, wy + 0.58, i * (bw / 2 - 0.2)))
      BK.fittings.push(cyl(0.09, 0.09, 1.15, 6, bx + 3.4, wy + 0.58, i * (bw / 2 - 0.2)))
      BK.fittings.push(box(7.2, 0.1, 0.1, bx, wy + 1.12, i * (bw / 2 - 0.2)))
    }

    BK.white.push(box(5.0, 0.9, 11.0, bx + 0.6, wy + 0.45, 0))
    const my = wy + 0.9
    BK.fittings.push(cyl(0.2, 0.3, 9.0, 10, bx + 0.6, my + 4.5, 0))
    BK.fittings.push(box(0.16, 0.16, 8.0, bx + 0.6, my + 5.6, 0))
    BK.fittings.push(box(0.14, 0.14, 5.2, bx + 0.6, my + 7.4, 0))
    BK.white.push(box(0.5, 0.42, 3.5, bx + 0.6, my + 8.9, 0))
    BK.white.push(cyl(0.85, 0.85, 0.9, 12, bx + 0.6, my + 6.6, 2.9))
    for (let i = -1; i <= 1; i += 2) BK.fittings.push(cyl(0.07, 0.07, 2.4, 5, bx + 0.6, my + 6.1, i * 3.9, 0, 0, i * 0.32))

    // funnel + uptakes
    BK.white.push(box(6.0, 6.6, 7.8, -57.5, HOUSE_BASE + 11.7 + 3.3, 0, 0, 0, -0.09))
    BK.dark.push(box(6.3, 1.9, 8.1, -57.85, HOUSE_BASE + 11.7 + 6.0, 0, 0, 0, -0.09))
    BK.dark.push(cyl(0.6, 0.6, 1.5, 10, -58.6, HOUSE_BASE + 11.7 + 7.2, -1.9))
    BK.dark.push(cyl(0.6, 0.6, 1.5, 10, -58.6, HOUSE_BASE + 11.7 + 7.2, 1.9))
    BK.white.push(box(4.2, 2.4, 11.6, -40.8, HOUSE_BASE + 1.2, 0))

    // free-fall lifeboat ramp on the centreline, angled down over the transom
    BK.fittings.push(box(9.0, 0.5, 4.2, -64.4, HOUSE_BASE + 1.5, 0, 0, 0, -0.42))
    BK.fittings.push(box(0.5, 3.4, 3.8, -60.6, HOUSE_BASE + 1.6, 0))
  }

  const lifeboat = new THREE.Mesh(
    mergeGeos([
      cyl(1.05, 1.25, 6.2, 14, -64.4, HOUSE_BASE + 2.9, 0, 0, 0, Math.PI / 2 - 0.42),
      place(new THREE.SphereGeometry(1.25, 14, 10), -61.6, HOUSE_BASE + 4.05, 0),
    ]),
    matRescue,
  )
  lifeboat.name = 'Lifeboat'
  lifeboat.castShadow = true
  ship.add(lifeboat)

  // hatch covers
  for (const [cx, len] of [
    [-33, 24],
    [-4, 26],
    [24, 24],
  ]) {
    const s = cx / HALF
    const w = halfBeamUnder(s) * 2 - 3.4
    BK.dark.push(box(len, 0.8, w, cx, deckY(s) + 0.4, 0))
    for (let j = 1; j < 4; j++) BK.fittings.push(box(0.3, 0.9, w, cx - len / 2 + (len / 4) * j, deckY(s) + 0.4, 0))
  }

  // heavy-lift cranes
  function latticeBoom(len: number, baseW: number, tipW: number) {
    const g: THREE.BufferGeometry[] = []
    const segs = Math.round(len / 3.0)
    const quad = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ]
    for (let j = 0; j < segs; j++) {
      const ta = j / segs
      const tb = (j + 1) / segs
      const wa = lerp(baseW, tipW, ta) / 2
      const wb = lerp(baseW, tipW, tb) / 2
      const ya = ta * len
      const yb = tb * len
      for (let i = 0; i < 4; i++) {
        // chords
        g.push(strut(new THREE.Vector3(quad[i][0] * wa, ya, quad[i][1] * wa), new THREE.Vector3(quad[i][0] * wb, yb, quad[i][1] * wb), 0.19, 6))
      }
      for (let f = 0; f < 4; f++) {
        // bracing + ring members
        const a = quad[f]
        const b = quad[(f + 1) % 4]
        const P0 = new THREE.Vector3((j % 2 ? b : a)[0] * wa, ya, (j % 2 ? b : a)[1] * wa)
        const P1 = new THREE.Vector3((j % 2 ? a : b)[0] * wb, yb, (j % 2 ? a : b)[1] * wb)
        g.push(strut(P0, P1, 0.095, 5))
        g.push(strut(new THREE.Vector3(a[0] * wa, ya, a[1] * wa), new THREE.Vector3(b[0] * wa, ya, b[1] * wa), 0.085, 5))
      }
    }
    return mergeGeos(g)
  }

  function buildCrane(name: string, px: number, pz: number, slew: number, pitch: number) {
    const s = px / HALF
    const dy = deckY(s)
    const group = new THREE.Group()
    group.name = name

    const ped = new THREE.Mesh(mergeGeos([cyl(2.5, 2.95, 9.4, 20, px, dy + 4.7, pz), cyl(3.15, 3.15, 0.55, 20, px, dy + 9.6, pz)]), matOrange)
    ped.name = `${name}_Pedestal`
    ped.castShadow = true
    ped.receiveShadow = true
    group.add(ped)

    const house = new THREE.Group()
    house.name = `${name}_HouseShell`
    house.position.set(px, dy + 9.9, pz)
    house.rotation.y = slew

    const hm = new THREE.Mesh(
      mergeGeos([
        box(7.4, 4.6, 5.8, -1.2, 2.3, 0),
        cyl(1.5, 1.5, 5.4, 12, -3.9, 2.6, 0, Math.PI / 2, 0, 0),
        box(2.7, 2.5, 2.5, 3.0, 3.3, -2.2),
        strut(new THREE.Vector3(-3.4, 1.2, -1.5), new THREE.Vector3(-1.2, 8.6, -1.5), 0.26, 8),
        strut(new THREE.Vector3(-3.4, 1.2, 1.5), new THREE.Vector3(-1.2, 8.6, 1.5), 0.26, 8),
        strut(new THREE.Vector3(-1.2, 8.6, -1.5), new THREE.Vector3(-1.2, 8.6, 1.5), 0.2, 8),
      ]),
      matOrange,
    )
    hm.name = `${name}_MachineryHouse`
    hm.castShadow = true
    hm.receiveShadow = true
    house.add(hm)
    house.add(new THREE.Mesh(box(2.75, 1.2, 2.6, 3.0, 3.65, -2.2), matGlass))

    const bl = 34
    const boom = new THREE.Group()
    boom.name = `${name}_Boom`
    boom.position.set(2.4, 2.6, 0)
    boom.rotation.z = -pitch
    const bm = new THREE.Mesh(latticeBoom(bl, 3.0, 1.5), matOrange)
    bm.name = `${name}_BoomLattice`
    bm.castShadow = true
    boom.add(bm)
    boom.add(new THREE.Mesh(cyl(0.78, 0.78, 1.6, 12, 0, bl + 0.35, 0, Math.PI / 2, 0, 0), matFittings))
    house.add(boom)

    // hoist rope + hook block, hanging vertically from the boom head
    const hx = 2.4 + bl * Math.sin(pitch)
    const hy = 2.6 + bl * Math.cos(pitch)
    const drop = hy - 11.0
    const rig = new THREE.Mesh(
      mergeGeos([cyl(0.07, 0.07, drop, 5, hx, hy - drop / 2, 0), box(1.8, 1.6, 1.2, hx, hy - drop - 0.8, 0), cyl(0.24, 0.24, 1.5, 8, hx, hy - drop - 2.2, 0)]),
      matFittings,
    )
    rig.name = `${name}_HoistRigging`
    rig.castShadow = true
    house.add(rig)

    group.add(house)
    return group
  }

  ship.add(buildCrane('Crane_Aft', -36.0, -7.2, 0.06, 1.02))
  ship.add(buildCrane('Crane_Fwd', 4.0, -7.2, -0.05, 0.94))

  // cargo: tower sections and lofted turbine blades
  function bladeGeometry(length: number) {
    const NSEC = 44
    const NP = 34
    const sections: V3[][] = []
    for (let i = 0; i <= NSEC; i++) {
      const t = i / NSEC
      const chord = t < 0.2 ? lerp(2.4, 4.2, smoothstep(0, 0.2, t)) : lerp(4.2, 0.85, Math.pow(smoothstep(0.2, 1.0, t), 0.8))
      const thick = lerp(0.85, 0.14, smoothstep(0.02, 0.4, t))
      const twist = lerp(0.32, -0.02, smoothstep(0.02, 0.7, t))
      const circular = 1 - smoothstep(0.0, 0.11, t) // circular root transition
      const prebend = Math.pow(t, 2.4) * 1.9
      const ring: V3[] = []
      for (let j = 0; j < NP; j++) {
        const ang = (j / NP) * Math.PI * 2
        const cx = 0.5 * (1 + Math.cos(ang)) // 1 -> 0 -> 1, cosine spaced
        const side = Math.sin(ang) >= 0 ? 1 : -1
        const yt = 5 * thick * (0.2969 * Math.sqrt(cx) - 0.126 * cx - 0.3516 * cx * cx + 0.2843 * cx * cx * cx - 0.1036 * cx * cx * cx * cx)
        const camber = 0.055 * (cx < 0.4 ? (0.8 * cx - cx * cx) / 0.16 : (0.2 + 0.8 * cx - cx * cx) / 0.36)
        const ax = (cx - 0.32) * chord
        const ay = (side * yt + camber) * chord
        const ox = Math.cos(ang) * 1.15
        const oy = Math.sin(ang) * 1.15
        const fx = lerp(ax, ox, circular)
        const fy = lerp(ay, oy, circular)
        const ct = Math.cos(twist)
        const stw = Math.sin(twist)
        ring.push([fx * ct - fy * stw, t * length, fx * stw + fy * ct + prebend])
      }
      sections.push(ring)
    }
    const pos: number[] = []
    const uvs: number[] = []
    const pv = (p: V3, u: number, v: number) => {
      pos.push(p[0], p[1], p[2])
      uvs.push(u, v)
    }
    for (let i = 0; i < NSEC; i++) {
      for (let j = 0; j < NP; j++) {
        const k = (j + 1) % NP
        const a = sections[i][j], b = sections[i + 1][j], c = sections[i + 1][k], d = sections[i][k]
        pv(a, j / NP, i / NSEC); pv(b, j / NP, (i + 1) / NSEC); pv(c, (j + 1) / NP, (i + 1) / NSEC)
        pv(a, j / NP, i / NSEC); pv(c, (j + 1) / NP, (i + 1) / NSEC); pv(d, (j + 1) / NP, i / NSEC)
      }
    }
    const root = sections[0]
    for (let j = 0; j < NP; j++) {
      const k2 = (j + 1) % NP
      pv([0, 0, 0], 0.5, 0); pv(root[k2], 0, 0); pv(root[j], 1, 0)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.computeVertexNormals()
    return g
  }

  // four tower sections standing on the forward deck
  ;[23, 32, 41, 50].forEach((x, i) => {
    const dy = deckY(x / HALF)
    const m = new THREE.Mesh(mergeGeos([cyl(2.02, 2.35, 15.5, 28, 0, 7.75, 0), cyl(2.5, 2.5, 0.35, 28, 0, 0.18, 0), cyl(2.16, 2.16, 0.32, 28, 0, 15.34, 0)]), matCargo)
    m.name = `TowerSection_${i + 1}`
    m.position.set(x, dy + 0.9, 1.6)
    m.castShadow = true
    m.receiveShadow = true
    ship.add(m)
    BK.dark.push(box(5.2, 0.9, 5.2, x, dy + 0.45, 1.6))
  })

  // five blades stowed lengthwise, nested in two tiers on low trestles
  {
    const bladeGeo = bladeGeometry(60)
    const rows = [
      { y: 3.4, zs: [-3.4, 0.6, 4.6] },
      { y: 7.5, zs: [-1.4, 2.6] },
    ]
    const xRoot = -37
    let n = 0
    rows.forEach((row, r) => {
      row.zs.forEach((z, i) => {
        const m = new THREE.Mesh(bladeGeo, matCargo)
        m.name = `Blade_${++n}`
        m.rotation.set(0, 0, -Math.PI / 2) // lay the span axis along +X
        m.rotateY(r * Math.PI + i * 0.14) // roll about the blade's own span axis
        m.position.set(xRoot, deckY(0) + row.y, z)
        m.castShadow = true
        m.receiveShadow = true
        ship.add(m)
      })
    })
    // trestles: a low sill with angled legs, kept clear of the blade surfaces
    for (let c = 0; c < 5; c++) {
      const cx = -34 + c * 12
      BK.dark.push(box(1.6, 1.9, 13.5, cx, deckY(0) + 1.35, 0.6))
      BK.fittings.push(box(0.9, 0.34, 13.5, cx, deckY(0) + 2.4, 0.6))
      BK.fittings.push(box(0.5, 4.6, 0.5, cx, deckY(0) + 4.0, -5.2, 0.16, 0, 0))
      BK.fittings.push(box(0.5, 4.6, 0.5, cx, deckY(0) + 4.0, 6.4, -0.16, 0, 0))
    }
  }

  // deck fittings
  {
    BK.hullc.push(box(8.0, 2.4, 8.0, 57.5, deckY(57.5 / HALF) + 1.2, 0))
    BK.fittings.push(box(0.6, 1.9, 12.0, 51.5, deckY(51.5 / HALF) + 0.95, 0, 0, 0, -0.16))
    BK.fittings.push(box(3.8, 1.7, 5.4, 58.5, deckY(58.5 / HALF) + 3.25, 0))
    BK.fittings.push(cyl(1.0, 1.0, 4.6, 12, 58.5, deckY(58.5 / HALF) + 3.5, 0, Math.PI / 2, 0, 0))
    BK.fittings.push(box(4.2, 1.8, 6.0, -62.0, deckY(-62 / HALF) + 0.9, 0))

    for (let i = 0; i < 12; i++) {
      const x = -62 + i * 11
      const s = x / HALF
      const hb = halfBeamUnder(s) + flare(s) - 0.9
      BK.fittings.push(cyl(0.42, 0.46, 1.5, 8, x, deckY(s) + 0.75, hb))
      BK.fittings.push(cyl(0.42, 0.46, 1.5, 8, x, deckY(s) + 0.75, -hb))
    }
    for (let i = 0; i <= 34; i++) {
      const x = 45 + (i / 34) * 22
      const s = x / HALF
      if (s > 0.982) continue
      const hb = halfBeamUnder(s) + flare(s)
      BK.fittings.push(cyl(0.055, 0.055, 1.05, 5, x, deckY(s) + 2.55, hb))
      BK.fittings.push(cyl(0.055, 0.055, 1.05, 5, x, deckY(s) + 2.55, -hb))
    }
    BK.dark.push(box(0.5, 2.2, 3.0, 64.0, DIM.DRAFT + 3.4, 5.6, 0, 0.3, 0))
    BK.dark.push(box(0.5, 2.2, 3.0, 64.0, DIM.DRAFT + 3.4, -5.6, 0, -0.3, 0))
    BK.dark.push(box(1.0, 6.5, 4.6, -68.0, 3.4, 0))
  }

  // flush buckets
  ;(
    [
      [BK.white, matWhite, 'Superstructure'],
      [BK.fittings, matFittings, 'Fittings'],
      [BK.glass, matGlass, 'Windows'],
      [BK.dark, matDark, 'DeckStructures'],
      [BK.hullc, matHullC, 'ForecastleDeck'],
    ] as [THREE.BufferGeometry[], THREE.Material, string][]
  ).forEach(([geos, mat, name]) => {
    if (!geos.length) return
    const m = new THREE.Mesh(mergeGeos(geos), mat)
    m.name = name
    m.castShadow = true
    m.receiveShadow = true
    ship.add(m)
  })

  return ship
}

export type HeroWorld = {
  sky: THREE.Mesh
  ocean: THREE.Group
  oceanUniforms: ReturnType<typeof buildOcean>['uniforms']
  /** Moves with the swell; waterline-at-origin frame. Children are keel-at-origin. */
  rider: THREE.Group
  draft: number
}

export function buildHeroWorld(): HeroWorld {
  const { group: ocean, uniforms } = buildOcean()
  const rider = new THREE.Group()
  rider.position.y = -DIM.DRAFT
  rider.add(buildShip())
  return { sky: buildSky(), ocean, oceanUniforms: uniforms, rider, draft: DIM.DRAFT }
}
