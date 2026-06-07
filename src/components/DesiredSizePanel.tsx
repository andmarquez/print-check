import { motion } from 'framer-motion'
import type { ModelDimensions, PrintCalculationInputs, SizeUnit } from '../types/analysis'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './layout/SectionHeader'

interface DesiredSizePanelProps {
  originalDimensions: ModelDimensions
  inputs: PrintCalculationInputs
  onUpdate: (
    updates: Partial<PrintCalculationInputs>,
    changedAxis?: 'width' | 'height' | 'depth'
  ) => void
  onStartAnalysis: () => void
  visible: boolean
}

const UNITS: SizeUnit[] = ['mm', 'cm', 'in']

export function DesiredSizePanel({
  originalDimensions,
  inputs,
  onUpdate,
  onStartAnalysis,
  visible,
}: DesiredSizePanelProps) {
  if (!visible) return null

  const { desiredSize, scaleFactor, scaledDimensionsMm } = inputs

  const updateDimension = (axis: 'width' | 'height' | 'depth', value: number) => {
    onUpdate(
      {
        desiredSize: { ...desiredSize, [axis]: value },
      },
      axis
    )
  }

  return (
    <GlassPanel className="p-5">
      <SectionHeader
        title="Desired Print Size"
        subtitle="Set final dimensions before analysis"
      />

      <p className="mt-2 text-xs leading-relaxed text-charcoal-soft">
        Original STL size: {originalDimensions.x} × {originalDimensions.y} ×{' '}
        {originalDimensions.z} mm
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">Units</label>
        <select
          value={desiredSize.unit}
          onChange={(e) =>
            onUpdate({
              desiredSize: { ...desiredSize, unit: e.target.value as SizeUnit },
            })
          }
          className="glass-input px-3 py-1.5 text-sm"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-charcoal-soft">
          <input
            type="checkbox"
            checked={desiredSize.lockProportions}
            onChange={(e) =>
              onUpdate({
                desiredSize: { ...desiredSize, lockProportions: e.target.checked },
              })
            }
            className="accent-electric-blue"
          />
          Lock proportions
        </label>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <DimField label="Width" value={desiredSize.width} onChange={(v) => updateDimension('width', v)} />
        <DimField label="Height" value={desiredSize.height} onChange={(v) => updateDimension('height', v)} />
        <DimField label="Depth" value={desiredSize.depth} onChange={(v) => updateDimension('depth', v)} />
      </div>

      <div className="glass-inset mt-4 px-4 py-3 text-xs text-charcoal-soft">
        <p>
          Scaled size:{' '}
          <span className="font-medium text-charcoal">
            {scaledDimensionsMm.x} × {scaledDimensionsMm.y} × {scaledDimensionsMm.z} mm
          </span>
        </p>
        <p className="mt-1">
          Scale factor: <span className="font-medium text-charcoal">{scaleFactor.toFixed(3)}×</span>
        </p>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartAnalysis}
        className="glass-button-primary mt-5 w-full cursor-pointer py-3.5 text-sm font-medium"
      >
        Run Pre-Flight Analysis
      </motion.button>
    </GlassPanel>
  )
}

function DimField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{label}</label>
      <input
        type="number"
        step="0.1"
        min="0.1"
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value)
          if (Number.isFinite(parsed) && parsed > 0) onChange(parsed)
        }}
        className="glass-input mt-1 px-3 py-2 text-sm"
      />
    </div>
  )
}
