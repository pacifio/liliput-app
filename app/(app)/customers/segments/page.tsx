"use client"

import { motion } from "motion/react"

import { SplitBar } from "@/components/charts/split-bar"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

export default function SegmentsPage() {
  const { t, locale, num, money, pct } = useLocale()
  const data = useDataset()

  const segments = [
    ...new Map(
      data.customers.map((c) => [
        c.segment.en,
        { label: c.segment, hue: c.segmentHue },
      ])
    ).values(),
  ].map((entry) => {
    const members = data.customers.filter(
      (c) => c.segment.en === entry.label.en
    )
    const spend = members.reduce((sum, c) => sum + c.spend, 0)
    const visits = members.reduce((sum, c) => sum + c.visits, 0)
    return {
      ...entry,
      count: members.length,
      spend,
      visits,
      avgSpend: spend / Math.max(1, members.length),
      share: members.length / data.customers.length,
    }
  })

  const sorted = [...segments].sort((a, b) => b.count - a.count)

  const sources = (["website", "app", "walk-in", "referral"] as const).map(
    (source, i) => ({
      id: source,
      label:
        source === "website"
          ? t("customers.sourceWebsite")
          : source === "app"
            ? t("customers.sourceApp")
            : source === "walk-in"
              ? t("customers.sourceWalkIn")
              : t("customers.sourceReferral"),
      value: data.customers.filter((c) => c.source === source).length,
      color: `var(--chart-${i + 1})`,
    })
  )

  const kpis: KpiCell[] = [
    {
      id: "segments",
      label: t("customers.segmentsTitle"),
      value: segments.length,
      color: "var(--chart-1)",
    },
    {
      id: "customers",
      label: t("customers.title"),
      value: data.customers.length,
      color: "var(--chart-2)",
    },
    {
      id: "avgSpend",
      label: t("customers.spend"),
      value: Math.round(
        data.customers.reduce((sum, c) => sum + c.spend, 0) /
          data.customers.length
      ),
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "avgVisits",
      label: t("customers.visits"),
      value: Math.round(
        data.customers.reduce((sum, c) => sum + c.visits, 0) /
          data.customers.length
      ),
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("customers.segmentsTitle")}
        subtitle={t("customers.segmentsSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((segment, index) => (
            <motion.div
              key={segment.label.en}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.05 }}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-xs font-medium">
                  {segment.label[locale]}
                </p>
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: HUE_VAR[segment.hue] }}
                />
              </div>
              <div className="flex items-end gap-2">
                <span className="figure text-[1.75rem] leading-none">
                  {num(segment.count)}
                </span>
                <span className="nums mb-1 text-[0.625rem] text-muted-foreground">
                  {pct(segment.share * 100, 0)}
                </span>
              </div>
              <CombChart
                values={Array.from({ length: 24 }, (_, i) =>
                  Math.max(
                    1,
                    Math.round(
                      segment.count * (0.5 + Math.sin(i / 4) * 0.25 + i / 60)
                    )
                  )
                )}
                height={26}
                color={HUE_VAR[segment.hue]}
                glow={false}
              />
              <dl className="grid grid-cols-2 gap-2 text-[0.5625rem]">
                <div>
                  <dt className="text-muted-foreground">
                    {t("customers.spend")}
                  </dt>
                  <dd className="nums font-medium">{money(segment.spend)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("customers.visits")}
                  </dt>
                  <dd className="nums font-medium">{num(segment.visits)}</dd>
                </div>
              </dl>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={t("customers.source")} delay={0.2}>
            <SplitBar slices={sources} />
          </Panel>
          <Panel title={t("customers.segmentsTitle")} delay={0.25}>
            <SplitBar
              slices={sorted.map((s, i) => ({
                id: s.label.en,
                label: s.label[locale],
                value: s.count,
                color: HUE_VAR[s.hue],
              }))}
            />
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
