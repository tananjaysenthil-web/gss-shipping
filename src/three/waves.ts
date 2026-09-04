// Shared wave definition used by both the GPU ocean shader (Ocean.tsx) and
// the CPU heave/pitch/roll calculation for the ship (Ship.tsx), so the hull
// always sits on the same surface it's rendered floating on.
//
// Four directional sine components summed together, each contributing an
// analytic (closed-form) normal contribution rather than a finite-difference
// approximation — cheap on the GPU and exact on the CPU.

export type WaveComponent = {
  dirX: number
  dirZ: number
  amplitude: number // metres
  wavelength: number // metres
  speed: number // m/s (phase speed along the wave direction)
}

function normalizeDir(x: number, z: number): [number, number] {
  const len = Math.hypot(x, z) || 1
  return [x / len, z / len]
}

const raw: [number, number, number, number, number][] = [
  // dirX, dirZ, amplitude, wavelength, speed
  [1.0, 0.15, 0.42, 38, 5.2],
  [0.6, -0.8, 0.28, 22, 4.1],
  [-0.35, 0.9, 0.18, 14, 3.2],
  [-0.9, -0.3, 0.1, 8, 2.4],
]

export const WAVES: WaveComponent[] = raw.map(([x, z, amplitude, wavelength, speed]) => {
  const [dirX, dirZ] = normalizeDir(x, z)
  return { dirX, dirZ, amplitude, wavelength, speed }
})

const TWO_PI = Math.PI * 2

/** CPU mirror of the vertex-shader displacement. Metres, ship/world Y. */
export function waveHeight(x: number, z: number, t: number): number {
  let y = 0
  for (const w of WAVES) {
    const k = TWO_PI / w.wavelength
    const phase = k * (w.dirX * x + w.dirZ * z) - w.speed * k * t
    y += w.amplitude * Math.sin(phase)
  }
  return y
}

/** Analytic surface gradient (dHeight/dx, dHeight/dz) at a point. */
export function waveGradient(x: number, z: number, t: number): [number, number] {
  let dx = 0
  let dz = 0
  for (const w of WAVES) {
    const k = TWO_PI / w.wavelength
    const phase = k * (w.dirX * x + w.dirZ * z) - w.speed * k * t
    const slope = w.amplitude * k * Math.cos(phase)
    dx += slope * w.dirX
    dz += slope * w.dirZ
  }
  return [dx, dz]
}

/** GLSL source fragment defining the same components + a height()/normal() pair. */
export function buildWaveGLSL(): string {
  const entries = WAVES.map(
    (w) => `vec4(${w.dirX.toFixed(6)}, ${w.dirZ.toFixed(6)}, ${w.amplitude.toFixed(6)}, ${w.wavelength.toFixed(6)})`,
  ).join(',\n    ')
  const speeds = WAVES.map((w) => w.speed.toFixed(6)).join(', ')
  return `
  const int WAVE_COUNT = ${WAVES.length};
  vec4 waveData[WAVE_COUNT] = vec4[WAVE_COUNT](
    ${entries}
  );
  float waveSpeeds[WAVE_COUNT] = float[WAVE_COUNT](${speeds});

  float waveHeightAt(vec2 p, float t) {
    float y = 0.0;
    for (int i = 0; i < WAVE_COUNT; i++) {
      vec4 w = waveData[i];
      float k = 6.28318530718 / w.w;
      float phase = k * (w.x * p.x + w.y * p.y) - waveSpeeds[i] * k * t;
      y += w.z * sin(phase);
    }
    return y;
  }

  // Analytic normal from the summed partial derivatives (no finite differencing).
  vec3 waveNormalAt(vec2 p, float t) {
    float dx = 0.0;
    float dz = 0.0;
    for (int i = 0; i < WAVE_COUNT; i++) {
      vec4 w = waveData[i];
      float k = 6.28318530718 / w.w;
      float phase = k * (w.x * p.x + w.y * p.y) - waveSpeeds[i] * k * t;
      float slope = w.z * k * cos(phase);
      dx += slope * w.x;
      dz += slope * w.y;
    }
    return normalize(vec3(-dx, 1.0, -dz));
  }
  `
}
