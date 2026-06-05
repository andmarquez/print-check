import { motion } from 'framer-motion'
import type { AnalysisResult } from '../../types/analysis'

interface StatsDockProps {
  analysis: AnalysisResult | null
  visible: boolean
}

interface DockStat {
  key: keyof AnalysisResult['metrics']
  label: string
  color: string
}

const stats: DockStat[] = [
  { key: 'printTimeHours', label: 'Print Time', color: 'text-charcoal' },
  { key: 'materialGrams', label: 'Material', color: 'text-charcoal' },
  { key: 'printabilityScore', label: 'Printability', color: 'text-electric-blue' },
  { key: 'riskScore', label: 'Risk', color: 'text-vibrant-orange' },
  { key: 'materialCost', label: 'Est. Cost', color: 'text-charcoal' },
  { key: 'supportRequirement', label: 'Supports', color: 'text-charcoal-soft' },
]

function formatDockValue(key: keyof AnalysisResult['metrics'], m: AnalysisResult['metrics']): string {
  const value = m[key]
  if (key === 'supportRequirement') return String(value)
  if (key === 'printTimeHours') return `${value}h`
  if (key === 'materialGrams') return `${value}g`
  if (key === 'printabilityScore') return `${value}%`
  if (key === 'materialCost') return `$${value}`
  return String(value)
}

export function StatsDock({ analysis, visible }: StatsDockProps) {
  if (!visible || !analysis) return null

  const m = analysis.metrics

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="glass-panel flex items-center gap-1 rounded-2xl px-2 py-2">
        {stats.map((stat, i) => {
          const display = formatDockValue(stat.key, m)

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex min-w-[100px] flex-col items-center px-4 py-2"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-soft-gray">
                {stat.label}
              </span>
              <span className={`font-display text-lg font-semibold capitalize ${stat.color}`}>
                {display}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
