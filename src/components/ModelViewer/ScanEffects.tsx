import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { ScanStage } from '../../types/analysis'

interface ScanEffectsProps {
  scanning: boolean
  scanStage: ScanStage
  scanProgress: number
  modelBounds?: { min: THREE.Vector3; max: THREE.Vector3 }
}

export function ScanEffects({ scanning, scanStage, scanProgress, modelBounds }: ScanEffectsProps) {
  const horizontalBeam = useRef<THREE.Mesh>(null)
  const verticalBeam = useRef<THREE.Mesh>(null)
  const wireframeRef = useRef<THREE.Mesh>(null)

  const height = modelBounds
    ? modelBounds.max.y - modelBounds.min.y
    : 4
  const width = modelBounds
    ? modelBounds.max.x - modelBounds.min.x
    : 4
  const centerY = modelBounds
    ? (modelBounds.min.y + modelBounds.max.y) / 2
    : 0

  useFrame((state) => {
    if (!scanning) return
    const t = state.clock.elapsedTime

    if (horizontalBeam.current) {
      const yRange = height + 1
      horizontalBeam.current.position.y =
        (modelBounds?.min.y ?? -height / 2) + ((t * 0.8 + scanProgress * 0.01) % 1) * yRange
      horizontalBeam.current.visible = true
    }

    if (verticalBeam.current) {
      const xRange = width + 1
      verticalBeam.current.position.x =
        (modelBounds?.min.x ?? -width / 2) + ((t * 0.6) % 1) * xRange
      verticalBeam.current.visible = scanStage === 'detecting_overhangs' || scanStage === 'estimating_supports'
    }

    if (wireframeRef.current) {
      wireframeRef.current.visible =
        scanStage === 'reading_geometry' ||
        scanStage === 'analyzing_surface' ||
        scanStage === 'checking_wall_thickness'
    }
  })

  if (!scanning) return null

  const beamWidth = Math.max(width, 3)

  return (
    <group>
      {/* Horizontal scan beam */}
      <mesh ref={horizontalBeam} position={[0, centerY, 0]}>
        <planeGeometry args={[beamWidth * 2, 0.02]} />
        <meshBasicMaterial
          color="#0066FF"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical scan beam */}
      <mesh ref={verticalBeam} rotation={[0, 0, Math.PI / 2]} position={[0, centerY, 0]}>
        <planeGeometry args={[height * 2, 0.02]} />
        <meshBasicMaterial
          color="#FF6B35"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe overlay plane hint */}
      <mesh ref={wireframeRef} visible={false}>
        <boxGeometry args={[width, height, width]} />
        <meshBasicMaterial
          color="#0066FF"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Risk markers */}
      {scanStage === 'detecting_overhangs' && (
        <RiskMarkers bounds={modelBounds} />
      )}

      {/* Validated region highlights */}
      {scanStage === 'checking_wall_thickness' && (
        <ValidatedMarkers bounds={modelBounds} />
      )}
    </group>
  )
}

function RiskMarkers({ bounds }: { bounds?: { min: THREE.Vector3; max: THREE.Vector3 } }) {
  const positions = [
    [0.3, 0.5, 0.2],
    [-0.4, 0.8, -0.1],
    [0.1, 1.2, 0.3],
  ] as const

  const offsetY = bounds ? bounds.min.y : 0

  return (
    <group>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + offsetY, z]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#FF6B35" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function ValidatedMarkers({ bounds }: { bounds?: { min: THREE.Vector3; max: THREE.Vector3 } }) {
  const positions = [
    [-0.2, 0.3, -0.3],
    [0.5, 0.2, 0.4],
  ] as const

  const offsetY = bounds ? bounds.min.y : 0

  return (
    <group>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + offsetY, z]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#0066FF" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}
