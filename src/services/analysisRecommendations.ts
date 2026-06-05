import type {
  AnalysisResult,
  CostBreakdown,
  CostInputs,
  OrientationData,
  PrintIssue,
  PrintSetting,
} from '../types/analysis'
import type { GeometryStats } from './geometryAnalyzer'

const MATERIAL_DENSITY: Record<string, number> = {
  PLA: 1.24,
  'PLA+': 1.24,
  PETG: 1.27,
  ABS: 1.04,
  TPU: 1.21,
  'Resin-like PLA': 1.22,
}

export function buildIssuesFromStats(stats: GeometryStats): PrintIssue[] {
  const thinWallStatus = issueStatus(
    stats.minEdgeLengthMm < 0.8,
    stats.minEdgeLengthMm < 0.5
  )
  const overhangStatus = issueStatus(
    stats.overhangRatio > 8,
    stats.overhangRatio > 20
  )
  const floatingStatus = issueStatus(stats.floatingIslandCount > 0, stats.floatingIslandCount > 1)
  const manifoldStatus = issueStatus(
    stats.nonManifoldEdgeCount > 0,
    stats.nonManifoldEdgeCount > 10
  )
  const smallDetailStatus = issueStatus(
    stats.smallFeatureCount > 5,
    stats.smallFeatureCount > 20
  )
  const unsupportedStatus = issueStatus(
    stats.overhangRatio > 15,
    stats.overhangRatio > 30
  )
  const warpingStatus = issueStatus(
    stats.bedFootprintMm2 > 4000 && stats.heightMm < 20,
    stats.bedFootprintMm2 > 8000
  )
  const adhesionStatus = issueStatus(
    stats.heightToFootprintRatio > 3,
    stats.heightToFootprintRatio > 5
  )
  const supportStatus = issueStatus(
    stats.overhangRatio > 5,
    stats.overhangRatio > 18
  )

  return [
    {
      id: 'thin_walls',
      title: 'Thin Walls',
      status: thinWallStatus.status,
      severity: thinWallStatus.severity,
      explanation: `Minimum edge length detected: ${stats.minEdgeLengthMm}mm across ${stats.triangleCount.toLocaleString()} triangles.`,
      suggestedFix:
        stats.minEdgeLengthMm < 0.5
          ? 'Scale model 105–110% or increase wall count to 4+ in your slicer.'
          : 'Use 3–4 perimeters and 0.12mm layer height for thin regions.',
    },
    {
      id: 'overhangs',
      title: 'Overhangs',
      status: overhangStatus.status,
      severity: overhangStatus.severity,
      explanation: `${stats.overhangFaceCount} faces (${stats.overhangRatio}%) exceed 45° overhang angle.`,
      suggestedFix: 'Enable tree supports at 15° threshold or rotate model to reduce downward-facing surfaces.',
    },
    {
      id: 'floating_geometry',
      title: 'Floating Geometry',
      status: floatingStatus.status,
      severity: floatingStatus.severity,
      explanation:
        stats.floatingIslandCount > 0
          ? `${stats.floatingIslandCount} mesh island(s) not connected to the primary body.`
          : 'All geometry is connected to a single body.',
      suggestedFix: 'Merge disconnected parts in CAD or add structural bridges before export.',
    },
    {
      id: 'non_manifold',
      title: 'Non-Manifold Geometry',
      status: manifoldStatus.status,
      severity: manifoldStatus.severity,
      explanation:
        stats.nonManifoldEdgeCount > 0
          ? `${stats.nonManifoldEdgeCount} non-manifold edge(s) and ${stats.degenerateTriangleCount} degenerate triangle(s) found.`
          : 'Mesh appears manifold with no degenerate triangles.',
      suggestedFix: 'Run Make Manifold in Blender/Meshmixer and re-export as binary STL.',
    },
    {
      id: 'small_details',
      title: 'Small Fragile Details',
      status: smallDetailStatus.status,
      severity: smallDetailStatus.severity,
      explanation: `${stats.smallFeatureCount} edges below 0.8mm may not resolve at standard layer heights.`,
      suggestedFix: 'Print at 0.12mm layers, 30mm/s speed, and use a 0.2mm nozzle for fine features.',
    },
    {
      id: 'unsupported_areas',
      title: 'Large Unsupported Areas',
      status: unsupportedStatus.status,
      severity: unsupportedStatus.severity,
      explanation: `Surface area ${stats.surfaceAreaMm2}mm² with ${stats.overhangRatio}% overhang coverage.`,
      suggestedFix: 'Split model into printable sections or use soluble PVA supports for cavities.',
    },
    {
      id: 'warping_risk',
      title: 'Warping Risk',
      status: warpingStatus.status,
      severity: warpingStatus.severity,
      explanation: `Bed footprint ${stats.bedFootprintMm2}mm² with ${stats.heightMm}mm height.`,
      suggestedFix: 'Add 8–10mm brim, use enclosure, and reduce bed temp 5°C after layer 1.',
    },
    {
      id: 'bed_adhesion',
      title: 'Bed Adhesion Risk',
      status: adhesionStatus.status,
      severity: adhesionStatus.severity,
      explanation: `Height-to-footprint ratio: ${stats.heightToFootprintRatio} (tall/narrow models tip easily).`,
      suggestedFix: 'Widen base with brim, reduce print speed first 10 layers, or reorient for stability.',
    },
    {
      id: 'support_complexity',
      title: 'Support Complexity',
      status: supportStatus.status,
      severity: supportStatus.severity,
      explanation:
        stats.overhangRatio > 5
          ? `Moderate-to-complex support generation expected (${stats.overhangFaceCount} overhang faces).`
          : 'Minimal supports required for this geometry.',
      suggestedFix: 'Tree supports at 8–12% density with support interface layers enabled.',
    },
  ]
}

