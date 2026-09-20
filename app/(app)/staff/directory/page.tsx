"use client"

import * as React from "react"
import { Plus, UsersRound } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { Department, Staff } from "@/lib/types"

const DEPARTMENTS: Department[] = [
  "floor",
  "daycare",
  "frontDesk",
  "outlet",
  "kitchen",
  "maintenance",
  "admin",
]

export default function StaffDirectoryPage() {
  const { t, locale, num, money, date } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")
  const [dept, setDept] = React.useState<string>("all")

  const deptLabel = React.useCallback(
    (department: Department) =>
      ({
        floor: t("staff.deptFloor"),
        daycare: t("staff.deptDaycare"),
        frontDesk: t("staff.deptFrontDesk"),
        outlet: t("staff.deptOutlet"),
        kitchen: t("staff.deptKitchen"),
        maintenance: t("staff.deptMaintenance"),
        admin: t("staff.deptAdmin"),
      })[department],
    [t]
  )

  const rows = React.useMemo(
    () =>
      dept === "all"
        ? data.staff
        : data.staff.filter((s) => s.department === dept),
    [data.staff, dept]
  )

  const payroll = data.staff.reduce((sum, s) => sum + s.salary, 0)

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("staff.directoryTitle"),
      value: data.staff.length,
      color: "var(--chart-1)",
    },
    {
      id: "active",
      label: t("common.active"),
      value: data.staff.filter((s) => s.status === "active").length,
      color: "var(--chart-6)",
    },
    {
      id: "leave",
      label: t("staff.leave"),
      value: data.staff.filter((s) => s.status === "leave").length,
      color: "var(--chart-4)",
    },
    {
      id: "payroll",
      label: t("staff.payrollTitle"),
      value: payroll,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "certified",
      label: t("staff.certified"),
      value: data.staff.filter((s) => s.certified).length,
      color: "var(--chart-3)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Staff, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn}`,
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-semibold"
              style={{
                background: `color-mix(in oklch, ${HUE_VAR[row.original.hue]} 16%, transparent)`,
                color: HUE_VAR[row.original.hue],
              }}
            >
              {row.original.name.en.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">
                {row.original.name[locale]}
              </p>
              <p className="truncate text-[0.5625rem] text-muted-foreground">
                {row.original.role[locale]}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: t("staff.department"),
        cell: ({ row }) => (
          <StatusTag hue={row.original.hue}>
            {deptLabel(row.original.department)}
          </StatusTag>
        ),
      },
      {
        accessorKey: "phone",
        header: t("common.phone"),
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem]">
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: "shift",
        header: t("staff.shift"),
        cell: ({ row }) =>
          row.original.shift === "morning"
            ? t("staff.shiftMorning")
            : row.original.shift === "evening"
              ? t("staff.shiftEvening")
              : t("staff.shiftSplit"),
      },
      {
        accessorKey: "salary",
        header: t("staff.salary"),
        cell: ({ row }) => money(row.original.salary),
        meta: { align: "right" },
      },
      {
        accessorKey: "joinedAt",
        header: t("staff.joined"),
        cell: ({ row }) => date(row.original.joinedAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "certified",
        header: t("staff.certified"),
        cell: ({ row }) =>
          row.original.certified ? (
            <StatusTag hue="teal">{t("common.yes")}</StatusTag>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag
            hue={
              row.original.status === "active"
                ? "green"
                : row.original.status === "leave"
                  ? "amber"
                  : "slate"
            }
            dot
          >
            {row.original.status === "active"
              ? t("common.active")
              : row.original.status === "leave"
                ? t("staff.leave")
                : t("staff.statusProbation")}
          </StatusTag>
        ),
      },
    ],
    [t, locale, money, date, deptLabel]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.directoryTitle")}
        subtitle={t("staff.directorySubtitle", {
          count: num(data.staff.length),
          branch: data.branch.name[locale],
        })}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<UsersRound />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={dept}
                onChange={setDept}
                options={[
                  { value: "all", label: t("common.all") },
                  ...DEPARTMENTS.map((d) => ({
                    value: d,
                    label: deptLabel(d),
                  })),
                ]}
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
