"use client"

import * as React from "react"
import { ClipboardList, Plus } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { StatusTag } from "@/components/motion/status-tag"
import { Button } from "@/components/ui/button"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { PurchaseOrder, TagHue } from "@/lib/types"

const HUE: Record<PurchaseOrder["status"], TagHue> = {
  draft: "slate",
  sent: "blue",
  partial: "amber",
  received: "green",
  cancelled: "rose",
}

export default function PurchaseOrdersPage() {
  const { t, locale, num, money, date, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")

  const open = data.purchaseOrders.filter((p) =>
    ["sent", "partial", "draft"].includes(p.status)
  )
  const openValue = open.reduce((sum, p) => sum + p.total, 0)

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("inventory.poTitle"),
      value: data.purchaseOrders.length,
      color: "var(--chart-1)",
    },
    {
      id: "open",
      label: t("common.pending"),
      value: open.length,
      color: "var(--chart-2)",
    },
    {
      id: "value",
      label: t("common.total"),
      value: openValue,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "received",
      label: t("common.completed"),
      value: data.purchaseOrders.filter((p) => p.status === "received").length,
      color: "var(--chart-6)",
    },
  ]

  const label = (status: PurchaseOrder["status"]) =>
    ({
      draft: t("common.pending"),
      sent: t("messaging.sent"),
      partial: t("inventory.inbound"),
      received: t("common.completed"),
      cancelled: t("common.cancelled"),
    })[status]

  const columns = React.useMemo<ColumnDef<PurchaseOrder, unknown>[]>(
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
        id: "supplier",
        accessorFn: (row) =>
          lookups.supplier.get(row.supplierId)?.name[locale] ?? "",
        header: t("nav.suppliers"),
        cell: ({ row }) => (
          <span className="truncate">
            {lookups.supplier.get(row.original.supplierId)?.name[locale]}
          </span>
        ),
      },
      {
        accessorKey: "placedAt",
        header: t("common.date"),
        cell: ({ row }) => date(row.original.placedAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "expectedAt",
        header: t("inventory.expectedAt"),
        cell: ({ row }) => date(row.original.expectedAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "items",
        header: t("inventory.items"),
        cell: ({ row }) => num(row.original.items),
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
            {label(row.original.status)}
          </StatusTag>
        ),
      },
    ],
    [t, locale, lookups, num, money, date, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.poTitle")}
        subtitle={t("inventory.poSubtitle", {
          open: num(open.length),
          value: money(openValue),
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
          data={data.purchaseOrders}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<ClipboardList />}
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
