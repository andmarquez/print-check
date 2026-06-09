import { motion } from 'framer-motion'
import { useCallback, useRef } from 'react'

const SPLASH_VIDEO = `${import.meta.env.BASE_URL}assets/splash/bg-video.mp4`
const SPLASH_EYES = `${import.meta.env.BASE_URL}assets/splash/eyes.gif`

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
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="splash-screen relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden"
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
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      >
        <source src={SPLASH_VIDEO} type="video/mp4" />
      </video>

      <div className="splash-scrim pointer-events-none absolute inset-0" aria-hidden />

      <img
        src={SPLASH_EYES}
        alt=""
        className="pointer-events-none absolute bottom-0 left-1/2 z-10 max-h-80 w-auto -translate-x-1/2 object-contain drop-shadow-lg"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <svg
          className="mb-6 drop-shadow-lg"
          width="32"
          height="32"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden
        >
          <path
            d="M6 20 L14 6 L22 20 Z"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="8" y1="16" x2="20" y2="16" stroke="#fb923c" strokeWidth="1" />
        </svg>

        <h2 className="font-display text-3xl font-light tracking-tight text-white drop-shadow-md">
          Upload your STL
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-300 drop-shadow">
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

        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
          .STL files only
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".stl"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.section>
  )
}
