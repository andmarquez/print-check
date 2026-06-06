import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { centerOnBuildPlate } from './geometryOrientation'
import type { ModelDimensions } from '../types/printCheck'

export async function loadStlDimensions(url: string): Promise<ModelDimensions> {
  const loader = new STLLoader()
  const geometry = await loader.loadAsync(url)
  const centered = centerOnBuildPlate(geometry)
  centered.computeBoundingBox()
  const box = centered.boundingBox!
  const size = new THREE.Vector3()
  box.getSize(size)

  return {
    x: round(size.x, 1),
    y: round(size.y, 1),
    z: round(size.z, 1),
  }
}

function round(n: number, d = 1) {
  const f = 10 ** d
  return Math.round(n * f) / f
}