function issueStatus(
  warn: boolean,
  fail: boolean
): { status: PrintIssue['status']; severity: PrintIssue['severity'] } {
  if (fail) return { status: 'fail', severity: 'high' }
  if (warn) return { status: 'warning', severity: 'medium' }
  return { status: 'pass', severity: 'low' }
}

export function buildMetricsFromStats(
  stats: GeometryStats,
  costInputs: CostInputs
): AnalysisResult['metrics'] {
  const density = MATERIAL_DENSITY[costInputs.materialType] ?? 1.24
  const shellFactor = 1.15
  const infillFactor = 0.2 + (costInputs.infillPercentage / 100) * 0.8
  const materialGrams = round(
    (stats.volumeCm3 * density * shellFactor * infillFactor),
    0
  )

  const layerFactor = costInputs.layerHeight / 0.16
  const speedFactor = 50 / costInputs.printSpeed
  const complexityFactor = 1 + stats.overhangRatio / 100
  const printTimeHours = round(
    (stats.volumeCm3 * 0.04 + stats.surfaceAreaMm2 * 0.00008) *
      layerFactor *
      speedFactor *
      complexityFactor,
    1
  )

  const issueCount = buildIssuesFromStats(stats).filter((i) => i.status !== 'pass').length
  const difficultyScore = clamp(
    Math.round(30 + stats.overhangRatio * 1.2 + stats.triangleCount / 500 + issueCount * 5),
    0,
    100
  )
  const riskScore = clamp(
    Math.round(
      stats.overhangRatio * 0.8 +
        stats.nonManifoldEdgeCount * 2 +
        stats.floatingIslandCount * 15 +
        (stats.heightToFootprintRatio > 4 ? 20 : 0)
    ),
    0,
    100
  )

  const supportRequirement: AnalysisResult['metrics']['supportRequirement'] =
    stats.overhangRatio > 25
      ? 'heavy'
      : stats.overhangRatio > 12
        ? 'moderate'
        : stats.overhangRatio > 4
          ? 'minimal'
          : 'none'

  return {
    printTimeHours,
    materialGrams,
    dimensions: stats.dimensions,
    volumeCm3: stats.volumeCm3,
    weightGrams: materialGrams,
    materialCost: round((materialGrams / 1000) * costInputs.filamentPricePerKg, 2),
    difficultyScore,
    riskScore,
    supportRequirement,
    printabilityScore: clamp(100 - riskScore * 0.55 - difficultyScore * 0.25, 0, 100),
  }
}

