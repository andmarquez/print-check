import { useCallback, useMemo, useRef, useState } from 'react'
import {
  applyPrinterProfileToInputs,
  defaultCalculatorInputs,
  getPrinterProfile,
} from '../data/printerProfiles'
import { loadStlDimensions } from '../services/stlMetadata'
import type {
  CalculatorInputs,
  CostBreakdown,
  ModelDimensions,
  OrientationMode,
  STLFileInfo,
} from '../types/printCheck'
import { calculateTotalCost } from '../utils/calculations'

/** Optional preview rotation from bounding box — tallest axis as Y-up preview only. */
export function computeRecommendedPreviewRotation(dimensions: ModelDimensions | null): {
  x: number
  y: number
  z: number
} {
  if (!dimensions) return { x: 0, y: 0, z: 0 }

  const { x, y, z } = dimensions
  const axes = [
    { axis: 'x' as const, value: x },
    { axis: 'y' as const, value: y },
    { axis: 'z' as const, value: z },
  ].sort((a, b) => b.value - a.value)

  const tallest = axes[0].axis
  if (tallest === 'y') return { x: 0, y: 0, z: 0 }
  if (tallest === 'z') return { x: -90, y: 0, z: 0 }
  return { x: 0, y: 0, z: 90 }
}

export function usePrintCheck() {
  const [stlFile, setStlFile] = useState<STLFileInfo | null>(null)
  const [dimensions, setDimensions] = useState<ModelDimensions | null>(null)
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>(defaultCalculatorInputs())
  const [orientationMode, setOrientationMode] = useState<OrientationMode>('uploaded')
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const costBreakdown: CostBreakdown = useMemo(
    () => calculateTotalCost(calculatorInputs),
    [calculatorInputs]
  )

  const selectedProfile = useMemo(
    () => getPrinterProfile(calculatorInputs.printerProfileId),
    [calculatorInputs.printerProfileId]
  )

  const viewerRotation = useMemo(() => {
    if (orientationMode === 'recommended') {
      return computeRecommendedPreviewRotation(dimensions)
    }
    return { x: 0, y: 0, z: 0 }
  }, [orientationMode, dimensions])

  const handleFileUpload = useCallback(async (file: File) => {
    if (stlFile?.url) URL.revokeObjectURL(stlFile.url)

    const url = URL.createObjectURL(file)
    const info: STLFileInfo = {
      file,
      name: file.name,
      size: file.size,
      url,
    }

    setStlFile(info)
    setOrientationMode('uploaded')

    try {
      const dims = await loadStlDimensions(url)
      setDimensions(dims)
    } catch {
      setDimensions(null)
    }
  }, [stlFile])

  const updateCalculatorInputs = useCallback((updates: Partial<CalculatorInputs>) => {
    setCalculatorInputs((prev) => {
      if (updates.printerProfileId && updates.printerProfileId !== prev.printerProfileId) {
        return applyPrinterProfileToInputs({ ...prev, ...updates }, updates.printerProfileId)
      }
      return { ...prev, ...updates }
    })
  }, [])

  const resetOrientation = useCallback(() => setOrientationMode('uploaded'), [])
  const previewRecommendedOrientation = useCallback(() => setOrientationMode('recommended'), [])

  const registerViewerCanvas = useCallback((canvas: HTMLCanvasElement) => {
    viewerCanvasRef.current = canvas
  }, [])

  const getPreviewDataUrl = useCallback(() => {
    return viewerCanvasRef.current?.toDataURL('image/png', 0.85) ?? null
  }, [])

  return {
    stlFile,
    dimensions,
    calculatorInputs,
    costBreakdown,
    selectedProfile,
    orientationMode,
    viewerRotation,
    handleFileUpload,
    updateCalculatorInputs,
    resetOrientation,
    previewRecommendedOrientation,
    registerViewerCanvas,
    getPreviewDataUrl,
  }
}
