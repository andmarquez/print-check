import * as THREE from 'three'

/** Preserve STL orientation — only center on build plate (XZ centered, bottom at Y=0). */
export function centerOnBuildPlate(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = source.clone()
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
