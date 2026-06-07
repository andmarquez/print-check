import { motion } from 'framer-motion'
import { useState } from 'react'
import type { AnalysisResult, STLFileInfo } from '../types/analysis'
import { downloadPdfReport, downloadTextReport } from '../utils/exportReport'

interface ExportReportButtonProps {
  file: STLFileInfo
  analysis: AnalysisResult
  visible: boolean
  getPreviewDataUrl?: () => string | null
  onSave?: () => Promise<void>
}

export function ExportReportButton({
  file,
  analysis,
  visible,
  getPreviewDataUrl,
  onSave,
}: ExportReportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!visible) return null

  const handlePdf = async () => {
    setExporting(true)
    try {
      await downloadPdfReport(file, analysis, getPreviewDataUrl?.() ?? null)
    } finally {
      setExporting(false)
    }
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2"
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={exporting}
        onClick={handlePdf}
        className="glass-button-primary flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-4 text-sm font-medium tracking-wide disabled:opacity-60"
      >
        <DownloadIcon />
        {exporting ? 'Generating PDF...' : 'Download PDF Report'}
      </motion.button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => downloadTextReport(file, analysis)}
          className="glass-button cursor-pointer py-3 text-xs font-medium text-charcoal-soft"
        >
          Text Report
        </button>
        {onSave && (
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="glass-button cursor-pointer border border-electric-blue/30 py-3 text-xs font-medium text-electric-blue disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Analysis'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
