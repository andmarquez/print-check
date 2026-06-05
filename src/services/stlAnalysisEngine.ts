import type { AnalysisResult, PrintCalculationInputs, STLFileInfo } from '../types/analysis'
import { buildIssuesFromStats, buildRuleBasedRecommendations } from './analysisRecommendations'
import { buildAnalysisFromStats } from './buildAnalysisFromStats'
import { analyzeGeometry, loadSTLGeometry, type GeometryStats } from './geometryAnalyzer'
import { generateAIRecommendations } from './aiAdvisorService'

export async function analyzeStlWithStats(
  file: STLFileInfo,
  inputs: PrintCalculationInputs,
  existingStats?: GeometryStats
): Promise<{ result: AnalysisResult; stats: GeometryStats }> {
  const stats = existingStats ?? analyzeGeometry(await loadSTLGeometry(file.url))
  const issues = buildIssuesFromStats(stats)
  const ruleBasedRecs = buildRuleBasedRecommendations(stats)
  const aiRecommendations = await generateAIRecommendations(stats, issues, ruleBasedRecs)
  const result = buildAnalysisFromStats(stats, inputs, aiRecommendations)
  return { result, stats }
}

export const stlAnalysisEngine = {
  analyze: async (file: STLFileInfo, inputs: PrintCalculationInputs) => {
    const { result } = await analyzeStlWithStats(file, inputs)
    return result
  },
}

export { buildAnalysisFromStats }
