interface TopNavProps {
  onSettings: () => void
}

export function TopNav({ onSettings }: TopNavProps) {
  return (
    <header className="nav-bar relative z-50 grid h-14 shrink-0 grid-cols-3 items-center px-6">
      <div className="nav-label">ANDSIOSA</div>

      <p className="nav-label text-center">3D Print</p>

      <div className="text-right">
        <button type="button" onClick={onSettings} className="nav-label cursor-pointer">
          Settings
        </button>
      </div>
    </header>
  )
}
