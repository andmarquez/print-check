import type {
  AnalysisEngine,
  AnalysisResult,
  CostInputs,
  PrintIssue,
  PrintSetting,
  STLFileInfo,
} from '../types/analysis'

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const rand = x - Math.floor(x)
  return min + rand * (max - min)
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function buildIssues(seed: number): PrintIssue[] {
  const issueTemplates: Omit<PrintIssue, 'status' | 'severity'>[] = [
    {
      id: 'thin_walls',
      title: 'Thin Walls',
      explanation: 'Several regions measure below 0.8mm wall thickness, which may not print reliably at standard layer heights.',
      suggestedFix: 'Increase wall count to 4 or scale the model by 102% in slicer before printing.',
    },
    {
      id: 'overhangs',
      title: 'Overhangs',
      explanation: 'Detected 12 surface regions exceeding 45° overhang angle without adequate self-support.',
      suggestedFix: 'Enable tree supports with 15° overhang threshold, or rotate model 35° backward.',
    },
    {
      id: 'floating_geometry',
      title: 'Floating Geometry',
      explanation: 'Two isolated mesh islands detected that are not connected to the main body.',
      suggestedFix: 'Merge floating parts in your CAD software or add structural bridges before export.',
    },
    {
      id: 'non_manifold',
      title: 'Non-Manifold Geometry',
      explanation: 'Minor non-manifold edges found near seam intersections. May cause slicing artifacts.',
      suggestedFix: 'Run "Make Manifold" in Meshmixer or Blender before re-exporting the STL.',
    },
    {
      id: 'small_details',
      title: 'Small Fragile Details',
      explanation: 'Fine protrusions under 0.4mm detected on extremities — below typical nozzle resolution.',
      suggestedFix: 'Use 0.12mm layer height and reduce print speed to 30mm/s for detail regions.',
    },
    {
      id: 'unsupported_areas',
      title: 'Large Unsupported Areas',
      explanation: 'A 34mm² underside cavity requires substantial support material for successful printing.',
      suggestedFix: 'Consider splitting the model or using soluble PVA supports for clean removal.',
    },
    {
      id: 'warping_risk',
      title: 'Warping Risk',
      explanation: 'Large flat base contact area with sharp corners increases corner-lifting probability.',
      suggestedFix: 'Add a 8mm brim and reduce bed temperature by 5°C after first layer.',
    },
    {
      id: 'bed_adhesion',
      title: 'Bed Adhesion Risk',
      explanation: 'Minimal footprint relative to model height creates stability concerns during tall prints.',
      suggestedFix: 'Use a wider brim (10mm) or reorient to maximize bed contact area.',
    },
    {
      id: 'support_complexity',
      title: 'Support Complexity',
      explanation: 'Organic geometry with internal cavities will require intricate tree support structures.',
      suggestedFix: 'Tree supports at 10% density recommended. Enable support interface layers.',
    },
  ]

  return issueTemplates.map((template, i) => {
    const severityRoll = seededRandom(seed + i * 7, 0, 1)
    let severity: PrintIssue['severity'] = 'low'
    let status: PrintIssue['status'] = 'pass'

    if (severityRoll > 0.85) {
      severity = 'critical'
      status = 'fail'
    } else if (severityRoll > 0.65) {
      severity = 'high'
      status = 'fail'
    } else if (severityRoll > 0.4) {
      severity = 'medium'
      status = 'warning'
    } else if (severityRoll > 0.2) {
      severity = 'low'
      status = 'warning'
    }

    return { ...template, severity, status }
  })
}

