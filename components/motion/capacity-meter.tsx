"use client"

import { motion } from "motion/react"

import { useLocale } from "@/lib/i18n/provider"
import { HUE_VAR } from "@/lib/hue"
import type { TagHue } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Zone occupancy against its licensed limit, with a threshold mark at 85%. */
export function CapacityMeter({
  value,
  capacity,
  hue = "blue",
  label,
  sublabel,
  delay = 0,
  className,
}: {
  value: number
  capacity: number
  hue?: TagHue
  label?: string
  sublabel?: string
  delay?: number
  className?: string
}) {
  const { num, pct } = useLocale()
  const ratio = capacity ? value / capacity : 0
  const full = ratio >= 1
  const near = !full && ratio >= 0.85
  const tone = full
    ? "var(--destructive)"
    : near
      ? "var(--warning)"
      : HUE_VAR[hue]

  return (
    <div className={cn("min-w-0", className)}>
      {label ? (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="truncate text-[0.6875rem]">{label}</span>
          <span className="nums shrink-0 text-[0.625rem] text-muted-foreground">
            {num(value)}/{num(capacity)}
          </span>
        </div>
      ) : null}
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, ratio * 100)}%` }}
          transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: tone }}
        />
        <span
          aria-hidden
          className="absolute inset-y-0 w-px bg-foreground/20"
          style={{ left: "85%" }}
        />
      </div>
      {sublabel ? (
        <p className="mt-1 truncate text-[0.5625rem] text-muted-foreground">
          {sublabel}
        </p>
      ) : (
        <p className="nums mt-1 text-[0.5625rem]" style={{ color: tone }}>
          {pct(ratio * 100, 0)}
        </p>
      )}
    </div>
  )
}
