"use client"

import { motion } from "motion/react"

import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { BranchSummary } from "@/lib/data"
import { cn } from "@/lib/utils"

/**
 * A schematic of the Dhaka network — not a real map tile, which would need a
 * network call the demo deliberately does not make. Positions come from each
 * branch's normalised `map` coordinates; bubble area is today's footfall.
 */
export function BranchMap({
  summaries,
  activeId,
  onSelect,
  className,
}: {
  summaries: BranchSummary[]
  activeId?: string
  onSelect?: (branchId: string) => void
  className?: string
}) {
  const { locale, num } = useLocale()
  const max = Math.max(...summaries.map((s) => s.footfall), 1)

  return (
    <div
      className={cn(
        "grid-lines relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/[0.06]",
        className
      )}
    >
      {summaries.map((summary, index) => {
        const { branch } = summary
        const scale = 0.4 + (summary.footfall / max) * 0.6
        const size = 10 + scale * 24
        const active = branch.id === activeId
        const tone =
          summary.capacityUsed >= 0.85
            ? "var(--destructive)"
            : summary.capacityUsed >= 0.6
              ? "var(--warning)"
              : HUE_VAR[branch.hue]
        return (
          <motion.button
            key={branch.id}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.32,
              delay: Math.min(index, 20) * 0.02,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => onSelect?.(branch.id)}
            title={`${branch.name[locale]} — ${num(summary.footfall)}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
            style={{
              left: `${8 + branch.map.x * 84}%`,
              top: `${8 + branch.map.y * 84}%`,
              width: size,
              height: size,
            }}
          >
            <span
              className={cn(
                "block size-full rounded-full transition-transform group-hover:scale-125",
                active && "ring-2 ring-foreground/40"
              )}
              style={{
                background: `color-mix(in oklch, ${tone} 38%, transparent)`,
                border: `1px solid ${tone}`,
              }}
            />
            <span className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded bg-popover px-1.5 py-0.5 text-[0.5625rem] whitespace-nowrap opacity-0 shadow-sm ring-1 ring-foreground/10 transition-opacity group-hover:opacity-100">
              {branch.name[locale]} · {num(summary.footfall)}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
