"use client"

import * as React from "react"
import { Download } from "lucide-react"

import { FootfallChart } from "@/components/charts/footfall-chart"
import { SplitBar } from "@/components/charts/split-bar"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { outletTotals, revenueStreams } from "@/lib/derive"
import { useLocale } from "@/lib/i18n/provider"
import { SERIES_TODAY_INDEX } from "@/lib/mock/generate"

const WINDOWS = ["7d", "30d", "90d"] as const

export default function RevenuePage() {
  const { t, locale, num, money, pct } = useLocale()
  const data = useDataset()
  const [window, setWindow] = React.useState<(typeof WINDOWS)[number]>("30d")

  const days = window === "7d" ? 7 : window === "30d" ? 30 : 90
  const slice = data.series.slice(
    SERIES_TODAY_INDEX - days + 1,
    SERIES_TODAY_INDEX + 1
  )
  const prior = data.series.slice(
    SERIES_TODAY_INDEX - days * 2 + 1,
    SERIES_TODAY_INDEX - days + 1
  )

  const gross = slice.reduce((sum, p) => sum + p.revenue, 0)
  const priorGross = prior.reduce((sum, p) => sum + p.revenue, 0)
  const expense = data.expenses
    .filter((e) => e.status !== "rejected")
    .reduce((sum, e) => sum + e.amount, 0)
  const streams = revenueStreams(data)
  const outlets = outletTotals(data)

  const kpis: KpiCell[] = [
    {
      id: "gross",
      label: t("finance.grossRevenue"),
      value: gross,
      prefix: "৳",
      delta: priorGross ? ((gross - priorGross) / priorGross) * 100 : 0,
      spark: slice.map((p) => p.revenue),
      color: "var(--chart-1)",
    },
    {
      id: "expense",
      label: t("finance.totalExpense"),
      value: expense,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "net",
      label: t("finance.netRevenue"),
      value: gross - expense,
      prefix: "৳",
      color: "var(--chart-6)",
    },
    {
      id: "margin",
      label: t("finance.margin"),
      value: Math.round(((gross - expense) / Math.max(1, gross)) * 100),
      suffix: "%",
      color: "var(--chart-2)",
    },
    {
      id: "spend",
      label: t("dashboard.spendPerHead"),
      value: Math.round(
        gross /
          Math.max(
            1,
            slice.reduce((s, p) => s + p.footfall, 0)
          )
      ),
      prefix: "৳",
      color: "var(--chart-4)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("finance.revenueTitle")}
        subtitle={t("finance.revenueSubtitle")}
      >
        <SegmentedPills
          size="sm"
          value={window}
          onChange={setWindow}
          options={WINDOWS.map((w) => ({ value: w, label: t(`range.${w}`) }))}
        />
        <Button size="sm" variant="outline">
          <Download />
          {t("common.export")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <Panel
          title={t("dashboard.footfallTrend")}
          subtitle={t("finance.grossRevenue")}
          delay={0.05}
        >
          <FootfallChart
            series={data.series.slice(
              SERIES_TODAY_INDEX - days + 1,
              SERIES_TODAY_INDEX + 31
            )}
          />
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={t("finance.byStream")} delay={0.1}>
            <SplitBar
              money
              slices={[
                {
                  id: "tickets",
                  label: t("finance.streamTickets"),
                  value: streams.tickets,
                  color: "var(--chart-1)",
                },
                {
                  id: "outlets",
                  label: t("finance.streamOutlets"),
                  value: streams.outlets,
                  color: "var(--chart-2)",
                },
                {
                  id: "membership",
                  label: t("finance.streamMembership"),
                  value: streams.membership,
                  color: "var(--chart-3)",
                },
                {
                  id: "daycare",
                  label: t("finance.streamDaycare"),
                  value: streams.daycare,
                  color: "var(--chart-4)",
                },
                {
                  id: "parties",
                  label: t("finance.streamParties"),
                  value: streams.parties,
                  color: "var(--chart-6)",
                },
              ]}
            />
          </Panel>

          <Panel title={t("dashboard.topOutlets")} delay={0.15}>
            <SplitBar
              money
              slices={outlets.map((row, i) => ({
                id: row.outlet.id,
                label: row.outlet.name[locale],
                value: row.revenue,
                color: `var(--chart-${i + 1})`,
              }))}
            />
            <ul className="mt-4 flex flex-col">
              {outlets.map((row) => (
                <li
                  key={row.outlet.id}
                  className="flex items-center gap-2 border-b border-[var(--hairline)] py-1.5 text-[0.6875rem] last:border-0"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {row.outlet.name[locale]}
                  </span>
                  <span className="nums shrink-0 text-muted-foreground">
                    {num(row.orders)}
                  </span>
                  <span className="nums w-20 shrink-0 text-right font-medium">
                    {money(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
