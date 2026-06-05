import type { AnalysisEngine, AnalysisResult, CostInputs, STLFileInfo } from '../types/analysis'
import {
  buildIssuesFromStats,
  buildMetricsFromStats,
  buildOrientationFromStats,
  buildPrintSettingsFromStats,
  buildRuleBasedRecommendations,
  calculateCostBreakdown,
} from './analysisRecommendations'
import { analyzeGeometry, loadSTLGeometry } from './geometryAnalyzer'
import { generateAIRecommendations } from './aiAdvisorService'

export const stlAnalysisEngine: AnalysisEngine = {
  async analyze(file: STLFileInfo, costInputs: CostInputs): Promise<AnalysisResult> {
    const geometry = await loadSTLGeometry(file.url)
    const stats = analyzeGeometry(geometry)

    const metrics = buildMetricsFromStats(stats, costInputs)
    const issues = buildIssuesFromStats(stats)
    const printSettings = buildPrintSettingsFromStats(stats, costInputs)
    const orientation = buildOrientationFromStats(stats)
    const ruleBasedRecs = buildRuleBasedRecommendations(stats)

    const aiRecommendations = await generateAIRecommendations(stats, issues, ruleBasedRecs)

    const result: AnalysisResult = {
      metrics,
      issues,
      aiRecommendations,
      printSettings,
      orientation,
      costBreakdown: calculateCostBreakdown(metrics, costInputs),
    }

    return result
  },
}
