import { motion } from 'framer-motion'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface AIPrintAdvisorProps {
  recommendations: string[]
  visible: boolean
}

export function AIPrintAdvisor({ recommendations, visible }: AIPrintAdvisorProps) {
  if (!visible) return null

  return (
    <GlassPanel className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-electric-blue/10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#0066FF" strokeWidth="1.2" />
            <path d="M5 8 L7 10 L11 6" stroke="#0066FF" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        <SectionHeader title="AI Print Advisor" subtitle="Expert recommendations · add API key in Settings for LLM" />
      </div>

      <div className="mt-4 space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-xl bg-warm-white/60 px-4 py-3"
          >
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-electric-blue/30" />
            <p className="pl-3 text-sm leading-relaxed text-charcoal">{rec}</p>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  )
}
