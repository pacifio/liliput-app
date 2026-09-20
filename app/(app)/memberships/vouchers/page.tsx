"use client"

import * as React from "react"
import { Percent, Plus } from "lucide-react"

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
import { useLocale } from "@/lib/i18n/provider"
import type { TagHue, Voucher } from "@/lib/types"

const HUE: Record<Voucher["status"], TagHue> = {
  active: "green",
  paused: "amber",
  expired: "slate",
}

export default function VouchersPage() {
  const { t, locale, num, money, date, pct, digits } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  const issued = data.vouchers.reduce((sum, v) => sum + v.issued, 0)
  const redeemed = data.vouchers.reduce((sum, v) => sum + v.redeemed, 0)

  const kpis: KpiCell[] = [
    {
      id: "codes",
      label: t("membership.vouchersTitle"),
      value: data.vouchers.length,
      color: "var(--chart-1)",
    },
    {
      id: "issued",
      label: t("membership.issued"),
      value: issued,
      color: "var(--chart-2)",
    },
    {
      id: "redeemed",
      label: t("membership.redeemed"),
      value: redeemed,
      color: "var(--chart-6)",
    },
    {
      id: "rate",
      label: t("membership.redemptionRate"),
      value: Math.round((redeemed / Math.max(1, issued)) * 100),
      suffix: "%",
      color: "var(--chart-4)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Voucher, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.625rem] font-medium">
              {digits(row.original.code)}
            </p>
            <p className="truncate text-[0.5625rem] text-muted-foreground">
              {row.original.label[locale]}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "kind",
        header: t("common.discount"),
        cell: ({ row }) => (
          <StatusTag hue={row.original.hue}>
            {row.original.kind === "percent"
              ? `${num(row.original.value)}%`
              : row.original.kind === "flat"
                ? money(row.original.value)
                : `${num(row.original.value)} ${t("common.hours")}`}
          </StatusTag>
        ),
      },
      {
        accessorKey: "issued",
        header: t("membership.issued"),
        cell: ({ row }) => num(row.original.issued),
        meta: { align: "right" },
      },
      {
        accessorKey: "redeemed",
        header: t("membership.redeemed"),
        cell: ({ row }) => num(row.original.redeemed),
        meta: { align: "right" },
      },
      {
        id: "rate",
        accessorFn: (row) => row.redeemed / Math.max(1, row.issued),
        header: t("membership.redemptionRate"),
        cell: ({ row }) =>
          pct(
            (row.original.redeemed / Math.max(1, row.original.issued)) * 100,
            0
          ),
        meta: { align: "right" },
      },
      {
        id: "expires",
        accessorFn: (row) => row.expiresAt,
        header: t("membership.validity"),
        cell: ({ row }) => date(row.original.expiresAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.status]} dot>
            {row.original.status === "active"
              ? t("common.active")
              : row.original.status === "paused"
                ? t("common.inactive")
                : t("membership.statusExpired")}
          </StatusTag>
        ),
      },
    ],
    [t, locale, num, money, date, pct, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("membership.vouchersTitle")}
        subtitle={t("membership.vouchersSubtitle")}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.vouchers}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Percent />}
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
