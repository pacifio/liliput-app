"use client"

import * as React from "react"
import { motion } from "motion/react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { useBranchSummaries } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

const METRICS = ["footfall", "revenue", "dwell", "memberShare"] as const
type Metric = (typeof METRICS)[number]

export default function CompareBranchesPage() {
  const { t, locale, num, money, pct } = useLocale()
  const summaries = useBranchSummaries()
  const [metric, setMetric] = React.useState<Metric>("revenue")

  const label: Record<Metric, string> = {
    footfall: t("dashboard.footfall"),
    revenue: t("dashboard.revenue"),
    dwell: t("dashboard.avgDwell"),
    memberShare: t("branches.memberShare"),
  }

  const value = (id: Metric, row: (typeof summaries)[number]) =>
    id === "memberShare" ? row.memberShare * 100 : row[id]

  const rows = [...summaries].sort(
    (a, b) => value(metric, b) - value(metric, a)
  )
  const max = Math.max(...rows.map((r) => value(metric, r)), 1)

  const format = (v: number) =>
    metric === "revenue"
      ? money(v)
      : metric === "memberShare"
        ? pct(v, 0)
        : num(v)

  // Area grouping tells a different story to the branch ranking — it is where
  // network decisions about the next 10 branches actually get made.
  const areas = React.useMemo(() => {
    const map = new Map<
      string,
      { label: string; value: number; count: number }
    >()
    for (const row of summaries) {
      const key = row.branch.area.en
      const hit = map.get(key) ?? {
        label: row.branch.area[locale],
        value: 0,
        count: 0,
      }
      hit.value += value(metric, row)
      hit.count += 1
      map.set(key, hit)
    }
    return [...map.values()].sort((a, b) => b.value - a.value)
  }, [summaries, metric, locale])

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("branches.compareTitle")}
        subtitle={t("branches.compareSubtitle")}
      >
        <SegmentedPills
          size="sm"
          value={metric}
          onChange={setMetric}
          options={METRICS.map((m) => ({ value: m, label: label[m] }))}
        />
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title={t("branches.ranking")} subtitle={label[metric]} delay={0}>
          <ul className="flex flex-col gap-1.5">
            {rows.map((row, index) => (
              <motion.li
                key={row.branch.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.22,
                  delay: Math.min(index, 20) * 0.015,
                }}
                className="flex items-center gap-2"
              >
                <span className="nums w-5 shrink-0 text-[0.5625rem] text-muted-foreground">
                  {num(index + 1)}
                </span>
                <span className="w-28 shrink-0 truncate text-[0.6875rem]">
                  {row.branch.name[locale]}
                </span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(value(metric, row) / max) * 100}%`,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index, 20) * 0.015,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full"
                    style={{ background: HUE_VAR[row.branch.hue] }}
                  />
                </div>
                <span className="nums w-20 shrink-0 text-right text-[0.625rem] font-medium">
                  {format(value(metric, row))}
                </span>
              </motion.li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-3">
          <Panel
            title={t("common.branches")}
            subtitle={label[metric]}
            delay={0.05}
          >
            <ul className="flex flex-col">
              {areas.map((area) => (
                <li
                  key={area.label}
                  className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <span className="min-w-0 flex-1 truncate text-[0.6875rem]">
                    {area.label}
                  </span>
                  <span className="nums shrink-0 text-[0.5625rem] text-muted-foreground">
                    ×{num(area.count)}
                  </span>
                  <span className="nums shrink-0 text-[0.625rem] font-medium">
                    {format(
                      metric === "memberShare" || metric === "dwell"
                        ? area.value / area.count
                        : area.value
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={t("dashboard.footfallTrend")} delay={0.1}>
            <div className="flex flex-col gap-2.5">
              {rows.slice(0, 8).map((row) => (
                <div key={row.branch.id} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-[0.625rem]">
                    {row.branch.name[locale]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <CombChart
                      values={row.spark}
                      height={22}
                      color={HUE_VAR[row.branch.hue]}
                      glow={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
