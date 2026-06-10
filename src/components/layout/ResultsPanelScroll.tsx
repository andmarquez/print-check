import { useEffect, useRef, type ReactNode } from 'react'

interface ResultsPanelScrollProps {
  children: ReactNode
}

function wheelDelta(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
  return event.deltaY
}

export function ResultsPanelScroll({ children }: ResultsPanelScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (event: WheelEvent) => {
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) return

      const next = el.scrollTop + wheelDelta(event)
      const clamped = Math.max(0, Math.min(maxScroll, next))
      if (clamped === el.scrollTop) return

      el.scrollTop = clamped
      event.preventDefault()
    }

    el.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => el.removeEventListener('wheel', onWheel, { capture: true })
  }, [])

  return (
    <div
      ref={ref}
      className="results-panel-scroll scrollbar-thin absolute inset-0 overflow-y-scroll overscroll-y-contain pr-1"
    >
      <div className="flex flex-col gap-4 pb-4">{children}</div>
    </div>
  )
}
