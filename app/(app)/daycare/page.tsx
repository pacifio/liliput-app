"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { AlertTriangle, ScanLine } from "lucide-react"

import { CapacityMeter } from "@/components/motion/capacity-meter"
import { EmptyState, PageHeader, Panel } from "@/components/motion/card-shell"
import { DwellTimer } from "@/components/motion/dwell-timer"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { inCare } from "@/lib/derive"
import { useLocale } from "@/lib/i18n/provider"

export default function DaycareBoardPage() {
  const { t, locale, num, money, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()

  const care = inCare(data)
  const carers = data.staff.filter(
    (s) => s.department === "daycare" && s.status === "active"
  )
  const overdue = care.filter((s) => s.status === "overdue")
  const released = data.daycare.filter((s) => s.status === "released")
  const revenue = data.daycare.reduce((sum, s) => sum + s.total, 0)
  const capacity = Math.round(data.branch.capacity * 0.4)

  const kpis: KpiCell[] = [
    {
      id: "inCare",
      label: t("daycare.inCare"),
      value: care.length,
      color: "var(--chart-1)",
    },
    {
      id: "carers",
      label: t("daycare.caregiver"),
      value: carers.length,
      color: "var(--chart-3)",
    },
    {
      id: "ratio",
      label: t("daycare.ratio"),
      value: Math.max(1, Math.round(care.length / Math.max(1, carers.length))),
      prefix: `${num(1)}:`,
      color: "var(--chart-2)",
    },
    {
      id: "overdue",
      label: t("daycare.overdue"),
      value: overdue.length,
      color: "var(--chart-5)",
    },
    {
      id: "revenue",
      label: t("finance.streamDaycare"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-4)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("daycare.title")}
        subtitle={t("daycare.subtitle", {
          count: num(care.length),
          carers: num(carers.length),
        })}
      >
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/daycare/checkin" />}
        >
          <ScanLine />
          {t("daycare.checkIn")}
        </Button>
      </PageHeader>

      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        <Panel
          title={t("dashboard.daycareOccupancy")}
          subtitle={t("dashboard.daycareOccupancyHint")}
          delay={0.05}
        >
          <CapacityMeter value={care.length} capacity={capacity} hue="teal" />
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={t("daycare.inCare")} delay={0.1}>
            {care.length ? (
              <ul className="flex flex-col">
                {care.slice(0, 16).map((stay, index) => {
                  const child = lookups.child.get(stay.childId)
                  const carer = lookups.staff.get(stay.caregiverId)
                  return (
                    <motion.li
                      key={stay.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(index, 12) * 0.025,
                      }}
                      className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                    >
                      <DwellTimer
                        entryAt={stay.checkInAt}
                        includedMinutes={stay.limitMinutes}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.6875rem] font-medium">
                          {child?.name[locale]}
                        </p>
                        <p className="truncate text-[0.5625rem] text-muted-foreground">
                          {carer?.name[locale]} · {time(stay.checkInAt)}
                        </p>
                        {child?.allergies.length ? (
                          <p className="mt-0.5 flex items-center gap-1 text-[0.5625rem] text-[var(--warning)]">
                            <AlertTriangle className="size-2.5" />
                            {t("daycare.allergyAlert", {
                              list: child.allergies
                                .map((a) => a[locale])
                                .join(", "),
                            })}
                          </p>
                        ) : null}
                      </div>
                      <span className="nums shrink-0 text-[0.625rem] text-muted-foreground">
                        {money(stay.total)}
                      </span>
                      <StatusTag
                        hue={stay.status === "overdue" ? "rose" : "green"}
                        dot
                      >
                        {stay.status === "overdue"
                          ? t("daycare.overdue")
                          : t("daycare.inCare")}
                      </StatusTag>
                    </motion.li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState title={t("common.noResults")} />
            )}
          </Panel>

          <Panel
            title={t("daycare.caregiver")}
            subtitle={t("daycare.ratio")}
            delay={0.15}
          >
            <ul className="flex flex-col">
              {carers.slice(0, 10).map((carer) => {
                const load = care.filter(
                  (s) => s.caregiverId === carer.id
                ).length
                return (
                  <li
                    key={carer.id}
                    className="flex items-center gap-2.5 border-b border-[var(--hairline)] py-2 last:border-0"
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-semibold"
                      style={{
                        background: `color-mix(in oklch, var(--hue-${carer.hue}) 16%, transparent)`,
                        color: `var(--hue-${carer.hue})`,
                      }}
                    >
                      {carer.name.en.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.6875rem]">
                        {carer.name[locale]}
                      </p>
                      <p className="truncate text-[0.5625rem] text-muted-foreground">
                        {carer.role[locale]}
                      </p>
                    </div>
                    {carer.certified ? (
                      <StatusTag hue="teal">{t("staff.certified")}</StatusTag>
                    ) : null}
                    <span className="nums w-8 shrink-0 text-right text-[0.6875rem] font-medium">
                      {num(load)}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-[0.625rem] text-muted-foreground">
              {t("daycare.released")}: {num(released.length)}
            </p>
          </Panel>
        </div>
      </div>
    </ScrollFade>
  )
}