export function buildPrintSettingsFromStats(
  stats: GeometryStats,
  costInputs: CostInputs
): PrintSetting[] {
  const layerHeight =
    stats.smallFeatureCount > 10 ? 0.12 : stats.overhangRatio > 15 ? 0.16 : 0.2
  const infill = stats.volumeCm3 > 50 ? 10 : 15
  const supportType = stats.overhangRatio > 10 ? 'Tree Supports' : 'Normal Supports'

  return [
    {
      key: 'layer_height',
      label: 'Layer Height',
      value: `${layerHeight}mm`,
      reason:
        stats.smallFeatureCount > 10
          ? 'Fine features detected — thinner layers improve surface resolution.'
          : 'Balanced layer height for this geometry complexity.',
      impact:
        layerHeight <= 0.12
          ? 'Maximum detail, ~25% longer print time.'
          : 'Good quality with reasonable print duration.',
    },
    {
      key: 'nozzle_size',
      label: 'Nozzle Size',
      value: stats.minEdgeLengthMm < 0.5 ? '0.2mm' : '0.4mm',
      reason:
        stats.minEdgeLengthMm < 0.5
          ? 'Sub-0.5mm features benefit from a smaller nozzle.'
          : 'Standard nozzle suits this feature scale.',
      impact: 'Optimal extrusion width for detected feature sizes.',
    },
    {
      key: 'infill',
      label: 'Infill Percentage',
      value: `${costInputs.infillPercentage}%`,
      reason: `Model volume ${stats.volumeCm3}cm³ — ${infill}% gyroid recommended.`,
      impact: 'Balanced strength and material efficiency.',
    },
    {
      key: 'wall_count',
      label: 'Wall Count',
      value: stats.minEdgeLengthMm < 0.8 ? '4 walls' : '3 walls',
      reason:
        stats.minEdgeLengthMm < 0.8
          ? 'Thin wall regions need extra perimeters.'
          : 'Standard wall count sufficient.',
      impact: stats.minEdgeLengthMm < 0.8 ? '+10% material, stronger walls.' : 'Standard material usage.',
    },
    {
      key: 'top_layers',
      label: 'Top Layers',
      value: stats.overhangRatio > 10 ? '6 layers' : '5 layers',
      reason: 'Curved top surfaces need solid layers to prevent pillowing.',
      impact: 'Smoother top surfaces.',
    },
    {
      key: 'bottom_layers',
      label: 'Bottom Layers',
      value: '4 layers',
      reason: `Bed footprint ${stats.bedFootprintMm2}mm² benefits from solid bottom layers.`,
      impact: 'Improved bed adhesion and base finish.',
    },
    {
      key: 'print_speed',
      label: 'Print Speed',
      value: `${costInputs.printSpeed} mm/s`,
      reason: 'Speed matched to your cost calculator setting.',
      impact: 'Adjust speed slider to trade quality vs time.',
    },
    {
      key: 'material_type',
      label: 'Material Type',
      value: costInputs.materialType,
      reason: hasWarpingRisk(stats)
        ? 'Large flat base — PLA+ with brim recommended.'
        : 'Low-warp geometry suits selected material.',
      impact: 'Material matched to geometry risk profile.',
    },
    {
      key: 'support_type',
      label: 'Support Type',
      value: supportType,
      reason:
        stats.overhangRatio > 10
          ? `${stats.overhangRatio}% overhangs — tree supports minimize scarring.`
          : 'Minimal supports needed.',
      impact: 'Easier post-processing on organic surfaces.',
    },
    {
      key: 'support_density',
      label: 'Support Density',
      value: stats.overhangRatio > 20 ? '12%' : '8%',
      reason: 'Density scaled to overhang coverage.',
      impact: 'Reliable overhang support with less waste.',
    },
    {
      key: 'support_placement',
      label: 'Support Placement',
      value: stats.overhangRatio > 8 ? 'Everywhere (auto)' : 'Touching buildplate',
      reason:
        stats.overhangRatio > 8
          ? 'Internal overhangs require full auto-support.'
          : 'Overhangs limited to lower regions.',
      impact: 'Complete coverage where needed.',
    },
    {
      key: 'build_plate_adhesion',
      label: 'Build Plate Adhesion',
      value: stats.bedFootprintMm2 > 5000 ? 'Brim — 10mm' : 'Brim — 6mm',
      reason: 'Brim sized to bed contact area and warping risk.',
      impact: 'Reduced corner lifting on large bases.',
    },
    {
      key: 'cooling',
      label: 'Cooling Settings',
      value: stats.overhangRatio > 10 ? '100% after layer 2' : '80% after layer 3',
      reason: 'Overhangs and bridges need aggressive part cooling.',
      impact: 'Sharper overhangs and cleaner bridges.',
    },
    {
      key: 'retraction',
      label: 'Retraction Suggestions',
      value: stats.connectedComponentCount > 1 ? '1.5mm @ 45mm/s' : '0.8mm @ 35mm/s',
      reason:
        stats.connectedComponentCount > 1
          ? 'Multiple bodies increase travel moves — tune retraction.'
          : 'Single body — standard retraction sufficient.',
      impact: 'Reduced stringing on travel moves.',
    },
    {
      key: 'orientation',
      label: 'Recommended Orientation',
      value: recommendOrientationLabel(stats),
      reason: 'Orientation optimized to minimize overhang area on display surfaces.',
      impact: orientationImpact(stats),
    },
  ]
}

