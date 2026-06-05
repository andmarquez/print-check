import { useCallback, useRef, useState } from 'react'
import type { SavedAnalysisRecord } from '../services/savedAnalysesDb'
import { saveAnalysis } from '../services/savedAnalysesDb'
import { getSettings } from '../services/settingsStorage'
import { stlAnalysisEngine } from '../services/stlAnalysisEngine'
import type {
  AnalysisResult,
  AppPhase,
  CostInputs,
  ScanStage,
  STLFileInfo,
} from '../types/analysis'
import { SCAN_STAGES } from '../types/analysis'

function defaultCostInputs(): CostInputs {
  const s = getSettings()
  return {
    filamentPricePerKg: s.filamentPricePerKg,
    materialType: s.defaultMaterialType,
    printerProfile: s.defaultPrinterProfile,
    electricityCostPerKwh: s.electricityCostPerKwh,
    printSpeed: 50,
    layerHeight: 0.16,
    infillPercentage: 15,
  }
}

export function useAnalysis() {
  const [phase, setPhase] = useState<AppPhase>('empty')
  const [stlFile, setStlFile] = useState<STLFileInfo | null>(null)
  const [scanStage, setScanStage] = useState<ScanStage>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [costInputs, setCostInputs] = useState<CostInputs>(defaultCostInputs)
  const [revealedSections, setRevealedSections] = useState<string[]>([])
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const revealSections = useCallback(async () => {
    const sections = ['metrics', 'health', 'ai', 'settings', 'orientation', 'cost']
    for (const section of sections) {
      await new Promise((r) => setTimeout(r, 200))
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

  const handleFileUpload = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file)
      const info: STLFileInfo = { file, name: file.name, size: file.size, url }

      setStlFile(info)
      setPhase('loaded')
      setAnalysis(null)
      setRevealedSections([])

      await new Promise((r) => setTimeout(r, 600))
      setPhase('scanning')
      await runScanSequence()

      setPhase('analyzing')
      const result = await stlAnalysisEngine.analyze(info, costInputs)
      setAnalysis(result)
      setPhase('complete')
      await revealSections()
    },
    [costInputs, runScanSequence, revealSections]
  )

  const updateCostInputs = useCallback(
    async (updates: Partial<CostInputs>) => {
      const next = { ...costInputs, ...updates }
      setCostInputs(next)
      if (stlFile && analysis) {
        const updated = await stlAnalysisEngine.analyze(stlFile, next)
        setAnalysis(updated)
      }
    },
    [costInputs, stlFile, analysis]
  )

  const loadSavedRecord = useCallback(async (record: SavedAnalysisRecord) => {
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

    setStlFile(info)
    setAnalysis(record.analysis)
    setCostInputs(record.costInputs)
    setPhase('complete')
    setScanStage('complete')
    setScanProgress(100)
    setRevealedSections(['metrics', 'health', 'ai', 'settings', 'orientation', 'cost'])
  }, [stlFile])

  const saveCurrentAnalysis = useCallback(async () => {
    if (!stlFile || !analysis) return null

    const thumbnail = viewerCanvasRef.current
      ? viewerCanvasRef.current.toDataURL('image/png', 0.85)
      : undefined

    let stlData: ArrayBuffer | undefined
    try {
      stlData = await stlFile.file.arrayBuffer()
    } catch {
      /* file may be empty when loaded from saved without blob */
    }

    const record: SavedAnalysisRecord = {
      id: crypto.randomUUID(),
      fileName: stlFile.name,
      fileSize: stlFile.size,
      savedAt: new Date().toISOString(),
      analysis,
      costInputs,
      thumbnail,
      stlData,
    }

    await saveAnalysis(record)
    return record
  }, [stlFile, analysis, costInputs])

  const reset = useCallback(() => {
    if (stlFile?.url) URL.revokeObjectURL(stlFile.url)
    setStlFile(null)
    setPhase('empty')
    setScanStage('idle')
    setScanProgress(0)
    setAnalysis(null)
    setRevealedSections([])
  }, [stlFile])

  const registerViewerCanvas = useCallback((canvas: HTMLCanvasElement) => {
    viewerCanvasRef.current = canvas
  }, [])

  const getPreviewDataUrl = useCallback((): string | null => {
    if (!viewerCanvasRef.current) return null
    return viewerCanvasRef.current.toDataURL('image/png', 0.92)
  }, [])

  const refreshSettingsDefaults = useCallback(() => {
    setCostInputs((prev) => ({
      ...prev,
      filamentPricePerKg: getSettings().filamentPricePerKg,
      electricityCostPerKwh: getSettings().electricityCostPerKwh,
    }))
  }, [])

  return {
    phase,
    stlFile,
    scanStage,
    scanProgress,
    analysis,
    costInputs,
    revealedSections,
    handleFileUpload,
    updateCostInputs,
    loadSavedRecord,
    saveCurrentAnalysis,
    reset,
    registerViewerCanvas,
    getPreviewDataUrl,
    refreshSettingsDefaults,
  }
}
