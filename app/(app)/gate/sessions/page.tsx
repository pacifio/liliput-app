"use client"

import * as React from "react"
import { Timer } from "lucide-react"

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
import type { PlaySession } from "@/lib/types"

export default function SessionsPage() {
  const { t, locale, num, money, time } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  const sessions = data.sessions
  const revenue = sessions.reduce((sum, s) => sum + s.total, 0)
  const overtime = sessions.reduce((sum, s) => sum + s.overtime, 0)
  const discount = sessions.reduce((sum, s) => sum + s.discount, 0)
  const avg = sessions.length
    ? Math.round(
        sessions.reduce((sum, s) => sum + s.minutes, 0) / sessions.length
      )
    : 0

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("gate.sessionsTitle"),
      value: sessions.length,
      color: "var(--chart-1)",
    },
    {
      id: "revenue",
      label: t("finance.streamTickets"),
      value: revenue,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "dwell",
      label: t("dashboard.avgDwell"),
      value: avg,
      suffix: ` ${t("common.minutes")}`,
      color: "var(--chart-3)",
    },
    {
      id: "overtime",
      label: t("gate.overtime"),
      value: overtime,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "discount",
      label: t("common.discount"),
      value: discount,
      prefix: "৳",
      color: "var(--chart-6)",
    },
  ]

  const columns = React.useMemo<ColumnDef<PlaySession, unknown>[]>(
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
        id: "zone",
        accessorFn: (row) => lookups.zone.get(row.zoneId)?.name[locale] ?? "",
        header: t("common.zone"),
        cell: ({ row }) => {
          const zone = lookups.zone.get(row.original.zoneId)
          return zone ? (
            <StatusTag hue={zone.hue}>{zone.name[locale]}</StatusTag>
          ) : null
        },
      },
      {
        id: "in",
        accessorFn: (row) => row.entryAt,
        header: t("gate.entryTime"),
        cell: ({ row }) => time(row.original.entryAt),
        meta: { align: "right" },
      },
      {
        id: "out",
        accessorFn: (row) => row.exitAt,
        header: t("gate.exitTime"),
        cell: ({ row }) => time(row.original.exitAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "minutes",
        header: t("gate.dwell"),
        cell: ({ row }) => num(row.original.minutes),
        meta: { align: "right" },
      },
      {
        accessorKey: "overtime",
        header: t("gate.overtime"),
        cell: ({ row }) =>
          row.original.overtime ? (
            <span className="text-[var(--warning)]">
              {money(row.original.overtime)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "discount",
        header: t("common.discount"),
        cell: ({ row }) =>
          row.original.discount ? (
            <span className="text-[var(--success)]">
              − {money(row.original.discount)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
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
    ],
    [t, locale, lookups, time, num, money]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("gate.sessionsTitle")}
        subtitle={t("gate.sessionsSubtitle")}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={sessions}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Timer />}
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
