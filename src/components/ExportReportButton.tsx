import { motion } from 'framer-motion'
import type { CalculatorInputs, CostBreakdown, STLFileInfo } from '../types/printCheck'
import { downloadCostReport, downloadCostReportPdf } from '../utils/exportReport'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './CostBreakdownCard'

interface ExportReportButtonProps {
  file: STLFileInfo
  inputs: CalculatorInputs
  breakdown: CostBreakdown
  getPreviewDataUrl: () => string | null
}

export function ExportReportButton({
  file,
  inputs,
  breakdown,
  getPreviewDataUrl,
}: ExportReportButtonProps) {
  const handleText = () => downloadCostReport(file, inputs, breakdown)

  const handlePdf = async () => {
    await downloadCostReportPdf(file, inputs, breakdown, getPreviewDataUrl())
  }

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Export Report" subtitle="Download your cost summary" />
      <div className="mt-4 flex flex-wrap gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleText}
          className="cursor-pointer rounded-xl border border-sand px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-cream"
        >
          Download Cost Report (.txt)
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePdf}
          className="cursor-pointer rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-warm-white shadow-md hover:bg-charcoal-soft"
        >
          Download Cost Report (.pdf)
        </motion.button>
      </div>
    </GlassPanel>
  )
}
