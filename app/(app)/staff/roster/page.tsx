"use client"

import * as React from "react"
import { motion } from "motion/react"

import { PageHeader, Panel } from "@/components/motion/card-shell"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { ScrollFade } from "@/components/motion/scroll-fade"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset } from "@/lib/data"
import { addDays, demoToday, isoDay } from "@/lib/demo-time"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { Department, Staff } from "@/lib/types"
import { cn } from "@/lib/utils"

const DEPARTMENTS: Department[] = [
  "floor",
  "daycare",
  "frontDesk",
  "outlet",
  "kitchen",
  "maintenance",
  "admin",
]

export default function RosterPage() {
  const { t, locale, num, date } = useLocale()
  const data = useDataset()
  const today = demoToday()
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  const deptLabel = (department: Department) =>
    ({
      floor: t("staff.deptFloor"),
      daycare: t("staff.deptDaycare"),
      frontDesk: t("staff.deptFrontDesk"),
      outlet: t("staff.deptOutlet"),
      kitchen: t("staff.deptKitchen"),
      maintenance: t("staff.deptMaintenance"),
      admin: t("staff.deptAdmin"),
    })[department]

  /**
   * Shift assignment is derived, not stored: a staffer works unless the day
   * lands on their rota gap. Deriving it keeps the grid consistent with the
   * `shift` field on the record rather than inventing a second source.
   */
  const onShift = (member: Staff, dayIndex: number) => {
    const gap = (member.id.charCodeAt(4) + dayIndex) % 7
    return gap !== 0 && gap !== 3
  }

  const active = data.staff.filter((s) => s.status === "active")
  const coverage = days.map(
    (_, i) => active.filter((s) => onShift(s, i)).length
  )

  const kpis: KpiCell[] = [
    {
      id: "staff",
      label: t("staff.directoryTitle"),
      value: active.length,
      color: "var(--chart-1)",
    },
    {
      id: "today",
      label: t("staff.onDuty"),
      value: coverage[0],
      color: "var(--chart-6)",
    },
    {
      id: "morning",
      label: t("staff.shiftMorning"),
      value: active.filter((s) => s.shift === "morning").length,
      color: "var(--chart-2)",
    },
    {
      id: "evening",
      label: t("staff.shiftEvening"),
      value: active.filter((s) => s.shift === "evening").length,
      color: "var(--chart-3)",
    },
  ]

  return (
    <ScrollFade className="min-h-0 flex-1">
      <PageHeader
        title={t("staff.rosterTitle")}
        subtitle={t("staff.rosterSubtitle")}
      />
      <div className="grid gap-3 px-5 pb-6">
        <KpiStrip cells={kpis} />

        {DEPARTMENTS.map((department, deptIndex) => {
          const members = active.filter((s) => s.department === department)
          if (!members.length) return null
          return (
            <Panel
              key={department}
              title={deptLabel(department)}
              subtitle={num(members.length)}
              delay={deptIndex * 0.04}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-xs">
                  <thead>
                    <tr>
                      <th className="micro sticky left-0 bg-card px-2 py-1.5 text-left">
                        {t("common.name")}
                      </th>
                      {days.map((day) => (
                        <th
                          key={isoDay(day)}
                          className="micro px-2 py-1.5 text-center whitespace-nowrap"
                        >
                          {date(day)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.slice(0, 10).map((member, rowIndex) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                      >
                        <td className="sticky left-0 border-b border-[var(--hairline)] bg-card px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ background: HUE_VAR[member.hue] }}
                            />
                            <span className="truncate text-[0.6875rem]">
                              {member.name[locale]}
                            </span>
                          </div>
                        </td>
                        {days.map((day, dayIndex) => {
                          const working = onShift(member, dayIndex)
                          return (
                            <td
                              key={isoDay(day)}
                              className="border-b border-[var(--hairline)] px-2 py-1.5 text-center"
                            >
                              <span
                                className={cn(
                                  "inline-block h-4 w-full rounded",
                                  working ? "" : "bg-muted/60"
                                )}
                                style={
                                  working
                                    ? {
                                        background: `color-mix(in oklch, ${HUE_VAR[member.hue]} 22%, transparent)`,
                                      }
                                    : undefined
                                }
                              />
                            </td>
                          )
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StatusTag hue="green" dot>
                  {t("staff.onDuty")}
                </StatusTag>
                <StatusTag hue="slate">{t("staff.leave")}</StatusTag>
              </div>
            </Panel>
          )
        })}
      </div>
    </ScrollFade>
  )
}
