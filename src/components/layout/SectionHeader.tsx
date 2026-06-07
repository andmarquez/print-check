export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-medium tracking-tight text-charcoal">{title}</h3>
      {subtitle && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft-gray">{subtitle}</p>
      )}
    </div>
  )
}
