import { motion } from 'framer-motion'
import type { PrintSetting } from '../types/analysis'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface PrintSettingsPanelProps {
  settings: PrintSetting[]
  visible: boolean
}

export function PrintSettingsPanel({ settings, visible }: PrintSettingsPanelProps) {
  if (!visible) return null

  return (
    <GlassPanel className="p-5">
      <SectionHeader title="Recommended Print Settings" subtitle="Optimized for your model" />

      <div className="mt-4 space-y-2">
        {settings.map((setting, i) => (
          <motion.details
            key={setting.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl bg-warm-white/50 overflow-hidden"
            open={i < 3}
          >
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 list-none [&::-webkit-details-marker]:hidden">
              <span className="text-sm text-charcoal-soft">{setting.label}</span>
              <span className="font-display text-sm font-semibold text-charcoal">
                {setting.value}
              </span>
            </summary>
            <div className="space-y-2 border-t border-sand/30 px-4 py-3 text-xs leading-relaxed">
              <div>
                <span className="font-medium uppercase tracking-wider text-soft-gray">Reason</span>
                <p className="mt-1 text-charcoal-soft">{setting.reason}</p>
              </div>
              <div>
                <span className="font-medium uppercase tracking-wider text-electric-blue">Impact</span>
                <p className="mt-1 text-charcoal">{setting.impact}</p>
              </div>
            </div>
          </motion.details>
        ))}
      </div>
    </GlassPanel>
  )
}
