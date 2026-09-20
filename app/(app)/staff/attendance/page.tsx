"use client"

import * as React from "react"
import { ListChecks } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Attendance, TagHue } from "@/lib/types"

const HUE: Record<Attendance["state"], TagHue> = {
  present: "green",
  late: "amber",
  absent: "rose",
  leave: "blue",
  holiday: "slate",
}

const FILTERS = ["all", "present", "late", "absent", "leave"] as const

export default function AttendancePage() {
  const { t, locale, num, dec, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const label = React.useCallback(
    (state: Attendance["state"]) =>
      ({
        present: t("staff.present"),
        late: t("staff.late"),
        absent: t("staff.absent"),
        leave: t("staff.leave"),
        holiday: t("staff.holiday"),
      })[state],
    [t]
  )

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.attendance
        : data.attendance.filter((a) => a.state === filter),
    [data.attendance, filter]
  )

  const present = data.attendance.filter((a) => a.state === "present").length
  const late = data.attendance.filter((a) => a.state === "late").length
  const absent = data.attendance.filter((a) => a.state === "absent").length
  const hours = data.attendance.reduce((sum, a) => sum + a.hours, 0)

  const kpis: KpiCell[] = [
    {
      id: "present",
      label: t("staff.present"),
      value: present,
      color: "var(--chart-6)",
    },
    {
      id: "late",
      label: t("staff.late"),
      value: late,
      color: "var(--chart-4)",
    },
    {
      id: "absent",
      label: t("staff.absent"),
      value: absent,
      color: "var(--chart-5)",
    },
    {
      id: "hours",
      label: t("staff.hours"),
      value: Math.round(hours),
      color: "var(--chart-1)",
    },
    {
      id: "rate",
      label: t("staff.present"),
      value:
        Math.round((present / Math.max(1, data.attendance.length)) * 1000) / 10,
      suffix: "%",
      color: "var(--chart-3)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Attendance, unknown>[]>(
    () => [
      {
        id: "staff",
        accessorFn: (row) => lookups.staff.get(row.staffId)?.name[locale] ?? "",
        header: t("common.name"),
        cell: ({ row }) => {
          const member = lookups.staff.get(row.original.staffId)
          return (
            <div className="min-w-0">
              <p className="truncate font-medium">{member?.name[locale]}</p>
              <p className="truncate text-[0.5625rem] text-muted-foreground">
                {member?.role[locale]}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: "day",
        header: t("common.date"),
        cell: ({ row }) => <span className="nums">{row.original.day}</span>,
      },
      {
        id: "in",
        accessorFn: (row) => row.inAt ?? 0,
        header: t("gate.entryTime"),
        cell: ({ row }) =>
          row.original.inAt ? (
            time(row.original.inAt)
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        id: "out",
        accessorFn: (row) => row.outAt ?? 0,
        header: t("gate.exitTime"),
        cell: ({ row }) =>
          row.original.outAt ? (
            time(row.original.outAt)
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "hours",
        header: t("staff.hours"),
        cell: ({ row }) =>
          row.original.hours ? dec(row.original.hours, 1) : "—",
        meta: { align: "right" },
      },
      {
        accessorKey: "state",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.state]} dot>
            {label(row.original.state)}
          </StatusTag>
        ),
      },
    ],
    [t, locale, lookups, dec, time, label]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.attendanceTitle")}
        subtitle={t("staff.attendanceSubtitle")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<ListChecks />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={FILTERS.map((f) => ({
                  value: f,
                  label:
                    f === "all"
                      ? t("common.all")
                      : label(f as Attendance["state"]),
                }))}
              />
              <TableSearch
                value={query}
                onChange={setQuery}
                className="ml-auto"
              />
            </>
          }
        />
      </div>
    </div>
  )
}
