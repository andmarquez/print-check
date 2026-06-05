import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

export interface GeometryStats {
  triangleCount: number
  vertexCount: number
  dimensions: { x: number; y: number; z: number }
  volumeMm3: number
  volumeCm3: number
  surfaceAreaMm2: number
  overhangFaceCount: number
  overhangRatio: number
  nonManifoldEdgeCount: number
  degenerateTriangleCount: number
  connectedComponentCount: number
  floatingIslandCount: number
  minEdgeLengthMm: number
  smallFeatureCount: number
  bedFootprintMm2: number
  heightMm: number
  heightToFootprintRatio: number
  isWatertight: boolean
}

const OVERHANG_ANGLE_DEG = 45
const THIN_FEATURE_MM = 0.8
const SMALL_FEATURE_MM = 0.4

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function quantize(v: THREE.Vector3, precision = 4): string {
  const f = 10 ** precision
  return `${Math.round(v.x * f)},${Math.round(v.y * f)},${Math.round(v.z * f)}`
}

export async function loadSTLGeometry(url: string): Promise<THREE.BufferGeometry> {
  const loader = new STLLoader()
  const geometry = await loader.loadAsync(url)
  geometry.computeBoundingBox()
  geometry.computeVertexNormals()
  return geometry
}

export function analyzeGeometry(geometry: THREE.BufferGeometry): GeometryStats {
  const position = geometry.getAttribute('position')
  const triangleCount = position.count / 3

  if (!geometry.boundingBox) geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const size = new THREE.Vector3()
  box.getSize(size)

  let volumeMm3 = 0
  let surfaceAreaMm2 = 0
  let overhangFaceCount = 0
  let degenerateTriangleCount = 0
  let minEdgeLengthMm = Infinity
  let smallFeatureCount = 0

  const edgeMap = new Map<string, number>()
  const v0 = new THREE.Vector3()
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const e01 = new THREE.Vector3()
  const e12 = new THREE.Vector3()
  const e20 = new THREE.Vector3()
  const cross = new THREE.Vector3()
  const normal = new THREE.Vector3()

  const overhangThreshold = Math.cos((OVERHANG_ANGLE_DEG * Math.PI) / 180)

  const triangleVertices: [string, string, string][] = []

  for (let i = 0; i < position.count; i += 3) {
    v0.fromBufferAttribute(position, i)
    v1.fromBufferAttribute(position, i + 1)
    v2.fromBufferAttribute(position, i + 2)

    e01.subVectors(v1, v0)
    e12.subVectors(v2, v1)
    e20.subVectors(v0, v2)

    cross.crossVectors(e01, e12)
    const crossLen = cross.length()
    if (crossLen < 1e-9) {
      degenerateTriangleCount++
      continue
    }

    volumeMm3 += v0.dot(cross) / 6
    surfaceAreaMm2 += crossLen / 2

    normal.copy(cross).normalize()
    if (normal.y < -overhangThreshold) {
      overhangFaceCount++
    }

    const verts = [v0, v1, v2].map((v) => quantize(v))
    triangleVertices.push([verts[0], verts[1], verts[2]])

    const edges = [
      [verts[0], verts[1], e01.length()],
      [verts[1], verts[2], e12.length()],
      [verts[2], verts[0], e20.length()],
    ] as const

    for (const [a, b, len] of edges) {
      if (len < minEdgeLengthMm) minEdgeLengthMm = len
      if (len < SMALL_FEATURE_MM) smallFeatureCount++
      if (len < THIN_FEATURE_MM) smallFeatureCount++

      const key = edgeKey(a, b)
      edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1)
    }
  }

  volumeMm3 = Math.abs(volumeMm3)
  if (!Number.isFinite(minEdgeLengthMm)) minEdgeLengthMm = 0

  let nonManifoldEdgeCount = 0
  for (const count of edgeMap.values()) {
    if (count !== 2) nonManifoldEdgeCount++
  }

  const { componentCount, floatingIslandCount } = countConnectedComponents(
    triangleVertices,
    box.min.y
  )

  const bedFootprintMm2 = size.x * size.z
  const heightMm = size.y
  const heightToFootprintRatio = bedFootprintMm2 > 0 ? heightMm / Math.sqrt(bedFootprintMm2) : 0

  return {
    triangleCount,
    vertexCount: position.count,
    dimensions: {
      x: round(size.x),
      y: round(size.y),
      z: round(size.z),
    },
    volumeMm3: round(volumeMm3),
    volumeCm3: round(volumeMm3 / 1000, 2),
    surfaceAreaMm2: round(surfaceAreaMm2),
    overhangFaceCount,
    overhangRatio: triangleCount > 0 ? round((overhangFaceCount / triangleCount) * 100) : 0,
    nonManifoldEdgeCount,
    degenerateTriangleCount,
    connectedComponentCount: componentCount,
    floatingIslandCount,
    minEdgeLengthMm: round(minEdgeLengthMm, 2),
    smallFeatureCount,
    bedFootprintMm2: round(bedFootprintMm2),
    heightMm: round(heightMm),
    heightToFootprintRatio: round(heightToFootprintRatio, 2),
    isWatertight: nonManifoldEdgeCount === 0 && degenerateTriangleCount === 0,
  }
}

function countConnectedComponents(
  triangles: [string, string, string][],
  bedY: number
): { componentCount: number; floatingIslandCount: number } {
  const parent = new Map<string, string>()

  function find(x: string): string {
    const p = parent.get(x) ?? x
    if (p !== x) {
      const root = find(p)
      parent.set(x, root)
      return root
    }
    return x
  }

  function union(a: string, b: string) {
    parent.set(find(a), find(b))
  }

  for (const [a, b, c] of triangles) {
    union(a, b)
    union(b, c)
  }

  const components = new Map<string, Set<string>>()
  for (const [a, b, c] of triangles) {
    const root = find(a)
    if (!components.has(root)) components.set(root, new Set())
    const set = components.get(root)!
    set.add(a)
    set.add(b)
    set.add(c)
  }

  const bedTolerance = 0.5
  let floatingIslandCount = 0

  for (const verts of components.values()) {
    let touchesBed = false
    for (const key of verts) {
      const y = parseFloat(key.split(',')[1])
      if (Math.abs(y - bedY) < bedTolerance) {
        touchesBed = true
        break
      }
    }
    if (!touchesBed) floatingIslandCount++
  }

  return {
    componentCount: components.size,
    floatingIslandCount: Math.max(0, floatingIslandCount),
  }
}

function round(n: number, d = 1): number {
  const f = 10 ** d
  return Math.round(n * f) / f
}
