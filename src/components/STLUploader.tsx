import { motion } from 'framer-motion'
import { useCallback, useRef } from 'react'

interface STLUploaderProps {
  onFileSelect: (file: File) => void
  visible: boolean
}

export function STLUploader({ onFileSelect, visible }: STLUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      const file = files[0]
      if (file.name.toLowerCase().endsWith('.stl')) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  if (!visible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="splash-screen fixed inset-x-0 bottom-0 top-16 z-30 flex items-center justify-center"
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault()
        dragCounter.current++
      }}
      onDragLeave={() => {
        dragCounter.current--
      }}
      onDrop={onDrop}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-w-lg flex-col items-center px-8 text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M6 20 L14 6 L22 20 Z"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line x1="8" y1="16" x2="20" y2="16" stroke="#FF6B35" strokeWidth="1" />
          </svg>
        </div>

        <h2 className="font-display text-3xl font-light tracking-tight text-charcoal">
          Upload your STL
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal-soft">
          Drop a model file to begin pre-flight analysis. We'll inspect geometry, estimate costs,
          and recommend optimal print settings.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="glass-button-primary mt-8 cursor-pointer px-8 py-3.5 text-sm font-medium tracking-wide"
        >
          Choose File
        </button>

        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-soft-gray">
          .STL files only
        </p>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept=".stl"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  )
}
