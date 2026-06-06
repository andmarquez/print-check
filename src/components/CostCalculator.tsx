import { getPrinterProfile, PRINTER_PROFILES } from '../data/printerProfiles'
import type { CalculatorInputs, CostBreakdown } from '../types/printCheck'
import { AnimatedValue } from './AnimatedValue'
import { SectionHeader } from './CostBreakdownCard'
import { GlassPanel } from './layout/GlassPanel'

interface CostCalculatorProps {
  inputs: CalculatorInputs
  breakdown: CostBreakdown
  onUpdate: (updates: Partial<CalculatorInputs>) => void
}

export function CostCalculator({ inputs, breakdown, onUpdate }: CostCalculatorProps) {
  const profile = getPrinterProfile(inputs.printerProfileId)
  const isCustom = inputs.printerProfileId === 'custom'

  return (
    <GlassPanel className="p-5">
      <SectionHeader
        title="Cost Calculator"
        subtitle="Enter slicer values — costs update live"
      />

      <div className="mt-4 space-y-5">
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
          {profile.notes && (
            <p className="mt-2 text-[11px] leading-relaxed text-charcoal-soft">{profile.notes}</p>
          )}
          {!isCustom && (
            <p className="mt-1 text-[11px] text-charcoal-soft">
              Build volume {profile.buildVolume.x}×{profile.buildVolume.y}×{profile.buildVolume.z} mm ·{' '}
              {profile.defaultNozzleMm} mm nozzle
              {profile.maxInputPowerWatts
                ? ` · max input ${profile.maxInputPowerWatts}W`
                : ''}
            </p>
          )}
        </Field>

        {isCustom && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream/40 p-3">
            <TextField
              label="Printer name"
              value={inputs.customPrinterName}
              onChange={(v) => onUpdate({ customPrinterName: v })}
            />
            <NumField label="Nozzle (mm)" value={inputs.customNozzleSizeMm} step={0.1} onChange={(v) => onUpdate({ customNozzleSizeMm: v })} />
            <NumField label="Build X (mm)" value={inputs.customBuildVolume.x} onChange={(v) => onUpdate({ customBuildVolume: { ...inputs.customBuildVolume, x: v } })} />
            <NumField label="Build Y (mm)" value={inputs.customBuildVolume.y} onChange={(v) => onUpdate({ customBuildVolume: { ...inputs.customBuildVolume, y: v } })} />
            <NumField label="Build Z (mm)" value={inputs.customBuildVolume.z} onChange={(v) => onUpdate({ customBuildVolume: { ...inputs.customBuildVolume, z: v } })} />
          </div>
        )}

        <CostSection title="Material Settings">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Spool price ($)" value={inputs.spoolPrice} step={0.5} onChange={(v) => onUpdate({ spoolPrice: v })} />
            <NumField label="Spool weight (kg)" value={inputs.spoolWeightKg} step={0.1} min={0.1} onChange={(v) => onUpdate({ spoolWeightKg: v })} />
            <NumField label="Filament used (g)" value={inputs.filamentUsedGrams} step={1} min={0} onChange={(v) => onUpdate({ filamentUsedGrams: v })} />
          </div>
        </CostSection>

        <CostSection title="Energy Settings">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Print time (hours)" value={inputs.printTimeHours} min={0} onChange={(v) => onUpdate({ printTimeHours: v })} />
            <NumField label="Print time (minutes)" value={inputs.printTimeMinutes} min={0} max={59} onChange={(v) => onUpdate({ printTimeMinutes: v })} />
            <NumField label="Printer power (W)" value={inputs.printerPowerWatts} min={1} onChange={(v) => onUpdate({ printerPowerWatts: v })} />
            <NumField label="Electricity ($/kWh)" value={inputs.electricityCostPerKwh} step={0.01} onChange={(v) => onUpdate({ electricityCostPerKwh: v })} />
          </div>
          <p className="text-[11px] text-charcoal-soft">
            Estimated print duration: <AnimatedValue value={`${breakdown.printTimeHours.toFixed(2)} hours`} />
          </p>
        </CostSection>

        <CostSection title="Printer Settings">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Printer cost ($)" value={inputs.printerCost} step={10} onChange={(v) => onUpdate({ printerCost: v })} />
            <NumField label="Expected lifespan (hours)" value={inputs.expectedLifespanHours} step={100} min={100} onChange={(v) => onUpdate({ expectedLifespanHours: v })} />
          </div>
        </CostSection>

        <CostSection title="Optional">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Failure rate (%)" value={inputs.failureRatePercent} min={0} max={50} onChange={(v) => onUpdate({ failureRatePercent: v })} />
            <NumField label="Setup fee ($)" value={inputs.setupFee} min={0} onChange={(v) => onUpdate({ setupFee: v })} />
            <NumField label="Profit margin (%)" value={inputs.profitMarginPercent} min={0} onChange={(v) => onUpdate({ profitMarginPercent: v })} />
          </div>
        </CostSection>
      </div>
    </GlassPanel>
  )
}

function CostSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sand/40 bg-warm-white/40 p-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-electric-blue">{title}</h4>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
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

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm"
      />
    </Field>
  )
}
