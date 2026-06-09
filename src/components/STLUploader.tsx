import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'

const SPLASH_VIDEO = `${import.meta.env.BASE_URL}assets/splash/bg-video.mp4`
const SPLASH_EYES = `${import.meta.env.BASE_URL}assets/splash/eyes.gif`

interface STLUploaderProps {
  onFileSelect: (file: File) => void
  visible: boolean
}

export function STLUploader({ onFileSelect, visible }: STLUploaderProps) {
  const sectionRef = useRef<HTMLElement>(null)
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

  useEffect(() => {
    if (!visible) return

    const onPointerMove = (e: PointerEvent) => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      section.style.setProperty('--x', `${e.clientX - rect.left}px`)
      section.style.setProperty('--y', `${e.clientY - rect.top}px`)
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <motion.section
      ref={sectionRef}
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
      <div className="splash-cursor-glow" aria-hidden />

      <button
        type="button"
        className="choose-file-button"
        onClick={() => inputRef.current?.click()}
      >
        Choose File
      </button>

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
