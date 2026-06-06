import type { CalculatorInputs, CostBreakdown } from '../types/printCheck'

export { getPrinterProfile, PRINTER_PROFILES } from '../data/printerProfiles'

export function getTotalPrintTimeHours(hours: number, minutes: number): number {
  return Math.max(hours, 0) + Math.max(minutes, 0) / 60
}

export function calculateMaterialCost(
  spoolPrice: number,
  spoolWeightKg: number,
  filamentUsedGrams: number
): number {
  const kg = Math.max(spoolWeightKg, 0.001)
  return round((spoolPrice / kg) * (filamentUsedGrams / 1000), 2)
}

export function calculateEnergyUsed(printerPowerWatts: number, printTimeHours: number): number {
  return round((printerPowerWatts * printTimeHours) / 1000, 3)
}

export function calculateElectricityCost(
  energyKwh: number,
  electricityCostPerKwh: number
): number {
  return round(energyKwh * electricityCostPerKwh, 2)
}

export function calculateMachineWear(
  printerCost: number,
  expectedLifespanHours: number,
  printTimeHours: number
): number {
  if (expectedLifespanHours <= 0) return 0
  return round((printerCost / expectedLifespanHours) * printTimeHours, 2)
}

export function calculateFailureMarkup(baseCost: number, failureRatePercent: number): number {
  return round(baseCost * (failureRatePercent / 100), 2)
}

export function calculateSuggestedSellingPrice(
  totalCost: number,
  profitMarginPercent: number
): number {
  return round(totalCost * (1 + profitMarginPercent / 100), 2)
}

export function calculateTotalCost(inputs: CalculatorInputs): CostBreakdown {
  const printTimeHours = getTotalPrintTimeHours(inputs.printTimeHours, inputs.printTimeMinutes)

  const materialCost = calculateMaterialCost(
    inputs.spoolPrice,
    inputs.spoolWeightKg,
    inputs.filamentUsedGrams
  )
  const energyKwh = calculateEnergyUsed(inputs.printerPowerWatts, printTimeHours)
  const electricityCost = calculateElectricityCost(energyKwh, inputs.electricityCostPerKwh)
  const machineWearCost = calculateMachineWear(
    inputs.printerCost,
    inputs.expectedLifespanHours,
    printTimeHours
  )

  const baseCost = round(materialCost + electricityCost + machineWearCost, 2)
  const failureMarkup = calculateFailureMarkup(baseCost, inputs.failureRatePercent)
  const setupFee = round(Math.max(inputs.setupFee, 0), 2)
  const totalCost = round(baseCost + failureMarkup + setupFee, 2)

  const costPerHour = printTimeHours > 0 ? round(totalCost / printTimeHours, 2) : 0
  const costPerGram =
    inputs.filamentUsedGrams > 0 ? round(totalCost / inputs.filamentUsedGrams, 2) : 0
  const suggestedSellingPrice = calculateSuggestedSellingPrice(
    totalCost,
    inputs.profitMarginPercent
  )

  return {
    materialCost,
    energyKwh,
    electricityCost,
    machineWearCost,
    baseCost,
    failureMarkup,
    setupFee,
    totalCost,
    costPerHour,
    costPerGram,
    suggestedSellingPrice,
    printTimeHours,
  }
}

export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function round(n: number, d = 2) {
  const f = 10 ** d
  return Math.round(n * f) / f
}
