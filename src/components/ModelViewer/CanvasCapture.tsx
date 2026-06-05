import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

interface CanvasCaptureProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export function CanvasCapture({ onCanvasReady }: CanvasCaptureProps) {
  const { gl } = useThree()

  useEffect(() => {
    onCanvasReady?.(gl.domElement)
  }, [gl, onCanvasReady])

  return null
}

export function captureCanvasPreview(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png', 0.92)
}
