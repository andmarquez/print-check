import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useCallback, useState } from 'react'
import * as THREE from 'three'
import type { ScanStage } from '../../types/analysis'
import { CanvasCapture } from './CanvasCapture'
import { ScanEffects } from './ScanEffects'
import { STLModel } from './STLModel'
import { StudioEnvironment } from './StudioEnvironment'

interface ModelViewerProps {
  stlUrl: string | null
  scanning: boolean
  scanStage: ScanStage
  scanProgress: number
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#d9d3c8" wireframe />
    </mesh>
  )
}

export function ModelViewer({
  stlUrl,
  scanning,
  scanStage,
  scanProgress,
  onCanvasReady,
}: ModelViewerProps) {
  const [modelBounds, setModelBounds] = useState<{
    min: THREE.Vector3
    max: THREE.Vector3
  }>()

  const handleBounds = useCallback(
    (bounds: { min: THREE.Vector3; max: THREE.Vector3 }) => {
      setModelBounds(bounds)
    },
    []
  )

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-cream/30 to-sand/20">
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      <Canvas shadows className="h-full w-full" gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[3, 2.5, 4]} fov={40} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 + 0.3}
        />

        <StudioEnvironment />
        <CanvasCapture onCanvasReady={onCanvasReady} />

        {stlUrl && (
          <Suspense fallback={<LoadingFallback />}>
            <STLModel
              url={stlUrl}
              wireframe={scanning && scanStage === 'reading_geometry'}
              onBoundsCalculated={handleBounds}
            />
            <ScanEffects
              scanning={scanning}
              scanStage={scanStage}
              scanProgress={scanProgress}
              modelBounds={modelBounds}
            />
          </Suspense>
        )}
      </Canvas>

      {!stlUrl && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-6xl font-light tracking-tighter text-charcoal/10">
              3D
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-soft-gray">
              Viewer Ready
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
