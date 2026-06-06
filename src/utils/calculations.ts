import { getPrinterProfile } from '../data/printerProfiles'
import type {
  DesiredSize,
  MaterialEstimate,
  ModelDimensions,
  PrintCalculationInputs,
  PrintSetting,
  PrintTimeEstimate,
  QualityPreset,
  SettingsSummary,
  SizeUnit,
} from '../types/analysis'
import { QUALITY_PRESETS } from '../types/analysis'
import type { GeometryStats } from '../services/geometryAnalyzer'

export const MATERIAL_DENSITY: Record<string, number> = {
  PLA: 1.24,
  'PLA+': 1.24,
  PETG: 1.27,
  ABS: 1.04,
  TPU: 1.21,
  'Resin-like PLA': 1.1,
  Resin: 1.1,
}

export function toMillimeters(value: number, unit: SizeUnit): number {
  if (unit === 'mm') return value
  if (unit === 'cm') return value * 10
  return value * 25.4
}

export function fromMillimeters(value: number, unit: SizeUnit): number {
  if (unit === 'mm') return value
  if (unit === 'cm') return value / 10
  return value / 25.4
}

export function desiredSizeFromOriginal(originalMm: ModelDimensions, unit: SizeUnit = 'mm'): DesiredSize {
  return {
    width: round(fromMillimeters(originalMm.x, unit), unit === 'mm' ? 1 : 2),
    height: round(fromMillimeters(originalMm.y, unit), unit === 'mm' ? 1 : 2),
    depth: round(fromMillimeters(originalMm.z, unit), unit === 'mm' ? 1 : 2),
    unit,
    lockProportions: true,
  }
}

export function calculateScaledDimensions(
  originalMm: ModelDimensions,
  desired: DesiredSize,
  changedAxis?: 'width' | 'height' | 'depth'
): { scaledDimensionsMm: ModelDimensions; scaleFactor: number } {
  let widthMm = toMillimeters(desired.width, desired.unit)
  let heightMm = toMillimeters(desired.height, desired.unit)
  let depthMm = toMillimeters(desired.depth, desired.unit)

  if (desired.lockProportions && changedAxis) {
    const ratios = {
      width: originalMm.x > 0 ? widthMm / originalMm.x : 1,
      height: originalMm.y > 0 ? heightMm / originalMm.y : 1,
      depth: originalMm.z > 0 ? depthMm / originalMm.z : 1,
    }
    const scale = ratios[changedAxis]
    widthMm = originalMm.x * scale
    heightMm = originalMm.y * scale
    depthMm = originalMm.z * scale
  } else if (desired.lockProportions) {
    const scale = originalMm.x > 0 ? widthMm / originalMm.x : 1
    heightMm = originalMm.y * scale
    depthMm = originalMm.z * scale
  }

  const scaleFactor =
    originalMm.x > 0 ? widthMm / originalMm.x : originalMm.y > 0 ? heightMm / originalMm.y : 1

  return {
    scaledDimensionsMm: {
      x: round(widthMm, 2),
      y: round(heightMm, 2),
      z: round(depthMm, 2),
    },
    scaleFactor: round(scaleFactor, 4),
  }
}

export function scaleGeometryStats(stats: GeometryStats, scaleFactor: number): GeometryStats {
  const s2 = scaleFactor * scaleFactor
  const s3 = scaleFactor * scaleFactor * scaleFactor

  return {
    ...stats,
    originalDimensions: stats.originalDimensions,
    dimensions: {
      x: round(stats.dimensions.x * scaleFactor, 1),
      y: round(stats.dimensions.y * scaleFactor, 1),
      z: round(stats.dimensions.z * scaleFactor, 1),
    },
    volumeMm3: round(stats.volumeMm3 * s3, 1),
    volumeCm3: round(stats.volumeCm3 * s3, 2),
    surfaceAreaMm2: round(stats.surfaceAreaMm2 * s2, 1),
    bedFootprintMm2: round(stats.bedFootprintMm2 * s2, 1),
    heightMm: round(stats.heightMm * scaleFactor, 1),
    minEdgeLengthMm: round(stats.minEdgeLengthMm * scaleFactor, 2),
  }
}

