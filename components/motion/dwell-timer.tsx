"use client"

import * as React from "react"

import { demoNow } from "@/lib/demo-time"
import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

/**
 * A live mm:ss counter with a slab progress ring.
 *
 * The count ticks on the client from a fixed `entryAt`, but the first render
 * is computed from `demoNow()` upstream, so the server and the client agree
 * on the initial frame and no timestamp flickers on hydrate.
 */
export function DwellTimer({
  entryAt,
  frozenMinutes,
  includedMinutes,
  size = 34,
  className,
  compact,
}: {
  entryAt: number
  /** Set for closed bands — the timer stops rather than running from `entryAt`. */
  frozenMinutes?: number
  includedMinutes: number
  size?: number
  className?: string
  compact?: boolean
}) {
  const { digits } = useLocale()
  const [now, setNow] = React.useState(() =>
    frozenMinutes !== undefined ? entryAt + frozenMinutes * 60_000 : demoNow()
  )

  // The count runs on the demo clock, not the wall clock: every timestamp in
  // the dataset is anchored to `demoNow()`, so ticking from `Date.now()` would
  // add however many hours have passed since UTC 10:00 to every band.
  React.useEffect(() => {
    if (frozenMinutes !== undefined) return
    const mountedAt = Date.now()
    const base = demoNow()
    const id = window.setInterval(
      () => setNow(base + (Date.now() - mountedAt)),
      1000
    )
    return () => window.clearInterval(id)
  }, [frozenMinutes])

  const seconds = Math.max(0, Math.floor((now - entryAt) / 1000))
  const minutes = Math.floor(seconds / 60)
  const ratio = Math.min(1.4, minutes / Math.max(1, includedMinutes))
  const over = minutes > includedMinutes
  const near = !over && ratio > 0.85

  const tone = over
    ? "var(--destructive)"
    : near
      ? "var(--warning)"
      : "var(--success)"

  const label = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`

  if (compact) {
    return (
      <span
        className={cn("nums text-[0.6875rem] font-medium", className)}
        style={{ color: tone }}
      >
        {digits(label)}
      </span>
    )
  }

  const stroke = 2.5
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(1, ratio))}
          style={{ transition: "stroke-dashoffset 900ms linear" }}
        />
      </svg>
      <span
        className="nums absolute inset-0 flex items-center justify-center text-[0.5rem] font-medium"
        style={{ color: tone }}
      >
        {digits(String(minutes))}
      </span>
    </span>
  )
}
