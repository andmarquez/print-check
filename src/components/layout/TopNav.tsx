interface TopNavProps {
  onSettings: () => void
}

export function TopNav({ onSettings }: TopNavProps) {
  return (
    <header className="nav-bar relative z-50 grid h-14 shrink-0 grid-cols-3 items-center px-6">
      <div className="font-display text-sm font-bold tracking-[0.18em] text-white">ANDSIOSA</div>

      <p className="text-center font-display text-sm font-medium tracking-wide text-white/90">
        3D Print
      </p>

      <div className="text-right">
        <button
          type="button"
          onClick={onSettings}
          className="cursor-pointer font-display text-sm font-medium tracking-wide text-white/90 transition-opacity hover:text-white"
        >
          Settings
        </button>
      </div>
    </header>
  )
}
