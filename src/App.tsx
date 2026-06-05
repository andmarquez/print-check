import { useCallback, useRef, useState } from 'react'
import { AIPrintAdvisor } from './components/AIPrintAdvisor'
import { AnalysisDashboard } from './components/AnalysisDashboard'
import { CostCalculator } from './components/CostCalculator'
import { ExportReportButton } from './components/ExportReportButton'
import { ModelViewer } from './components/ModelViewer/ModelViewer'
import { OrientationComparison } from './components/OrientationComparison'
import { PrintHealthReport } from './components/PrintHealthReport'
import { PrintSettingsPanel } from './components/PrintSettingsPanel'
import { SavedAnalysesPanel } from './components/SavedAnalysesPanel'
import { ScanAnimation } from './components/ScanAnimation'
import { SettingsPanel } from './components/SettingsPanel'
import { STLUploader } from './components/STLUploader'
import { StatsDock } from './components/layout/StatsDock'
import { TopNav } from './components/layout/TopNav'
import { useAnalysis } from './hooks/useAnalysis'

const SITE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : 'https://andsiosa.github.io/print-check/'

export default function App() {
  const uploadRef = useRef<HTMLInputElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  const {
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
    registerViewerCanvas,
    getPreviewDataUrl,
    refreshSettingsDefaults,
  } = useAnalysis()

  const triggerUpload = useCallback(() => {
    uploadRef.current?.click()
  }, [])

  const handleSave = useCallback(async () => {
    await saveCurrentAnalysis()
    setSaveToast('Analysis saved locally')
    setTimeout(() => setSaveToast(null), 2500)
  }, [saveCurrentAnalysis])

  const loadSample = useCallback(async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}assets/sample-models/demo-pyramid.stl`)
    const blob = await res.blob()
    const file = new File([blob], 'demo-pyramid.stl', { type: 'application/octet-stream' })
    handleFileUpload(file)
  }, [handleFileUpload])

  const isScanning = phase === 'scanning'
  const isComplete = phase === 'complete'
  const hasFile = stlFile !== null

  return (
    <div className="flex h-full flex-col bg-warm-white">
      <TopNav
        onUpload={triggerUpload}
        onSaved={() => setSavedOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        fileName={stlFile?.name}
        siteUrl={SITE_URL}
      />

      {saveToast && (
        <div className="fixed right-6 top-20 z-[80] rounded-xl bg-charcoal px-4 py-2 text-xs text-warm-white shadow-lg">
          {saveToast}
        </div>
      )}

      <main className="relative flex min-h-0 flex-1 gap-4 p-4 lg:p-6">
        <section className="relative min-w-0 flex-[3]">
          <ModelViewer
            stlUrl={stlFile?.url ?? null}
            scanning={isScanning}
            scanStage={scanStage}
            scanProgress={scanProgress}
            onCanvasReady={registerViewerCanvas}
          />

          <ScanAnimation
            scanning={isScanning}
            scanStage={scanStage}
            scanProgress={scanProgress}
          />

          <STLUploader
            onFileSelect={handleFileUpload}
            visible={phase === 'empty'}
            onTrySample={loadSample}
          />

          <StatsDock analysis={analysis} visible={isComplete} />

          <input
            ref={uploadRef}
            type="file"
            accept=".stl"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
              e.target.value = ''
            }}
          />
        </section>

        <aside className="scrollbar-thin flex min-w-0 flex-[2] flex-col gap-4 overflow-y-auto pr-1">
          {!hasFile && (
            <div className="glass-panel flex flex-1 flex-col items-center justify-center rounded-2xl p-8 text-center">
              <p className="font-display text-4xl font-light tracking-tight text-charcoal/20">
                Analysis
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal-soft">
                Upload an STL file to begin real geometry analysis with print recommendations and
                cost estimates.
              </p>
              <button
                type="button"
                onClick={loadSample}
                className="mt-6 cursor-pointer rounded-xl border border-sand px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-cream"
              >
                Try demo pyramid
              </button>
            </div>
          )}

          {analysis && (
            <>
              <AnalysisDashboard
                metrics={analysis.metrics}
                visible={revealedSections.includes('metrics')}
              />
              <PrintHealthReport
                issues={analysis.issues}
                visible={revealedSections.includes('health')}
              />
              <AIPrintAdvisor
                recommendations={analysis.aiRecommendations}
                visible={revealedSections.includes('ai')}
              />
              <PrintSettingsPanel
                settings={analysis.printSettings}
                visible={revealedSections.includes('settings')}
              />
              <OrientationComparison
                orientation={analysis.orientation}
                visible={revealedSections.includes('orientation')}
              />
              <CostCalculator
                inputs={costInputs}
                breakdown={analysis.costBreakdown}
                onUpdate={updateCostInputs}
                visible={revealedSections.includes('cost')}
              />
              {stlFile && (
                <ExportReportButton
                  file={stlFile}
                  analysis={analysis}
                  visible={isComplete}
                  getPreviewDataUrl={getPreviewDataUrl}
                  onSave={handleSave}
                />
              )}
            </>
          )}

          {(phase === 'scanning' || phase === 'analyzing') && (
            <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand border-t-electric-blue" />
              <p className="mt-4 font-display text-lg font-light text-charcoal">
                {phase === 'scanning' ? 'Scanning model...' : 'Analyzing geometry...'}
              </p>
            </div>
          )}
        </aside>
      </main>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={refreshSettingsDefaults}
      />

      <SavedAnalysesPanel
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        onLoad={loadSavedRecord}
      />
    </div>
  )
}
