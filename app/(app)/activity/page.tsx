"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Activity } from "lucide-react"

import { EmptyState, PageHeader } from "@/components/motion/card-shell"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"

const FILTERS = ["all", "access", "commerce", "admin"] as const

export default function ActivityPage() {
  const { t, locale, relative, time } = useLocale()
  const data = useDataset()
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  // A single chronological stream stitched from the modules that actually
  // generate operator-visible events.
  const events = React.useMemo(() => {
    const rows = [
      ...data.audit.map((entry) => ({
        id: entry.id,
        at: entry.at,
        group: "admin" as const,
        actor: entry.actor[locale],
        title: entry.action[locale],
        detail: `${entry.target} · ${entry.ip}`,
        hue: entry.hue,
      })),
      ...data.wristbands.slice(0, 40).map((band) => ({
        id: band.id,
        at: band.exitAt ?? band.entryAt,
        group: "access" as const,
        actor: band.gate[locale],
        title: band.exitAt ? t("gate.exitRecorded") : t("gate.entryRecorded"),
        detail: band.code,
        hue: band.status === "overstay" ? ("rose" as const) : ("teal" as const),
      })),
      ...data.sales.slice(0, 40).map((sale) => ({
        id: sale.id,
        at: sale.at,
        group: "commerce" as const,
        actor:
          data.outlets.find((o) => o.id === sale.outletId)?.name[locale] ?? "",
        title: t("pos.saleComplete", { ref: sale.ref }),
        detail: `${sale.lines.length}`,
        hue: "amber" as const,
      })),
    ]
    return rows.sort((a, b) => b.at - a.at)
  }, [data, locale, t])

  const rows =
    filter === "all" ? events : events.filter((e) => e.group === filter)

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("activity.title")}
        subtitle={t("activity.subtitle", { branch: data.branch.name[locale] })}
      >
        <SegmentedPills
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("common.all") },
            { value: "access", label: t("nav.access") },
            { value: "commerce", label: t("nav.commerce") },
            { value: "admin", label: t("nav.administration") },
          ]}
        />
      </PageHeader>

      <div className="px-5 pb-6">
        {rows.length ? (
          <ol className="relative">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-[5px] w-px bg-[var(--hairline)]"
            />
            {rows.slice(0, 80).map((event, index) => (
              <motion.li
                key={`${event.group}-${event.id}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(index, 18) * 0.02,
                }}
                className="relative flex gap-3 py-2 pl-5"
              >
                <span
                  className="absolute top-3 left-0 size-2.5 rounded-full ring-2 ring-background"
                  style={{ background: `var(--hue-${event.hue})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.6875rem] font-medium">
                    {event.title}
                  </p>
                  <p className="nums truncate text-[0.5625rem] text-muted-foreground">
                    {event.actor} · {event.detail}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="nums text-[0.625rem]">{time(event.at)}</p>
                  <p className="text-[0.5625rem] text-muted-foreground">
                    {relative(event.at)}
                  </p>
                </div>
                <StatusTag hue={event.hue}>
                  {event.group === "access"
                    ? t("nav.access")
                    : event.group === "commerce"
                      ? t("nav.commerce")
                      : t("nav.administration")}
                </StatusTag>
              </motion.li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={<Activity />} title={t("activity.empty")} />
        )}
      </div>
    </ScrollFade>
  )
}
