"use client"

import * as React from "react"
import { Star, Truck } from "lucide-react"

import { PageHeader } from "@/components/motion/card-shell"
import {
  DataTable,
  TableSearch,
  type ColumnDef,
} from "@/components/motion/data-table"
import { KpiStrip, type KpiCell } from "@/components/motion/kpi-strip"
import { useDataset } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Supplier } from "@/lib/types"

export default function SuppliersPage() {
  const { t, locale, num, money, date, dec } = useLocale()
  const data = useDataset()
  const [query, setQuery] = React.useState("")

  const outstanding = data.suppliers.reduce((sum, s) => sum + s.outstanding, 0)
  const rating =
    data.suppliers.reduce((sum, s) => sum + s.rating, 0) / data.suppliers.length

  const kpis: KpiCell[] = [
    {
      id: "count",
      label: t("nav.suppliers"),
      value: data.suppliers.length,
      color: "var(--chart-1)",
    },
    {
      id: "outstanding",
      label: t("inventory.outstanding"),
      value: outstanding,
      prefix: "৳",
      color: "var(--chart-5)",
    },
    {
      id: "rating",
      label: t("inventory.rating"),
      value: Math.round(rating * 10) / 10,
      color: "var(--chart-4)",
    },
    {
      id: "orders",
      label: t("inventory.poTitle"),
      value: data.purchaseOrders.length,
      color: "var(--chart-2)",
    },
  ]

  const columns = React.useMemo<ColumnDef<Supplier, unknown>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name.en} ${row.name.bn}`,
        header: t("common.name"),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name[locale]}</p>
            <p className="truncate text-[0.5625rem] text-muted-foreground">
              {row.original.contact[locale]}
            </p>
          </div>
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
        id: "category",
        accessorFn: (row) => row.category[locale],
        header: t("reports.category"),
      },
      {
        id: "terms",
        accessorFn: (row) => row.terms[locale],
        header: t("inventory.terms"),
      },
      {
        accessorKey: "rating",
        header: t("inventory.rating"),
        cell: ({ row }) => (
          <span className="nums inline-flex items-center gap-1">
            <Star className="size-2.5 fill-[var(--warning)] text-[var(--warning)]" />
            {dec(row.original.rating, 1)}
          </span>
        ),
        meta: { align: "right" },
      },
      {
        accessorKey: "outstanding",
        header: t("inventory.outstanding"),
        cell: ({ row }) =>
          row.original.outstanding ? (
            <span className="font-medium text-[var(--warning)]">
              {money(row.original.outstanding)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { align: "right" },
      },
      {
        accessorKey: "since",
        header: t("customers.joined"),
        cell: ({ row }) => date(row.original.since),
        meta: { align: "right" },
      },
    ],
    [t, locale, money, date, dec]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("inventory.supplierTitle")}
        subtitle={t("inventory.supplierSubtitle", {
          count: num(data.suppliers.length),
          outstanding: money(outstanding),
        })}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5">
        <KpiStrip cells={kpis} />
        <DataTable
          data={data.suppliers}
          columns={columns}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
          rowId={(row) => row.id}
          emptyIcon={<Truck />}
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
