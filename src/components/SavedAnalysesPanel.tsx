import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  deleteSavedAnalysis,
  listSavedAnalyses,
  type SavedAnalysisRecord,
} from '../services/savedAnalysesDb'

interface SavedAnalysesPanelProps {
  open: boolean
  onClose: () => void
  onLoad: (record: SavedAnalysisRecord) => void
}

export function SavedAnalysesPanel({ open, onClose, onLoad }: SavedAnalysesPanelProps) {
  const [records, setRecords] = useState<SavedAnalysisRecord[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      setRecords(await listSavedAnalyses())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  const handleDelete = async (id: string) => {
    await deleteSavedAnalysis(id)
    refresh()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-panel fixed left-1/2 top-20 z-[70] w-full max-w-lg -translate-x-1/2 rounded-2xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-medium text-charcoal">Saved Analyses</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-soft-gray">
                  Stored locally in your browser
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-charcoal-soft hover:bg-cream"
              >
                Close
              </button>
            </div>

            <div className="scrollbar-thin mt-4 max-h-[60vh] space-y-2 overflow-y-auto">
              {loading && (
                <p className="py-8 text-center text-sm text-soft-gray">Loading...</p>
              )}
              {!loading && records.length === 0 && (
                <p className="py-8 text-center text-sm text-charcoal-soft">
                  No saved analyses yet. Complete an analysis and click Save.
                </p>
              )}
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 rounded-xl bg-warm-white/60 p-3"
                >
                  {record.thumbnail ? (
                    <img
                      src={record.thumbnail}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover bg-sand"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sand text-[10px] text-soft-gray">
                      3D
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal">{record.fileName}</p>
                    <p className="text-[10px] text-soft-gray">
                      {new Date(record.savedAt).toLocaleString()} ·{' '}
                      {record.analysis.metrics.printabilityScore}% printability
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoad(record)
                      onClose()
                    }}
                    className="cursor-pointer rounded-lg bg-charcoal px-3 py-1.5 text-xs font-medium text-warm-white"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(record.id)}
                    className="cursor-pointer rounded-lg px-2 py-1.5 text-xs text-vibrant-orange hover:bg-vibrant-orange/10"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
