import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function GlassPanel({ children, className = '', delay = 0 }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}
