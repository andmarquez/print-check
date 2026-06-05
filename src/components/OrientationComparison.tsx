import type { OrientationData } from '../types/analysis'
import { AnimatedValue } from './AnimatedValue'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface OrientationComparisonProps {
  orientation: OrientationData
  applyRecommended: boolean
  onApplyRecommended: (apply: boolean) => void
  visible: boolean
}

export function OrientationComparison({
  orientation,
  applyRecommended,
  onApplyRecommended,
  visible,
}: OrientationComparisonProps) {
  if (!visible) return null

  const benefits = [
    { label: 'Support Reduction', value: orientation.supportReduction, positive: true },
    { label: 'Time Difference', value: orientation.timeDifference, positive: false },
    { label: 'Material Savings', value: orientation.materialSavings, positive: true },
    { label: 'Risk Reduction', value: orientation.riskReduction, positive: true },
  ]

  const displayRotation = applyRecommended ? orientation.recommended : orientation.current

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Orientation Comparison" subtitle="Original vs recommended" />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <OrientationCard title="Current (uploaded)" rotation={orientation.current} variant="current" />
        <OrientationCard
          title="Recommended"
          rotation={orientation.recommended}
          variant="recommended"
          active={applyRecommended}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {benefits.map((b) => (
          <div key={b.label} className="rounded-xl bg-warm-white/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{b.label}</p>
            <p className={`font-display text-lg font-semibold ${b.positive && b.value.startsWith('−') ? 'text-electric-blue' : 'text-charcoal'}`}>
              <AnimatedValue value={b.value} />
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onApplyRecommended(!applyRecommended)}
        className={`mt-4 w-full cursor-pointer rounded-xl py-3 text-sm font-medium transition-colors ${
          applyRecommended
            ? 'bg-electric-blue text-white'
            : 'border border-sand bg-warm-white/80 text-charcoal hover:bg-cream'
        }`}
      >
        {applyRecommended ? 'Using recommended orientation in viewer' : 'Apply recommended orientation'}
      </button>

      {applyRecommended && (
        <p className="mt-2 text-center font-mono text-[10px] text-charcoal-soft">
          Viewer rotation X{displayRotation.x}° Y{displayRotation.y}° Z{displayRotation.z}°
        </p>
      )}
    </GlassPanel>
  )
}

function OrientationCard({
  title,
  rotation,
  variant,
  active,
}: {
  title: string
  rotation: { x: number; y: number; z: number }
  variant: 'current' | 'recommended'
  active?: boolean
}) {
  const isRecommended = variant === 'recommended'

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 ${
        isRecommended ? 'bg-electric-blue/5 ring-1 ring-electric-blue/20' : 'bg-sand/30'
      } ${active ? 'ring-2 ring-electric-blue' : ''}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-soft-gray">{title}</p>
      <div className="mt-3 flex h-24 items-center justify-center">
        <div
          className={`h-14 w-10 rounded-sm shadow-md ${
            isRecommended
              ? 'bg-gradient-to-br from-electric-blue/30 to-electric-blue/10'
              : 'bg-gradient-to-br from-light-beige to-sand'
          }`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          }}
        />
      </div>
      <p className="mt-2 text-center font-mono text-[10px] text-charcoal-soft">
        X{rotation.x}° Y{rotation.y}° Z{rotation.z}°
      </p>
    </div>
  )
}