function buildPrintSettings(seed: number): PrintSetting[] {
  const layerHeight = seededRandom(seed, 0.12, 0.2)
  const infill = Math.round(seededRandom(seed + 1, 10, 25))

  return [
    {
      key: 'layer_height',
      label: 'Layer Height',
      value: `${round(layerHeight, 2)}mm`,
      reason: 'This model contains organic curves and facial details that would benefit from increased surface quality.',
      impact: 'Higher detail with slightly longer print times.',
    },
    {
      key: 'nozzle_size',
      label: 'Nozzle Size',
      value: '0.4mm',
      reason: 'Standard nozzle provides optimal balance of detail and speed for this geometry complexity.',
      impact: 'Reliable extrusion with good fine-feature resolution.',
    },
    {
      key: 'infill',
      label: 'Infill Percentage',
      value: `${infill}%`,
      reason: 'Decorative/display model with moderate structural demands — gyroid infill pattern recommended.',
      impact: 'Reduced material usage while maintaining structural integrity.',
    },
    {
      key: 'wall_count',
      label: 'Wall Count',
      value: '3 walls',
      reason: 'Thin wall regions detected require additional perimeters for printability.',
      impact: 'Stronger walls, +8% material usage.',
    },
    {
      key: 'top_layers',
      label: 'Top Layers',
      value: '5 layers',
      reason: 'Curved top surfaces need sufficient solid layers to prevent pillowing artifacts.',
      impact: 'Smoother top surfaces, minimal time increase.',
    },
    {
      key: 'bottom_layers',
      label: 'Bottom Layers',
      value: '4 layers',
      reason: 'Flat base contact area benefits from extra bottom solid layers for bed adhesion.',
      impact: 'Improved first-layer bonding and surface finish.',
    },
    {
      key: 'print_speed',
      label: 'Print Speed',
      value: '50 mm/s',
      reason: 'Moderate speed balances quality on detail regions with reasonable total print time.',
      impact: 'Balanced quality-to-speed ratio.',
    },
    {
      key: 'material_type',
      label: 'Material Type',
      value: 'PLA+',
      reason: 'Low warp risk geometry suits PLA+. Good detail reproduction for display pieces.',
      impact: 'Easy printing with excellent surface finish.',
    },
    {
      key: 'support_type',
      label: 'Support Type',
      value: 'Tree Supports',
      reason: 'Organic geometry with internal overhangs benefits from minimal-contact tree structures.',
      impact: 'Easier removal with less surface scarring.',
    },
    {
      key: 'support_density',
      label: 'Support Density',
      value: '10%',
      reason: 'Moderate overhang coverage allows lower density without compromising reliability.',
      impact: 'Less support material, faster post-processing.',
    },
    {
      key: 'support_placement',
      label: 'Support Placement',
      value: 'Everywhere (auto)',
      reason: 'Complex internal cavities require automatic support generation in hidden areas.',
      impact: 'Complete overhang coverage with some internal supports.',
    },
    {
      key: 'build_plate_adhesion',
      label: 'Build Plate Adhesion',
      value: 'Brim — 8mm',
      reason: 'Corner-lifting risk on large flat base warrants extended brim adhesion.',
      impact: 'Improved bed adhesion, easy brim removal.',
    },
    {
      key: 'cooling',
      label: 'Cooling Settings',
      value: '100% after layer 2',
      reason: 'Fine details and overhangs require maximum part cooling for crisp edges.',
      impact: 'Sharper details, potential slight layer adhesion trade-off.',
    },
    {
      key: 'retraction',
      label: 'Retraction Suggestions',
      value: '1.5mm @ 45mm/s (Bowden)',
      reason: 'Multiple island travels detected — tuned retraction prevents stringing between sections.',
      impact: 'Cleaner travel moves, reduced post-processing.',
    },
    {
      key: 'orientation',
      label: 'Recommended Orientation',
      value: 'Tilt 35° backward, rotate 12° left',
      reason: 'This orientation minimizes visible support marks on primary display surfaces.',
      impact: '−34% support material, +12min print time.',
    },
  ]
}

function buildAiRecommendations(fileName: string): string[] {
  const base = fileName.replace(/\.stl$/i, '').toLowerCase()
  const isOrganic = /figur|toy|character|bust|head|face|dragon|creature/i.test(base)

  const recommendations = [
    'This model contains multiple surface details that may benefit from a smaller layer height of 0.12–0.16mm for crisp feature definition.',
    'Tilting the model backward approximately 35° could reduce visible support marks on the primary viewing angle.',
    isOrganic
      ? 'Tree supports are strongly recommended due to the organic geometry and curved overhang profiles.'
      : 'Standard grid supports may suffice, but tree supports will reduce scarring on exterior surfaces.',
    'Consider printing at 50% speed for the first 10 layers to ensure optimal bed adhesion on the contact surface.',
    'A gyroid infill pattern at 15% provides excellent strength-to-weight ratio for display models.',
    'Enable "detect thin walls" in your slicer — our scan found regions that may need manual wall count adjustment.',
    'Post-processing tip: light sanding at 400-grit on support-contact areas will restore surface quality.',
  ]

  return recommendations
}

