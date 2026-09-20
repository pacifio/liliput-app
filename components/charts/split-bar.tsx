"use client"

import { motion } from "motion/react"

import { useLocale } from "@/lib/i18n/provider"
import { cn } from "@/lib/utils"

export type SplitSlice = {
  id: string
  label: string
  value: number
  color: string
}

/**
 * A hand-built proportional bar. Recharts' pie would tell the same story with
 * ten times the DOM, and this animates its shares in on mount.
 */
export function SplitBar({
  slices,
  money,
  className,
}: {
  slices: SplitSlice[]
  money?: boolean
  className?: string
}) {
  const { num, money: fmtMoney, pct } = useLocale()
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex h-2 gap-1">
        {slices.map((slice, index) => (
          <motion.span
            key={slice.id}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: slice.value / total }}
            transition={{
              duration: 0.45,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ flexBasis: 0, background: slice.color }}
            className="block rounded-full"
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[0.6875rem] text-muted-foreground">
              {slice.label}
            </span>
            <span className="nums shrink-0 text-[0.6875rem] font-medium">
              {money ? fmtMoney(slice.value) : num(slice.value)}
            </span>
            <span className="nums w-9 shrink-0 text-right text-[0.5625rem] text-muted-foreground">
              {pct((slice.value / total) * 100, 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
