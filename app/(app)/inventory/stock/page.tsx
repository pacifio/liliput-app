"use client"

import * as React from "react"
import { Package } from "lucide-react"

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
import { lowStock } from "@/lib/derive"
import { useLocale } from "@/lib/i18n/provider"
import type { InventoryItem } from "@/lib/types"

const FILTERS = ["all", "low", "out"] as const

export default function StockPage() {
  const { t, locale, num, money, relative, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const low = lowStock(data)
  const rows = React.useMemo(() => {
    if (filter === "low") return low
    if (filter === "out") return data.inventory.filter((i) => i.onHand === 0)
    return data.inventory
  }, [data.inventory, low, filter])

  const value = data.inventory.reduce(
    (sum, i) => sum + i.onHand * i.unitCost,
    0
  )

  const kpis: KpiCell[] = [
    {
      id: "skus",
      label: "SKU",
      value: data.inventory.length,
      color: "var(--chart-1)",
    },
    {
      id: "value",
      label: t("inventory.stockValue"),
      value,
      prefix: "৳",
      color: "var(--chart-2)",
    },
    {
      id: "low",
      label: t("inventory.lowStock"),
      value: low.length,
      color: "var(--chart-4)",
    },
    {
      id: "out",
      label: t("inventory.outOfStock"),
      value: data.inventory.filter((i) => i.onHand === 0).length,
      color: "var(--chart-5)",
    },
    {
      id: "reserved",
      label: t("inventory.reserved"),
      value: data.inventory.reduce((sum, i) => sum + i.reserved, 0),
      color: "var(--chart-3)",
    },
  ]

  const columns = React.useMemo<ColumnDef<InventoryItem, unknown>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <span className="nums font-mono text-[0.625rem]">
            {digits(row.original.sku)}
          </span>
        ),
      },
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn}`,
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name[locale]}</p>
            <p className="truncate text-[0.5625rem] text-muted-foreground">
              {row.original.category[locale]}
            </p>
          </div>
        ),
      },
      {
        id: "outlet",
        accessorFn: (row) =>
          lookups.outlet.get(row.outletId)?.name[locale] ?? "",
        header: t("nav.outlets"),
        cell: ({ row }) => {
          const outlet = lookups.outlet.get(row.original.outletId)
          return outlet ? (
            <StatusTag hue={outlet.hue}>{outlet.name[locale]}</StatusTag>
          ) : null
        },
      },
      {
        accessorKey: "onHand",
        header: t("inventory.onHand"),
        cell: ({ row }) => (
          <span className="nums">
            {num(row.original.onHand)} {row.original.unit[locale]}
          </span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "reserved",
        header: t("inventory.reserved"),
        cell: ({ row }) => num(row.original.reserved),
        meta: { align: "right" },
      },
      {
        accessorKey: "reorderAt",
        header: t("inventory.reorderAt"),
        cell: ({ row }) => num(row.original.reorderAt),
        meta: { align: "right" },
      },
      {
        id: "value",
        accessorFn: (row) => row.onHand * row.unitCost,
        header: t("inventory.stockValue"),
        cell: ({ row }) => money(row.original.onHand * row.original.unitCost),
        meta: { align: "right" },
      },
      {
        id: "supplier",
        accessorFn: (row) =>
          lookups.supplier.get(row.supplierId)?.name[locale] ?? "",
        header: t("nav.suppliers"),
      },
      {
        id: "updated",
        accessorFn: (row) => row.updatedAt,
        header: t("common.date"),
        cell: ({ row }) => relative(row.original.updatedAt),
        meta: { align: "right" },
      },
      {
        id: "health",
        accessorFn: (row) => row.onHand - row.reorderAt,
        header: t("common.status"),
        cell: ({ row }) => {
          const item = row.original
          return item.onHand === 0 ? (
            <StatusTag hue="rose" dot>
              {t("inventory.outOfStock")}
            </StatusTag>
          ) : item.onHand <= item.reorderAt ? (
            <StatusTag hue="amber" dot>
              {t("inventory.lowStock")}
            </StatusTag>
          ) : (
            <StatusTag hue="green" dot>
              {t("inventory.healthy")}
            </StatusTag>
          )
        },
      },
    ],
    [t, locale, lookups, num, money, relative, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.title")}
        subtitle={t("inventory.subtitle", {
          count: num(data.inventory.length),
          low: num(low.length),
        })}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<Package />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: t("common.all") },
                  { value: "low", label: t("inventory.lowStock") },
                  { value: "out", label: t("inventory.outOfStock") },
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
