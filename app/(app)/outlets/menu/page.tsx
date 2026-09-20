"use client"

import * as React from "react"
import { ShoppingBag } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { SegmentedPills } from "@/components/motion/segmented"
import { StatusTag } from "@/components/motion/status-tag"
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Product } from "@/lib/types"

export default function CataloguePage() {
  const { t, locale, num, money, pct, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [outletId, setOutletId] = React.useState("all")

  const rows = React.useMemo(
    () =>
      outletId === "all"
        ? data.products
        : data.products.filter((p) => p.outletId === outletId),
    [data.products, outletId]
  )

  const columns = React.useMemo<ColumnDef<Product, unknown>[]>(
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
          <span className="truncate font-medium">
            {row.original.name[locale]}
          </span>
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
        id: "category",
        accessorFn: (row) => row.category[locale],
        header: t("reports.category"),
      },
      {
        accessorKey: "cost",
        header: t("inventory.unitCost"),
        cell: ({ row }) => money(row.original.cost),
        meta: { align: "right" },
      },
      {
        accessorKey: "price",
        header: t("common.amount"),
        cell: ({ row }) => (
          <span className="font-medium">{money(row.original.price)}</span>
        ),
        meta: { align: "right" },
      },
      {
        id: "margin",
        accessorFn: (row) => (row.price - row.cost) / row.price,
        header: t("pos.margin"),
        cell: ({ row }) =>
          pct(
            ((row.original.price - row.original.cost) / row.original.price) *
              100,
            0
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "vatPct",
        header: t("common.vat"),
        cell: ({ row }) => pct(row.original.vatPct, 1),
        meta: { align: "right" },
      },
      {
        accessorKey: "stock",
        header: t("inventory.onHand"),
        cell: ({ row }) => (
          <span
            className={
              row.original.stock <= row.original.reorderAt
                ? "nums text-[var(--warning)]"
                : "nums"
            }
          >
            {num(row.original.stock)}
          </span>
        ),
        meta: { align: "right" },
      },
    ],
    [t, locale, lookups, num, money, pct, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t("pos.menuTitle")} subtitle={t("pos.menuSubtitle")} />
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          selectable
          emptyIcon={<ShoppingBag />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={outletId}
                onChange={setOutletId}
                options={[
                  { value: "all", label: t("common.all") },
                  ...data.outlets.map((o) => ({
                    value: o.id,
                    label: o.name[locale],
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
