import { motion } from 'framer-motion'
import type { AnalysisMetrics } from '../types/analysis'
import { GlassPanel } from './layout/GlassPanel'

interface AnalysisDashboardProps {
  metrics: AnalysisMetrics
  visible: boolean
}

interface MetricCard {
  key: keyof AnalysisMetrics
  label: string
  prefix?: string
  suffix?: string
  decimals: number
}

const metricCards: MetricCard[] = [
  { key: 'printTimeHours', label: 'Print Time', suffix: 'h', decimals: 1 },
  { key: 'materialGrams', label: 'Material Usage', suffix: 'g', decimals: 0 },
  { key: 'volumeCm3', label: 'Volume', suffix: ' cm³', decimals: 1 },
  { key: 'weightGrams', label: 'Weight', suffix: 'g', decimals: 0 },
  { key: 'materialCost', label: 'Material Cost', prefix: '$', decimals: 2 },
  { key: 'difficultyScore', label: 'Difficulty', suffix: '/100', decimals: 0 },
  { key: 'riskScore', label: 'Risk Score', suffix: '/100', decimals: 0 },
  { key: 'printabilityScore', label: 'Printability', suffix: '%', decimals: 0 },
]

export function AnalysisDashboard({ metrics, visible }: AnalysisDashboardProps) {
  if (!visible) return null

  const { dimensions, supportRequirement } = metrics

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Analysis" subtitle="Pre-flight metrics" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metricCards.map((card, i) => {
          const raw = metrics[card.key]
          const value = typeof raw === 'number' ? raw : 0
          const formatted = card.decimals > 0 ? value.toFixed(card.decimals) : String(value)
          const display = `${card.prefix ?? ''}${formatted}${card.suffix ?? ''}`

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-warm-white/60 px-3 py-2.5"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{card.label}</p>
              <p className="font-display text-xl font-semibold text-charcoal">{display}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-xl bg-warm-white/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">Dimensions</p>
          <p className="font-display text-sm font-medium text-charcoal">
            {dimensions.x} × {dimensions.y} × {dimensions.z} mm
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-warm-white/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">Supports</p>
          <p className="font-display text-sm font-medium capitalize text-charcoal">
            {supportRequirement}
          </p>
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
