"use client"

import { useLocale } from "@/lib/i18n/provider"

type Entry = { color?: string; name?: string; value?: number | string }

/** The single tooltip every Recharts surface in the app uses. */
export function MiniTooltip({
  active,
  payload,
  label,
  suffix,
  money,
}: {
  active?: boolean
  payload?: Entry[]
  label?: string | number
  suffix?: string
  money?: boolean
}) {
  const { num, money: fmtMoney, digits } = useLocale()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md bg-popover px-2 py-1 text-[0.625rem] shadow-md ring-1 ring-foreground/10">
      <div className="text-muted-foreground">{digits(String(label ?? ""))}</div>
      {payload.map((entry, index) => (
        <div
          key={index}
          className="nums font-medium"
          style={{ color: entry.color }}
        >
          {money
            ? fmtMoney(Number(entry.value))
            : `${num(Number(entry.value))}${suffix ?? ""}`}
        </div>
      ))}
    </div>
  )
}
