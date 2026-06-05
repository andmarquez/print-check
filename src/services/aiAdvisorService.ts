import type { PrintIssue } from '../types/analysis'
import type { GeometryStats } from './geometryAnalyzer'
import { getSettings } from './settingsStorage'

function buildPrompt(stats: GeometryStats, issues: PrintIssue[]): string {
  const activeIssues = issues
    .filter((i) => i.status !== 'pass')
    .map((i) => `${i.title} (${i.severity}): ${i.explanation}`)
    .join('\n')

  return `You are an expert 3D printing technician reviewing an STL model for pre-flight analysis.

Model stats:
- Dimensions: ${stats.dimensions.x}×${stats.dimensions.y}×${stats.dimensions.z}mm
- Volume: ${stats.volumeCm3}cm³
- Triangles: ${stats.triangleCount}
- Overhangs: ${stats.overhangRatio}% (${stats.overhangFaceCount} faces)
- Min edge: ${stats.minEdgeLengthMm}mm
- Non-manifold edges: ${stats.nonManifoldEdgeCount}
- Floating islands: ${stats.floatingIslandCount}
- Watertight: ${stats.isWatertight}

Issues:
${activeIssues || 'No critical issues detected.'}

Provide 5-7 concise, actionable recommendations for a maker printing this model. Each should be one sentence, friendly and expert-toned. Focus on orientation, supports, layer height, material, and post-processing. Do not use bullet characters — return one recommendation per line.`
}

export async function generateAIRecommendations(
  stats: GeometryStats,
  issues: PrintIssue[],
  fallback: string[]
): Promise<string[]> {
  const settings = getSettings()

  if (!settings.openaiApiKey) {
    return fallback
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [
          {
            role: 'system',
            content:
              'You are Print Check AI, a premium 3D printing pre-flight advisor. Give practical slicer-ready advice.',
          },
          { role: 'user', content: buildPrompt(stats, issues) },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      console.warn('AI advisor API error:', response.status)
      return fallback
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return fallback

    const lines = content
      .split('\n')
      .map((l) => l.replace(/^[-•*]\s*/, '').trim())
      .filter((l) => l.length > 10)

    return lines.length > 0 ? lines.slice(0, 7) : fallback
  } catch (err) {
    console.warn('AI advisor failed:', err)
    return fallback
  }
}
