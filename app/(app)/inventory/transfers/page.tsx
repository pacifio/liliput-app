"use client"

import * as React from "react"
import { ArrowDownLeft, ArrowUpRight, Globe, Plus } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useBranch, useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { StockTransfer, TagHue } from "@/lib/types"

const HUE: Record<StockTransfer["status"], TagHue> = {
  requested: "amber",
  "in-transit": "blue",
  received: "green",
  rejected: "rose",
}

export default function TransfersPage() {
  const { t, locale, num, money, date, digits } = useLocale()
  const data = useDataset()
  const branch = useBranch()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  const inbound = data.transfers.filter((tr) => tr.toBranchId === branch.id)
  const outbound = data.transfers.filter((tr) => tr.fromBranchId === branch.id)

  const kpis: KpiCell[] = [
    {
      id: "total",
      label: t("inventory.transfersTitle"),
      value: data.transfers.length,
      color: "var(--chart-1)",
    },
    {
      id: "in",
      label: t("inventory.inbound"),
      value: inbound.length,
      color: "var(--chart-2)",
    },
    {
      id: "out",
      label: t("inventory.outbound"),
      value: outbound.length,
      color: "var(--chart-3)",
    },
    {
      id: "value",
      label: t("inventory.stockValue"),
      value: data.transfers.reduce((sum, tr) => sum + tr.value, 0),
      prefix: "৳",
      color: "var(--chart-4)",
    },
  ]

  const label = (status: StockTransfer["status"]) =>
    ({
      requested: t("common.pending"),
      "in-transit": t("inventory.inbound"),
      received: t("common.completed"),
      rejected: t("common.cancelled"),
    })[status]

  const columns = React.useMemo<ColumnDef<StockTransfer, unknown>[]>(
    () => [
      {
        accessorKey: "ref",
        header: t("bookings.ref"),
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem] font-medium">
            {digits(row.original.ref)}
          </span>
        ),
      },
      {
        id: "direction",
        accessorFn: (row) => (row.fromBranchId === branch.id ? "out" : "in"),
        header: t("inventory.direction"),
        cell: ({ row }) => {
          const out = row.original.fromBranchId === branch.id
          return (
            <span className="inline-flex items-center gap-1 text-[0.625rem]">
              {out ? (
                <ArrowUpRight className="size-3 text-[var(--warning)]" />
              ) : (
                <ArrowDownLeft className="size-3 text-[var(--success)]" />
              )}
              {out ? t("inventory.outbound") : t("inventory.inbound")}
            </span>
          )
        },
      },
      {
        id: "counterpart",
        accessorFn: (row) =>
          lookups.branch.get(
            row.fromBranchId === branch.id ? row.toBranchId : row.fromBranchId
          )?.name.en ?? "",
        header: t("common.branch"),
        cell: ({ row }) => {
          const other = lookups.branch.get(
            row.original.fromBranchId === branch.id
              ? row.original.toBranchId
              : row.original.fromBranchId
          )
          return other ? (
            <StatusTag hue={other.hue}>{other.name[locale]}</StatusTag>
          ) : null
        },
      },
      {
        accessorKey: "items",
        header: t("inventory.items"),
        cell: ({ row }) => num(row.original.items),
        meta: { align: "right" },
      },
      {
        accessorKey: "value",
        header: t("inventory.stockValue"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.value)}</span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "raisedAt",
        header: t("common.date"),
        cell: ({ row }) => date(row.original.raisedAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "status",
        header: t("common.status"),
        cell: ({ row }) => (
          <StatusTag hue={HUE[row.original.status]} dot>
            {label(row.original.status)}
          </StatusTag>
        ),
      },
    ],
    [t, locale, lookups, branch.id, num, money, date, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.transfersTitle")}
        subtitle={t("inventory.transfersSubtitle")}
      >
        <Button size="sm">
          <Plus />
          {t("common.new")}
        </Button>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.transfers}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Globe />}
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
