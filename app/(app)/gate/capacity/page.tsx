"use client"

import { motion } from "motion/react"
import { Users } from "lucide-react"

import { CapacityMeter } from "@/components/motion/capacity-meter"
import { PageHeader, Panel } from "@/components/motion/card-shell"
import { CombChart } from "@/components/motion/comb-chart"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { onFloor, zoneHeadcount } from "@/lib/derive"
import { tradingWindow } from "@/lib/mock/generate"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"

export default function CapacityPage() {
  const { t, locale, num, pct, time } = useLocale()
  const data = useDataset()
  const heads = zoneHeadcount(data)
  const floor = onFloor(data)

  // Hourly arrival profile, rebuilt from the entry stamps themselves so it
  // always lines up with whatever the generator actually issued.
  const { open, elapsedHours } = tradingWindow()
  const hourly = Array.from({ length: Math.round(elapsedHours) }, (_, i) => {
    const from = open + i * 3_600_000
    return data.wristbands.filter(
      (b) => b.entryAt >= from && b.entryAt < from + 3_600_000
    ).length
  })

  const total = data.zones.reduce((sum, z) => sum + z.capacity, 0)

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("gate.capacityTitle")}
        subtitle={t("gate.capacitySubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
          <Panel title={t("gate.headcount")} delay={0}>
            <p className="figure text-[2.5rem] leading-none">
              {num(floor.length)}
            </p>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">
              {pct((floor.length / Math.max(1, total)) * 100, 0)}{" "}
              {t("dashboard.ofCapacity")} · {num(total)}
            </p>
            <div className="mt-4">
              <CapacityMeter value={floor.length} capacity={total} hue="blue" />
            </div>
          </Panel>

          <Panel
            title={t("dashboard.footfallTrend")}
            subtitle={t("gate.headcount")}
            delay={0.05}
          >
            <CombChart values={hourly} height={92} color="var(--chart-1)" />
            <div className="mt-2 flex justify-between text-[0.5625rem] text-muted-foreground">
              {hourly.map((_, i) => (
                <span key={i} className="nums">
                  {time(open + i * 3_600_000)}
                </span>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.zones.map((zone, index) => {
            const value = heads.get(zone.id) ?? 0
            const ratio = value / zone.capacity
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.05 }}
                className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {zone.name[locale]}
                    </p>
                    <p className="truncate text-[0.625rem] text-muted-foreground">
                      {zone.ageBand[locale]}
                    </p>
                  </div>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: HUE_VAR[zone.hue] }}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <span className="figure text-[1.75rem] leading-none">
                    {num(value)}
                  </span>
                  <span className="mb-1 text-[0.625rem] text-muted-foreground">
                    / {num(zone.capacity)}
                  </span>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <StatusTag
                      hue={
                        ratio >= 1 ? "rose" : ratio >= 0.85 ? "amber" : "green"
                      }
                      dot
                    >
                      {ratio >= 1
                        ? t("gate.full")
                        : t("gate.remaining", {
                            count: num(zone.capacity - value),
                          })}
                    </StatusTag>
                    {zone.supervised ? (
                      <span className="flex items-center gap-1 text-[0.5625rem] text-muted-foreground">
                        <Users className="size-2.5" />
                        {t("gate.supervised")}
                      </span>
                    ) : null}
                  </div>
                </div>

                <CapacityMeter
                  value={value}
                  capacity={zone.capacity}
                  hue={zone.hue}
                  delay={index * 0.04}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </ScrollFade>
  )
}
