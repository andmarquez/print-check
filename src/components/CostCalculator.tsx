import { PRINTER_PROFILES } from '../data/printerProfiles'
import type { CustomPrinterSettings, PrintCalculationInputs } from '../types/analysis'
import { QUALITY_PRESETS } from '../types/analysis'
import type { AnalysisResult } from '../types/analysis'
import { AnimatedValue } from './AnimatedValue'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface CostCalculatorProps {
  inputs: PrintCalculationInputs
  analysis: AnalysisResult
  onUpdate: (updates: Partial<PrintCalculationInputs>) => void
  visible: boolean
}

const MATERIALS = ['PLA', 'PLA+', 'PETG', 'ABS', 'TPU', 'Resin-like PLA']

export function CostCalculator({ inputs, analysis, onUpdate, visible }: CostCalculatorProps) {
  if (!visible) return null

  const { costBreakdown, materialEstimate, energyEstimate, metrics } = analysis
  const printer = PRINTER_PROFILES.find((p) => p.id === inputs.printerProfileId)
  const isCustom = inputs.printerProfileId === 'custom'

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Cost Calculator" subtitle="All values update from your inputs" />

      <div className="mt-4 space-y-4">
        <Field label="Printer Profile">
          <select
            value={inputs.printerProfileId}
            onChange={(e) => onUpdate({ printerProfileId: e.target.value })}
            className="w-full rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm"
          >
            {PRINTER_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        {isCustom && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream/40 p-3">
            <NumField label="Print speed (mm/s)" value={inputs.customPrinter?.printSpeedMmS ?? 50} onChange={(v) => updateCustom(onUpdate, inputs, { printSpeedMmS: v })} />
            <NumField label="Power (W)" value={inputs.customPrinter?.powerWatts ?? 160} onChange={(v) => updateCustom(onUpdate, inputs, { powerWatts: v })} />
            <NumField label="Nozzle (mm)" value={inputs.customPrinter?.nozzleSizeMm ?? 0.4} step={0.1} onChange={(v) => updateCustom(onUpdate, inputs, { nozzleSizeMm: v })} />
            <NumField label="Build X (mm)" value={inputs.customPrinter?.buildVolumeX ?? 220} onChange={(v) => updateCustom(onUpdate, inputs, { buildVolumeX: v })} />
            <NumField label="Build Y (mm)" value={inputs.customPrinter?.buildVolumeY ?? 220} onChange={(v) => updateCustom(onUpdate, inputs, { buildVolumeY: v })} />
            <NumField label="Build Z (mm)" value={inputs.customPrinter?.buildVolumeZ ?? 250} onChange={(v) => updateCustom(onUpdate, inputs, { buildVolumeZ: v })} />
          </div>
        )}

        {printer && !isCustom && (
          <p className="text-[11px] text-charcoal-soft">
            {printer.printSpeedMmS}mm/s · {printer.powerWatts}W · {printer.nozzleSizeMm}mm nozzle ·{' '}
            {printer.buildVolume.x}×{printer.buildVolume.y}×{printer.buildVolume.z}mm build volume
          </p>
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
                    ? 'bg-charcoal text-warm-white'
                    : 'bg-warm-white/80 text-charcoal-soft hover:bg-cream'
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
              className="w-full rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm"
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

        <div className="grid grid-cols-2 gap-3">
          <NumField label="Filament ($/kg)" value={inputs.filamentPricePerKg} step={0.5} onChange={(v) => onUpdate({ filamentPricePerKg: v })} />
          <NumField label="Electricity ($/kWh)" value={inputs.electricityCostPerKwh} step={0.01} onChange={(v) => onUpdate({ electricityCostPerKwh: v })} />
          <NumField label="Machine rate ($/hr)" value={inputs.machineHourlyRate} step={0.5} onChange={(v) => onUpdate({ machineHourlyRate: v })} />
          <NumField label="Setup fee ($)" value={inputs.setupFee} step={1} onChange={(v) => onUpdate({ setupFee: v })} />
        </div>

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

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-charcoal p-4 text-warm-white sm:grid-cols-3">
        <Stat label="Material" value={`$${costBreakdown.materialCost.toFixed(2)}`} />
        <Stat label="Energy" value={`$${costBreakdown.electricityCost.toFixed(2)}`} />
        <Stat label="kWh" value={`${costBreakdown.energyKwh.toFixed(2)}`} />
        <Stat label="Machine" value={`$${costBreakdown.machineCost.toFixed(2)}`} />
        <Stat label="Setup" value={`$${costBreakdown.setupFee.toFixed(2)}`} />
        <Stat label="Total" value={`$${costBreakdown.totalCost.toFixed(2)}`} highlight />
      </div>

      <p className="mt-3 text-[11px] text-charcoal-soft">
        Estimated filament {materialEstimate.totalGrams}g ({materialEstimate.modelGrams.toFixed(0)}g model +{' '}
        {materialEstimate.supportGrams.toFixed(0)}g supports) · {energyEstimate.watts}W printer ·{' '}
        {metrics.printTimeHours.toFixed(2)}h print time
      </p>
    </GlassPanel>
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
        className="w-full rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm"
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-soft-gray">{label}</p>
      <p className={`font-display text-base font-semibold ${highlight ? 'text-electric-blue-soft' : ''}`}>
        <AnimatedValue value={value} />
      </p>
    </div>
  )
}
