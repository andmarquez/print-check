import { getPrinterProfile } from '../data/printerProfiles'
import { BETTER_PRINT_SETTINGS } from '../data/printRecommendations'
import type { CalculatorInputs, CostBreakdown, STLFileInfo } from '../types/printCheck'
import { formatDuration } from '../utils/calculations'
import { jsPDF } from 'jspdf'

export function generateCostReportText(
  file: STLFileInfo,
  inputs: CalculatorInputs,
  breakdown: CostBreakdown
): string {
  const profile = getPrinterProfile(inputs.printerProfileId)
  const printerName =
    inputs.printerProfileId === 'custom' ? inputs.customPrinterName : profile.name

  const lines: string[] = []
  lines.push('═'.repeat(60))
  lines.push('PRINT CHECK — 3D PRINT COST REPORT')
  lines.push('═'.repeat(60))
  lines.push('')
  lines.push(`Model: ${file.name}`)
  lines.push(`File size: ${(file.size / 1024).toFixed(1)} KB`)
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push('')
  lines.push('── PRINT INPUTS (from slicer) ──')
  lines.push(`Printer: ${printerName}`)
  lines.push(`Filament used: ${inputs.filamentUsedGrams} g`)
  lines.push(`Print time: ${formatDuration(breakdown.printTimeHours)}`)
  lines.push(`Printer power: ${inputs.printerPowerWatts} W`)
  lines.push('')
  lines.push('── COST BREAKDOWN ──')
  lines.push(`Material: $${breakdown.materialCost.toFixed(2)}`)
  lines.push(`Electricity: $${breakdown.electricityCost.toFixed(2)} (${breakdown.energyKwh.toFixed(3)} kWh)`)
  lines.push(`Machine wear: $${breakdown.machineWearCost.toFixed(2)}`)
  lines.push(`Failure markup: $${breakdown.failureMarkup.toFixed(2)}`)
  if (breakdown.setupFee > 0) lines.push(`Setup fee: $${breakdown.setupFee.toFixed(2)}`)
  lines.push(`Total estimated cost: $${breakdown.totalCost.toFixed(2)}`)
  lines.push(`Suggested selling price: $${breakdown.suggestedSellingPrice.toFixed(2)} (${inputs.profitMarginPercent}% margin)`)
  lines.push('')
  lines.push('── BETTER PRINT SETTINGS ──')
  for (const item of BETTER_PRINT_SETTINGS) {
    lines.push(`${item.label}: ${item.value}`)
    lines.push(`  ${item.note}`)
  }
  lines.push('')
  lines.push('═'.repeat(60))

  return lines.join('\n')
}

export function downloadCostReport(
  file: STLFileInfo,
  inputs: CalculatorInputs,
  breakdown: CostBreakdown
): void {
  const content = generateCostReportText(file, inputs, breakdown)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, `${baseName(file)}-print-cost-report.txt`)
}

export async function downloadCostReportPdf(
  file: STLFileInfo,
  inputs: CalculatorInputs,
  breakdown: CostBreakdown,
  previewDataUrl?: string | null
): Promise<void> {
  const profile = getPrinterProfile(inputs.printerProfileId)
  const printerName =
    inputs.printerProfileId === 'custom' ? inputs.customPrinterName : profile.name

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 16
  let y = margin

  const addPageIfNeeded = (height: number) => {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Print Check', margin, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('3D Print Cost Report', margin, y)
  y += 10

  if (previewDataUrl) {
    addPageIfNeeded(55)
    doc.addImage(previewDataUrl, 'PNG', margin, y, doc.internal.pageSize.getWidth() - margin * 2, 45)
    y += 50
  }

  const line = (text: string) => {
    const wrapped = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - margin * 2)
    addPageIfNeeded(wrapped.length * 5)
    doc.text(wrapped, margin, y)
    y += wrapped.length * 5 + 2
  }

  line(`Model: ${file.name}`)
  line(`Printer: ${printerName}`)
  line(`Filament: ${inputs.filamentUsedGrams}g · Time: ${formatDuration(breakdown.printTimeHours)}`)
  y += 4

  doc.setFont('helvetica', 'bold')
  line('Cost Breakdown')
  doc.setFont('helvetica', 'normal')
  line(`Material: $${breakdown.materialCost.toFixed(2)}`)
  line(`Electricity: $${breakdown.electricityCost.toFixed(2)} (${breakdown.energyKwh.toFixed(3)} kWh)`)
  line(`Machine wear: $${breakdown.machineWearCost.toFixed(2)}`)
  line(`Failure markup: $${breakdown.failureMarkup.toFixed(2)}`)
  line(`Total: $${breakdown.totalCost.toFixed(2)}`)
  line(`Suggested selling price: $${breakdown.suggestedSellingPrice.toFixed(2)}`)
  y += 4

  doc.setFont('helvetica', 'bold')
  line('Better Print Settings')
  doc.setFont('helvetica', 'normal')
  for (const item of BETTER_PRINT_SETTINGS.slice(0, 6)) {
    line(`${item.label}: ${item.value}`)
  }

  doc.save(`${baseName(file)}-print-cost-report.pdf`)
}

function baseName(file: STLFileInfo): string {
  return file.name.replace(/\.stl$/i, '')
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
