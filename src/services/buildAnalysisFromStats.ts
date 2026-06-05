import type { AnalysisResult, PrintCalculationInputs } from '../types/analysis'
import {
  buildSettingsSummary,
  calculateTotalCost,
  estimateEnergyUsage,
  estimateMaterialUsage,
  estimatePrintTime,
  recommendPrintSettings,
  scaleGeometryStats,
} from '../utils/calculations'
import { getPrinterProfile } from '../data/printerProfiles'
import {
  buildIssuesFromStats,
  buildOrientationFromStats,
  buildRuleBasedRecommendations,
} from './analysisRecommendations'
import type { GeometryStats } from './geometryAnalyzer'

export function buildAnalysisFromStats(
  stats: GeometryStats,
  inputs: PrintCalculationInputs,
  aiRecommendations?: string[]
): AnalysisResult {
  const scaledStats = scaleGeometryStats(stats, inputs.scaleFactor)
  const printer = getPrinterProfile(inputs.printerProfileId, inputs.customPrinter)

  const material = estimateMaterialUsage({
    volumeCm3: scaledStats.volumeCm3,
    surfaceAreaMm2: scaledStats.surfaceAreaMm2,
    bedFootprintMm2: scaledStats.bedFootprintMm2,
    infillPct: inputs.infillPercentage,
    wallCount: inputs.wallCount,
    topLayers: inputs.topLayers,
    bottomLayers: inputs.bottomLayers,
    layerHeight: inputs.layerHeight,
    nozzleSize: printer.nozzleSizeMm,
    materialType: inputs.materialType,
    overhangRatio: scaledStats.overhangRatio,
    supportsEnabled: inputs.supportsEnabled,
  })

  const time = estimatePrintTime({
    volumeCm3: scaledStats.volumeCm3,
    surfaceAreaMm2: scaledStats.surfaceAreaMm2,
    heightMm: scaledStats.heightMm,
    layerHeight: inputs.layerHeight,
    infillPct: inputs.infillPercentage,
    printSpeedMmS: printer.printSpeedMmS,
    speedQualityFactor: printer.speedQualityFactor,
    qualityPreset: inputs.qualityPreset,
    overhangRatio: scaledStats.overhangRatio,
    supportsEnabled: inputs.supportsEnabled,
  })

  const energy = estimateEnergyUsage(
    printer.powerWatts,
    time.hours,
    inputs.electricityCostPerKwh
  )

  const costs = calculateTotalCost({
    materialGrams: material.totalGrams,
    filamentPricePerKg: inputs.filamentPricePerKg,
    energyCost: energy.cost,
    printHours: time.hours,
    machineHourlyRate: inputs.machineHourlyRate,
    setupFee: inputs.setupFee,
  })

  const issues = buildIssuesFromStats(scaledStats)
  const issueCount = issues.filter((i) => i.status !== 'pass').length

  const difficultyScore = clamp(
    Math.round(30 + scaledStats.overhangRatio * 1.2 + scaledStats.triangleCount / 500 + issueCount * 5),
    0,
    100
  )
  const riskScore = clamp(
    Math.round(
      scaledStats.overhangRatio * 0.8 +
        scaledStats.nonManifoldEdgeCount * 2 +
        scaledStats.floatingIslandCount * 15 +
        (scaledStats.heightToFootprintRatio > 4 ? 20 : 0)
    ),
    0,
    100
  )

  const supportRequirement: AnalysisResult['metrics']['supportRequirement'] =
    !inputs.supportsEnabled
      ? 'none'
      : scaledStats.overhangRatio > 25
        ? 'heavy'
        : scaledStats.overhangRatio > 12
          ? 'moderate'
          : scaledStats.overhangRatio > 4
            ? 'minimal'
            : 'none'

  const orientation = buildOrientationFromStats(scaledStats, material, time)

  const printSettings = recommendPrintSettings(scaledStats, inputs, material, time)
  const settingsSummary = buildSettingsSummary(inputs, scaledStats, material, time, energy, costs.totalCost)

  return {
    metrics: {
      printTimeHours: time.hours,
      materialGrams: material.totalGrams,
      dimensions: scaledStats.dimensions,
      volumeCm3: scaledStats.volumeCm3,
      weightGrams: material.totalGrams,
      materialCost: costs.materialCost,
      difficultyScore,
      riskScore,
      supportRequirement,
      printabilityScore: clamp(100 - riskScore * 0.55 - difficultyScore * 0.25, 0, 100),
      scaleFactor: inputs.scaleFactor,
      isEstimated: true,
    },
    issues,
    aiRecommendations: aiRecommendations ?? buildRuleBasedRecommendations(scaledStats),
    printSettings,
    orientation,
    costBreakdown: {
      materialCost: costs.materialCost,
      electricityCost: costs.electricityCost,
      machineCost: costs.machineCost,
      setupFee: costs.setupFee,
      totalCost: costs.totalCost,
      printTimeHours: time.hours,
      energyKwh: energy.kwh,
    },
    materialEstimate: material,
    energyEstimate: energy,
    settingsSummary,
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
