export interface ModelDimensions {
  x: number
  y: number
  z: number
}

export interface STLFileInfo {
  file: File
  name: string
  size: number
  url: string
}

export interface CalculatorInputs {
  spoolPrice: number
  spoolWeightKg: number
  filamentUsedGrams: number
  printTimeHours: number
  printTimeMinutes: number
  printerPowerWatts: number
  electricityCostPerKwh: number
  printerProfileId: string
  printerCost: number
  expectedLifespanHours: number
  failureRatePercent: number
  setupFee: number
  profitMarginPercent: number
  customPrinterName: string
  customBuildVolume: ModelDimensions
  customNozzleSizeMm: number
}

export interface CostBreakdown {
  materialCost: number
  energyKwh: number
  electricityCost: number
  machineWearCost: number
  baseCost: number
  failureMarkup: number
  setupFee: number
  totalCost: number
  costPerHour: number
  costPerGram: number
  suggestedSellingPrice: number
  printTimeHours: number
}

export type OrientationMode = 'uploaded' | 'recommended'

export interface PrintRecommendation {
  key: string
  label: string
  value: string
  note: string
}
