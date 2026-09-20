"use client"

import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { MiniTooltip } from "@/components/charts/mini-tooltip"
import { useLocale } from "@/lib/i18n/provider"
import type { SeriesPoint } from "@/lib/types"

/**
 * Daily entries with a forward forecast. The confidence band is a stacked
 * pair of areas — a transparent base plus a tinted span — so it reads as
 * uncertainty rather than a second series.
 */
export function FootfallChart({
  series,
  height = 220,
}: {
  series: SeriesPoint[]
  height?: number
}) {
  const { num } = useLocale()
  const rows = series.map((p) => ({
    ...p,
    bandBase: p.lower,
    bandSpan:
      p.lower != null && p.upper != null ? p.upper - p.lower : undefined,
    actual: p.offset <= 0 ? p.footfall : undefined,
  }))
  const today = series.find((p) => p.offset === 0)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="footfallFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={38}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={38}
            tickFormatter={(v) => num(Number(v))}
          />
          <Tooltip
            content={<MiniTooltip />}
            cursor={{ stroke: "var(--border)" }}
          />
          <Area
            dataKey="bandBase"
            stackId="band"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            dataKey="bandSpan"
            stackId="band"
            stroke="none"
            fill="var(--chart-3)"
            fillOpacity={0.14}
            isAnimationActive={false}
          />
          <Area
            dataKey="actual"
            stroke="var(--chart-1)"
            strokeWidth={1.8}
            fill="url(#footfallFill)"
          />
          <Line
            dataKey="forecast"
            stroke="var(--chart-3)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
          />
          {today ? (
            <ReferenceLine
              x={today.label}
              stroke="var(--scrubber)"
              strokeWidth={1}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
