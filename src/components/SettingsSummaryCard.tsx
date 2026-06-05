import type { SettingsSummary } from '../types/analysis'
import { AnimatedValue } from './AnimatedValue'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface SettingsSummaryCardProps {
  summary: SettingsSummary
  visible: boolean
}

const rows: { key: keyof SettingsSummary; label: string }[] = [
  { key: 'modelSize', label: 'Model size' },
  { key: 'material', label: 'Material' },
  { key: 'printer', label: 'Printer' },
  { key: 'layerHeight', label: 'Layer height' },
  { key: 'infill', label: 'Infill' },
  { key: 'supports', label: 'Supports' },
  { key: 'estimatedTime', label: 'Estimated time' },
  { key: 'filament', label: 'Filament' },
  { key: 'energy', label: 'Energy' },
  { key: 'totalCost', label: 'Total cost' },
]

export function SettingsSummaryCard({ summary, visible }: SettingsSummaryCardProps) {
  if (!visible) return null

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Settings Summary" subtitle="All estimates labeled where approximate" />

      <dl className="mt-4 space-y-2">
        {rows.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg bg-warm-white/60 px-3 py-2 text-sm"
          >
            <dt className="text-charcoal-soft">{label}</dt>
            <dd className="font-medium text-charcoal">
              <AnimatedValue value={summary[key]} />
            </dd>
          </div>
        ))}
      </dl>
    </GlassPanel>
  )
}
