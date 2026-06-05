import { motion } from 'framer-motion'
import type { AnalysisResult } from '../../types/analysis'
import { formatDuration } from '../../utils/calculations'
import { AnimatedValue } from '../AnimatedValue'

interface StatsDockProps {
  analysis: AnalysisResult | null
  visible: boolean
}

export function StatsDock({ analysis, visible }: StatsDockProps) {
  if (!visible || !analysis) return null

  const { metrics, costBreakdown } = analysis

  const stats = [
    { label: 'Print Time', value: formatDuration(costBreakdown.printTimeHours), color: 'text-charcoal' },
    { label: 'Material', value: `${metrics.materialGrams}g`, color: 'text-charcoal' },
    { label: 'Printability', value: `${metrics.printabilityScore}%`, color: 'text-electric-blue' },
    { label: 'Risk', value: `${metrics.riskScore}`, color: 'text-vibrant-orange' },
    { label: 'Total Cost', value: `$${costBreakdown.totalCost.toFixed(2)}`, color: 'text-charcoal' },
    { label: 'Supports', value: metrics.supportRequirement, color: 'text-charcoal-soft' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2"
    >
      <div className="glass-panel flex items-center gap-1 rounded-2xl px-2 py-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex min-w-[100px] flex-col items-center px-4 py-2"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-soft-gray">
              {stat.label}
            </span>
            <span className={`font-display text-lg font-semibold capitalize ${stat.color}`}>
              <AnimatedValue value={stat.value} />
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
