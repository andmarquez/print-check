import { useState } from 'react'
import { CostCalculator } from './components/CostCalculator'
import { DesiredSizePanel } from './components/DesiredSizePanel'
import { ModelViewer } from './components/ModelViewer/ModelViewer'
import { SavedAnalysesPanel } from './components/SavedAnalysesPanel'
import { ScanAnimation } from './components/ScanAnimation'
import { SettingsPanel } from './components/SettingsPanel'
import { STLUploader } from './components/STLUploader'
import { TopNav } from './components/layout/TopNav'
import { ResultsPanelScroll } from './components/layout/ResultsPanelScroll'
import { useAnalysis } from './hooks/useAnalysis'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)

  const {
    phase,
    stlFile,
    scanStage,
    scanProgress,
    analysis,
    printInputs,
    originalDimensions,
    handleFileUpload,
    updatePrintInputs,
    startAnalysis,
    loadSavedRecord,
    registerViewerCanvas,
    getPreviewDataUrl,
  } = useAnalysis()

  const isScanning = phase === 'scanning'
  const isComplete = phase === 'complete'

  const viewerRotation =
    printInputs?.applyRecommendedOrientation && analysis
      ? analysis.orientation.recommended
      : { x: 0, y: 0, z: 0 }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopNav onSettings={() => setSettingsOpen(true)} />

      {phase === 'empty' ? (
        <>
          <STLUploader onFileSelect={handleFileUpload} visible />
          <input
            id="stl-upload-input"
            type="file"
            accept=".stl"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
              e.target.value = ''
            }}
          />
        </>
      ) : (
        <main className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,3fr)_minmax(0,2fr)] gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-1 lg:p-6">
          <section className="relative h-full min-h-0 min-w-0 overflow-hidden">
            <ModelViewer
              stlUrl={stlFile?.url ?? null}
              scanning={isScanning}
              scanStage={scanStage}
              scanProgress={scanProgress}
              rotationDeg={viewerRotation}
              onCanvasReady={registerViewerCanvas}
            />

            <ScanAnimation scanning={isScanning} scanStage={scanStage} scanProgress={scanProgress} />

            <input
              id="stl-upload-input"
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

          <aside className="results-panel-shell relative min-h-0 min-w-0 overflow-hidden">
            <ResultsPanelScroll>
                {phase === 'sizing' && printInputs && originalDimensions && (
                  <DesiredSizePanel
                    originalDimensions={originalDimensions}
                    inputs={printInputs}
                    onUpdate={updatePrintInputs}
                    onStartAnalysis={startAnalysis}
                    visible
                  />
                )}

                {analysis && printInputs && isComplete && (
                  <CostCalculator
                    inputs={printInputs}
                    analysis={analysis}
                    onUpdate={updatePrintInputs}
                    visible
                    file={stlFile}
                    getPreviewDataUrl={getPreviewDataUrl}
                  />
                )}

                {(phase === 'scanning' || phase === 'analyzing') && (
                  <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-8 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-electric-blue" />
                    <p className="mt-4 font-display text-lg font-light text-charcoal">
                      {phase === 'scanning' ? 'Scanning model...' : 'Calculating estimates...'}
                    </p>
                  </div>
                )}
            </ResultsPanelScroll>
          </aside>
        </main>
      )}

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={() => {}} />

      <SavedAnalysesPanel open={savedOpen} onClose={() => setSavedOpen(false)} onLoad={loadSavedRecord} />
    </div>
  )
}
