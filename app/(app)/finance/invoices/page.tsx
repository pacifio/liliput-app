"use client"

import * as React from "react"
import { Plus, Receipt } from "lucide-react"

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
import { useDataset, useLookups } from "@/lib/data"
import { useLocale } from "@/lib/i18n/provider"
import type { Invoice, TagHue } from "@/lib/types"

const HUE: Record<Invoice["status"], TagHue> = {
  draft: "slate",
  sent: "blue",
  paid: "green",
  overdue: "rose",
  void: "slate",
}

const FILTERS = ["all", "sent", "paid", "overdue"] as const

export default function InvoicesPage() {
  const { t, locale, num, money, date, digits } = useLocale()
  const data = useDataset()
  const lookups = useLookups()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all")

  const rows = React.useMemo(
    () =>
      filter === "all"
        ? data.invoices
        : data.invoices.filter((i) => i.status === filter),
    [data.invoices, filter]
  )

  const issued = data.invoices.reduce((sum, i) => sum + i.amount, 0)
  const collected = data.invoices.reduce((sum, i) => sum + i.paid, 0)
  const overdue = data.invoices.filter((i) => i.status === "overdue")

  const kpis: KpiCell[] = [
    {
      id: "issued",
      label: t("finance.issued"),
      value: issued,
      prefix: "৳",
      color: "var(--chart-1)",
    },
    {
      id: "collected",
      label: t("common.paid"),
      value: collected,
      prefix: "৳",
      color: "var(--chart-6)",
    },
    {
      id: "outstanding",
      label: t("finance.outstanding"),
      value: issued - collected,
      prefix: "৳",
      color: "var(--chart-4)",
    },
    {
      id: "overdue",
      label: t("common.pending"),
      value: overdue.length,
      color: "var(--chart-5)",
    },
    {
      id: "count",
      label: t("finance.invoicesTitle"),
      value: data.invoices.length,
      color: "var(--chart-2)",
    },
  ]

  const label = (status: Invoice["status"]) =>
    ({
      draft: t("common.pending"),
      sent: t("messaging.sent"),
      paid: t("common.paid"),
      overdue: t("finance.due"),
      void: t("common.cancelled"),
    })[status]

  const columns = React.useMemo<ColumnDef<Invoice, unknown>[]>(
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
        id: "customer",
        accessorFn: (row) =>
          lookups.customer.get(row.customerId)?.name[locale] ?? "",
        header: t("common.guardian"),
        cell: ({ row }) => (
          <span className="truncate">
            {lookups.customer.get(row.original.customerId)?.name[locale]}
          </span>
        ),
      },
      {
        accessorKey: "kind",
        header: t("bookings.kind"),
        cell: ({ row }) => (
          <StatusTag
            hue={
              row.original.kind === "party"
                ? "magenta"
                : row.original.kind === "corporate"
                  ? "purple"
                  : "amber"
            }
          >
            {row.original.kind === "party"
              ? t("bookings.kindParty")
              : row.original.kind === "corporate"
                ? t("finance.scopeCorporate")
                : t("bookings.kindMembership")}
          </StatusTag>
        ),
      },
      {
        accessorKey: "issuedAt",
        header: t("finance.issued"),
        cell: ({ row }) => date(row.original.issuedAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "dueAt",
        header: t("finance.due"),
        cell: ({ row }) => date(row.original.dueAt),
        meta: { align: "right" },
      },
      {
        accessorKey: "amount",
        header: t("common.amount"),
        cell: ({ row }) => money(row.original.amount),
        meta: { align: "right" },
      },
      {
        id: "outstanding",
        accessorFn: (row) => row.amount - row.paid,
        header: t("finance.outstanding"),
        cell: ({ row }) => {
          const due = row.original.amount - row.original.paid
          return due ? (
            <span className="font-medium text-[var(--warning)]">
              {money(due)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
        },
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
    [t, locale, lookups, money, date, digits]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("finance.invoicesTitle")}
        subtitle={t("finance.invoicesSubtitle")}
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
          emptyIcon={<Receipt />}
          className="min-h-0 flex-1"
          toolbar={
            <>
              <SegmentedPills
                size="sm"
                value={filter}
                onChange={setFilter}
                options={FILTERS.map((f) => ({
                  value: f,
                  label:
                    f === "all"
                      ? t("common.all")
                      : label(f as Invoice["status"]),
                }))}
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
