import type { CalculatorInputs, ModelDimensions } from '../types/printCheck'

export interface PrinterProfile {
  id: string
  name: string
  printerPowerWatts: number
  maxInputPowerWatts?: number
  printerCost: number
  expectedLifespanHours: number
  buildVolume: ModelDimensions
  defaultNozzleMm: number
  notes?: string
}

export const PRINTER_PROFILES: PrinterProfile[] = [
  {
    id: 'flashforge-c5',
    name: 'Flashforge Creator 5',
    printerPowerWatts: 250,
    maxInputPowerWatts: 700,
    printerCost: 2999,
    expectedLifespanHours: 5000,
    buildVolume: { x: 256, y: 256, z: 256 },
    defaultNozzleMm: 0.4,
    notes:
      '4 independent toolheads, near-zero purge waste, multi-material workflow. Max input power is not the same as average print power.',
  },
  {
    id: 'snapmaker-u1',
    name: 'Snapmaker U1',
    printerPowerWatts: 150,
    maxInputPowerWatts: 400,
    printerCost: 999,
    expectedLifespanHours: 5000,
    buildVolume: { x: 270, y: 270, z: 270 },
    defaultNozzleMm: 0.4,
    notes: '4 toolheads, CoreXY, multi-color and multi-material printing. Average power is editable.',
  },
  {
    id: 'bambu-x1c',
    name: 'Bambu Lab X1 Carbon',
    printerPowerWatts: 150,
    printerCost: 1199,
    expectedLifespanHours: 5000,
    buildVolume: { x: 256, y: 256, z: 256 },
    defaultNozzleMm: 0.4,
  },
  {
    id: 'bambu-p1s',
    name: 'Bambu Lab P1S',
    printerPowerWatts: 140,
    printerCost: 699,
    expectedLifespanHours: 5000,
    buildVolume: { x: 256, y: 256, z: 256 },
    defaultNozzleMm: 0.4,
  },
  {
    id: 'bambu-a1mini',
    name: 'Bambu Lab A1 Mini',
    printerPowerWatts: 95,
    printerCost: 299,
    expectedLifespanHours: 4000,
    buildVolume: { x: 180, y: 180, z: 180 },
    defaultNozzleMm: 0.4,
  },
  {
    id: 'prusa-mk4',
    name: 'Prusa MK4',
    printerPowerWatts: 120,
    printerCost: 1099,
    expectedLifespanHours: 6000,
    buildVolume: { x: 250, y: 210, z: 220 },
    defaultNozzleMm: 0.4,
  },
  {
    id: 'creality-k1',
    name: 'Creality K1',
    printerPowerWatts: 160,
    printerCost: 599,
    expectedLifespanHours: 4000,
    buildVolume: { x: 220, y: 220, z: 250 },
    defaultNozzleMm: 0.4,
  },
  {
    id: 'creality-e3v3',
    name: 'Creality Ender 3 V3',
    printerPowerWatts: 120,
    printerCost: 299,
    expectedLifespanHours: 3500,
    buildVolume: { x: 220, y: 220, z: 250 },
    defaultNozzleMm: 0.4,
  },
  {
    id: 'custom',
    name: 'Custom Printer',
    printerPowerWatts: 150,
    printerCost: 500,
    expectedLifespanHours: 5000,
    buildVolume: { x: 220, y: 220, z: 250 },
    defaultNozzleMm: 0.4,
    notes: 'Enter your printer specs manually. Average print power depends on material and settings.',
  },
]

export function getPrinterProfile(profileId: string): PrinterProfile {
  return PRINTER_PROFILES.find((p) => p.id === profileId) ?? PRINTER_PROFILES[0]
}

export function applyPrinterProfileToInputs(
  inputs: CalculatorInputs,
  profileId: string
): CalculatorInputs {
  const profile = getPrinterProfile(profileId)
  return {
    ...inputs,
    printerProfileId: profileId,
    printerPowerWatts: profile.printerPowerWatts,
    printerCost: profile.printerCost,
    expectedLifespanHours: profile.expectedLifespanHours,
    customBuildVolume: profile.buildVolume,
    customNozzleSizeMm: profile.defaultNozzleMm,
    customPrinterName: profileId === 'custom' ? inputs.customPrinterName || 'Custom Printer' : profile.name,
  }
}

export function defaultCalculatorInputs(): CalculatorInputs {
  const profile = getPrinterProfile('bambu-p1s')
  return {
    spoolPrice: 22,
    spoolWeightKg: 1,
    filamentUsedGrams: 50,
    printTimeHours: 2,
    printTimeMinutes: 30,
    printerPowerWatts: profile.printerPowerWatts,
    electricityCostPerKwh: 0.16,
    printerProfileId: profile.id,
    printerCost: profile.printerCost,
    expectedLifespanHours: profile.expectedLifespanHours,
    failureRatePercent: 5,
    setupFee: 0,
    profitMarginPercent: 30,
    customPrinterName: 'Custom Printer',
    customBuildVolume: profile.buildVolume,
    customNozzleSizeMm: profile.defaultNozzleMm,
  }
}