function hasWarpingRisk(stats: GeometryStats): boolean {
  return stats.bedFootprintMm2 > 4000 && stats.heightMm < 30
}

export function buildOrientationFromStats(stats: GeometryStats): OrientationData {
  const tiltX = stats.overhangRatio > 15 ? 35 : stats.overhangRatio > 8 ? 20 : 0
  const tiltZ = stats.dimensions.x > stats.dimensions.z ? 12 : 0
  const supportReduction = Math.round(stats.overhangRatio * 0.4)
  const timeAdd = Math.round(tiltX * 0.3)

  return {
    current: { x: 0, y: 0, z: 0 },
    recommended: { x: tiltX, y: 0, z: tiltZ },
    supportReduction: supportReduction > 0 ? `−${supportReduction}%` : '0%',
    timeDifference: timeAdd > 0 ? `+${timeAdd} min` : '0 min',
    materialSavings: supportReduction > 0 ? `−${Math.round(supportReduction * 0.5)}g` : '0g',
    riskReduction: supportReduction > 0 ? `−${Math.round(supportReduction * 0.6)}%` : '0%',
  }
}

function recommendOrientationLabel(stats: GeometryStats): string {
  const o = buildOrientationFromStats(stats)
  if (o.recommended.x === 0 && o.recommended.z === 0) return 'Default (no rotation needed)'
  return `Tilt ${o.recommended.x}° backward, rotate ${o.recommended.z}° left`
}

function orientationImpact(stats: GeometryStats): string {
  const reduction = Math.round(stats.overhangRatio * 0.4)
  return reduction > 0
    ? `−${reduction}% support material, slight time increase.`
    : 'Current orientation is near-optimal.'
}

export function buildRuleBasedRecommendations(stats: GeometryStats): string[] {
  const recs: string[] = []

  recs.push(
    `Analyzed ${stats.triangleCount.toLocaleString()} triangles across ${stats.dimensions.x}×${stats.dimensions.y}×${stats.dimensions.z}mm (${stats.volumeCm3}cm³ volume).`
  )

  if (stats.overhangRatio > 10) {
    recs.push(
      `${stats.overhangRatio}% of faces are overhangs — tree supports at 10% density will reduce post-processing time.`
    )
  }

  if (stats.minEdgeLengthMm < 0.8) {
    recs.push(
      `Features as small as ${stats.minEdgeLengthMm}mm detected — a 0.12mm layer height will preserve detail on curved surfaces.`
    )
  }

  if (stats.floatingIslandCount > 0) {
    recs.push(
      `${stats.floatingIslandCount} disconnected mesh island(s) found — these will print as separate parts unless merged.`
    )
  }

  if (stats.nonManifoldEdgeCount > 0) {
    recs.push(
      `Mesh has ${stats.nonManifoldEdgeCount} non-manifold edge(s) — repair before slicing to avoid artifacts.`
    )
  }

  if (stats.heightToFootprintRatio > 4) {
    recs.push(
      'Tall, narrow geometry — print slower for the first 15 layers and use a wide brim for stability.'
    )
  }

  if (hasWarpingRisk(stats)) {
    recs.push('Large flat base detected — use a brim and avoid drafts to prevent corner warping.')
  }

  if (stats.isWatertight && stats.overhangRatio < 8) {
    recs.push('Mesh quality is good — this model should slice cleanly with minimal adjustments.')
  }

  return recs
}

export function calculateCostBreakdown(
  metrics: AnalysisResult['metrics'],
  inputs: CostInputs
): CostBreakdown {
  const powerDrawKw = inputs.printerProfile.includes('Voron') ? 0.35 : 0.22
  const speedFactor = 50 / inputs.printSpeed
  const layerFactor = 0.16 / inputs.layerHeight
  const infillFactor = inputs.infillPercentage / 15

  const adjustedTime = metrics.printTimeHours * speedFactor * layerFactor
  const adjustedMaterial = metrics.materialGrams * infillFactor
  const materialCost = round((adjustedMaterial / 1000) * inputs.filamentPricePerKg, 2)
  const electricityCost = round(adjustedTime * powerDrawKw * inputs.electricityCostPerKwh, 2)

  return {
    materialCost,
    electricityCost,
    totalCost: round(materialCost + electricityCost, 2),
    printTimeHours: round(adjustedTime, 1),
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function round(n: number, d = 1) {
  const f = 10 ** d
  return Math.round(n * f) / f
}