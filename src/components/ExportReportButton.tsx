import { useState } from 'react'
import type { AnalysisResult, STLFileInfo } from '../types/analysis'
import { downloadPdfReport } from '../utils/exportReport'

interface ExportReportButtonProps {
  file: STLFileInfo
  analysis: AnalysisResult
  visible: boolean
  getPreviewDataUrl?: () => string | null
}

export function ExportReportButton({
  file,
  analysis,
  visible,
  getPreviewDataUrl,
}: ExportReportButtonProps) {
  const [exporting, setExporting] = useState(false)

  if (!visible) return null

  const handlePdf = async () => {
    setExporting(true)
    try {
      await downloadPdfReport(file, analysis, getPreviewDataUrl?.() ?? null)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      type="button"
      disabled={exporting}
      onClick={handlePdf}
      className="glass-button-primary flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium tracking-wide disabled:opacity-60"
    >
      <DownloadIcon />
      {exporting ? 'Generating PDF...' : 'Download PDF Report'}
    </button>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2 L8 10 M5 7 L8 10 L11 7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12 L3 13.5 C3 14 3.5 14.5 4 14.5 L12 14.5 C12.5 14.5 13 14 13 13.5 L13 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
