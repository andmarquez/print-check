import * as THREE from 'three'

/**
 * Most STL files use Z-up (CAD/slicer convention) while Three.js uses Y-up.
 * Detect the likely up axis and rotate so the model stands upright in the viewer.
 */
export function normalizeStlUpAxis(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = source.clone()
  geo.computeBoundingBox()
  const size = new THREE.Vector3()
  geo.boundingBox!.getSize(size)

  const { x, y, z } = size
  const yIsShortest = y <= x * 0.95 && y <= z * 0.95
  const zIsTallest = z >= x * 0.85 && z > y * 1.08
  const xIsTallest = x >= z * 0.85 && x > y * 1.08

  if (zIsTallest || (yIsShortest && z >= x)) {
    // Z-up STL → Y-up (most common, e.g. figurines exported from CAD)
    geo.rotateX(-Math.PI / 2)
  } else if (xIsTallest) {
    // X-up export → Y-up
    geo.rotateZ(Math.PI / 2)
  }

  geo.computeBoundingBox()
  geo.computeVertexNormals()
  return geo
}

/** Center on build plate (XZ centered, bottom at Y=0) after standing upright. */
export function centerOnBuildPlate(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = normalizeStlUpAxis(source)
  geo.computeBoundingBox()
  const box = geo.boundingBox!
  const center = new THREE.Vector3()
  box.getCenter(center)
  geo.translate(-center.x, -box.min.y, -center.z)
  geo.computeBoundingBox()
  geo.computeVertexNormals()
  return geo
}

export interface ModelFrame {
  geometry: THREE.BufferGeometry
  scale: number
  center: THREE.Vector3
  size: THREE.Vector3
}

export function frameModelForViewer(
  source: THREE.BufferGeometry,
  targetSize = 2.2,
  displayScale = 1
): ModelFrame {
  const geometry = centerOnBuildPlate(source)
  geometry.computeBoundingBox()

  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  geometry.boundingBox!.getSize(size)
  geometry.boundingBox!.getCenter(center)

  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const fitScale = targetSize / maxDim
  const scale = fitScale * displayScale

  return {
    geometry,
    scale,
    center: center.clone().multiplyScalar(scale),
    size: size.clone().multiplyScalar(scale),
  }
}
