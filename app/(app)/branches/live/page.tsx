"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"

import { BranchMap } from "@/components/charts/branch-map"
import { CapacityMeter } from "@/components/motion/capacity-meter"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useBranchSummaries } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import { useUi } from "@/lib/store"

export default function BranchLivePage() {
  const { t, locale, num, pct } = useLocale()
  const summaries = useBranchSummaries()
  const router = useRouter()
  const setBranchId = useUi((s) => s.setBranchId)

  const onFloor = summaries.reduce((sum, s) => sum + s.onFloor, 0)
  const capacity = summaries.reduce((sum, s) => sum + s.branch.capacity, 0)
  const hot = summaries.filter((s) => s.capacityUsed >= 0.85)

  const kpis: KpiCell[] = [
    {
      id: "onFloor",
      label: t("dashboard.onFloor"),
      value: onFloor,
      color: "var(--chart-1)",
    },
    {
      id: "capacity",
      label: t("settings.capacity"),
      value: capacity,
      color: "var(--chart-3)",
    },
    {
      id: "used",
      label: t("branches.avgCapacity"),
      value: Math.round((onFloor / Math.max(1, capacity)) * 100),
      suffix: "%",
      color: "var(--chart-2)",
    },
    {
      id: "hot",
      label: t("gate.full"),
      value: hot.length,
      color: "var(--chart-5)",
    },
  ]

  const open = (id: string) => {
    setBranchId(id)
    router.push("/gate")
  }

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("branches.liveTitle")}
        subtitle={t("branches.liveSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
          <Panel
            title={t("branches.map")}
            subtitle={t("branches.mapHint")}
            delay={0}
          >
            <BranchMap summaries={summaries} onSelect={open} />
          </Panel>

          <Panel title={t("dashboard.onFloor")} delay={0.05}>
            <div className="grid gap-2 sm:grid-cols-2">
              {summaries.map((summary, index) => (
                <motion.button
                  key={summary.branch.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: Math.min(index, 20) * 0.015,
                  }}
                  onClick={() => open(summary.branch.id)}
                  className="rounded-lg bg-surface p-2.5 text-left ring-1 ring-foreground/[0.06] transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: HUE_VAR[summary.branch.hue] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[0.625rem]">
                      {summary.branch.name[locale]}
                    </span>
                    {summary.capacityUsed >= 0.85 ? (
                      <StatusTag hue="rose">{t("gate.full")}</StatusTag>
                    ) : null}
                  </div>
                  <p className="figure mt-1 text-lg leading-none">
                    {num(summary.onFloor)}
                    <span className="ml-1 text-[0.625rem] text-muted-foreground">
                      / {num(summary.branch.capacity)}
                    </span>
                  </p>
                  <div className="mt-1.5">
                    <CapacityMeter
                      value={summary.onFloor}
                      capacity={summary.branch.capacity}
                      hue={summary.branch.hue}
                      sublabel={pct(summary.capacityUsed * 100, 0)}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
