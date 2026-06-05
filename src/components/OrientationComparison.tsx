import { motion } from 'framer-motion'
import type { OrientationData } from '../types/analysis'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface OrientationComparisonProps {
  orientation: OrientationData
  visible: boolean
}

export function OrientationComparison({ orientation, visible }: OrientationComparisonProps) {
  if (!visible) return null

  const benefits = [
    { label: 'Support Reduction', value: orientation.supportReduction, positive: true },
    { label: 'Time Difference', value: orientation.timeDifference, positive: false },
    { label: 'Material Savings', value: orientation.materialSavings, positive: true },
    { label: 'Risk Reduction', value: orientation.riskReduction, positive: true },
  ]

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Orientation Comparison" subtitle="Current vs recommended" />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <OrientationCard
          title="Current"
          rotation={orientation.current}
          variant="current"
        />
        <OrientationCard
          title="Recommended"
          rotation={orientation.recommended}
          variant="recommended"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {benefits.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl bg-warm-white/60 px-3 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{b.label}</p>
            <p
              className={`font-display text-lg font-semibold ${
                b.positive && b.value.startsWith('−') ? 'text-electric-blue' : 'text-charcoal'
              }`}
            >
              {b.value}
            </p>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  )
}

function OrientationCard({
  title,
  rotation,
  variant,
}: {
  title: string
  rotation: { x: number; y: number; z: number }
  variant: 'current' | 'recommended'
}) {
  const isRecommended = variant === 'recommended'

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 ${
        isRecommended ? 'bg-electric-blue/5 ring-1 ring-electric-blue/20' : 'bg-sand/30'
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-soft-gray">{title}</p>

      <div className="mt-3 flex h-24 items-center justify-center">
        <motion.div
          animate={{
            rotateX: rotation.x,
            rotateY: rotation.y,
            rotateZ: rotation.z,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative"
        >
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
          {/* Shadow */}
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-charcoal/10 blur-sm" />
        </motion.div>
      </div>

      <p className="mt-2 text-center font-mono text-[10px] text-charcoal-soft">
        X{rotation.x}° Y{rotation.y}° Z{rotation.z}°
      </p>

      {isRecommended && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-2 rounded-full bg-electric-blue px-2 py-0.5 text-[9px] font-medium text-white"
        >
          Optimal
        </motion.div>
      )}
    </div>
  )
}
