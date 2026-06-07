import { AnimatePresence, motion } from 'framer-motion'
import { SCAN_STAGES, type ScanStage } from '../types/analysis'

interface ScanAnimationProps {
  scanning: boolean
  scanStage: ScanStage
  scanProgress: number
}

export function ScanAnimation({ scanning, scanStage, scanProgress }: ScanAnimationProps) {
  const currentLabel =
    SCAN_STAGES.find((s) => s.stage === scanStage)?.label ?? 'Initializing'

  return (
    <AnimatePresence>
      {scanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute left-6 top-6 z-20 w-72"
        >
          <div className="glass-panel rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-electric-blue">
                Scanning
              </span>
              <span
                className="font-display text-sm font-medium text-charcoal"
                style={{ animation: 'hud-blink 2s ease-in-out infinite' }}
              >
                {Math.round(scanProgress)}%
              </span>
            </div>

            <div className="glass-progress mb-4 h-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-electric-blue to-vibrant-orange"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={scanStage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="font-display text-lg font-light tracking-tight text-charcoal"
              >
                {currentLabel}
              </motion.p>
            </AnimatePresence>

            <div className="mt-4 space-y-1.5">
              {SCAN_STAGES.map((stage, i) => {
                const stageIndex = SCAN_STAGES.findIndex((s) => s.stage === scanStage)
                const isComplete = i < stageIndex
                const isActive = stage.stage === scanStage

                return (
                  <div key={stage.stage} className="flex items-center gap-2">
                    <div
                      className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                        isComplete
                          ? 'bg-electric-blue'
                          : isActive
                            ? 'bg-vibrant-orange'
                            : 'bg-light-beige'
                      }`}
                      style={isActive ? { animation: 'scan-pulse 1.5s ease-in-out infinite' } : undefined}
                    />
                    <span
                      className={`text-[10px] tracking-wide ${
                        isActive ? 'text-charcoal' : isComplete ? 'text-charcoal-soft' : 'text-soft-gray'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* HUD corner brackets */}
          <div className="pointer-events-none absolute -left-1 -top-1 h-4 w-4 border-l border-t border-electric-blue/40" />
          <div className="pointer-events-none absolute -right-1 -top-1 h-4 w-4 border-r border-t border-electric-blue/40" />
          <div className="pointer-events-none absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-electric-blue/40" />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-electric-blue/40" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
