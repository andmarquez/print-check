import { motion } from 'framer-motion'
import type { CostBreakdown, CostInputs } from '../types/analysis'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface CostCalculatorProps {
  inputs: CostInputs
  breakdown: CostBreakdown
  onUpdate: (updates: Partial<CostInputs>) => void
  visible: boolean
}

const materialOptions = ['PLA', 'PLA+', 'PETG', 'ABS', 'TPU', 'Resin-like PLA']
const printerOptions = [
  'Bambu Lab P1S',
  'Prusa MK4',
  'Creality Ender 3 V3',
  'Voron 2.4',
  'Ultimaker S5',
]

export function CostCalculator({ inputs, breakdown, onUpdate, visible }: CostCalculatorProps) {
  if (!visible) return null

  const fields: {
    key: keyof CostInputs
    label: string
    type: 'number' | 'select'
    options?: string[]
    step?: number
    min?: number
    max?: number
  }[] = [
    { key: 'filamentPricePerKg', label: 'Filament Price ($/kg)', type: 'number', step: 0.5, min: 5, max: 80 },
    { key: 'materialType', label: 'Material Type', type: 'select', options: materialOptions },
    { key: 'printerProfile', label: 'Printer Profile', type: 'select', options: printerOptions },
    { key: 'electricityCostPerKwh', label: 'Electricity ($/kWh)', type: 'number', step: 0.01, min: 0.05, max: 0.5 },
    { key: 'printSpeed', label: 'Print Speed (mm/s)', type: 'number', step: 5, min: 20, max: 150 },
    { key: 'layerHeight', label: 'Layer Height (mm)', type: 'number', step: 0.02, min: 0.08, max: 0.32 },
    { key: 'infillPercentage', label: 'Infill (%)', type: 'number', step: 5, min: 0, max: 100 },
  ]

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Cost Calculator" subtitle="Adjust parameters" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {fields.map((field, i) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col gap-1"
          >
            <label className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={inputs[field.key] as string}
                onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                className="rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm text-charcoal outline-none transition-colors focus:border-electric-blue/40"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={inputs[field.key] as number}
                step={field.step}
                min={field.min}
                max={field.max}
                onChange={(e) => onUpdate({ [field.key]: parseFloat(e.target.value) })}
                className="rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm text-charcoal outline-none transition-colors focus:border-electric-blue/40"
              />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex gap-3 rounded-xl bg-charcoal p-4 text-warm-white"
      >
        <CostStat label="Material" value={`$${breakdown.materialCost.toFixed(2)}`} />
        <CostStat label="Electricity" value={`$${breakdown.electricityCost.toFixed(2)}`} />
        <CostStat label="Total" value={`$${breakdown.totalCost.toFixed(2)}`} highlight />
        <CostStat label="Time" value={`${breakdown.printTimeHours}h`} />
      </motion.div>
    </GlassPanel>
  )
}

function CostStat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[9px] uppercase tracking-[0.2em] text-soft-gray">{label}</p>
      <p className={`font-display text-lg font-semibold ${highlight ? 'text-electric-blue-soft' : ''}`}>
        {value}
      </p>
    </div>
  )
}
