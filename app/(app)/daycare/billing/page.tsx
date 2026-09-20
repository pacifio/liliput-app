"use client"

import * as React from "react"
import { Receipt } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { DaycareStay, TagHue } from "@/lib/types"

const HUE: Record<DaycareStay["status"], TagHue> = {
  "in-care": "green",
  released: "slate",
  overdue: "rose",
}

export default function DaycareBillingPage() {
  const { t, locale, num, money, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  const revenue = data.daycare.reduce((sum, s) => sum + s.total, 0)
  const minutes = data.daycare.reduce((sum, s) => sum + s.minutes, 0)
  const meals = data.daycare.reduce((sum, s) => sum + s.meals, 0)
  const over = data.daycare.filter((s) => s.minutes > s.limitMinutes)

  const kpis: KpiCell[] = [
    {
      id: "stays",
      label: t("daycare.billingTitle"),
      value: data.daycare.length,
      color: "var(--chart-1)",
    },
    {
      id: "revenue",
      label: t("finance.streamDaycare"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "avg",
      label: t("dashboard.avgDwell"),
      value: Math.round(minutes / Math.max(1, data.daycare.length)),
      suffix: ` ${t("common.minutes")}`,
      color: "var(--chart-3)",
    },
    {
      id: "over",
      label: t("gate.overtime"),
      value: over.length,
      color: "var(--chart-5)",
    },
    {
      id: "meals",
      label: t("daycare.meals"),
      value: meals,
      color: "var(--chart-4)",
    },
  ]

  const columns = React.useMemo<ColumnDef<DaycareStay, unknown>[]>(
    () => [
      {
        id: "child",
        accessorFn: (row) => lookups.child.get(row.childId)?.name[locale] ?? "",
        header: t("common.child"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {lookups.child.get(row.original.childId)?.name[locale]}
            </p>
            <p className="truncate text-[0.5625rem] text-muted-foreground">
              {lookups.customer.get(row.original.guardianId)?.name[locale]}
            </p>
          </div>
        ),
      },
      {
        id: "carer",
        accessorFn: (row) =>
          lookups.staff.get(row.caregiverId)?.name[locale] ?? "",
        header: t("daycare.caregiver"),
      },
      {
        id: "in",
        accessorFn: (row) => row.checkInAt,
        header: t("daycare.checkIn"),
        cell: ({ row }) => time(row.original.checkInAt),
        meta: { align: "right" },
      },
      {
        id: "out",
        accessorFn: (row) => row.checkOutAt ?? 0,
        header: t("daycare.checkOut"),
        cell: ({ row }) =>
          row.original.checkOutAt ? (
            time(row.original.checkOutAt)
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "minutes",
        header: t("daycare.elapsed"),
        cell: ({ row }) => (
          <span
            className={cnTone(row.original.minutes > row.original.limitMinutes)}
          >
            {num(row.original.minutes)}/{num(row.original.limitMinutes)}
          </span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "meals",
        header: t("daycare.meals"),
        cell: ({ row }) => num(row.original.meals),
        meta: { align: "right" },
      },
      {
        accessorKey: "total",
        header: t("common.total"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.total)}</span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.status]} dot>
            {row.original.status === "in-care"
              ? t("daycare.inCare")
              : row.original.status === "overdue"
                ? t("daycare.overdue")
                : t("daycare.released")}
          </StatusTag>
        ),
      },
    ],
    [t, locale, lookups, num, money, time]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("daycare.billingTitle")}
        subtitle={t("daycare.billingSubtitle")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.daycare}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Receipt />}
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

function cnTone(over: boolean) {
  return over ? "nums text-[var(--warning)]" : "nums"
}
