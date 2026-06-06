import { useCallback, useMemo, useRef, useState } from 'react'
import type { SavedAnalysisRecord } from '../services/savedAnalysesDb'
import { saveAnalysis } from '../services/savedAnalysesDb'
import { buildAnalysisFromStats } from '../services/buildAnalysisFromStats'
import type { GeometryStats } from '../services/geometryAnalyzer'
import { loadSTLGeometry, analyzeGeometry } from '../services/geometryAnalyzer'
import { analyzeStlWithStats } from '../services/stlAnalysisEngine'
import type {
  AnalysisResult,
  AppPhase,
  ModelDimensions,
  PrintCalculationInputs,
  ScanStage,
  STLFileInfo,
} from '../types/analysis'
import { SCAN_STAGES } from '../types/analysis'
import { getPrinterProfile } from '../data/printerProfiles'
import {
  calculateScaledDimensions,
  defaultPrintInputs,
  normalizePrintInputs,
} from '../utils/calculations'

export function useAnalysis() {
  const [phase, setPhase] = useState<AppPhase>('empty')
  const [stlFile, setStlFile] = useState<STLFileInfo | null>(null)
  const [scanStage, setScanStage] = useState<ScanStage>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const [geometryStats, setGeometryStats] = useState<GeometryStats | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState<ModelDimensions | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<string[] | null>(null)
  const [savedSnapshot, setSavedSnapshot] = useState<AnalysisResult | null>(null)
  const [printInputs, setPrintInputs] = useState<PrintCalculationInputs | null>(null)
  const [revealedSections, setRevealedSections] = useState<string[]>([])
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const analysis = useMemo(() => {
    if (geometryStats && printInputs) {
      return buildAnalysisFromStats(
        geometryStats,
        printInputs,
        aiRecommendations ?? undefined
      )
    }
    return savedSnapshot
  }, [geometryStats, printInputs, aiRecommendations, savedSnapshot])

  const revealSections = useCallback(async () => {
    const sections = ['summary', 'metrics', 'health', 'ai', 'settings', 'orientation', 'cost']
    for (const section of sections) {
      await new Promise((r) => setTimeout(r, 180))
      setRevealedSections((prev) => [...prev, section])
    }
  }, [])

  const runScanSequence = useCallback(async () => {
    let progress = 0
    for (const { stage, duration } of SCAN_STAGES) {
      setScanStage(stage)
      const steps = 20
      const stepDuration = duration / steps
      for (let i = 0; i < steps; i++) {
        await new Promise((r) => setTimeout(r, stepDuration))
        progress += 100 / (SCAN_STAGES.length * steps)
        setScanProgress(Math.min(progress, 99))
      }
    }
    setScanStage('complete')
    setScanProgress(100)
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    const info: STLFileInfo = { file, name: file.name, size: file.size, url }

    setStlFile(info)
    setGeometryStats(null)
    setAiRecommendations(null)
    setSavedSnapshot(null)
    setRevealedSections([])

    const geometry = await loadSTLGeometry(url)
    const stats = analyzeGeometry(geometry)
    const original = stats.originalDimensions

    setGeometryStats(stats)
    setOriginalDimensions(original)
    setPrintInputs(defaultPrintInputs(original))
    setPhase('sizing')
  }, [])

  const updatePrintInputs = useCallback(
    (updates: Partial<PrintCalculationInputs>, changedAxis?: 'width' | 'height' | 'depth') => {
      setPrintInputs((prev) => {
        if (!prev || !originalDimensions) return prev

        const next = { ...prev, ...updates }

        if (updates.desiredSize || changedAxis) {
          const desired = updates.desiredSize ?? next.desiredSize
          const { scaledDimensionsMm, scaleFactor } = calculateScaledDimensions(
            originalDimensions,
            desired,
            changedAxis
          )
          next.desiredSize = desired
          next.scaledDimensionsMm = scaledDimensionsMm
          next.scaleFactor = scaleFactor
        }

        if (updates.qualityPreset && !updates.layerHeight) {
          const preset = updates.qualityPreset
          const layers = { draft: 0.28, standard: 0.2, high: 0.16, ultra: 0.12 } as const
          next.layerHeight = layers[preset]
        }

        if (updates.printerProfileId === 'custom' && !next.customPrinter) {
          next.customPrinter = {
            printSpeedMmS: 50,
            powerWatts: 160,
            buildVolumeX: 220,
            buildVolumeY: 220,
            buildVolumeZ: 250,
            nozzleSizeMm: 0.4,
          }
        }

        if (updates.printerProfileId) {
          const profile = getPrinterProfile(updates.printerProfileId, next.customPrinter)
          if (updates.printerProfileId !== 'custom') {
            next.layerHeight = profile.defaultLayerHeightMm
          }
          next.printerCost = profile.printerCost
          next.expectedLifespanHours = profile.expectedLifespanHours
        }

        return next
      })
    },
    [originalDimensions]
  )

  const startAnalysis = useCallback(async () => {
    if (!stlFile || !printInputs || !geometryStats) return

    setPhase('scanning')
    setRevealedSections([])
    await runScanSequence()

    setPhase('analyzing')
    const { result } = await analyzeStlWithStats(stlFile, printInputs, geometryStats)
    setAiRecommendations(result.aiRecommendations)
    setPhase('complete')
    await revealSections()
  }, [stlFile, printInputs, geometryStats, runScanSequence, revealSections])

  const loadSavedRecord = useCallback(
    async (record: SavedAnalysisRecord) => {
      if (stlFile?.url) URL.revokeObjectURL(stlFile.url)

      let url = ''
      let file: File

      if (record.stlData) {
        const blob = new Blob([record.stlData], { type: 'application/octet-stream' })
        url = URL.createObjectURL(blob)
        file = new File([blob], record.fileName, { type: 'application/octet-stream' })
      } else {
        file = new File([], record.fileName)
        url = ''
      }

      const info: STLFileInfo = {
        file,
        name: record.fileName,
        size: record.fileSize,
        url,
      }

      setAiRecommendations(record.analysis.aiRecommendations)
      setPrintInputs(normalizePrintInputs(record.costInputs))

      if (url) {
        const geometry = await loadSTLGeometry(url)
        const stats = analyzeGeometry(geometry)
        setGeometryStats(stats)
        setOriginalDimensions(stats.originalDimensions)
        setSavedSnapshot(null)
      } else {
        setGeometryStats(null)
        setSavedSnapshot(record.analysis)
      }

      setStlFile(info)
      setPhase('complete')
      setScanStage('complete')
      setScanProgress(100)
      setRevealedSections(['summary', 'metrics', 'health', 'ai', 'settings', 'orientation', 'cost'])
    },
    [stlFile]
  )

  const saveCurrentAnalysis = useCallback(async () => {
    if (!stlFile || !analysis || !printInputs) return null

    const thumbnail = viewerCanvasRef.current
      ? viewerCanvasRef.current.toDataURL('image/png', 0.85)
      : undefined

    let stlData: ArrayBuffer | undefined
    try {
      stlData = await stlFile.file.arrayBuffer()
    } catch {
      /* ignore */
    }

    const record: SavedAnalysisRecord = {
      id: crypto.randomUUID(),
      fileName: stlFile.name,
      fileSize: stlFile.size,
      savedAt: new Date().toISOString(),
      analysis,
      costInputs: printInputs,
      thumbnail,
      stlData,
    }

    await saveAnalysis(record)
    return record
  }, [stlFile, analysis, printInputs])

  const reset = useCallback(() => {
    if (stlFile?.url) URL.revokeObjectURL(stlFile.url)
    setStlFile(null)
    setPhase('empty')
    setScanStage('idle')
    setScanProgress(0)
    setGeometryStats(null)
    setOriginalDimensions(null)
    setAiRecommendations(null)
    setSavedSnapshot(null)
    setPrintInputs(null)
    setRevealedSections([])
  }, [stlFile])

  const registerViewerCanvas = useCallback((canvas: HTMLCanvasElement) => {
    viewerCanvasRef.current = canvas
  }, [])

  const getPreviewDataUrl = useCallback((): string | null => {
    if (!viewerCanvasRef.current) return null
    return viewerCanvasRef.current.toDataURL('image/png', 0.92)
  }, [])

  return {
    phase,
    stlFile,
    scanStage,
    scanProgress,
    analysis,
    printInputs,
    originalDimensions,
    revealedSections,
    handleFileUpload,
    updatePrintInputs,
    startAnalysis,
    loadSavedRecord,
    saveCurrentAnalysis,
    reset,
    registerViewerCanvas,
    getPreviewDataUrl,
  }
}