export function estimateMaterialUsage(params: {
  volumeCm3: number
  surfaceAreaMm2: number
  bedFootprintMm2: number
  infillPct: number
  wallCount: number
  topLayers: number
  bottomLayers: number
  layerHeight: number
  nozzleSize: number
  materialType: string
  overhangRatio: number
  supportsEnabled: boolean
}): MaterialEstimate {
  const density = MATERIAL_DENSITY[params.materialType] ?? 1.24
  const lineWidth = params.nozzleSize * 1.05

  const wallVolumeCm3 =
    (params.surfaceAreaMm2 / 100) * params.wallCount * params.layerHeight * lineWidth * 0.001
  const topBottomVolumeCm3 =
    (params.bedFootprintMm2 / 100) * (params.topLayers + params.bottomLayers) * params.layerHeight * 0.001

  const internalCm3 = Math.max(params.volumeCm3 - wallVolumeCm3 - topBottomVolumeCm3, 0)
  const infillVolumeCm3 = internalCm3 * (params.infillPct / 100)

  const supportVolumeCm3 = params.supportsEnabled
    ? params.volumeCm3 * (params.overhangRatio / 100) * 0.42
    : 0

  const wallGrams = wallVolumeCm3 * density
  const topBottomGrams = topBottomVolumeCm3 * density
  const infillGrams = infillVolumeCm3 * density
  const modelGrams = wallGrams + topBottomGrams + infillGrams
  const supportGrams = supportVolumeCm3 * density

  return {
    wallGrams: round(wallGrams, 1),
    topBottomGrams: round(topBottomGrams, 1),
    infillGrams: round(infillGrams, 1),
    modelGrams: round(modelGrams, 1),
    supportGrams: round(supportGrams, 1),
    totalGrams: round(modelGrams + supportGrams, 0),
  }
}

export function estimatePrintTime(params: {
  volumeCm3: number
  surfaceAreaMm2: number
  heightMm: number
  layerHeight: number
  infillPct: number
  printSpeedMmS: number
  speedQualityFactor: number
  qualityPreset: QualityPreset
  overhangRatio: number
  supportsEnabled: boolean
}): PrintTimeEstimate {
  const quality = QUALITY_PRESETS.find((q) => q.id === params.qualityPreset) ?? QUALITY_PRESETS[1]

  const layerCount = Math.max(params.heightMm / params.layerHeight, 1)
  const perimeterMm = params.surfaceAreaMm2 * 0.35
  const infillAreaMm2 = (params.volumeCm3 * 100) * (params.infillPct / 100) * 0.4

  const perimeterMinutes = perimeterMm / Math.max(params.printSpeedMmS * 60, 1)
  const infillMinutes = infillAreaMm2 / Math.max(params.printSpeedMmS * 40, 1)
  const layerChangeMinutes = layerCount * 0.015

  let minutes =
    (perimeterMinutes + infillMinutes + layerChangeMinutes) *
    (0.2 / params.layerHeight) *
    (60 / params.printSpeedMmS) *
    quality.factor *
    (1 / params.speedQualityFactor)

  if (params.supportsEnabled) {
    minutes *= 1 + params.overhangRatio / 100
  }

  minutes = Math.max(minutes, 3)

  const hours = minutes / 60
  return {
    hours: round(hours, 2),
    minutes: round(minutes, 0),
    label: formatDuration(hours),
  }
}

export function estimateEnergyUsage(
  watts: number,
  printHours: number,
  electricityCostPerKwh: number
): { kwh: number; cost: number; watts: number } {
  const kwh = (watts * printHours) / 1000
  return {
    watts,
    kwh: round(kwh, 3),
    cost: round(kwh * electricityCostPerKwh, 2),
  }
}

/** Material cost = (print weight ÷ spool weight) × spool price (PrintPal model). */
export function calculateMaterialCost(
  materialGrams: number,
  spoolPrice: number,
  spoolWeightKg: number
): number {
  const spoolGrams = Math.max(spoolWeightKg * 1000, 1)
  return round((materialGrams / spoolGrams) * spoolPrice, 2)
}

/** Machine wear = (printer cost ÷ lifespan hours) × print hours. */
export function calculateMachineWearCost(
  printerCost: number,
  expectedLifespanHours: number,
  printHours: number
): number {
  if (expectedLifespanHours <= 0) return 0
  return round((printerCost / expectedLifespanHours) * printHours, 2)
}

/** Failure markup applied to material + electricity + machine wear subtotal. */
export function calculateFailureMarkup(
  subtotalBeforeFailure: number,
  failureRatePercent: number
): number {
  return round(subtotalBeforeFailure * (failureRatePercent / 100), 2)
}

/**
 * PrintPal-style total cost:
 * material + electricity + machine wear + failure markup on that subtotal.
 */
