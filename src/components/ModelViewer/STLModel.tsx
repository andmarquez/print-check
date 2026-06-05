import { useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

interface STLModelProps {
  url: string
  wireframe?: boolean
  onBoundsCalculated?: (bounds: { min: THREE.Vector3; max: THREE.Vector3 }) => void
}

export function STLModel({ url, wireframe = false, onBoundsCalculated }: STLModelProps) {
  const geometry = useLoader(STLLoader, url)
  const meshRef = useRef<THREE.Mesh>(null)

  const centeredGeometry = useMemo(() => {
    const geo = geometry.clone()
    geo.computeBoundingBox()
    geo.center()
    geo.computeVertexNormals()
    return geo
  }, [geometry])

  useEffect(() => {
    if (centeredGeometry.boundingBox && onBoundsCalculated) {
      onBoundsCalculated({
        min: centeredGeometry.boundingBox.min.clone(),
        max: centeredGeometry.boundingBox.max.clone(),
      })
    }
  }, [centeredGeometry, onBoundsCalculated])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !centeredGeometry.boundingBox) return

    const box = centeredGeometry.boundingBox
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.5 / maxDim
    mesh.scale.setScalar(scale)
    mesh.position.y = (-box.min.y * scale)
  }, [centeredGeometry])

  return (
    <mesh ref={meshRef} geometry={centeredGeometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={wireframe ? '#0066FF' : '#e8e2d9'}
        metalness={0.15}
        roughness={0.45}
        wireframe={wireframe}
        transparent={wireframe}
        opacity={wireframe ? 0.3 : 1}
      />
    </mesh>
  )
}