function calculateCost(
  metrics: AnalysisResult['metrics'],
  inputs: CostInputs
): AnalysisResult['costBreakdown'] {
  const powerDrawKw = inputs.printerProfile.includes('Core') ? 0.35 : 0.22
  const electricityCost =
    metrics.printTimeHours * powerDrawKw * inputs.electricityCostPerKwh

  const speedFactor = 60 / inputs.printSpeed
  const layerFactor = 0.16 / inputs.layerHeight
  const infillFactor = inputs.infillPercentage / 15
  const adjustedTime = metrics.printTimeHours * speedFactor * layerFactor
  const adjustedMaterial = metrics.materialGrams * infillFactor

  return {
    materialCost: round((adjustedMaterial / 1000) * inputs.filamentPricePerKg, 2),
    electricityCost: round(electricityCost * speedFactor, 2),
    totalCost: round(
      (adjustedMaterial / 1000) * inputs.filamentPricePerKg + electricityCost * speedFactor,
      2
    ),
    printTimeHours: round(adjustedTime, 1),
  }
}

export const mockAnalysisEngine: AnalysisEngine = {
  async analyze(file: STLFileInfo, costInputs: CostInputs): Promise<AnalysisResult> {
    await new Promise((r) => setTimeout(r, 300))

    const seed = hashString(file.name + file.size)
    const sizeFactor = Math.min(file.size / 500000, 3)

    const printTimeHours = round(seededRandom(seed, 2, 8) * sizeFactor, 1)
    const materialGrams = round(seededRandom(seed + 2, 30, 180) * sizeFactor, 0)
    const dimX = round(seededRandom(seed + 3, 40, 120), 0)
    const dimY = round(seededRandom(seed + 4, 40, 120), 0)
    const dimZ = round(seededRandom(seed + 5, 30, 200), 0)
    const volumeCm3 = round((dimX * dimY * dimZ) / 1000, 1)
    const weightGrams = round(materialGrams * 0.95, 0)
    const difficultyScore = Math.round(seededRandom(seed + 6, 35, 85))
    const riskScore = Math.round(seededRandom(seed + 7, 20, 75))
    const printabilityScore = Math.round(100 - riskScore * 0.6 - difficultyScore * 0.2)

    const supportRoll = seededRandom(seed + 8, 0, 1)
    const supportRequirement: AnalysisResult['metrics']['supportRequirement'] =
      supportRoll > 0.75 ? 'heavy' : supportRoll > 0.5 ? 'moderate' : supportRoll > 0.25 ? 'minimal' : 'none'

    const metrics: AnalysisResult['metrics'] = {
      printTimeHours,
      materialGrams,
      dimensions: { x: dimX, y: dimY, z: dimZ },
      volumeCm3,
      weightGrams,
      materialCost: round((materialGrams / 1000) * costInputs.filamentPricePerKg, 2),
      difficultyScore,
      riskScore,
      supportRequirement,
      printabilityScore: Math.max(0, Math.min(100, printabilityScore)),
    }

    const result: AnalysisResult = {
      metrics,
      issues: buildIssues(seed),
      aiRecommendations: buildAiRecommendations(file.name),
      printSettings: buildPrintSettings(seed),
      orientation: {
        current: { x: 0, y: 0, z: 0 },
        recommended: { x: 35, y: 0, z: 12 },
        supportReduction: '−34%',
        timeDifference: '+12 min',
        materialSavings: '−18g',
        riskReduction: '−22%',
      },
      costBreakdown: calculateCost(metrics, costInputs),
    }

    result.costBreakdown = calculateCost(metrics, costInputs)
    return result
  },
}
