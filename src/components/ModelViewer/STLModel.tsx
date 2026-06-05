import { useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { frameModelForViewer } from '../../services/geometryOrientation'

interface STLModelProps {
  url: string
  wireframe?: boolean
  rotationDeg?: { x: number; y: number; z: number }
  onFrameCalculated?: (frame: {
    center: THREE.Vector3
    size: THREE.Vector3
    scale: number
  }) => void
}

export function STLModel({
  url,
  wireframe = false,
  rotationDeg = { x: 0, y: 0, z: 0 },
  onFrameCalculated,
}: STLModelProps) {
  const rawGeometry = useLoader(STLLoader, url)
  const groupRef = useRef<THREE.Group>(null)

  const frame = useMemo(() => frameModelForViewer(rawGeometry), [rawGeometry])

  const rotationRad = useMemo(
    () => ({
      x: THREE.MathUtils.degToRad(rotationDeg.x),
      y: THREE.MathUtils.degToRad(rotationDeg.y),
      z: THREE.MathUtils.degToRad(rotationDeg.z),
    }),
    [rotationDeg]
  )

  useEffect(() => {
    onFrameCalculated?.({
      center: frame.center,
      size: frame.size,
      scale: frame.scale,
    })
  }, [frame, onFrameCalculated])

  return (
    <group ref={groupRef} rotation={[rotationRad.x, rotationRad.y, rotationRad.z]}>
      <mesh geometry={frame.geometry} scale={frame.scale} castShadow receiveShadow>
        <meshStandardMaterial
          color={wireframe ? '#0066FF' : '#e8e2d9'}
          metalness={0.15}
          roughness={0.45}
          wireframe={wireframe}
          transparent={wireframe}
          opacity={wireframe ? 0.3 : 1}
        />
      </mesh>
    </group>
  )
}
