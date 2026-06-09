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
      className="splash-screen relative flex min-h-0 w-full flex-1 cursor-pointer overflow-hidden"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => {
        e.preventDefault()
        dragCounter.current++
      }}
      onDragLeave={() => {
        dragCounter.current--
      }}
      onDrop={onDrop}
      aria-label="Upload STL file"
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
        width={743}
        height={436}
        className="pointer-events-none absolute bottom-0 left-1/2 z-10 block origin-bottom -translate-x-1/2 scale-50 drop-shadow-lg"
        aria-hidden
      />

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
