import { BETTER_PRINT_SETTINGS } from '../data/printRecommendations'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './CostBreakdownCard'

export function BetterPrintSettings() {
  return (
    <GlassPanel className="p-5">
      <SectionHeader
        title="Better Print Settings"
        subtitle="General print quality recommendations — not cost estimates"
      />

      <div className="mt-4 space-y-3">
        {BETTER_PRINT_SETTINGS.map((item) => (
          <div key={item.key} className="rounded-xl bg-warm-white/60 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-medium text-charcoal">{item.label}</h4>
              <p className="text-xs text-electric-blue">{item.value}</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal-soft">{item.note}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