export function calculateTotalCost(params: {
  materialGrams: number
  spoolPrice: number
  spoolWeightKg: number
  energyCost: number
  printHours: number
  printerCost: number
  expectedLifespanHours: number
  failureRatePercent: number
}): {
  materialCost: number
  electricityCost: number
  machineWearCost: number
  failureMarkup: number
  subtotalBeforeFailure: number
  totalCost: number
} {
  const materialCost = calculateMaterialCost(
    params.materialGrams,
    params.spoolPrice,
    params.spoolWeightKg
  )
  const electricityCost = round(params.energyCost, 2)
  const machineWearCost = calculateMachineWearCost(
    params.printerCost,
    params.expectedLifespanHours,
    params.printHours
  )
  const subtotalBeforeFailure = round(materialCost + electricityCost + machineWearCost, 2)
  const failureMarkup = calculateFailureMarkup(subtotalBeforeFailure, params.failureRatePercent)
  const totalCost = round(subtotalBeforeFailure + failureMarkup, 2)

  return {
    materialCost,
    electricityCost,
    machineWearCost,
    failureMarkup,
    subtotalBeforeFailure,
    totalCost,
  }
}

export function recommendPrintSettings(
  stats: GeometryStats,
  inputs: PrintCalculationInputs,
  material: MaterialEstimate,
  time: PrintTimeEstimate
): PrintSetting[] {
  const printer = getPrinterProfile(inputs.printerProfileId, inputs.customPrinter)
  const maxDim = Math.max(stats.dimensions.x, stats.dimensions.y, stats.dimensions.z)
  const isSmallDetailed = maxDim < 80 && stats.minEdgeLengthMm < 1.2
  const isLargeSimple = maxDim > 150 && stats.overhangRatio < 12

  let layerHeight = inputs.layerHeight
  if (isSmallDetailed) layerHeight = Math.min(layerHeight, 0.16)
  if (isLargeSimple) layerHeight = Math.max(layerHeight, 0.2)

  const supportType =
    stats.overhangRatio > 18 ? 'Tree Supports' : stats.overhangRatio > 8 ? 'Organic Supports' : 'Normal Supports'
  const supportDensity = stats.overhangRatio > 20 ? '12%' : stats.overhangRatio > 10 ? '10%' : '8%'
  const adhesion = stats.bedFootprintMm2 > 5000 ? 'Brim 10 mm' : 'Brim 6 mm'

  return [
    {
      key: 'layer_height',
      label: 'Layer Height',
      value: `${layerHeight.toFixed(2)} mm`,
      reason: isSmallDetailed
        ? 'Small detailed model — thinner layers improve surface quality.'
        : isLargeSimple
          ? 'Large simple geometry — thicker layers reduce print time.'
          : 'Balanced layer height for this model size and detail level.',
      impact: `Estimated print time: ${time.label} (estimated).`,
    },
    {
      key: 'nozzle',
      label: 'Nozzle Size',
      value: `${printer.nozzleSizeMm} mm`,
      reason: `Default nozzle for ${printer.name}.`,
      impact: 'Matched to selected printer profile.',
    },
    {
      key: 'infill',
      label: 'Infill',
      value: `${inputs.infillPercentage}%`,
      reason: `Infill volume contributes ~${material.infillGrams.toFixed(1)}g of model material.`,
      impact: 'Higher infill increases strength, weight, time, and cost.',
    },
    {
      key: 'walls',
      label: 'Wall Count',
      value: `${inputs.wallCount}`,
      reason:
        stats.minEdgeLengthMm < 0.8
          ? 'Thin features detected — extra walls improve reliability.'
          : 'Standard perimeter count for this geometry.',
      impact: `Wall material ~${material.wallGrams.toFixed(1)}g (estimated).`,
    },
    {
      key: 'support_type',
      label: 'Support Type',
      value: inputs.supportsEnabled ? supportType : 'None',
      reason:
        stats.overhangRatio > 8
          ? `${stats.overhangRatio}% overhang coverage detected.`
          : 'Low overhang risk — supports optional.',
      impact: inputs.supportsEnabled
        ? `Support material ~${material.supportGrams.toFixed(1)}g (estimated).`
        : 'No support material required.',
    },
    {
      key: 'support_density',
      label: 'Support Density',
      value: inputs.supportsEnabled ? supportDensity : '0%',
      reason: 'Density scaled to overhang severity.',
      impact: 'Affects support removal difficulty and material use.',
    },
    {
      key: 'adhesion',
      label: 'Build Plate Adhesion',
      value: adhesion,
      reason:
        stats.bedFootprintMm2 > 4000
          ? 'Large footprint — brim reduces warping risk.'
          : 'Moderate brim for bed adhesion.',
      impact: 'Improves first-layer stability.',
    },
    {
      key: 'orientation',
      label: 'Orientation',
      value: inputs.applyRecommendedOrientation ? 'Recommended rotation applied' : 'Original upload orientation',
      reason: inputs.applyRecommendedOrientation
        ? 'Applied recommended orientation to reduce supports.'
        : 'Preserving original STL orientation unless you apply the recommendation.',
      impact: 'Orientation changes visible support and time estimates.',
    },
    {
      key: 'material',
      label: 'Material',
      value: inputs.materialType,
      reason: printer.supportedMaterials.includes(inputs.materialType)
        ? `Supported by ${printer.name}.`
        : 'Verify compatibility with your selected printer.',
      impact: `Density ${MATERIAL_DENSITY[inputs.materialType] ?? 1.24} g/cm³ used in estimates.`,
    },
    {
      key: 'quality',
      label: 'Quality Preset',
      value: QUALITY_PRESETS.find((q) => q.id === inputs.qualityPreset)?.label ?? 'Standard',
      reason: 'Quality preset adjusts effective print duration multiplier.',
      impact: `Current estimate: ${time.label} (estimated).`,
    },
  ]
}

