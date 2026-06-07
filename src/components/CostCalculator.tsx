import { PRINTER_PROFILES } from '../data/printerProfiles'
import type { CustomPrinterSettings, PrintCalculationInputs } from '../types/analysis'
import { QUALITY_PRESETS } from '../types/analysis'
import type { AnalysisResult } from '../types/analysis'
import { AnimatedValue } from './AnimatedValue'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './layout/SectionHeader'

interface CostCalculatorProps {
  inputs: PrintCalculationInputs
  analysis: AnalysisResult
  onUpdate: (updates: Partial<PrintCalculationInputs>) => void
  visible: boolean
}

const MATERIALS = ['PLA', 'PLA+', 'PETG', 'ABS', 'TPU', 'Resin-like PLA']

export function CostCalculator({ inputs, analysis, onUpdate, visible }: CostCalculatorProps) {
  if (!visible) return null

  const { costBreakdown, materialEstimate, metrics } = analysis
  const printer = PRINTER_PROFILES.find((p) => p.id === inputs.printerProfileId)
  const isCustom = inputs.printerProfileId === 'custom'
  const powerWatts = isCustom ? inputs.customPrinter?.powerWatts ?? 160 : printer?.powerWatts ?? 160

  return (
    <GlassPanel className="p-5">
      <SectionHeader
        title="Cost Calculator"
        subtitle="PrintPal-style true cost: material, energy, wear, failure buffer"
      />

      <div className="mt-4 space-y-5">
        <Field label="Printer Profile">
          <select
            value={inputs.printerProfileId}
            onChange={(e) => onUpdate({ printerProfileId: e.target.value })}
            className="glass-input px-3 py-2 text-sm"
          >
            {PRINTER_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        {isCustom && (
          <div className="glass-inset grid grid-cols-2 gap-2 p-3">
            <NumField label="Print speed (mm/s)" value={inputs.customPrinter?.printSpeedMmS ?? 50} onChange={(v) => updateCustom(onUpdate, inputs, { printSpeedMmS: v })} />
            <NumField label="Power (W)" value={inputs.customPrinter?.powerWatts ?? 160} onChange={(v) => updateCustom(onUpdate, inputs, { powerWatts: v })} />
            <NumField label="Nozzle (mm)" value={inputs.customPrinter?.nozzleSizeMm ?? 0.4} step={0.1} onChange={(v) => updateCustom(onUpdate, inputs, { nozzleSizeMm: v })} />
            <NumField label="Build X (mm)" value={inputs.customPrinter?.buildVolumeX ?? 220} onChange={(v) => updateCustom(onUpdate, inputs, { buildVolumeX: v })} />
            <NumField label="Build Y (mm)" value={inputs.customPrinter?.buildVolumeY ?? 220} onChange={(v) => updateCustom(onUpdate, inputs, { buildVolumeY: v })} />
            <NumField label="Build Z (mm)" value={inputs.customPrinter?.buildVolumeZ ?? 250} onChange={(v) => updateCustom(onUpdate, inputs, { buildVolumeZ: v })} />
          </div>
        )}

        <Field label="Quality Preset">
          <div className="grid grid-cols-2 gap-2">
            {QUALITY_PRESETS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => onUpdate({ qualityPreset: q.id, layerHeight: q.layerHeight })}
                className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  inputs.qualityPreset === q.id
                    ? 'glass-toggle-active'
                    : 'glass-toggle text-charcoal-soft'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Material">
            <select
              value={inputs.materialType}
              onChange={(e) => onUpdate({ materialType: e.target.value })}
              className="glass-input px-3 py-2 text-sm"
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <NumField label="Wall count" value={inputs.wallCount} min={1} max={8} onChange={(v) => onUpdate({ wallCount: v })} />
        </div>

        <Slider label="Infill" value={inputs.infillPercentage} min={0} max={100} step={5} unit="%" onChange={(v) => onUpdate({ infillPercentage: v })} />
        <Slider label="Layer height" value={inputs.layerHeight} min={0.08} max={0.32} step={0.02} unit="mm" format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ layerHeight: v })} />

        <CostSection title="Material Settings">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Spool price ($)" value={inputs.spoolPrice} step={0.5} onChange={(v) => onUpdate({ spoolPrice: v })} />
            <NumField label="Spool weight (kg)" value={inputs.spoolWeightKg} step={0.1} min={0.1} onChange={(v) => onUpdate({ spoolWeightKg: v })} />
          </div>
          <ReadOnlyField
            label="Print weight / filament used (g)"
            value={`${materialEstimate.totalGrams}g estimated`}
            hint={`${materialEstimate.modelGrams.toFixed(0)}g model + ${materialEstimate.supportGrams.toFixed(0)}g supports`}
          />
        </CostSection>

        <CostSection title="Energy Settings">
          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField label="Print time (hours)" value={`${metrics.printTimeHours.toFixed(2)}h estimated`} />
            <ReadOnlyField label="Printer power (W)" value={`${powerWatts}W`} />
            <NumField label="Electricity ($/kWh)" value={inputs.electricityCostPerKwh} step={0.01} onChange={(v) => onUpdate({ electricityCostPerKwh: v })} />
            <ReadOnlyField label="Energy used (kWh)" value={`${costBreakdown.energyKwh.toFixed(3)} estimated`} />
          </div>
        </CostSection>

        <CostSection title="Machine Wear (optional)">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Printer cost ($)" value={inputs.printerCost} step={10} onChange={(v) => onUpdate({ printerCost: v })} />
            <NumField label="Expected lifespan (hours)" value={inputs.expectedLifespanHours} step={100} min={100} onChange={(v) => onUpdate({ expectedLifespanHours: v })} />
          </div>
          <p className="mt-2 text-[11px] text-charcoal-soft">
            Wear rate: ${(inputs.printerCost / Math.max(inputs.expectedLifespanHours, 1)).toFixed(3)}/hr ·
            this print: ${costBreakdown.machineWearCost.toFixed(2)} estimated
          </p>
        </CostSection>

        <CostSection title="Failure Rate">
          <Slider
            label="Failure rate"
            value={inputs.failureRatePercent}
            min={0}
            max={25}
            step={1}
            unit="%"
            onChange={(v) => onUpdate({ failureRatePercent: v })}
          />
          <p className="mt-1 text-[11px] text-charcoal-soft">
            Markup applied to material + electricity + machine wear (e.g. 5% ≈ 1 in 20 prints fails).
          </p>
        </CostSection>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal-soft">
          <input
            type="checkbox"
            checked={inputs.supportsEnabled}
            onChange={(e) => onUpdate({ supportsEnabled: e.target.checked })}
            className="accent-electric-blue"
          />
          Include supports in estimates
        </label>
      </div>

      <div className="glass-dark mt-5 p-4">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-soft-gray">Cost Breakdown</p>
        <p className="mt-1 text-center font-display text-3xl font-semibold text-electric-blue-soft">
          <AnimatedValue value={`$${costBreakdown.totalCost.toFixed(2)}`} />
        </p>
        <p className="text-center text-[11px] text-soft-gray">Total estimated cost per print</p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <BreakdownStat label="Material" value={`$${costBreakdown.materialCost.toFixed(2)}`} />
          <BreakdownStat label="Electricity" value={`$${costBreakdown.electricityCost.toFixed(2)}`} />
          <BreakdownStat label="Machine Wear" value={`$${costBreakdown.machineWearCost.toFixed(2)}`} />
          <BreakdownStat label="Failure Markup" value={`$${costBreakdown.failureMarkup.toFixed(2)}`} />
        </div>
      </div>

      <p className="mt-3 text-[11px] text-charcoal-soft">
        Formula: (print weight ÷ spool weight) × spool price + (W × hours ÷ 1000) × $/kWh + (printer
        cost ÷ lifespan) × hours, then +{inputs.failureRatePercent}% failure buffer on that subtotal.
      </p>
    </GlassPanel>
  )
}

function CostSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-inset p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-electric-blue">{title}</h4>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  )
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{label}</p>
      <p className="glass-inset mt-1 px-3 py-2 text-sm font-medium text-charcoal">
        <AnimatedValue value={value} />
      </p>
      {hint && <p className="mt-1 text-[10px] text-charcoal-soft">{hint}</p>}
    </div>
  )
}

function updateCustom(
  onUpdate: (u: Partial<PrintCalculationInputs>) => void,
  inputs: PrintCalculationInputs,
  patch: Partial<CustomPrinterSettings>
) {
  onUpdate({
    customPrinter: {
      printSpeedMmS: 50,
      powerWatts: 160,
      buildVolumeX: 220,
      buildVolumeY: 220,
      buildVolumeZ: 250,
      nozzleSizeMm: 0.4,
      ...inputs.customPrinter,
      ...patch,
    },
  })
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function NumField({
  label,
  value,
  step = 1,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  step?: number
  min?: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const p = parseFloat(e.target.value)
          if (Number.isFinite(p)) onChange(p)
        }}
        className="glass-input px-3 py-2 text-sm"
      />
    </Field>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  format?: (v: number) => string
  onChange: (v: number) => void
}) {
  const display = format ? format(value) : String(value)
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.15em] text-soft-gray">
        <span>{label}</span>
        <span className="font-display text-sm normal-case text-charcoal">
          <AnimatedValue value={`${display}${unit}`} />
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-electric-blue"
      />
    </div>
  )
}

function BreakdownStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-inset px-2 py-2 text-center">
      <p className="text-[9px] uppercase tracking-wider text-soft-gray">{label}</p>
      <p className="font-display text-sm font-semibold">
        <AnimatedValue value={value} />
      </p>
    </div>
  )
}
