import { motion } from 'framer-motion'
import type { PrintIssue } from '../types/analysis'
import { GlassPanel } from './layout/GlassPanel'
import { SectionHeader } from './AnalysisDashboard'

interface PrintHealthReportProps {
  issues: PrintIssue[]
  visible: boolean
}

const statusStyles: Record<PrintIssue['status'], { dot: string; bg: string; label: string }> = {
  pass: { dot: 'bg-electric-blue', bg: 'bg-electric-blue/5', label: 'Pass' },
  warning: { dot: 'bg-vibrant-orange', bg: 'bg-vibrant-orange/5', label: 'Warning' },
  fail: { dot: 'bg-vibrant-orange', bg: 'bg-vibrant-orange/10', label: 'Issue' },
}

const severityLabels: Record<PrintIssue['severity'], string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function PrintHealthReport({ issues, visible }: PrintHealthReportProps) {
  if (!visible) return null

  const issueCount = issues.filter((i) => i.status !== 'pass').length

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <SectionHeader title="Print Health Report" subtitle="Geometry inspection" />
        <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-medium text-charcoal-soft">
          {issueCount} findings
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {issues.map((issue, i) => {
          const style = statusStyles[issue.status]
          return (
            <motion.details
              key={issue.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`group rounded-xl ${style.bg} overflow-hidden`}
            >
              <summary className="flex cursor-pointer items-center gap-3 px-3 py-2.5 list-none [&::-webkit-details-marker]:hidden">
                <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                <span className="flex-1 text-sm font-medium text-charcoal">{issue.title}</span>
                <span className="text-[10px] uppercase tracking-wider text-soft-gray">
                  {severityLabels[issue.severity]}
                </span>
                <span className="rounded-md bg-warm-white/80 px-2 py-0.5 text-[10px] font-medium text-charcoal-soft">
                  {style.label}
                </span>
              </summary>
              <div className="border-t border-sand/40 px-3 py-3 text-xs leading-relaxed text-charcoal-soft">
                <p>{issue.explanation}</p>
                <p className="mt-2 text-charcoal">
                  <span className="font-medium text-electric-blue">Fix: </span>
                  {issue.suggestedFix}
                </p>
              </div>
            </motion.details>
          )
        })}
      </div>
    </GlassPanel>
  )
}
