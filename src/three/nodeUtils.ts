import * as THREE from 'three'

/** World-space bounding-box center of the union of named nodes under root. */
export function getWorldBoundsCenter(root: THREE.Object3D, names: string[]): THREE.Vector3 | null {
  const box = new THREE.Box3()
  let found = false
  for (const name of names) {
    const obj = root.getObjectByName(name)
    if (!obj) continue
    const objBox = new THREE.Box3().setFromObject(obj)
    if (objBox.isEmpty()) continue
    box.union(objBox)
    found = true
  }
  if (!found) return null
  const center = new THREE.Vector3()
  box.getCenter(center)
  return center
}

export function findNodes(root: THREE.Object3D, names: string[]): THREE.Object3D[] {
  const out: THREE.Object3D[] = []
  for (const name of names) {
    const obj = root.getObjectByName(name)
    if (obj) out.push(obj)
  }
  return out
}
