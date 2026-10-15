// Measured constants for gss-project-carrier-draco.glb. Units: metres.
// Origin is the design waterline (y = 0), not the keel. Bow points +X, up is +Y.

export const VESSEL = {
  modelUrl: '/models/gss-project-carrier-draco.glb',
  loa: 138.0,
  beam: 21.8,
  draft: 7.4,
  keelY: -7.4,
  mainDeckY: 3.8,
  craneTipY: 37.7,
  // Approximate bow/stern points at the waterline, ship-local == world when
  // the ship group sits at the origin (which it does — see Ship.tsx).
  bow: [69, 0, 0] as [number, number, number],
  stern: [-69, 0, 0] as [number, number, number],
}

export const CAMERA_DEFAULT = {
  radius: 178,
  polar: 1.11, // radians from +Y
  fov: 38,
}

// Minimum polar angle keeps the camera from tipping over the top; maximum
// keeps it from dropping below the waterline (polar measured from +Y up).
export const POLAR_LIMITS = {
  min: 0.55,
  max: 1.48,
}

export type CameraPose = {
  target: [number, number, number]
  position: [number, number, number]
}

const DEFAULT_AZIMUTH = 0.92

export function getDefaultPose(): CameraPose {
  const { radius, polar } = CAMERA_DEFAULT
  const x = radius * Math.sin(polar) * Math.sin(DEFAULT_AZIMUTH)
  const y = radius * Math.cos(polar)
  const z = radius * Math.sin(polar) * Math.cos(DEFAULT_AZIMUTH)
  return {
    // Aimed at the vessel's midsection (between main deck and crane tips)
    // rather than the waterline, so the fixed 1.11 rad polar angle still
    // lets a sliver of horizon/sky read above the hull.
    target: [-3, 8.6, 0],
    position: [x, y, z],
  }
}
