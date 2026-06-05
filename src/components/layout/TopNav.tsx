import { motion } from 'framer-motion'

interface TopNavProps {
  onUpload: () => void
  onSaved: () => void
  onSettings: () => void
  fileName?: string
  siteUrl?: string
}

export function TopNav({ onUpload, onSaved, onSettings, fileName, siteUrl }: TopNavProps) {
  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-sand/60 bg-warm-white/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream shadow-sm">
            <img src={`${import.meta.env.BASE_URL}assets/brand/logo.svg`} alt="" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-sm font-semibold tracking-tight text-charcoal">
              Print Check
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-soft-gray">
              Pre-Flight Analyzer
            </p>
          </div>
          {siteUrl && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-[10px] text-electric-blue hover:underline"
            >
              View live
            </a>
          )}
        </motion.div>

        {fileName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden items-center gap-2 rounded-full border border-sand/80 bg-cream/50 px-3 py-1 md:flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-electric-blue" />
            <span className="max-w-[200px] truncate text-xs text-charcoal-soft">{fileName}</span>
          </motion.div>
        )}
      </div>

      <nav className="flex items-center gap-2">
        <NavButton onClick={onUpload} primary>
          Upload STL
        </NavButton>
        <NavButton onClick={onSaved}>Saved Analyses</NavButton>
        <NavButton onClick={onSettings}>Settings</NavButton>
      </nav>
    </header>
  )
}

function NavButton({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-xl px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300
        ${primary
          ? 'bg-charcoal text-warm-white shadow-md hover:bg-charcoal-soft hover:shadow-lg'
          : 'text-charcoal-soft hover:bg-cream/80 hover:text-charcoal'
        }
        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}
