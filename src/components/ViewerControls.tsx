import { motion } from 'framer-motion'
import type { OrientationMode } from '../types/printCheck'

interface ViewerControlsProps {
  orientationMode: OrientationMode
  onResetOrientation: () => void
  onPreviewRecommended: () => void
}

export function ViewerControls({
  orientationMode,
  onResetOrientation,
  onPreviewRecommended,
}: ViewerControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ControlButton
        active={orientationMode === 'uploaded'}
        onClick={onResetOrientation}
      >
        Reset to Uploaded Orientation
      </ControlButton>
      <ControlButton
        active={orientationMode === 'recommended'}
        onClick={onPreviewRecommended}
      >
        Preview Recommended Orientation
      </ControlButton>
    </div>
  )
}

function ControlButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? 'bg-charcoal text-warm-white shadow-md'
          : 'border border-sand/60 bg-warm-white/80 text-charcoal-soft hover:bg-cream'
      }`}
    >
      {children}
    </motion.button>
  )
}
