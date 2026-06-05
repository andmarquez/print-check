import { Bounds, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useState } from 'react'
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
  rotationDeg?: { x: number; y: number; z: number }
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

function OrbitTarget({ target }: { target: THREE.Vector3 }) {
  const controls = useThree((state) => state.controls)
  useEffect(() => {
    if (controls && 'target' in controls) {
      const orbit = controls as unknown as { target: THREE.Vector3; update: () => void }
      orbit.target.copy(target)
      orbit.update()
    }
  }, [controls, target])
  return null
}

export function ModelViewer({
  stlUrl,
  scanning,
  scanStage,
  scanProgress,
  rotationDeg = { x: 0, y: 0, z: 0 },
  onCanvasReady,
}: ModelViewerProps) {
  const [modelFrame, setModelFrame] = useState<{
    center: THREE.Vector3
    size: THREE.Vector3
    scale: number
  }>()
  const [modelBounds, setModelBounds] = useState<{
    min: THREE.Vector3
    max: THREE.Vector3
  }>()

  const handleFrame = useCallback(
    (frame: { center: THREE.Vector3; size: THREE.Vector3; scale: number }) => {
      setModelFrame(frame)
      const half = frame.size.clone().multiplyScalar(0.5)
      const center = frame.center.clone()
      setModelBounds({
        min: center.clone().sub(half),
        max: center.clone().add(half),
      })
    },
    []
  )

  const lookTarget = modelFrame?.center ?? new THREE.Vector3(0, 1, 0)

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-cream/30 to-sand/20">
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      <div className="h-full w-full max-h-full max-w-full">
        <Canvas
          shadows
          className="h-full w-full"
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          camera={{ position: [4, 3, 5], fov: 42, near: 0.1, far: 100 }}
        >
          <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={42} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={1.5}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2 + 0.15}
          />
          <OrbitTarget target={lookTarget} />

          <StudioEnvironment />
          <CanvasCapture onCanvasReady={onCanvasReady} />

          {stlUrl ? (
            <Suspense fallback={<LoadingFallback />}>
              <Bounds fit clip observe margin={1.3}>
                <STLModel
                  url={stlUrl}
                  wireframe={scanning && scanStage === 'reading_geometry'}
                  rotationDeg={rotationDeg}
                  onFrameCalculated={handleFrame}
                />
              </Bounds>
              {modelBounds && (
                <ScanEffects
                  scanning={scanning}
                  scanStage={scanStage}
                  scanProgress={scanProgress}
                  modelBounds={modelBounds}
                />
              )}
            </Suspense>
          ) : null}
        </Canvas>
      </div>

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
