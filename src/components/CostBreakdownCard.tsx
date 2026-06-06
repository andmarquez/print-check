import { AnimatedValue } from './AnimatedValue'
import { GlassPanel } from './layout/GlassPanel'
import type { CostBreakdown } from '../types/printCheck'

interface CostBreakdownCardProps {
  breakdown: CostBreakdown
  profitMarginPercent: number
}

export function CostBreakdownCard({ breakdown, profitMarginPercent }: CostBreakdownCardProps) {
  return (
    <GlassPanel className="p-5">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-soft-gray">Total Estimated Cost</p>
        <p className="mt-1 font-display text-4xl font-semibold text-charcoal">
          <AnimatedValue value={`$${breakdown.totalCost.toFixed(2)}`} />
        </p>
      </div>

      <dl className="mt-5 space-y-2">
        <BreakdownRow label="Material" value={`$${breakdown.materialCost.toFixed(2)}`} />
        <BreakdownRow label="Electricity" value={`$${breakdown.electricityCost.toFixed(2)}`} />
        <BreakdownRow label="Machine Wear" value={`$${breakdown.machineWearCost.toFixed(2)}`} />
        <BreakdownRow label="Failure Markup" value={`$${breakdown.failureMarkup.toFixed(2)}`} />
        {breakdown.setupFee > 0 && (
          <BreakdownRow label="Setup Fee" value={`$${breakdown.setupFee.toFixed(2)}`} />
        )}
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-sand/50 pt-4">
        <Metric label="Energy Used" value={`${breakdown.energyKwh.toFixed(2)} kWh`} />
        <Metric label="Cost Per Hour" value={`$${breakdown.costPerHour.toFixed(2)}/hr`} />
        <Metric label="Cost Per Gram" value={`$${breakdown.costPerGram.toFixed(2)}/g`} />
        <Metric
          label="Suggested Selling Price"
          value={`$${breakdown.suggestedSellingPrice.toFixed(2)}`}
          highlight
        />
      </div>

      <p className="mt-3 text-[10px] text-charcoal-soft">
        Selling price includes {profitMarginPercent}% profit margin on total cost.
      </p>
    </GlassPanel>
  )
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-warm-white/60 px-3 py-2 text-sm">
      <dt className="text-charcoal-soft">{label}</dt>
      <dd className="font-medium text-charcoal">
        <AnimatedValue value={value} />
      </dd>
    </div>
  )
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-warm-white/60 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{label}</p>
      <p className={`font-display text-sm font-semibold ${highlight ? 'text-electric-blue' : 'text-charcoal'}`}>
        <AnimatedValue value={value} />
      </p>
    </div>
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
