export type ScanStage =
  | 'idle'
  | 'reading_geometry'
  | 'analyzing_surface'
  | 'checking_wall_thickness'
  | 'detecting_overhangs'
  | 'estimating_supports'
  | 'generating_settings'
  | 'complete'

export type IssueSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical'
export type IssueStatus = 'pass' | 'warning' | 'fail'
export type SizeUnit = 'mm' | 'cm' | 'in'
export type QualityPreset = 'draft' | 'standard' | 'high' | 'ultra'
export type AppPhase = 'empty' | 'sizing' | 'scanning' | 'analyzing' | 'complete'

export interface ModelDimensions {
  x: number
  y: number
  z: number
}

export interface DesiredSize {
  width: number
  height: number
  depth: number
  unit: SizeUnit
  lockProportions: boolean
}

export interface CustomPrinterSettings {
  printSpeedMmS: number
  powerWatts: number
  buildVolumeX: number
  buildVolumeY: number
  buildVolumeZ: number
  nozzleSizeMm: number
}

export interface PrintCalculationInputs {
  desiredSize: DesiredSize
  scaleFactor: number
  scaledDimensionsMm: ModelDimensions
  printerProfileId: string
  customPrinter: CustomPrinterSettings | null
  materialType: string
  infillPercentage: number
  wallCount: number
  topLayers: number
  bottomLayers: number
  layerHeight: number
  qualityPreset: QualityPreset
  spoolPrice: number
  spoolWeightKg: number
  electricityCostPerKwh: number
  printerCost: number
  expectedLifespanHours: number
  failureRatePercent: number
  supportsEnabled: boolean
  applyRecommendedOrientation: boolean
}

/** @deprecated use PrintCalculationInputs */
export type CostInputs = PrintCalculationInputs

export interface PrintIssue {
  id: string
  title: string
  status: IssueStatus
  severity: IssueSeverity
  explanation: string
  suggestedFix: string
}

export interface PrintSetting {
  key: string
  label: string
  value: string
  reason: string
  impact: string
}

export interface OrientationData {
  current: { x: number; y: number; z: number }
  recommended: { x: number; y: number; z: number }
  supportReduction: string
  timeDifference: string
  materialSavings: string
  riskReduction: string
}

export interface MaterialEstimate {
  modelGrams: number
  supportGrams: number
  totalGrams: number
  wallGrams: number
  infillGrams: number
  topBottomGrams: number
}

export interface PrintTimeEstimate {
  hours: number
  minutes: number
  label: string
}

export interface EnergyEstimate {
  kwh: number
  cost: number
  watts: number
}

export interface CostBreakdown {
  materialCost: number
  electricityCost: number
  machineWearCost: number
  failureMarkup: number
  subtotalBeforeFailure: number
  totalCost: number
  printTimeHours: number
  energyKwh: number
}

export interface SettingsSummary {
  modelSize: string
  material: string
  printer: string
  layerHeight: string
  infill: string
  supports: string
  estimatedTime: string
  filament: string
  energy: string
  totalCost: string
}

export interface AnalysisMetrics {
  printTimeHours: number
  materialGrams: number
  dimensions: ModelDimensions
  volumeCm3: number
  weightGrams: number
  materialCost: number
  difficultyScore: number
  riskScore: number
  supportRequirement: 'none' | 'minimal' | 'moderate' | 'heavy'
  printabilityScore: number
  scaleFactor: number
  isEstimated: boolean
}

export interface AnalysisResult {
  metrics: AnalysisMetrics
  issues: PrintIssue[]
  aiRecommendations: string[]
  printSettings: PrintSetting[]
  orientation: OrientationData
  costBreakdown: CostBreakdown
  materialEstimate: MaterialEstimate
  energyEstimate: EnergyEstimate
  settingsSummary: SettingsSummary
}

export interface STLFileInfo {
  file: File
  name: string
  size: number
  url: string
}

export interface AnalysisEngine {
  analyze(file: STLFileInfo, inputs: PrintCalculationInputs): Promise<AnalysisResult>
}

export const SCAN_STAGES: { stage: ScanStage; label: string; duration: number }[] = [
  { stage: 'reading_geometry', label: 'Reading Geometry', duration: 1800 },
  { stage: 'analyzing_surface', label: 'Analyzing Surface Structure', duration: 2200 },
  { stage: 'checking_wall_thickness', label: 'Checking Wall Thickness', duration: 2000 },
  { stage: 'detecting_overhangs', label: 'Detecting Overhangs', duration: 2400 },
  { stage: 'estimating_supports', label: 'Estimating Supports', duration: 2000 },
  { stage: 'generating_settings', label: 'Generating Print Settings', duration: 1800 },
]

export const QUALITY_PRESETS: { id: QualityPreset; label: string; layerHeight: number; factor: number }[] = [
  { id: 'draft', label: 'Draft', layerHeight: 0.28, factor: 0.82 },
  { id: 'standard', label: 'Standard', layerHeight: 0.2, factor: 1.0 },
  { id: 'high', label: 'High Detail', layerHeight: 0.16, factor: 1.22 },
  { id: 'ultra', label: 'Ultra Detail', layerHeight: 0.12, factor: 1.55 },
]
