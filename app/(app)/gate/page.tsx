"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { QrCode, Ticket } from "lucide-react"

import { CapacityMeter } from "@/components/motion/capacity-meter"
import { EmptyState, PageHeader, Panel } from "@/components/motion/card-shell"
import { DwellTimer } from "@/components/motion/dwell-timer"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { demoToday } from "@/lib/demo-time"
import { liveMinutes, onFloor, zoneHeadcount } from "@/lib/derive"
import { useLocale } from "@/lib/i18n/provider"

export default function GateFloorPage() {
  const { t, locale, num, money, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()

  const floor = onFloor(data)
  const heads = zoneHeadcount(data)
  const since = demoToday().getTime()
  const todaySessions = data.sessions.filter((s) => s.exitAt >= since)
  const revenue = todaySessions.reduce((sum, s) => sum + s.total, 0)
  const avgDwell = todaySessions.length
    ? Math.round(
        todaySessions.reduce((sum, s) => sum + s.minutes, 0) /
          todaySessions.length
      )
    : 0

  const kpis: KpiCell[] = [
    {
      id: "onFloor",
      label: t("dashboard.onFloor"),
      value: floor.length,
      spark: data.zones.map((z) => heads.get(z.id) ?? 0),
      color: "var(--chart-1)",
    },
    {
      id: "sold",
      label: t("dashboard.ticketsSold"),
      value: todaySessions.length + floor.length,
      color: "var(--chart-2)",
    },
    {
      id: "dwell",
      label: t("dashboard.avgDwell"),
      value: avgDwell,
      suffix: ` ${t("common.minutes")}`,
      color: "var(--chart-3)",
    },
    {
      id: "revenue",
      label: t("finance.streamTickets"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "overstay",
      label: t("gate.statusOverstay"),
      value: floor.filter((b) => b.status === "overstay").length,
      color: "var(--chart-5)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("gate.title")}
        subtitle={t("gate.subtitle", {
          count: num(floor.length),
          zones: num(data.zones.length),
        })}
      >
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/gate/tickets" />}
        >
          <Ticket />
          {t("nav.tickets")}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/gate/scan" />}
        >
          <QrCode />
          {t("nav.gateScan")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1fr_1.3fr]">
          <Panel
            title={t("gate.capacityTitle")}
            subtitle={t("gate.capacitySubtitle")}
            delay={0.05}
            bodyClassName="flex flex-col gap-3"
          >
            {data.zones.map((zone, index) => {
              const value = heads.get(zone.id) ?? 0
              return (
                <CapacityMeter
                  key={zone.id}
                  value={value}
                  capacity={zone.capacity}
                  hue={zone.hue}
                  label={zone.name[locale]}
                  sublabel={
                    value >= zone.capacity
                      ? t("gate.full")
                      : t("gate.remaining", {
                          count: num(zone.capacity - value),
                        })
                  }
                  delay={index * 0.04}
                />
              )
            })}
          </Panel>

          <Panel
            title={t("gate.bandsTitle")}
            subtitle={t("dashboard.liveBandsHint")}
            delay={0.1}
          >
            {floor.length ? (
              <ul className="flex flex-col">
                {[...floor]
                  .sort((a, b) => liveMinutes(b) - liveMinutes(a))
                  .slice(0, 14)
                  .map((band, index) => {
                    const slab = lookups.slab.get(band.slabId)
                    return (
                      <motion.li
                        key={band.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(index, 12) * 0.025,
                        }}
                        className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                      >
                        <DwellTimer
                          entryAt={band.entryAt}
                          includedMinutes={slab?.includedMinutes ?? 60}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.6875rem] font-medium">
                            {lookups.child.get(band.childId)?.name[locale]}
                          </p>
                          <p className="truncate text-[0.5625rem] text-muted-foreground">
                            {lookups.zone.get(band.zoneId)?.name[locale]} ·{" "}
                            {time(band.entryAt)} · {band.gate[locale]}
                          </p>
                        </div>
                        <span className="nums shrink-0 text-[0.625rem] text-muted-foreground">
                          {money(slab?.basePrice ?? 0)}
                        </span>
                        <StatusTag
                          hue={band.status === "overstay" ? "rose" : "green"}
                          dot
                        >
                          {band.status === "overstay"
                            ? t("gate.statusOverstay")
                            : t("gate.statusActive")}
                        </StatusTag>
                      </motion.li>
                    )
                  })}
              </ul>
            ) : (
              <EmptyState title={t("common.noResults")} />
            )}
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