export function buildSettingsSummary(
  inputs: PrintCalculationInputs,
  stats: GeometryStats,
  material: MaterialEstimate,
  time: PrintTimeEstimate,
  energy: { kwh: number; cost: number },
  totalCost: number
): SettingsSummary {
  const printer = getPrinterProfile(inputs.printerProfileId, inputs.customPrinter)
  const dim = stats.dimensions

  return {
    modelSize: `${dim.x} × ${dim.y} × ${dim.z} mm`,
    material: inputs.materialType,
    printer: printer.name,
    layerHeight: `${inputs.layerHeight.toFixed(2)} mm`,
    infill: `${inputs.infillPercentage}%`,
    supports: inputs.supportsEnabled ? `${material.supportGrams.toFixed(0)}g estimated` : 'None',
    estimatedTime: `${time.label} (estimated)`,
    filament: `${material.totalGrams}g (estimated)`,
    energy: `${energy.kwh.toFixed(2)} kWh · $${energy.cost.toFixed(2)} (estimated)`,
    totalCost: `$${totalCost.toFixed(2)} (estimated)`,
  }
}

export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function normalizePrintInputs(
  inputs: Partial<PrintCalculationInputs> & { filamentPricePerKg?: number }
): PrintCalculationInputs {
  const legacy = inputs as {
    filamentPricePerKg?: number
    machineHourlyRate?: number
    setupFee?: number
  }

  const base =
    inputs.desiredSize && inputs.scaledDimensionsMm
      ? (inputs as PrintCalculationInputs)
      : null

  const merged = {
    ...(base ?? {}),
    ...inputs,
    spoolPrice: inputs.spoolPrice ?? legacy.filamentPricePerKg ?? 22,
    spoolWeightKg: inputs.spoolWeightKg ?? 1,
    printerCost: inputs.printerCost ?? 699,
    expectedLifespanHours: inputs.expectedLifespanHours ?? 8000,
    failureRatePercent: inputs.failureRatePercent ?? 5,
  }

  return merged as PrintCalculationInputs
}

export function defaultPrintInputs(originalMm: ModelDimensions): PrintCalculationInputs {
  const desiredSize = desiredSizeFromOriginal(originalMm, 'mm')
  const { scaledDimensionsMm, scaleFactor } = calculateScaledDimensions(originalMm, desiredSize)

  return {
    desiredSize,
    scaleFactor,
    scaledDimensionsMm,
    printerProfileId: 'bambu-p1s',
    customPrinter: null,
    materialType: 'PLA',
    infillPercentage: 15,
    wallCount: 3,
    topLayers: 5,
    bottomLayers: 4,
    layerHeight: 0.16,
    qualityPreset: 'standard',
    spoolPrice: 22,
    spoolWeightKg: 1,
    electricityCostPerKwh: 0.16,
    printerCost: 699,
    expectedLifespanHours: 8000,
    failureRatePercent: 5,
    supportsEnabled: true,
    applyRecommendedOrientation: false,
  }
}

function round(n: number, d = 2) {
  const f = 10 ** d
  return Math.round(n * f) / f
}
