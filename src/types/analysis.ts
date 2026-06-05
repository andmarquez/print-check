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

export interface AnalysisMetrics {
  printTimeHours: number
  materialGrams: number
  dimensions: { x: number; y: number; z: number }
  volumeCm3: number
  weightGrams: number
  materialCost: number
  difficultyScore: number
  riskScore: number
  supportRequirement: 'none' | 'minimal' | 'moderate' | 'heavy'
  printabilityScore: number
}

export interface CostInputs {
  filamentPricePerKg: number
  materialType: string
  printerProfile: string
  electricityCostPerKwh: number
  printSpeed: number
  layerHeight: number
  infillPercentage: number
}

export interface CostBreakdown {
  materialCost: number
  electricityCost: number
  totalCost: number
  printTimeHours: number
}

export interface AnalysisResult {
  metrics: AnalysisMetrics
  issues: PrintIssue[]
  aiRecommendations: string[]
  printSettings: PrintSetting[]
  orientation: OrientationData
  costBreakdown: CostBreakdown
}

export interface STLFileInfo {
  file: File
  name: string
  size: number
  url: string
}

export type AppPhase = 'empty' | 'loaded' | 'scanning' | 'analyzing' | 'complete'

export interface AnalysisEngine {
  analyze(file: STLFileInfo, costInputs: CostInputs): Promise<AnalysisResult>
}

export const SCAN_STAGES: { stage: ScanStage; label: string; duration: number }[] = [
  { stage: 'reading_geometry', label: 'Reading Geometry', duration: 1800 },
  { stage: 'analyzing_surface', label: 'Analyzing Surface Structure', duration: 2200 },
  { stage: 'checking_wall_thickness', label: 'Checking Wall Thickness', duration: 2000 },
  { stage: 'detecting_overhangs', label: 'Detecting Overhangs', duration: 2400 },
  { stage: 'estimating_supports', label: 'Estimating Supports', duration: 2000 },
  { stage: 'generating_settings', label: 'Generating Print Settings', duration: 1800 },
]
