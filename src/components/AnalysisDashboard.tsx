import { motion } from 'framer-motion'
import type { AnalysisMetrics, CostBreakdown } from '../types/analysis'
import { formatDuration } from '../utils/calculations'
import { AnimatedValue } from './AnimatedValue'
import { GlassPanel } from './layout/GlassPanel'

interface AnalysisDashboardProps {
  metrics: AnalysisMetrics
  costBreakdown: CostBreakdown
  visible: boolean
}

interface MetricCard {
  key: string
  label: string
  getValue: (m: AnalysisMetrics, c: CostBreakdown) => string
}

const metricCards: MetricCard[] = [
  {
    key: 'printTime',
    label: 'Print Time',
    getValue: (_m, c) => formatDuration(c.printTimeHours),
  },
  {
    key: 'materialGrams',
    label: 'Material Usage',
    getValue: (m) => `${m.materialGrams}g`,
  },
  {
    key: 'volumeCm3',
    label: 'Volume',
    getValue: (m) => `${m.volumeCm3} cm³`,
  },
  {
    key: 'weightGrams',
    label: 'Weight',
    getValue: (m) => `${m.weightGrams}g`,
  },
  {
    key: 'materialCost',
    label: 'Filament Cost',
    getValue: (m) => `$${m.materialCost.toFixed(2)}`,
  },
  {
    key: 'totalCost',
    label: 'Total Cost',
    getValue: (_m, c) => `$${c.totalCost.toFixed(2)}`,
  },
  {
    key: 'difficultyScore',
    label: 'Difficulty',
    getValue: (m) => `${m.difficultyScore}/100`,
  },
  {
    key: 'printabilityScore',
    label: 'Printability',
    getValue: (m) => `${m.printabilityScore}%`,
  },
]

export function AnalysisDashboard({ metrics, costBreakdown, visible }: AnalysisDashboardProps) {
  if (!visible) return null

  const { dimensions, supportRequirement, riskScore } = metrics

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Analysis" subtitle="Live pre-flight metrics" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-warm-white/60 px-3 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{card.label}</p>
            <p className="font-display text-xl font-semibold text-charcoal">
              <AnimatedValue value={card.getValue(metrics, costBreakdown)} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-warm-white/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">Dimensions</p>
          <p className="font-display text-sm font-medium text-charcoal">
            {dimensions.x} × {dimensions.y} × {dimensions.z} mm
          </p>
        </div>
        <div className="rounded-xl bg-warm-white/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">Supports</p>
          <p className="font-display text-sm font-medium capitalize text-charcoal">
            {supportRequirement}
          </p>
        </div>
        <div className="rounded-xl bg-warm-white/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">Risk Score</p>
          <p className="font-display text-sm font-medium text-vibrant-orange">{riskScore}/100</p>
        </div>
      </div>
    </GlassPanel>
  )
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-medium tracking-tight text-charcoal">{title}</h3>
      {subtitle && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft-gray">{subtitle}</p>
      )}
    </div>
  )
}
