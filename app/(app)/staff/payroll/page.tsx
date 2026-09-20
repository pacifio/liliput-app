"use client"

import * as React from "react"
import { Banknote, Send } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset } from "@/lib/data"
import { HUE_VAR } from "@/lib/hue"
import { useLocale } from "@/lib/i18n/provider"
import type { Staff } from "@/lib/types"

export default function PayrollPage() {
  const { t, locale, num, money, dec } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  /**
   * Deductions are derived from the same attendance records the attendance
   * screen shows, so the two screens can never disagree about a month.
   */
  const rows = React.useMemo(
    () =>
      data.staff.map((member) => {
        const records = data.attendance.filter((a) => a.staffId === member.id)
        const absent = records.filter((a) => a.state === "absent").length
        const late = records.filter((a) => a.state === "late").length
        const daily = member.salary / 30
        const deductions = Math.round(absent * daily + late * daily * 0.1)
        return {
          member,
          absent,
          late,
          hours: records.reduce((sum, a) => sum + a.hours, 0),
          gross: member.salary,
          deductions,
          net: member.salary - deductions,
        }
      }),
    [data.staff, data.attendance]
  )

  const gross = rows.reduce((sum, r) => sum + r.gross, 0)
  const deductions = rows.reduce((sum, r) => sum + r.deductions, 0)

  const kpis: KpiCell[] = [
    {
      id: "headcount",
      label: t("staff.directoryTitle"),
      value: data.staff.length,
      color: "var(--chart-1)",
    },
    {
      id: "gross",
      label: t("staff.gross"),
      value: gross,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "deductions",
      label: t("staff.deductions"),
      value: deductions,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "net",
      label: t("staff.netPay"),
      value: gross - deductions,
      prefix: "৳",
      color: "var(--chart-6)",
    },
    {
      id: "avg",
      label: t("staff.salary"),
      value: Math.round(gross / Math.max(1, rows.length)),
      prefix: "৳",
      color: "var(--chart-4)",
    },
  ]

  type Row = (typeof rows)[number]

  const columns = React.useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.member.name.en} ${row.member.name.bn}`,
        header: t("common.name"),
        cell: ({ row }) => {
          const member: Staff = row.original.member
          return (
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-semibold"
                style={{
                  background: `color-mix(in oklch, ${HUE_VAR[member.hue]} 16%, transparent)`,
                  color: HUE_VAR[member.hue],
                }}
              >
                {member.name.en.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{member.name[locale]}</p>
                <p className="truncate text-[0.5625rem] text-muted-foreground">
                  {member.role[locale]}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "hours",
        header: t("staff.hours"),
        cell: ({ row }) => dec(row.original.hours, 1),
        meta: { align: "right" },
      },
      {
        accessorKey: "absent",
        header: t("staff.absent"),
        cell: ({ row }) => num(row.original.absent),
        meta: { align: "right" },
      },
      {
        accessorKey: "late",
        header: t("staff.late"),
        cell: ({ row }) => num(row.original.late),
        meta: { align: "right" },
      },
      {
        accessorKey: "gross",
        header: t("staff.gross"),
        cell: ({ row }) => money(row.original.gross),
        meta: { align: "right" },
      },
      {
        accessorKey: "deductions",
        header: t("staff.deductions"),
        cell: ({ row }) =>
          row.original.deductions ? (
            <span className="text-[var(--destructive)]">
              − {money(row.original.deductions)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "net",
        header: t("staff.netPay"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.net)}</span>
        ),
        meta: { align: "right" },
      },
      {
        id: "status",
        accessorFn: (row) => row.member.status,
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag
            hue={row.original.member.status === "active" ? "green" : "amber"}
            dot
          >
            {row.original.member.status === "active"
              ? t("common.active")
              : row.original.member.status === "leave"
                ? t("staff.leave")
                : t("staff.statusProbation")}
          </StatusTag>
        ),
      },
    ],
    [t, locale, num, money, dec]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("staff.payrollTitle")}
        subtitle={t("staff.payrollSubtitle")}
      >
        <Button
          size="sm"
          onClick={() =>
            toast.success(t("staff.disburse"), {
              description: money(gross - deductions),
            })
          }
        >
          <Send />
          {t("staff.disburse")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.member.id}
          selectable
          emptyIcon={<Banknote />}
          className="min-h-0 flex-1"
          toolbar={
            <TableSearch
              value={query}
              onChange={setQuery}
              className="ml-auto"
            />
          }
        />
      </div>
    </div>
  )
}
