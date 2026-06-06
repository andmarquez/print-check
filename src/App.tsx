import { usePrintCheck } from './hooks/usePrintCheck'
import { BetterPrintSettings } from './components/BetterPrintSettings'
import { CostBreakdownCard } from './components/CostBreakdownCard'
import { CostCalculator } from './components/CostCalculator'
import { ExportReportButton } from './components/ExportReportButton'
import { ModelInfo } from './components/ModelInfo'
import { ModelViewer } from './components/ModelViewer/ModelViewer'
import { STLUploader } from './components/STLUploader'
import { TopNav } from './components/layout/TopNav'
import { ViewerControls } from './components/ViewerControls'

function getSiteUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined
  if (window.location.hostname.endsWith('github.io')) {
    return `${window.location.origin}${import.meta.env.BASE_URL}`
  }
  return undefined
}

export default function App() {
  const {
    stlFile,
    dimensions,
    calculatorInputs,
    costBreakdown,
    orientationMode,
    viewerRotation,
    handleFileUpload,
    updateCalculatorInputs,
    resetOrientation,
    previewRecommendedOrientation,
    registerViewerCanvas,
    getPreviewDataUrl,
  } = usePrintCheck()

  const triggerUpload = () => document.getElementById('stl-upload-input')?.click()

  const loadSample = async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}assets/sample-models/demo-pyramid.stl`)
    const blob = await res.blob()
    handleFileUpload(new File([blob], 'demo-pyramid.stl', { type: 'application/octet-stream' }))
  }

  return (
    <div className="flex h-full flex-col bg-warm-white">
      <TopNav onUpload={triggerUpload} fileName={stlFile?.name} siteUrl={getSiteUrl()} />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <section className="flex min-w-0 flex-[3] flex-col gap-3">
            <div className="relative min-h-[420px] flex-1">
              <ModelViewer
                stlUrl={stlFile?.url ?? null}
                rotationDeg={viewerRotation}
                onCanvasReady={registerViewerCanvas}
              />
              <STLUploader onFileSelect={handleFileUpload} visible={!stlFile} onTrySample={loadSample} />
            </div>

            {stlFile && (
              <>
                <ViewerControls
                  orientationMode={orientationMode}
                  onResetOrientation={resetOrientation}
                  onPreviewRecommended={previewRecommendedOrientation}
                />
                <ModelInfo file={stlFile} dimensions={dimensions} />
              </>
            )}
          </section>

          <aside className="scrollbar-thin flex min-w-0 flex-[2] flex-col gap-4 lg:max-w-md xl:max-w-lg">
            {!stlFile ? (
              <div className="glass-panel flex flex-1 flex-col items-center justify-center rounded-2xl p-8 text-center">
                <p className="font-display text-4xl font-light tracking-tight text-charcoal/20">Calculator</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal-soft">
                  Upload an STL to preview your model, then enter filament and print time from your slicer.
                </p>
                <button
                  type="button"
                  onClick={loadSample}
                  className="mt-6 cursor-pointer rounded-xl border border-sand px-4 py-2 text-xs font-medium text-charcoal-soft hover:bg-cream"
                >
                  Try demo pyramid
                </button>
              </div>
            ) : (
              <>
                <CostCalculator
                  inputs={calculatorInputs}
                  breakdown={costBreakdown}
                  onUpdate={updateCalculatorInputs}
                />
                <CostBreakdownCard
                  breakdown={costBreakdown}
                  profitMarginPercent={calculatorInputs.profitMarginPercent}
                />
              </>
            )}
          </aside>
        </div>

        {stlFile && (
          <div className="flex flex-col gap-4">
            <BetterPrintSettings />
            <ExportReportButton
              file={stlFile}
              inputs={calculatorInputs}
              breakdown={costBreakdown}
              getPreviewDataUrl={getPreviewDataUrl}
            />
          </div>
        )}
      </main>

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
    </div>
  )
}
