"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  AlertTriangle,
  ArrowUpRight,
  Download,
  HeartHandshake,
  Info,
  Plus,
  TriangleAlert,
} from "lucide-react"

import { FootfallChart } from "@/components/charts/footfall-chart"
import { SplitBar } from "@/components/charts/split-bar"
import { CapacityMeter } from "@/components/motion/capacity-meter"
import { EmptyState, PageHeader, Panel } from "@/components/motion/card-shell"
import { DwellTimer } from "@/components/motion/dwell-timer"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { demoNow } from "@/lib/demo-time"
import {
  inCare,
  liveMinutes,
  onFloor,
  outletTotals,
  revenueStreams,
  zoneHeadcount,
} from "@/lib/derive"
import { useLocale } from "@/lib/i18n/provider"
import { SERIES_TODAY_INDEX } from "@/lib/mock/generate"
import { useUi } from "@/lib/store"
import { resolvePreset } from "@/lib/report-range"

const WINDOWS = ["7d", "30d", "90d"] as const

export default function DashboardPage() {
  const { t, locale, num, money, time, relative } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const setReportRange = useUi((s) => s.setReportRange)
  const reportRange = useUi((s) => s.reportRange)
  const [window, setWindow] = React.useState<(typeof WINDOWS)[number]>("30d")

  // The pills and the top-bar range picker drive the same reporting window.
  React.useEffect(() => {
    if (
      reportRange.preset === "7d" ||
      reportRange.preset === "30d" ||
      reportRange.preset === "90d"
    ) {
      setWindow(reportRange.preset)
    }
  }, [reportRange.preset])

  const floor = onFloor(data)
  const heads = zoneHeadcount(data)
  const care = inCare(data)
  const streams = revenueStreams(data)
  const outlets = outletTotals(data)
  const days = window === "7d" ? 7 : window === "30d" ? 30 : 90

  const series = data.series.slice(
    SERIES_TODAY_INDEX - days + 1,
    SERIES_TODAY_INDEX + 31
  )

  const kpis: KpiCell[] = data.kpis.map((kpi) => ({
    id: kpi.id,
    label: t(kpi.labelKey as "dashboard.footfall"),
    value: kpi.value,
    delta: kpi.delta,
    prefix: kpi.format === "money" ? "৳" : undefined,
    suffix: kpi.format === "minutes" ? " " + t("common.minutes") : undefined,
    spark: kpi.spark,
    color: `var(--chart-${(data.kpis.indexOf(kpi) % 8) + 1})`,
  }))

  const longest = [...floor]
    .sort((a, b) => liveMinutes(b) - liveMinutes(a))
    .slice(0, 8)

  const upcoming = data.bookings
    .filter((b) => b.status === "confirmed" && b.startAt >= demoNow())
    .slice(0, 6)

  const caregivers = data.staff.filter(
    (s) => s.department === "daycare" && s.status === "active"
  ).length

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle", {
          branch: data.branch.name[locale],
        })}
      >
        <SegmentedPills
          size="sm"
          value={window}
          onChange={(value) => {
            setWindow(value)
            setReportRange(resolvePreset(value))
          }}
          options={WINDOWS.map((w) => ({ value: w, label: t(`range.${w}`) }))}
        />
        <Button size="sm" variant="outline">
          <Download />
          {t("common.export")}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/gate/scan" />}
        >
          <Plus />
          {t("gate.issue")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <Panel
            title={t("dashboard.footfallTrend")}
            subtitle={t("dashboard.footfallTrendHint")}
            delay={0.05}
          >
            <FootfallChart series={series} />
          </Panel>

          <Panel
            title={t("dashboard.zoneCapacity")}
            subtitle={t("dashboard.zoneCapacityHint")}
            delay={0.1}
            bodyClassName="flex flex-col gap-3"
          >
            {data.zones.map((zone, index) => (
              <CapacityMeter
                key={zone.id}
                value={heads.get(zone.id) ?? 0}
                capacity={zone.capacity}
                hue={zone.hue}
                label={zone.name[locale]}
                delay={index * 0.04}
              />
            ))}
          </Panel>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
          <Panel
            title={t("dashboard.revenueMix")}
            subtitle={t("dashboard.revenueMixHint")}
            delay={0.15}
          >
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
            <div className="mt-4 grid grid-cols-2 gap-2">
              {outlets.map((row) => (
                <div
                  key={row.outlet.id}
                  className="rounded-lg bg-surface p-2.5 ring-1 ring-foreground/[0.06]"
                >
                  <p className="truncate text-[0.625rem] text-muted-foreground">
                    {row.outlet.name[locale]}
                  </p>
                  <p className="figure mt-0.5 text-lg leading-none">
                    {money(row.revenue)}
                  </p>
                  <p className="nums mt-1 text-[0.5625rem] text-muted-foreground">
                    {num(row.orders)} · {num(row.items)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title={t("dashboard.liveBands")}
            subtitle={t("dashboard.liveBandsHint")}
            delay={0.2}
            actions={
              <Button
                size="xs"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/gate/wristbands" />}
              >
                {t("common.view")}
                <ArrowUpRight />
              </Button>
            }
          >
            {longest.length ? (
              <ul className="flex flex-col">
                {longest.map((band, index) => {
                  const child = lookups.child.get(band.childId)
                  const zone = lookups.zone.get(band.zoneId)
                  const slab = lookups.slab.get(band.slabId)
                  return (
                    <motion.li
                      key={band.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.03 }}
                      className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                    >
                      <DwellTimer
                        entryAt={band.entryAt}
                        includedMinutes={slab?.includedMinutes ?? 60}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.6875rem] font-medium">
                          {child?.name[locale]}
                        </p>
                        <p className="truncate text-[0.5625rem] text-muted-foreground">
                          {zone?.name[locale]} · {time(band.entryAt)}
                        </p>
                      </div>
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

        <div className="grid gap-3 lg:grid-cols-3">
          <Panel
            title={t("dashboard.daycareOccupancy")}
            subtitle={t("dashboard.daycareOccupancyHint")}
            delay={0.25}
          >
            <div className="flex items-end gap-4">
              <div>
                <p className="figure text-[1.75rem] leading-none">
                  {num(care.length)}
                </p>
                <p className="mt-1 text-[0.625rem] text-muted-foreground">
                  {t("daycare.inCare")}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="figure text-lg leading-none">
                  {t("daycare.ratioValue", {
                    count: num(
                      Math.max(
                        1,
                        Math.round(care.length / Math.max(1, caregivers))
                      )
                    ),
                  })}
                </p>
                <p className="mt-1 text-[0.625rem] text-muted-foreground">
                  {t("daycare.ratio")}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <CapacityMeter
                value={care.length}
                capacity={Math.round(data.branch.capacity * 0.4)}
                hue="teal"
              />
            </div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {care.slice(0, 4).map((stay) => {
                const child = lookups.child.get(stay.childId)
                return (
                  <li key={stay.id} className="flex items-center gap-2">
                    <HeartHandshake className="size-3 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-[0.6875rem]">
                      {child?.name[locale]}
                    </span>
                    <span className="nums shrink-0 text-[0.5625rem] text-muted-foreground">
                      {num(stay.minutes)}/{num(stay.limitMinutes)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel
            title={t("dashboard.alerts")}
            subtitle={t("dashboard.alertsHint")}
            delay={0.3}
          >
            <ul className="flex flex-col">
              {data.alerts.slice(0, 5).map((alert) => (
                <li
                  key={alert.id}
                  className="flex gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                >
                  <span className="mt-0.5 shrink-0">
                    {alert.severity === "critical" ? (
                      <TriangleAlert className="size-3 text-destructive" />
                    ) : alert.severity === "warning" ? (
                      <AlertTriangle className="size-3 text-[var(--warning)]" />
                    ) : (
                      <Info className="size-3 text-[var(--info)]" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.6875rem] font-medium">
                      {alert.title[locale]}
                    </p>
                    <p className="text-[0.625rem] text-muted-foreground">
                      {alert.detail[locale]}
                    </p>
                    <p className="mt-0.5 text-[0.5625rem] text-muted-foreground/70">
                      {relative(alert.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title={t("dashboard.upcoming")}
            subtitle={t("dashboard.upcomingHint")}
            delay={0.35}
          >
            {upcoming.length ? (
              <ul className="flex flex-col">
                {upcoming.map((booking) => {
                  const customer = lookups.customer.get(booking.customerId)
                  return (
                    <li
                      key={booking.id}
                      className="flex items-center gap-2 border-b border-[var(--hairline)] py-2 last:border-0"
                    >
                      <span className="nums w-11 shrink-0 text-[0.625rem] text-muted-foreground">
                        {time(booking.startAt)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.6875rem]">
                          {customer?.name[locale]}
                        </p>
                        <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                          {booking.ref} · {num(booking.heads)}
                        </p>
                      </div>
                      <span className="nums shrink-0 text-[0.625rem] font-medium">
                        {money(booking.amount)}
                      </span>
                    </li>
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
